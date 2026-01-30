import axios from "axios";
import { BodyToSendCampaign } from "../../interfaces/BodySendToCampaing";

export const sendCampaing = async (body: BodyToSendCampaign) => {
    try {
        const tokenMeta = process.env.TOKEN_META;
        const urlMeta = process.env.URL_META ?? "https://graph.facebook.com/v23.0/872884792582393/message_templates";
        const responseSend = await axios.post(urlMeta,
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenMeta}`
                }
            }
        )
        return {
            status: responseSend.status,
            data: JSON.stringify(responseSend.data)
        }

    } catch (e) {
        console.log(`❌ Erro ao requisitar meta campaing: ${JSON.stringify(e)}`)
        return {
            status: 500,
            data: JSON.stringify(e)
        }
    }
}