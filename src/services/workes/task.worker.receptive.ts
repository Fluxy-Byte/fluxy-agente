import { contato } from "../../infra/dataBase/contacts";
import type { User } from "../../infra/dataBase/contacts";
import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';
import type { MetaWebhook } from '../interfaces/MetaWebhook';
import { criarHistoricoDeConversa } from "../../infra/dataBase/messages"

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

    channel.consume(queue, async (msg: any) => {
        if (!msg) return
        const body = JSON.parse(msg.content.toString())
        console.log(body)
        const task: MetaWebhook = body.bodyTask
        const repostaEnviada: string = body.resposta

        try {
            console.log('\n---------💜 Processando de alimentação da base começando---------\n');

            const mensagem = task.entry[0];
            const dadosDaMesagen = mensagem.changes[0];

            if (dadosDaMesagen.value.messages) {

                const bodyDaMenssage = dadosDaMesagen.value.messages;
                //const profileContact = dadosDaMesagen.value.contacts?.[0]; // Nome no perfil
                const dadosDoBodyDaMensagem = bodyDaMenssage?.[0];

                const mensagemRecebida = dadosDoBodyDaMensagem?.text?.body || "Não indentificada";
                const tipoDaMensagem = dadosDoBodyDaMensagem?.type || false; // Pode ser text ou audio
                const timesTampMensagem = dadosDoBodyDaMensagem.timestamp; // Pode ser text ou audio
                const idMensagem = dadosDoBodyDaMensagem?.id || false;
                const numeroDoContato = dadosDoBodyDaMensagem?.from || false;

                if (idMensagem && numeroDoContato) {

                    let respostaParaMensagem = repostaEnviada ?? "Tivemos um erro inesperado no momento. Tente novamente mais a tarde!\n\nA Fluxy agradece o contato! 💜";
                    const usuario = await contato(numeroDoContato);

                    if (usuario.user) {

                        console.log(usuario.user)
                        const dadosUser: User = usuario.user
                        await criarHistoricoDeConversa(
                            dadosUser.id,
                            tipoDaMensagem,
                            mensagemRecebida,
                            respostaParaMensagem,
                            String(new Date(Number(timesTampMensagem) * 1000)),
                            "enviado",
                        )
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
4


