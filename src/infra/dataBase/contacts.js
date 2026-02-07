import { prisma } from '@/lib/prisma';
async function verificandoExistencia(phone) {
    const result = await prisma.user.findMany({
        where: {
            phone
        }
    });
    return {
        status: result.length > 0,
        user: result[0] ?? {}
    };
}
async function criarUsuario(name, phone) {
    const result = await prisma.user.create({
        data: {
            name,
            phone
        }
    });
    return {
        status: result ? true : false,
        user: result ?? {}
    };
}
export async function contato(name, phone) {
    try {
        let user;
        let consulta = await verificandoExistencia(phone);
        if (consulta.user) {
            user = consulta.user;
        }
        else {
            let resultCreate = await criarUsuario(name, phone);
            user = resultCreate.user;
        }
        return {
            status: user ? true : false,
            user
        };
    }
    catch (e) {
        console.log(`Erro ao gerar ususario: ${e}`);
        return {
            status: false,
        };
    }
}
