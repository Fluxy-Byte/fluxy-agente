// import dns from "dns";

// dns.setDefaultResultOrder("ipv4first");

// export const sendMenssagem = async (props: {
//   mensagem: string;
//   idMensagem: string;
//   numeroDoContato: string;
// }) => {
//   const controller = new AbortController();

//   // Timeout de 15s
//   const timeout = setTimeout(() => {
//     controller.abort();
//   }, 15000);

//   try {
//     console.log(`📨 Mensagem IA: ${props.mensagem}`);

//     const urlMeta =
//       "https://graph.facebook.com/v22.0/872884792582393/messages";

//     const tokenMeta = process.env.TOKEN_META;

//     if (!tokenMeta) {
//       throw new Error("TOKEN_META não definido no .env");
//     }

//     const payload = {
//       messaging_product: "whatsapp",
//       recipient_type: "individual",
//       to: props.numeroDoContato,
//       context: {
//         message_id: props.idMensagem,
//       },
//       type: "text",
//       text: {
//         preview_url: false,
//         body: props.mensagem,
//       },
//     };

//     const response = await fetch(urlMeta, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${tokenMeta}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     clearTimeout(timeout);

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("❌ Erro Meta:", data);

//       throw new Error(
//         `Meta API Error ${response.status}: ${JSON.stringify(data)}`
//       );
//     }

//     console.log("✅ Mensagem enviada:", data);

//     return {
//       status: response.status,
//       data,
//     };

//   } catch (e: any) {
//     clearTimeout(timeout);

//     if (e.name === "AbortError") {
//       console.error("⏱ Timeout ao chamar Meta API");
//     } else {
//       console.error("❌ Erro ao requisitar Meta:", e.message);
//     }

//     return {
//       status: 500,
//       data: e.message ?? JSON.stringify(e),
//     };
//   }
// };

import axios from "axios";

export const sendMenssagem = async (props: { mensagem: string, idMensagem: string, numeroDoContato: string }) => {
    try {

        console.log(`Mensagem gerada pela IA: ${props.mensagem}`)
        // const tokenMeta = process.env.TOKEN_META;
        const urlMeta = "https://graph.facebook.com/v22.0/872884792582393/messages";
        const responseSend = await axios.post(urlMeta,
            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": props.numeroDoContato,
                "context": {
                    "message_id": props.idMensagem
                },
                "type": "text",
                "text": {
                    "preview_url": false,
                    "body": props.mensagem
                }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer EAAnnMWg4ZAq8BQhrPuSuNAsoOqtRnoCaCSqNiHOaXPqrqOGwLrHV5TiMfapxKWbhxYZAn1yqEPO6WIrSndoZADRnHnsUImUYGnIa0ZC7qcjCfozoUrbT1JYFfkRVXxRqmCd3XiCpofZCFhZBJPgeMHE8hXLhL0qlHDfMbl5jMAj0ZAcdhT1XIsf08tUMKiklP00hwZDZD`
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

// import axios from "axios";

// export const sendMenssagem = async (props: { mensagem: string, idMensagem: string, numeroDoContato: string }) => {
//     try {

//         console.log(`Mensagem gerada pela IA: ${props.mensagem}`)
//         // const tokenMeta = process.env.TOKEN_META;
//         const urlMeta = "https://fluxy-microservice-send-mensage-meta.egnehl.easypanel.host/send-message";
//         const responseSend = await axios.post(urlMeta,
//             {
//                 "mensagem": props.mensagem,
//                 "idMensagem": props.idMensagem,
//                 "numeroDoContato": props.numeroDoContato
//             }
//         )

//         return {
//             status: responseSend.status,
//             data: JSON.stringify(responseSend.data)
//         }

//     } catch (e) {
//         console.log(`❌ Erro ao requisitar meta message: ${JSON.stringify(e)}`)
//         return {
//             status: 500,
//             data: JSON.stringify(e)
//         }
//     }
// }