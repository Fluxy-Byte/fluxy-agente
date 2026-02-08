
import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';

// Onde a API recebe tarefas

export async function createTaskReceptive(task: any) {

    const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
    const channel = await getConectionTheChannel()
    
    console.log(`\n🟢 Criou na fila recptive`);

    const queue = `task.${nomeFila}.receptive.create`
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(task)), {
        persistent: true
    })
    return;
}