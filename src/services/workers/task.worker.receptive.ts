// Onde o worker executa

import { MetaWebhook } from '../../interfaces/MetaWebhook';
import { getAnswer } from '../../adapters/agent/conectionAgente';
import { getAudio } from "../../adapters/microsservico/getAudio";
import { Message } from "../../interfaces/MetaWebhook";
import { getConectionTheChannel } from '../../config/infra/rabbitmg';
import { validarCadastroDoContato } from '../../config/database/entities/contatos'

export async function startTaskWorkerReceptive() {
  const channel = getConectionTheChannel()
  const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
  const queue = `task.${nomeFila}.receptive.create`
  const dlq = `task.${nomeFila}.receptive.dlq`

  await channel.assertQueue(dlq, { durable: true })

  await channel.assertQueue(queue, {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: dlq
  })

  channel.prefetch(1)

  channel.consume(queue, async msg => {
    if (!msg) return
    const body = JSON.parse(msg.content.toString())
    const task: MetaWebhook = body.bodyTask
    const repostaParaMensagemEnviada = body.resposta
    try {
      console.log("\n")
      console.log('🛠 Processando webhook de alimentação de base');

      const mensagem = task.entry[0];
      const dadosDaMesagen = mensagem.changes[0];

      console.log("\n");

      if (dadosDaMesagen.value.messages) {

        const bodyDaMenssage = dadosDaMesagen.value.messages;
        const profileContact = dadosDaMesagen.value.contacts?.[0];
        const dadosDoBodyDaMensagem = bodyDaMenssage?.[0];

        const mensagemRecebida = dadosDoBodyDaMensagem?.text?.body || false;
        const tipoDaMensagem = dadosDoBodyDaMensagem?.type || false; // Pode ser text ou audio
        const timesTampMensagem = dadosDoBodyDaMensagem.timestamp; // Pode ser text ou audio
        const idMensagem = dadosDoBodyDaMensagem?.id || false;
        const numeroDoContato = dadosDoBodyDaMensagem?.from || false;

        if (idMensagem && numeroDoContato) {

          let respostaParaMensagem = repostaParaMensagemEnviada ?? "Olá! 😊 No momento, ainda não consigo receber mensagens em áudio, imagens, vídeos ou documentos. Poderia me enviar sua dúvida por escrito, por favor? 😊";

          let nameContact = profileContact?.profile.name ?? "Sem nome no contato";
          let id_whats = profileContact?.wa_id ?? "false";

          const contatoBase: number | boolean = await validarCadastroDoContato(nameContact, numeroDoContato, id_whats);

          if (contatoBase != false) {

            // Modelo de como deve ser enviado para banco

            const dadosMensagem = {
              id_user: contatoBase,
              type_message: tipoDaMensagem,
              question_message: mensagemRecebida,
              answer_message: respostaParaMensagem,
              date_recept_message: new Date(Number(timesTampMensagem) * 1000),
              date_send_message: new Date(),
              status_message: "",
            }
          }

        }

        console.log('💜 Processamento de alimentação da base concluído');
      }

      // ======================
      // STATUS
      // ======================
      else if (dadosDaMesagen.value.statuses) {

        const contatosAtualizados = dadosDaMesagen.value.statuses;

        contatosAtualizados.forEach((c, i) => {
          let status = `${i} - Numero: ${c.recipient_id} - Status: ${c.status} - Serviço: ${c.pricing?.type} | ${c.pricing?.category}`;
          console.log(status);
        });

        console.log('💜 Atualização de status concluída');
      }

      channel.ack(msg);

    } catch (err) {
      console.error("Erro ao processar alimentação da base" + err);
    }
  })
}

async function tratarMensagensDeAudio(dados: Message, numeroDoContato: string) {
  try {
    const urlAudio = dados.audio?.url;
    const idAudio = dados.audio?.id;

    if (urlAudio && idAudio) {
      interface ReseultGetAudio {
        status: boolean,
        data: string
      }
      const resultgGetAudio: ReseultGetAudio = await getAudio(idAudio);
      console.log(resultgGetAudio)
      if (resultgGetAudio.status && resultgGetAudio.data) {
        return (await getAnswer(resultgGetAudio.data, numeroDoContato)).data;
      } else {
        return "Ola eu sou a *Fly*, no momento estou em construção e não consegui encontrar a mensagem que me enviou acima. Poderia reformular ela por favor?"
      }


    }
  } catch (e: any) {
    console.log(e);
    return "Ola eu sou a *Fly*, no momento estou em construção e não consegui encontrar a mensagem que me enviou acima. Poderia reformular ela por favor?"
  }
}

async function tratarMensagensDeTexto(dados: Message, numeroDoContato: string) {
  try {
    if (dados.text?.body) {
      const urlAudio = dados.text?.body;
      return (await getAnswer(urlAudio, numeroDoContato)).data;
    } else {
      return "Ola eu sou a *Fly*, no momento estou em construção e não consegui encontrar a mensagem que me enviou acima. Poderia reformular ela por favor?"
    }
  } catch (e: any) {
    console.log(e);
    return "Ola eu sou a *Fly*, no momento estou em construção e não consegui encontrar a mensagem que me enviou acima. Poderia reformular ela por favor?";
  }
}