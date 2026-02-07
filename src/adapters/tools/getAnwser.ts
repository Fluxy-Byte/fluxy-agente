import axios, { AxiosError } from "axios";
import { AdkInvocation } from "../interfaces/AdkInvocation";

/**
 * Envia mensagem ao ADK e retorna a resposta em texto
 */
export async function getAnwser(
  mensagem: string,
  phone: string,
  MENSAGM_DEFAULT: string
): Promise<string> {
  try {
    // 1️⃣ Cria ou reaproveita sessão
    const resultSession = await createSession(phone);

    const sessionOk =
      resultSession.status === 200 ||
      (resultSession.status === 400 &&
        resultSession.data?.error?.includes("Session already exists"));

    if (!sessionOk) {
      console.error("Erro ao criar sessão:", resultSession);
      return MENSAGM_DEFAULT;
    }

    // 2️⃣ Envia mensagem para o agente
    const response = await axios.post(
      "https://fluxe-adk-fluxy.egnehl.easypanel.host/run",
      {
        appName: "fluxy",
        userId: phone,
        sessionId: phone,
        newMessage: {
          role: "user",
          parts: [
            {
              text: mensagem
            }
          ]
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        validateStatus: (status) => status >= 200 && status < 500
      }
    );

    if (response.status !== 200) {
      console.error("Erro ao rodar agente:", response.data);
      return MENSAGM_DEFAULT;
    }

    // 3️⃣ Processa resposta
    const body: AdkInvocation[] = response.data;

    const resposta = body.find((b) =>
      b.content.parts.some((p) => "text" in p)
    );

    const textPart = resposta?.content.parts.find(
      (p): p is { text: string } => "text" in p
    );

    return textPart?.text ?? MENSAGM_DEFAULT;

  } catch (error) {
    handleAxiosError(error, "getAnwser");
    return MENSAGM_DEFAULT;
  }
}

/**
 * Cria sessão no ADK (ou reutiliza se já existir)
 */
async function createSession(phone: string) {
  try {
    const response = await axios.post(
      `https://fluxe-adk-fluxy.egnehl.easypanel.host/apps/fluxy/users/${phone}/sessions/${phone}`,
      {},
      {
        headers: {
          "Content-Type": "application/json"
        },
        validateStatus: (status) => status === 200 || status === 400
      }
    );

    return {
      status: response.status,
      data: response.data ?? {}
    };

  } catch (error) {
    handleAxiosError(error, "createSession");

    return {
      status: 500,
      data: {}
    };
  }
}

/**
 * Centraliza tratamento de erro Axios
 */
function handleAxiosError(error: unknown, origem: string) {
  if (axios.isAxiosError(error)) {
    console.error(`❌ Erro Axios em ${origem}`);

    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("URL:", error.config?.url);

  } else {
    console.error(`❌ Erro desconhecido em ${origem}`, error);
  }
}
