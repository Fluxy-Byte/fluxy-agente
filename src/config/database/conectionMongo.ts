import mongoose from "mongoose";

export async function connectMongo() {
    try {
        await mongoose.connect(process.env.MONGO_DB as string);

        console.log("✅ MongoDB conectado com sucesso");
    } catch (error) {
        console.error("❌ Erro ao conectar no Mongo:", error);
        process.exit(1);
    }
}
