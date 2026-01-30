// Onde o worker executa

import { getConectionTheChannel } from '../../config/infra/rabbitmg';
import { MetaWebhook } from '../../interfaces/MetaWebhook';
import { getAnswer } from '../../adapters/agent/conectionAgente';
import { sendMenssagem } from "../../adapters/meta/sendMenssage";
import { getAudio } from "../../adapters/meta/getAudio";
import { Message } from "../../interfaces/MetaWebhook";

export async function HandleReceptiveWebhook(task: MetaWebhook) {
    try {
        console.log('🛠 Processando webhook direto');

        const mensagem = task.entry[0];
        const dadosDaMesagen = mensagem.changes[0];

        console.log("\n\n");

        // ======================
        // MENSAGENS
        // ======================
        if (dadosDaMesagen.value.messages) {

            const bodyDaMenssage = dadosDaMesagen.value.messages;
            const dadosDoBodyDaMensagem = bodyDaMenssage?.[0];

            const mensagemRecebida = dadosDoBodyDaMensagem?.text?.body || false;
            const tipoDaMensagem = dadosDoBodyDaMensagem?.type || false;
            const idMensagem = dadosDoBodyDaMensagem?.id || false;
            const numeroDoContato = dadosDoBodyDaMensagem?.from || false;

            console.log(`ID: ${idMensagem} - TYPE: ${tipoDaMensagem} - MSG: ${mensagemRecebida}`);

            if (idMensagem && numeroDoContato) {

                if (tipoDaMensagem === "audio") {
                    await tratarMensagensDeAudio(
                        dadosDoBodyDaMensagem,
                        idMensagem,
                        numeroDoContato
                    );

                } else if (tipoDaMensagem === "text") {
                    await tratarMensagensDeTexto(
                        dadosDoBodyDaMensagem,
                        idMensagem,
                        numeroDoContato
                    );
                } else {
                    let mensagem = "Olá! 😊 No momento, ainda não consigo receber mensagens em áudio, imagens, vídeos ou documentos. Poderia me enviar sua dúvida por escrito, por favor? 😊"
                    await sendMenssagem({
                        mensagem,
                        idMensagem,
                        numeroDoContato
                    })
                }

            } else {
                console.log(`🔴 Mensagem inválida: ID - ${idMensagem} | FROM: ${numeroDoContato}`);
            }

            console.log('💚 Processamento concluído');
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

        // ======================
        // OUTROS
        // ======================
        else {
            console.log(`❤️ Payload não reconhecido`);
        }

    } catch (err) {
        console.log('❌ Erro ao processar webhook');
        console.error(err);
    }
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
            if (resultgGetAudio.status && resultgGetAudio.data) {
                mensagem = (await getAnswer(resultgGetAudio.data, numeroDoContato)).data;
                await sendBodyToMenssage(idMensagem, numeroDoContato, mensagem, "text");
                return;
            }

            await sendBodyToMenssage(idMensagem, numeroDoContato, "Percebi que você enviou um áudio, mas no momento só consigo receber respostas em texto. Poderia, por favor, enviar a mensagem por escrito? 😅", "text");
            return;
        }
    } catch (e: any) {
        console.log(e);
        await sendBodyToMenssage(idMensagem, numeroDoContato, "Percebi que você enviou um áudio, mas no momento só consigo receber respostas em texto. Poderia, por favor, enviar a mensagem por escrito? 😅", "text");
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

        await sendBodyToMenssage(idMensagem, numeroDoContato, mensagem, "text");
        return;
    } catch (e: any) {
        console.log(e);
        await sendBodyToMenssage(idMensagem, numeroDoContato, "No momento não consegui processar sua solicitação. Poderia tentar novamente, por favor? 😅", "text");
        return;
    }
}

async function sendBodyToMenssage(idMensagem: string, numeroDoContato: string, consultaResposta: string, typeMessage: string) {
    try {

        const listaDeRespostas = await splitText(consultaResposta);

        for (const mensagem of listaDeRespostas) {

            const payload = {
                "payload": mensagem,
                "id_conversa": idMensagem,
                "numero_usuario": numeroDoContato,
                "tipo_mensagem": typeMessage
            }

            await createTaskReceptive(payload)

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


async function createTaskReceptive(task: any) {
    const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
    const channel = getConectionTheChannel()
    console.log(`🟢 Criou na fila recptive`);
    console.log(JSON.stringify(task))
    const queue = `task.${nomeFila}.receptive.create`
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(task)), {
        persistent: true
    })
    return;
}