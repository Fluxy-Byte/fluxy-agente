import { MetaWebhook } from '../../interfaces/MetaWebhook';
import { getConectionTheChannel } from '../../config/infra/rabbitmg';
import { validarCadastroDoContato } from '../../config/database/entities/contatos'
import type { BodyResult } from "../../adapters/agent/conectionAgente";

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
    const repostaParaMensagemEnviada: BodyResult = body.resposta
    try {
      console.log('\n---------💜 Processando de alimentação da base começando---------\n');

      const mensagem = task.entry[0];
      const dadosDaMesagen = mensagem.changes[0];

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

          let respostaParaMensagem = repostaParaMensagemEnviada.output ?? "Olá! 😊 No momento, ainda não consigo receber mensagens em áudio, imagens, vídeos ou documentos. Poderia me enviar sua dúvida por escrito, por favor? 😊";

          let nameContact = profileContact?.profile.name ?? "Sem nome no contato";
          let id_whats = profileContact?.wa_id ?? "false";

          const contatoBase: number | boolean = await validarCadastroDoContato(nameContact, numeroDoContato, id_whats, repostaParaMensagemEnviada.nivel_de_cliente);

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

        console.log('\n---------💜 Processamento de alimentação da base concluído---------\n');
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
