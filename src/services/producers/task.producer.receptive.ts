// Onde a API recebe tarefas

import { getConectionTheChannel } from '../../config/infra/rabbitmg';

export async function createTaskReceptive(task: any) {
    
    const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
    const channel = getConectionTheChannel()
    console.log(`🟢 Criou na fila recptive`);

    const queue = `task.${nomeFila}.receptive.create`
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(task)), {
        persistent: true
    })
    return;
}
