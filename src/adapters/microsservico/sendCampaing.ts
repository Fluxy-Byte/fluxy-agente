import axios from "axios";
import { BodyTemplate } from "../interfaces/BodySendToCampaing";

export const sendCampaing = async (body: any) => {
    try {
        const url = process.env.URL_MICROSERVICE ?? "https://fluxe-microservice-message-fluxe-agente.egnehl.easypanel.host";
        console.log(JSON.stringify(body))
        const responseSend = await axios.post(`${url}/send-campaign`,
            body
        )

        return {
            status: responseSend.status,
            data: JSON.stringify(responseSend.data)
        }

    } catch (e) {
        console.log(`❌ Erro ao requisitar meta message: ${JSON.stringify(e)}`)
        return {
            status: 500,
            data: JSON.stringify(e)
        }
    }
}