import axios from "axios";
export async function getAnwser(mensagem, phone, MENSAGM_DEFAULT) {
    try {
        const resultSession = await CreateSession(phone);
        if ((resultSession.status === 400 &&
            resultSession.data?.error === `Session already exists: ${phone}`) ||
            resultSession.status === 200) {
            const { data, status } = await axios.post("https://fluxe-adk-fluxy.egnehl.easypanel.host/run", {
                "appName": "fluxy",
                "userId": phone,
                "sessionId": phone,
                "newMessage": {
                    "role": "user",
                    "parts": [
                        {
                            "text": mensagem
                        }
                    ]
                }
            });
            if (status === 200) {
                const body = data;
                const resposta = body.find((b) => b.content.parts.some((p) => "text" in p));
                const textPart = resposta?.content.parts.find((p) => "text" in p);
                return textPart?.text ?? MENSAGM_DEFAULT;
            }
        }
        // ✅ GARANTE retorno
        return MENSAGM_DEFAULT;
    }
    catch (e) {
        console.error(e);
        return MENSAGM_DEFAULT;
    }
}
async function CreateSession(phone) {
    const { data, status } = await axios.post(`https://fluxe-adk-fluxy.egnehl.easypanel.host/apps/fluxy/users/${phone}/sessions/${phone}`);
    return {
        status,
        data: data ?? {}
    };
}
