interface Contact {
  id_user: number
  name_user: string
  phone_user: string
  id_whats: string
  start_date_conversation: Date
  last_date_conversation: Date
  quantity_call_agent: number
  quantity_message_with_agent: number
  pipeline_user: string
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

const criarContato = async (name: string, phone: string, id_whats: string) => {
  try {

    const usuario = new ContactCreate(name, phone, id_whats);

    const resultCreated = await pool.query("INSERT INTO contacts (name_user, phone_user, id_whats) VALUES ($1, $2, $3) RETURNING id_user",
      [usuario.name_user, usuario.phone_user, usuario.id_whats]
    );

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

  } finally {
    await pool.end();
  }
}

const consultarContato = async (phone: string) => {
  try {

    const resultConsulta = await pool.query("SELECT * FROM contacts WHERE phone_user = $1",
      [phone]
    );

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

  } finally {
    await pool.end();
  }
}


export const validarCadastroDoContato = async (
  name: string,
  phone: string,
  id_whats: string
): Promise<number | false> => {

  try {
    console.log(name, phone, id_whats)
    const contato = await consultarContato(phone);
    console.log(contato)
    // Se já existe retorna id
    if (contato.status === true) {
      return contato.data.id_user;
    }

    // Se não existe, cria e retorna id
    const criado = await criarContato(name, phone, id_whats);

    if (criado.status === true) {
      return criado.data.id_user;
    }

    return false;

  } catch (e: any) {
    console.log("Erro na verificação de contato:", e);
    return false;
  }
};
