import axios from "axios";

export const sendMenssagem = async (props: { mensagem: string, idMensagem: string, numeroDoContato: string }) => {
    try {

        console.log(`Mensagem gerada pela IA: ${props.mensagem}`)
        const url = process.env.URL_MICROSERVICE ?? "https://fluxe-microservice-message-fluxe-agente.egnehl.easypanel.host";
        const responseSend = await axios.post(`${url}/send-message`,
            {
                "mensagem": props.mensagem,
                "idMensagem": props.idMensagem,
                "numeroDoContato": props.numeroDoContato
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
