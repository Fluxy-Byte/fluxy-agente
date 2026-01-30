// Onde o worker executa

import { getConectionTheChannel } from '../../config/infra/rabbitmg';
import { MetaWebhook } from '../../interfaces/MetaWebhook';
import { getAnswer } from '../../adapters/agent/conectionAgente';
import { sendMenssagem } from "../../adapters/meta/sendMenssage";
import { getAudio } from "../../adapters/meta/getAudio";
import { Message } from "../../interfaces/MetaWebhook";

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

    const task: MetaWebhook = JSON.parse(msg.content.toString())

    try {
      console.log('🛠 Executando tarefa');

      const mensagem = task.entry[0]

      const dadosDaMesagen = mensagem.changes[0];
      console.log("\n\n")
      if (dadosDaMesagen.value.messages) {
        const bodyDaMenssage = dadosDaMesagen.value.messages;
        const dadosDoBodyDaMensagem = bodyDaMenssage ? bodyDaMenssage[0] : false;
        const mensagemRecebida = dadosDoBodyDaMensagem ? dadosDoBodyDaMensagem.text?.body : false;
        const tipoDaMensagem = dadosDoBodyDaMensagem ? dadosDoBodyDaMensagem.type : false;
        const idMensagem = dadosDoBodyDaMensagem ? dadosDoBodyDaMensagem.id : false;
        const numeroDoContato = dadosDoBodyDaMensagem ? dadosDoBodyDaMensagem.from : false;

        console.log(`ID: ${idMensagem} - TYPE: ${tipoDaMensagem} - MSG: ${mensagemRecebida}`)

        if (idMensagem != false && numeroDoContato != false) {

          if (tipoDaMensagem == "audio" && dadosDoBodyDaMensagem) {
            await tratarMensagensDeAudio(dadosDoBodyDaMensagem, idMensagem, numeroDoContato);

          } else if (tipoDaMensagem == "text" && dadosDoBodyDaMensagem) {
            await tratarMensagensDeTexto(dadosDoBodyDaMensagem, idMensagem, numeroDoContato);

          }
        } else {
          console.log(`🔴 Mensagem não enviada: ID - ${idMensagem} | FROM: ${numeroDoContato}`)
        }

        console.log('💚 Tarefa de recebimento de mensagem concluída con sucesso');
      }
      else if (dadosDaMesagen.value.statuses) {
        const contatosAtualizados = dadosDaMesagen.value.statuses;
        contatosAtualizados.map((c, i) => {
          let status = `${i} - Numero: ${c.recipient_id} - Status: ${c.status} - Serviço: ${c.pricing?.type} | ${c.pricing?.category}`
          console.log(status);
        })
        console.log('💜 Tarefa de atualização de status de mensagem concluída con sucesso');
      } else {
        console.log(`❤️Dados recebidos não são de mensagem...`)
      }

      channel.ack(msg)
    } catch (err) {
      console.log('❌ Falhou, jogando pra DLQ')
      channel.nack(msg, false, false)
    }
  })
}

async function tratarMensagensDeAudio(dados: Message, idMensagem: string, numeroDoContato: string) {
  try {
    const urlAudio = dados.audio?.url;
    const idAudio = dados.audio?.id;
    let mensagem;

    if (urlAudio && idAudio) {
      interface ReseultGetAudio {
        status: boolean,
        data: string
      }
      const resultgGetAudio: ReseultGetAudio = await getAudio(idAudio);
      console.log(resultgGetAudio)
      if (resultgGetAudio.data) {
        mensagem = (await getAnswer(resultgGetAudio.data, numeroDoContato)).data;
        await sendBodyToMenssage(idMensagem, numeroDoContato, mensagem);
        return;
      }

      await sendBodyToMenssage(idMensagem, numeroDoContato, "Ops, no momento não consegue escutar seu audio a um devido problema tecnico, poderia me mandar escrito?");
      return;
    }
  } catch (e: any) {
    console.log(e);
    await sendBodyToMenssage(idMensagem, numeroDoContato, "Ops, no momento não consegue escutar seu audio a um devido problema tecnico, poderia me mandar escrito?");
  }
}

async function tratarMensagensDeTexto(dados: Message, idMensagem: string, numeroDoContato: string) {
  try {
    let mensagem;

    if (dados.text?.body) {
      const urlAudio = dados.text?.body;
      mensagem = (await getAnswer(urlAudio, numeroDoContato)).data;
    } else {
      mensagem = "Ola eu sou a *Fly*, no momento estou em construção e não consegui encontrar a mensagem que me enviou acima. Poderia reformular ela por favor?"
    }

    await sendBodyToMenssage(idMensagem, numeroDoContato, mensagem);
    return;
  } catch (e: any) {
    console.log(e);
    await sendBodyToMenssage(idMensagem, numeroDoContato, "No momento não consegui processar sua solicitação. Poderia tentar novamente, por favor? 😅");
    return;
  }
}

async function sendBodyToMenssage(idMensagem: string, numeroDoContato: string, consultaResposta: string) {
  try {

    const listaDeRespostas = await splitText(consultaResposta);

    for (const mensagem of listaDeRespostas) {

      const response = await sendMenssagem({
        mensagem,
        idMensagem,
        numeroDoContato
      })

      console.log(response.status)

      await new Promise(r => setTimeout(r, 20000))
    }
  } catch (e: any) {
    console.log(e)
  }
}

async function splitText(text: string, limit = 3800) {
  const parts = []
  let current = ""
  for (const word of text.split(" ")) {
    if ((current + " " + word).length > limit) {
      parts.push(current)
      current = word
    } else {
      current += (current ? " " : "") + word
    }
  }
  if (current) parts.push(current)
  return parts
}
