// Onde o worker executa

import { getConectionTheChannel } from '../../config/infra/rabbitmg';
import { sendCampaing } from "../../adapters/meta/sendCampaing";
import { BodyReqCampaing } from "../../interfaces/BodySendToCampaing"

export async function startTaskWorkerCampaign() {
  const channel = getConectionTheChannel()
  const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
  const queue = `task.${nomeFila}.campaign.create`
  const dlq = `task.${nomeFila}.campaign.dlq`

  await channel.assertQueue(dlq, { durable: true })

  await channel.assertQueue(queue, {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: dlq
  })

  channel.prefetch(1)

  channel.consume(queue, async msg => {
    if (!msg) return

    const bodyCampaign: BodyReqCampaing = JSON.parse(msg.content.toString())

    try {
      const dataToSend = bodyCampaign.body;
      const typeBody = bodyCampaign.type;
      console.log('🛠 Executando tarefa');
      console.log(JSON.stringify(bodyCampaign));
      let responseSendCampaing = await sendCampaing(dataToSend);

      // console.log(responseSendCampaing);
      console.log('✅ Tarefa concluída')
      channel.ack(msg)
    } catch (err) {
      console.log('❌ Falhou, jogando pra DLQ');
      channel.nack(msg, false, false)
    }
  })
}
