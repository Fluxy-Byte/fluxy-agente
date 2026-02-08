// Onde o worker executa

import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';
import { sendCampaing } from "../../adapters/microsservico/sendCampaing";
import { handleHistoricoDeConversa } from "../tools/handleHistoricoDeConversa"
import { Task, LeadError, LeadRegister } from "../producers/task.producer.vendas"

export async function startTaskWorkerCampaign() {
  const channel = getConectionTheChannel()
  const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
  const queue = `task.${nomeFila}.vendas.create`
  const dlq = `task.${nomeFila}.vendas.dlq`

  await channel.assertQueue(dlq, { durable: true })

  await channel.assertQueue(queue, {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: dlq
  })

  channel.prefetch(1)

  channel.consume(queue, async (msg: any) => {
    if (!msg) return

    const bodyVendas: Task = JSON.parse(msg.content.toString())
    console.log("🟠 Body recebido: " + bodyVendas)
    try {
      if (!bodyVendas.dados.telefone) {
        console.log('❌ Tarefa não concluida pois não tem numero para disparo');
        channel.ack(msg);
        return;
      }

      let bodyPayload;

      if (bodyVendas.name_template == "lead_register") {
        const dadosLead: LeadRegister = bodyVendas.dados;
        bodyPayload = {
          messaging_product: "whatsapp",
          to: dadosLead.telefoneAgente,
          type: "template",

          template: {
            name: bodyVendas.name_template,

            language: {
              code: "pt_BR"
            },

            components: [
              {
                "type": "header",
                "parameters": [
                  {
                    "type": "text",
                    "text": dadosLead.nomeAgente
                  }
                ]
              },
              {
                "type": "body",
                "parameters": [
                  {
                    "type": "text",
                    "text": dadosLead.nome
                  },
                  {
                    "type": "text",
                    "text": dadosLead.telefone
                  },
                  {
                    "type": "text",
                    "text": dadosLead.produto
                  },
                  {
                    "type": "text",
                    "text": dadosLead.nivelInteresse
                  }
                ]
              }

            ]
          }
        }
      } else if (bodyVendas.name_template == "error_lead") {
        const dadosLead: LeadError = bodyVendas.dados;
        bodyPayload = {
          messaging_product: "whatsapp",
          to: bodyVendas.dados.telefone,
          type: "template",

          template: {
            name: bodyVendas.name_template,

            language: {
              code: "pt_BR"
            },

            components: [
              {
                "type": "header",
                "parameters": [
                  {
                    "type": "text",
                    "text": dadosLead.nomeAgente
                  }
                ]
              },
              {
                "type": "body",
                "parameters": [
                  {
                    "type": "text",
                    "text": dadosLead.nome
                  },
                  {
                    "type": "text",
                    "text": dadosLead.telefone
                  },
                  {
                    "type": "text",
                    "text": dadosLead.problema
                  }
                ]
              }

            ]
          }
        }
      }

      let result = await sendCampaing(bodyPayload);
      console.log(result)
      handleHistoricoDeConversa(bodyVendas.dados.telefone, bodyVendas.name_template, "template", "oi", String(new Date()), 'enviado')

      console.log('🛠 Executando tarefa');
      console.log(JSON.stringify(bodyPayload));

      console.log('✅ Tarefa concluída')
      channel.ack(msg)
    } catch (err) {
      console.log('❌ Falhou, jogando pra DLQ');
      channel.nack(msg, false, false)
    }
  })
}
