import axios from "axios";

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
