import { criarHistoricoDeConversa } from "../../infra/dataBase/messages"
import { contato } from "../../infra/dataBase/contacts";
import type { User } from "../../infra/dataBase/contacts";

export async function handleHistoricoDeConversa(numeroDoContato: string, repostaEnviada: string, tipoDaMensagem: string, mensagemRecebida: string, timesTampMensagem: string, status: string) {
    let respostaParaMensagem = repostaEnviada ?? "😔 Ops! Tivemos um pequeno imprevisto no momento.\nPedimos que tente novamente mais tarde.\n\n📞 Se for urgente, fale com a gente pelo número: +55 11 3164-7487\n\nA Gamefic agradece seu contato! 💙😊";
    const usuario = await contato(numeroDoContato);

    if (usuario.user) {
        const dadosUser: User = usuario.user
        await criarHistoricoDeConversa(
            dadosUser.id,
            tipoDaMensagem,
            mensagemRecebida,
            respostaParaMensagem,
            timesTampMensagem,
            status
        )
    }
}