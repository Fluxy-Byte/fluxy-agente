interface Contact {
  id_user: number
  name_user: string
  phone_user: string
  id_whats: string
  start_date_conversation: Date
  last_date_conversation?: Date
  quantity_call_agent: number
  quantity_message_with_agent: number
  pipeline_user?: string
}

import pool from "../conection"

class ContactCreate {
  name_user!: string
  phone_user!: string
  id_whats!: string

  constructor(name: string, phone: string, id_whats: string) {
    this.name_user = name;
    this.phone_user = phone;
    this.id_whats = id_whats;
  }
}

const criarContato = async (name: string, phone: string, id_whats: string, pipeline_user: string) => {
  try {

    const usuario = new ContactCreate(name, phone, id_whats);

    const resultCreated = await pool.query("INSERT INTO contacts (name_user, phone_user, id_whats, quantity_call_agent, quantity_message_with_agent, pipeline_user) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_user",
      [usuario.name_user, usuario.phone_user, usuario.id_whats, 1, 1, pipeline_user]
    );

    console.log("Contato criado com sucesso: " + resultCreated.rows[0])

    return {
      data: resultCreated.rows[0] ?? {},
      status: resultCreated.rows[0] ? true : false
    }

  } catch (e: any) {

    console.log("Erro ao salvar contato na base: " + e);

    return {
      data: {},
      status: false
    };

  }
}

const consultarContato = async (phone: string, pipeline_user: string) => {
  try {

    const resultConsulta = await pool.query("SELECT * FROM contacts WHERE phone_user = $1",
      [phone]
    );

    if (resultConsulta.rows[0]) {

      const dadosUser: Contact = resultConsulta.rows[0];

      if (dadosUser.pipeline_user && dadosUser.pipeline_user != pipeline_user) {
        const updateContact = await pool.query("UPDATE contacts SET pipeline_user = $1 WHERE phone_user = $2", [phone, pipeline_user]);
        console.log("Contato atualizado no campo do pipeline_user: " + updateContact.rows[0])
      }

    }

    return {
      data: resultConsulta.rows[0] ?? {},
      status: resultConsulta.rows[0] ? true : false
    }

  } catch (e: any) {

    console.log("Erro ao consultar contato na base: " + e);

    return {
      data: {},
      status: false
    };

  }
}


export const validarCadastroDoContato = async (
  name: string,
  phone: string,
  id_whats: string,
  pipeline_user: string
): Promise<number | false> => {

  try {
    console.log(`Contato em validação de base: ${name}, ${phone}, ${id_whats}`)
    const contato = await consultarContato(phone, pipeline_user);

    // Se já existe retorna id
    if (contato.status === true) {
      return contato.data.id_user;
    }

    // Se não existe, cria e retorna id
    const criado = await criarContato(name, phone, id_whats, pipeline_user);

    if (criado.status === true) {
      return criado.data.id_user;
    }

    return false;

  } catch (e: any) {
    console.log("❌ Erro na verificação de contato:", e);
    return false;
  }
};
