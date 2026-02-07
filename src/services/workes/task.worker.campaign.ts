// Onde o worker executa

import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';
import { sendCampaing } from "../../adapters/meta/sendCampaing";
import { handleHistoricoDeConversa } from "../tools/handleHistoricoDeConversa"

interface Payload {
  numbers: Numbers[],
  template_name: string,
  type: string
}

interface Numbers {
  phone: string,
  parameters: any[]
}

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

  channel.consume(queue, async (msg: any) => {
    if (!msg) return

    const bodyCampaign: Payload = JSON.parse(msg.content.toString())

    try {
      if (bodyCampaign.numbers.length == 0) {
        console.log('❌ Tarefa não concluida pois não tem numeros para disparo');
        channel.ack(msg);
        return;
      }

      for (let i = 0; i < bodyCampaign.numbers.length; i++) {
        let contact = bodyCampaign.numbers[i];
        const dataToSend = {
          "type": bodyCampaign.type,
          "body": {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": contact.phone,
            "type": "template",
            "template": {
              "name": bodyCampaign.template_name,
              "language": {
                "code": "pt_BR"
              },
              "components": contact.parameters
            }
          }
        }

        const type = bodyCampaign.type

        let result = await sendCampaing(dataToSend);

        handleHistoricoDeConversa(contact.phone, bodyCampaign.template_name, "template", "oi", String(new Date()), 'enviado')
      }

      console.log('🛠 Executando tarefa');
      console.log(JSON.stringify(bodyCampaign));

      console.log('✅ Tarefa concluída')
      channel.ack(msg)
    } catch (err) {
      console.log('❌ Falhou, jogando pra DLQ');
      channel.nack(msg, false, false)
    }
  })
}



// {
//   "type": "text",
//     "body": {
//     "messaging_product": "whatsapp",
//       "recipient_type": "individual",
//         "to": "",
//           "type": "template",
//             "template": {
//       "name": "boas_vindas_poup",
//         "language": {
//         "code": "pt_BR"
//       },
//       "components": []
//     }
//   }
// }