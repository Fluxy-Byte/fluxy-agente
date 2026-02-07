import { MetaWebhook } from '../interfaces/MetaWebhook';
import { createTaskReceptive } from "../producers/task.producer.receptive";
import { getAudio } from "../../adapters/microsservico/getAudio";
import type { Message } from "../interfaces/MetaWebhook";
import { sendMenssagem } from "../../adapters/microsservico/sendMenssage";
import { getAnwser } from "../../adapters/tools/getAnwser";

export async function HandleReceptiveWebhook(task: MetaWebhook) {
    try {

        const MENSAGM_DEFAULT = process.env.MENSAGM_DEFAULT ?? "Tivemos um erro inesperado no momento. Tente novamente mais a tarde!\n\nA Fluxy agradece o contato! 💜"

        const mensagem = task.entry[0];
        const dadosDaMesagen = mensagem.changes[0];

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
                        numeroDoContato,
                        MENSAGM_DEFAULT
                    );

                } else if (tipoDaMensagem === "text") {
                    mensagem = await tratarMensagensDeTexto(
                        dadosDoBodyDaMensagem,
                        idMensagem,
                        numeroDoContato,
                        MENSAGM_DEFAULT
                    );
                } else {

                    await sendBodyToMenssage(
                        idMensagem,
                        numeroDoContato,
                        MENSAGM_DEFAULT,
                    )

                    mensagem = MENSAGM_DEFAULT
                }

                await createTaskReceptive({
                    bodyTask: task,
                    resposta: mensagem
                });

            } else {
                console.log(`---------🔴 Mensagem inválida: ID - ${idMensagem} | FROM: ${numeroDoContato}---------`);
            }

            console.log('---------💚 Tratamento de mensagem concluida---------');
        }

    } catch (err) {
        console.log('---------❌ Erro ao processar webhook---------');
        console.error(err);
    }
}


async function tratarMensagensDeAudio(dados: Message, idMensagem: string, numeroDoContato: string, MENSAGM_DEFAULT: string) {
    try {
        const urlAudio = dados.audio?.url;
        const idAudio = dados.audio?.id;
        let mensagem: string;

        if (urlAudio && idAudio) {
            interface ReseultGetAudio {
                status: boolean,
                data: string
            }
            const resultgGetAudio: ReseultGetAudio = await getAudio(idAudio, MENSAGM_DEFAULT);

            if (resultgGetAudio.status && resultgGetAudio.data) {
                let result = resultgGetAudio.data
                mensagem = await getAnwser(result, numeroDoContato, MENSAGM_DEFAULT);
                await sendBodyToMenssage(idMensagem, numeroDoContato, mensagem);
                return mensagem;
            }

            await sendBodyToMenssage(idMensagem, numeroDoContato, MENSAGM_DEFAULT);
            return MENSAGM_DEFAULT
        }
    } catch (e: any) {
        console.log("❌ Erro ao coletar mensagem de audio: " + e);
        await sendBodyToMenssage(idMensagem, numeroDoContato, MENSAGM_DEFAULT);
        return MENSAGM_DEFAULT
    }
}

async function tratarMensagensDeTexto(dados: Message, idMensagem: string, numeroDoContato: string, MENSAGM_DEFAULT: string) {
    try {
        let responseToUser;
        if (dados.text?.body) {
            const mensagemUser = dados.text?.body;
            responseToUser = await getAnwser(mensagemUser, numeroDoContato, MENSAGM_DEFAULT);
        } else {
            responseToUser = MENSAGM_DEFAULT;
        }

        await sendBodyToMenssage(idMensagem, numeroDoContato, responseToUser);
        return responseToUser;
    } catch (e: any) {
        console.log("❌ Erro ao coletar mensagem de texto: " + e);
        await sendBodyToMenssage(idMensagem, numeroDoContato, MENSAGM_DEFAULT);
        return MENSAGM_DEFAULT;
    }
}

async function sendBodyToMenssage(idMensagem: string, numeroDoContato: string, consultaResposta: string) {
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