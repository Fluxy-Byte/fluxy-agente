import axios from "axios";

export interface BodyResutl {
  output: string
  nivel_de_cliente: string
}

export const getAnswer = async (mensagem: string, numeroDoContato: string) => {
  try {

    const { data, status } = await axios.post("https://poup-n8n.egnehl.easypanel.host/webhook/9ba11544-5c4e-4f91-818a-08a4ecb596c5",
      {
        "question": mensagem,
        "user": numeroDoContato
      },
      {
        headers: {
          Authorization: "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"
        }
      }
    )

    const result: BodyResutl = status ? data : {
      output: "Tivemos um erro nesse exato momento, por favor tente novemente!",
      nivel_de_cliente: "false"
    };

    return {
      data: result,
      status: status
    }

  } catch (e: any) {
    console.log(`❌ Erro ao requisitar germini: ${JSON.stringify(e)}`)
    return {
      data: {
        output: "Tivemos um erro nesse exato momento, por favor tente novemente!",
        nivel_de_cliente: "false"
      },
      status: 500
    }
  }
}


