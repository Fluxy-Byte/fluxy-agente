import axios from "axios";
import fs from "fs";
import path from "path";
import { converterAudio } from "../../adapters/agent/converterAudio.Agent"

interface ResultTranscricao {
    status: boolean,
    text: string
}

// export async function getAudio(idAudio: string) {
//     try {
//         const tokenMeta = process.env.TOKEN_META;
//         const { data, status } = await axios.get(`https://graph.facebook.com/v24.0/${idAudio}`,
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${tokenMeta}`
//                 }
//             }
//         )

//         const resultGetAudioMeta: ResultGetVideo = data;

//         if (resultGetAudioMeta.url) {
//             const donwload = await downloadAudio(resultGetAudioMeta.url);
//             const convertAudio: ResultTranscricao = await converterAudio(donwload.local)
//             console.log(convertAudio)
//             return {
//                 status: convertAudio.status,
//                 data: convertAudio.text
//             }
//         }
//         return {
//             status: false,
//             data: ""
//         }
//     } catch (e: any) {
//         return {
//             status: false,
//             data: ""
//         }
//     }
// }


// async function downloadAudio(audioUrl: string) {
//     try {
//         const tokenMeta = process.env.TOKEN_META;

//         const dir = path.join(process.cwd(), "audios");
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir);
//         }

//         console.log(dir)
//         const fileName = `audio_${Date.now()}.ogg`;
//         const filePath = path.join(dir, fileName);

//         const response = await axios.get(audioUrl, {
//             headers: {
//                 Authorization: `Bearer ${tokenMeta}`,
//             },
//             responseType: "arraybuffer",
//         });

//         fs.writeFileSync(filePath, response.data);
//         console.log(filePath)
//         return {
//             status: true,
//             local: filePath
//         };
//     } catch (e: any) {
//         console.log(e)
//         return {
//             status: false,
//             local: ""
//         }
//     }
// }


// interface ResultGetVideo {
//     url?: string,
//     mime_type?: string,
//     sha256?: string,
//     file_size?: number,
//     id?: string,
//     messaging_product?: string
// }

export async function getAudio(idAudio: string) {
    try {
        const urlMicroService = "https://fluxy-microservice-send-mensage-meta.egnehl.easypanel.host/transcribe-audio";
        const { data, status } = await axios.post(urlMicroService,
            {
                "idAudio": idAudio
            }
        )

        return {
            status: status == 200,
            data: data.mensagem ?? "Ops, no momento não consegue escutar seu audio a um devido problema tecnico, poderia me mandar escrito?"
        }
    } catch (e: any) {
        return {
            status: false,
            data: "Ops, no momento não consegue escutar seu audio a um devido problema tecnico, poderia me mandar escrito?"
        }
    }
}
