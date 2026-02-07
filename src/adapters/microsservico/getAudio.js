import axios from "axios";
export async function getAudio(idAudio, MENSAGM_DEFAULT) {
    try {
        const url = process.env.URL_MICROSERVICE ?? "https://fluxe-microservice-message-fluxe-agente.egnehl.easypanel.host";
        const urlMicroService = `${url}/transcribe-audio`;
        const { data, status } = await axios.post(urlMicroService, {
            "idAudio": idAudio
        });
        return {
            status: status == 200,
            data: data.mensagem ?? MENSAGM_DEFAULT
        };
    }
    catch (e) {
        return {
            status: false,
            data: MENSAGM_DEFAULT
        };
    }
}
