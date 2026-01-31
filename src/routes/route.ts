import express from "express";
import swaggerUi from "swagger-ui-express";
import { BodyReqCampaing } from "../interfaces/BodySendToCampaing";
import { createTaskCampaign } from '../services/producers/task.producer.campaign'; // Criar task para campanhas
import { sendMenssageSemId } from "../adapters/meta/sendMenssageSemId";
import { createTaskReceptive } from "../services/producers/task.producer.receptive";
const routes = express();

routes.use(express.json());

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API Teste",
    version: "1.0.0"
  }
};

routes.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Para validar o token de acesso webhook
routes.get("/api/v1/receptive/webhook", async (req, res) => {
  try {
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
    const verifyToken = process.env.VERIFY_TOKEN;
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WEBHOOK VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.status(403).end();
    }
  } catch (e) {
    console.log("❌ Erro tentar verificar webhook GET-/api/v1/receptive/webhook: " + e)
    return res.status(500).end();
  }
})

// Receber mensagens e alteração de status do webhook da meta
routes.post("/api/v1/receptive/webhook", async (req, res) => {
  try {
    res.status(200).end()
    await createTaskReceptive(req.body);
    return
  } catch (e) {
    console.log("❌ Erro ao tentar criar mensagem na fila POST-/api/v1/receptive/webhook: " + e)
    res.status(500).end();
  }
})

// Receber mensagem do SDR
routes.post("/api/v1/receptive/sdr/webhook", async (req, res) => {
  try {
    const body: WhatsAppMessageList = req.body
    const dados = {
      mensagem: body[0].content.text,
      numeroDoContato: body[0].chatid
    }
    await sendMenssageSemId(dados);
    return res.status(200).end()
  } catch (e) {
    console.log("❌ Erro ao tentar criar mensagem na fila POST-/api/v1/receptive/webhook: " + e)
    res.status(500).end();
  }
})

// Receber mensagens ativas para disparo
routes.post("/api/v1/campaign", async (req, res) => {
  try {
    const bodyToCampaing: BodyReqCampaing = req.body;
    console.log(bodyToCampaing)
    if (!bodyToCampaing.body.messaging_product || !bodyToCampaing.body.recipient_type || !bodyToCampaing.body.template || !bodyToCampaing.body.to || !bodyToCampaing.type) {
      return res.status(401).json({
        status: false,
        message: "Erro ao inserir na fila de disparo pois esta faltando dados no corpo da req.",
        error: ""
      });
    }

    await createTaskCampaign(bodyToCampaing);

    return res.status(200).json({
      status: true,
      message: "Campanha inserida na fila de disparo com sucesso.",
      error: ""
    })
  } catch (e) {
    console.log("❌ Erro ao tentar criar campaign na fila POST-/api/v1/campaign/webhook: " + e)
    res.status(500).json({
      status: false,
      message: "Erro ao inserir na fila de disparo.",
      error: JSON.stringify(e)
    });
  }
})

routes.get("/api/v1/healths", (_, res) => {
  res.json({ status: "ok" });
});

export default routes;


export type WhatsAppMessageList = WhatsAppMessagePayload[];

export interface WhatsAppMessagePayload {
  chatid: string;
  content: MessageContent;
  convertOptions: string;
  edited: string;
  fromMe: boolean;
  id: string;
  isGroup: boolean;
  messageTimestamp: number;
  messageType: MessageType;
  messageid: string;
  owner: string;
  quoted: string;
  reaction: string;
  readChatAttempted: boolean;
  sender: string;
  senderName: string;
  source: "web" | "mobile" | "api";
  status: MessageStatus;
  text: string;
  track_id: string;
  track_source: string;
}

export interface MessageContent {
  text: string;
  contextInfo: MessageContextInfo;
}

export interface MessageContextInfo {
  quotedMessageId?: string;
  mentionedJid?: string[];
  participant?: string;
}

export type MessageType =
  | "ExtendedTextMessage"
  | "TextMessage"
  | "ImageMessage"
  | "VideoMessage"
  | "AudioMessage"
  | "DocumentMessage"
  | "StickerMessage"
  | "ContactMessage"
  | "LocationMessage"
  | "ButtonsMessage"
  | "ListMessage";

export type MessageStatus =
  | "Pending"
  | "Sent"
  | "Delivered"
  | "Read"
  | "Failed";
