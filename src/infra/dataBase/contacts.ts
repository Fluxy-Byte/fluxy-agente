import { prisma } from '@/lib/prisma'

export interface User {
    id: number;
    email: string | null;
    name: string | null;
    phone: string;
    start_date_conversation: Date;
    last_date_conversation: Date | null;
    pipeline_user: string;
}

async function verificandoExistencia(phone: string) {
    const result = await prisma.user.findMany({
        where: {
            phone
        }
    })

    return {
        status: result.length > 0,
        user: result[0] ?? {}
    };
}

async function criarUsuario(name: string, phone: string) {
    const result = await prisma.user.create({
        data: {
            name,
            phone
        }
    })

    return {
        status: result ? true : false,
        user: result ?? {}
    };
}


export async function contato(name: string, phone: string) {
    try {
        let user: User;

        let consulta = await verificandoExistencia(phone);
        if (consulta.user) {
            user = consulta.user;
        } else {
            let resultCreate = await criarUsuario(name, phone);
            user = resultCreate.user;
        }

        return {
            status: user ? true : false,
            user
        }
    }

    catch (e) {
        console.log(`Erro ao gerar ususario: ${e}`);
        return {
            status: false,
        }
    }
}

