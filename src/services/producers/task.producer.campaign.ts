// Onde a API recebe tarefas
import { BodyReqCampaing } from "../../interfaces/BodySendToCampaing"

import { getConectionTheChannel } from '../../config/infra/rabbitmg';

export async function createTaskCampaign(task: BodyReqCampaing) {
    const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
    const channel = getConectionTheChannel()
    console.log(`🔵 Criou na fila campaing`);
    const queue = `task.${nomeFila}.campaign.create`
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(task)), {
        persistent: true
    })
    return;
}
