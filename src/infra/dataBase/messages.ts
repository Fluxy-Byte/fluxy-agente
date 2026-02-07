
import mongoose, { Schema, Document } from "mongoose";

export async function connectMongo() {
    try {
        await mongoose.connect(process.env.DATABASE_URL_MONGO as string);

        console.log("✅ MongoDB conectado com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao conectar no MongoDB:", error);
    }
}

/* ===============================
   INTERFACE
================================ */
export interface IMessage extends Document {
    id_user: number;
    type_message: string;
    question_message: string;
    answer_message: string;
    date_recept_message: Date;
    date_send_message: Date;
    status_message: string;
}

/* ===============================
   SCHEMA
================================ */
const MessageSchema = new Schema<IMessage>(
    {
        id_user: {
            type: Number,
            required: true,
        },

        type_message: {
            type: String,
            required: true,
        },

        question_message: {
            type: String,
            required: true,
        },

        answer_message: {
            type: String,
            required: true,
        },

        date_recept_message: {
            type: Date,
            default: Date.now,
        },

        date_send_message: {
            type: Date,
        },

        status_message: {
            type: String,
            enum: ["enviado", "recebido", "erro", "pendente"],
            default: "pendente",
        },
    },
    {
        timestamps: true,
    }
);

/* ===============================
   MODEL
================================ */
export const Message = mongoose.model<IMessage>(
    "Message",
    MessageSchema
);

/* ===============================
   EXEMPLO DE USO
================================ */

export async function criarHistoricoDeConversa(id_user: number, type_message: string, question_message: string, answer_message: string, date_recept_message: string, status_message: string) {
    const msg = await Message.create({
        id_user,
        type_message,
        question_message,
        answer_message,
        date_send_message: new Date(),
        date_recept_message,
        status_message,
    });

    console.log("📨 Mensagem salva:", msg);
}


export async function coletarHistorico(id_user: number) {
  return await Message.find({ id_user });
}

