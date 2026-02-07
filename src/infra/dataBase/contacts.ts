import { prisma } from '../../lib/prisma'

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
    return await prisma.user.findFirst({
        where: {
            phone
        }
    })
}

async function criarUsuario(phone: string) {
    return await prisma.user.create({
        data: {
            phone
        }
    })
}

export async function contato(phone: string) {
    try {
        let user = await verificandoExistencia(phone);

        if (!user) {
            user = await criarUsuario(phone);
        }

        return {
            status: true,
            user
        };

    } catch (e) {
        console.error('Erro ao gerar usuário:', e);

        return {
            status: false,
            user: null
        };
    }
}



