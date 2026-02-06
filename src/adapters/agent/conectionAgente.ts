import axios from "axios";

export interface BodyResult {
  output: string
  nivel_de_cliente: string
  nome_user: string
  tipo_produto: string
  nivel_de_interesse: string
  informacoes_completas: string
}

export const getAnswer = async (mensagem: string, numeroDoContato: string) => {
  try {
    const tokenAgente = process.env.TOKEN_AGENTE;
    const urlAgente = process.env.URL_AGENTE ?? "https://poup-n8n.egnehl.easypanel.host/webhook/9ba11544-5c4e-4f91-818a-08a4ecb596c5"
    const { data, status } = await axios.post(urlAgente,
      {
        "question": mensagem,
        "user": numeroDoContato
      },
      {
        headers: {
          Authorization: tokenAgente
        }
      }
    )

    console.log(data)

    const result: BodyResult = {
      output: data.output ?? "Tivemos um erro nesse exato momento, por favor tente novemente!",
      nivel_de_cliente: data.nivel_de_cliente ?? "false",
      nome_user: data.nome_user ?? "Não indentificado",
      tipo_produto: data.tipo_produto ?? "",
      nivel_de_interesse: data.nivel_de_interesse ?? "Novo",
      informacoes_completas: data.informacoes_completas ?? "false",
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
        nivel_de_cliente: "false",
        nome_user: "Não indentificado",
        tipo_produto: "",
        nivel_de_interesse: "Novo",
        informacoes_completas: "false",
      },
      status: 500
    }
  }
}


