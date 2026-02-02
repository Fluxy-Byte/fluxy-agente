
import { MetaWebhook } from '../../interfaces/MetaWebhook';
import { getAnswer } from '../../adapters/agent/conectionAgente';
import { getAudio } from "../../adapters/microsservico/getAudio";
import { Message } from "../../interfaces/MetaWebhook";
import { sendMenssagem } from "../../adapters/microsservico/sendMenssage";
import { createTaskReceptive } from "../producers/task.producer.receptive";
import type { BodyResutl } from "../../adapters/agent/conectionAgente";

export async function HandleReceptiveWebhook(task: MetaWebhook) {
    try {

        const mensagem = task.entry[0];
        const dadosDaMesagen = mensagem.changes[0];

        //await createTaskReceptive(task);

        if (dadosDaMesagen.value.messages) {

            const bodyDaMenssage = dadosDaMesagen.value.messages;
            const dadosDoBodyDaMensagem = bodyDaMenssage?.[0];

            const mensagemRecebida = dadosDoBodyDaMensagem?.text?.body || false;
            const tipoDaMensagem = dadosDoBodyDaMensagem?.type || false;
            const idMensagem = dadosDoBodyDaMensagem?.id || false;
            const numeroDoContato = dadosDoBodyDaMensagem?.from || false;

            console.log(`ID: ${idMensagem} - TYPE: ${tipoDaMensagem} - MSG: ${mensagemRecebida}`);

            if (idMensagem && numeroDoContato) {
                let mensagem;
                if (tipoDaMensagem === "audio") {
                    mensagem = await tratarMensagensDeAudio(
                        dadosDoBodyDaMensagem,
                        idMensagem,
                        numeroDoContato
                    );

                } else if (tipoDaMensagem === "text") {
                    mensagem = await tratarMensagensDeTexto(
                        dadosDoBodyDaMensagem,
                        idMensagem,
                        numeroDoContato
                    );
                } else {
                    mensagem = "Olá! 😊 No momento, ainda não consigo receber mensagens em áudio, imagens, vídeos ou documentos. Poderia me enviar sua dúvida por escrito, por favor? 😊"
                    await sendBodyToMenssage(
                        idMensagem,
                        numeroDoContato,
                        mensagem,
                        "text"
                    )
                }

                await createTaskReceptive({
                    bodyTask: task,
                    resposta: mensagem
                });

            } else {
                console.log(`🔴 Mensagem inválida: ID - ${idMensagem} | FROM: ${numeroDoContato}`);
            }

            console.log('💚 Tratamento de mensagem concluida');
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

            if (resultgGetAudio.status && resultgGetAudio.data) {
                let result: BodyResutl = (await getAnswer(resultgGetAudio.data, numeroDoContato)).data;
                mensagem = result.output;
                await sendBodyToMenssage(idMensagem, numeroDoContato, mensagem, "text");
                return mensagem;
            }

            await sendBodyToMenssage(idMensagem, numeroDoContato, "Percebi que você enviou um áudio, mas no momento só consigo receber respostas em texto. Poderia, por favor, enviar a mensagem por escrito? 😅", "text");
            return "Percebi que você enviou um áudio, mas no momento só consigo receber respostas em texto. Poderia, por favor, enviar a mensagem por escrito? 😅";
        }
    } catch (e: any) {
        console.log("Erro ao coletar mensagem de audio: " + e);
        await sendBodyToMenssage(idMensagem, numeroDoContato, "Percebi que você enviou um áudio, mas no momento só consigo receber respostas em texto. Poderia, por favor, enviar a mensagem por escrito? 😅", "text");
        return "Percebi que você enviou um áudio, mas no momento só consigo receber respostas em texto. Poderia, por favor, enviar a mensagem por escrito? 😅"
    }
}

async function tratarMensagensDeTexto(dados: Message, idMensagem: string, numeroDoContato: string) {
    try {
        let mensagem;

        if (dados.text?.body) {
            const urlAudio = dados.text?.body;
            let resutl: BodyResutl = (await getAnswer(urlAudio, numeroDoContato)).data;
            mensagem = resutl.output
        } else {
            mensagem = "Ola eu sou a *Fly*, no momento estou em construção e não consegui encontrar a mensagem que me enviou acima. Poderia reformular ela por favor?"
        }

        await sendBodyToMenssage(idMensagem, numeroDoContato, mensagem, "text");
        return mensagem;
    } catch (e: any) {
        console.log("Erro ao coletar mensagem de texto: " + e);
        await sendBodyToMenssage(idMensagem, numeroDoContato, "No momento não consegui processar sua solicitação. Poderia tentar novamente, por favor? 😅", "text");
        return "No momento não consegui processar sua solicitação. Poderia tentar novamente, por favor? 😅";
    }
}

async function sendBodyToMenssage(idMensagem: string, numeroDoContato: string, consultaResposta: string, typeMessage: string) {
    try {

        const listaDeRespostas = await splitText(consultaResposta);

        for (const mensagem of listaDeRespostas) {

            await sendMenssagem({
                mensagem,
                idMensagem,
                numeroDoContato
            })

            await new Promise(r => setTimeout(r, 20000))
        }
    } catch (e: any) {
        console.log("Erro ao enviar mensagem: " + e)
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