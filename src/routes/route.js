import express from "express";
import swaggerUi from "swagger-ui-express";
import { createTaskCampaign } from "../services/producers/task.producer.campaign"; // Criar task para campanhas
// import { buscarTodasAsMensagens } from "../config/database/entities/mensagems";
import { HandleReceptiveWebhook } from "../services/handleMessages/handleReceptiveWebhook";
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
        }
        else {
            res.status(403).end();
        }
    }
    catch (e) {
        console.log("❌ Erro tentar verificar webhook GET-/api/v1/receptive/webhook: " + e);
        return res.status(500).end();
    }
});
// Receber mensagens e alteração de status do webhook da meta
routes.post("/api/v1/receptive/webhook", async (req, res) => {
    try {
        res.status(200).end();
        // await createTaskReceptive(req.body);
        await HandleReceptiveWebhook(req.body);
        return;
    }
    catch (e) {
        console.log("❌ Erro ao tentar criar mensagem na fila POST-/api/v1/receptive/webhook: " + e);
        res.status(500).end();
    }
});
// Receber mensagens ativas para disparo
routes.post("/api/v1/campaign", async (req, res) => {
    try {
        const bodyToCampaing = req.body;
        console.log(bodyToCampaing);
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
        });
    }
    catch (e) {
        console.log("❌ Erro ao tentar criar campaign na fila POST-/api/v1/campaign/webhook: " + e);
        res.status(500).json({
            status: false,
            message: "Erro ao inserir na fila de disparo.",
            error: JSON.stringify(e)
        });
    }
});
// Coletar historico de conversação
// routes.get("/api/v1/message-history", async (req, res) => {
//     try {
//         const mensagens = await buscarTodasAsMensagens();
//         res.status(200).json({
//             status: true,
//             message: "Mensagens capturadas",
//             data: mensagens
//         });
//     } catch (e: any) {
//         res.status(500).json({
//             status: false,
//             message: "Erro ao coletar historico de conversação",
//             error: JSON.stringify(e)
//         });
//     }
// })
routes.get("/api/v1/healths", (_, res) => {
    res.json({ status: "ok" });
});
export default routes;
