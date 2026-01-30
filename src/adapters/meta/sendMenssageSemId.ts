import axios from "axios";

export const sendMenssageSemId = async (props: { mensagem: string, numeroDoContato: string }) => {
    try {
        const tokenMeta = process.env.TOKEN_META;
        const urlMeta = process.env.URL_META ?? "https://graph.facebook.com/v22.0/872884792582393/messages";
        const responseSend = await axios.post(urlMeta,
            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": props.numeroDoContato,
                "type": "text",
                "text": {
                    "preview_url": false,
                    "body": props.mensagem
                }
            },
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
        console.log(`❌ Erro ao requisitar meta message: ${JSON.stringify(e)}`)
        return {
            status: 500,
            data: JSON.stringify(e)
        }
    }
}