import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function converterAudio(path: string) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(path),
      model: "whisper-1",
      language: "pt"
    });

    return {
      status: true,
      text: transcription.text
    };

  } catch (e: any) {
    console.error("Erro na transcrição:", e);

    return {
      status: false,
      text: ""
    };
  }
}
