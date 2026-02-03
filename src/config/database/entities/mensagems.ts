import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface (tipo da classe)
 */
export interface IMessage extends Document {
    id_user: string;
    type_message: string;
    question_message: string;
    answer_message: string;
    date_recept_message: Date;
    date_send_message: Date;
    status_message: string;
}

/**
 * Schema
 */
const MessageSchema = new Schema<IMessage>(
    {
        id_user: {
            type: String,
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
            required: true,
        },

        date_send_message: {
            type: Date,
            default: Date.now,
        },

        status_message: {
            type: String,
            default: "pendente",
        },
    },
    {
        timestamps: true, // cria createdAt e updatedAt automático
    }
);

export const MessageModel = mongoose.model<IMessage>(
    "Message",
    MessageSchema
);


export async function salvarMensagem(dadosMensagem: any) {
    try {
        const mensagem = new MessageModel(dadosMensagem);

        await mensagem.save();

        return mensagem;
    } catch (error) {
        console.error("Erro ao salvar mensagem:", error);
        throw error;
    }
}

export async function buscarPorUsuario(id_user: string) {
    const mensagens = await MessageModel.find({ id_user })
        .sort({ date_send_message: -1 })
        .limit(50);

    return mensagens;
}

export async function buscarTodasAsMensagens() {
    const mensagens = await MessageModel.find()
        .sort({ date_send_message: -1 })
        .limit(50);

    return mensagens;
}