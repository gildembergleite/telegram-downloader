import { MediaDownloader } from "./services/media-downloader"
import { TelegramService } from "./services/telegram-service"
import { askQuestion } from "./utils/readline-utils"

async function main() {
    const telegramService = new TelegramService()
    await telegramService.connect()

    const chats = await telegramService.listChats()

    if (chats.length === 0) {
        console.log("⚠️ Nenhum canal ou grupo encontrado.")
        return
    }

    let currentIndex = 0

    while (true) {
        const mediaDownloader = new MediaDownloader(telegramService.getClient(), "../dowloads")
        console.log("\n📜 Canais disponíveis:\n")
        for (let i = currentIndex; i < Math.min(currentIndex + 5, chats.length); i++) {
            console.log(`${i + 1} - ${chats[i].title}`)
        }

        if (chats.length > currentIndex + 5) {
            console.log("\n📌 Digite '1' para listar mais canais...")
        }

        console.log("📌 Digite '2' para pesquisar um canal pelo nome...")
        console.log("📌 Digite '3' para escolher um canal para baixar as mídias...")
        console.log("📌 Digite '0' para sair...")

        let option = await askQuestion("\nEscolha uma opção: ")

        switch (option) {
            case "1":
                if (chats.length > currentIndex + 5) {
                    currentIndex += 5
                } else {
                    console.log("⚠️ Não há mais canais para listar.")
                }
                break

            case "2":
                let searchTerm = await askQuestion("🔍 Digite o nome do canal/grupo para pesquisar: ")
                let filteredChats = chats.filter(chat => chat.title.toLowerCase().includes(searchTerm.toLowerCase()))

                if (filteredChats.length === 0) {
                    console.log("❌ Nenhum canal encontrado com esse nome.")
                } else {
                    console.log("\n📌 Resultados da pesquisa:\n")
                    filteredChats.forEach((chat, index) => {
                        console.log(`${index + 1} - ${chat.title}`)
                    })

                    let chatIndex = await askQuestion("\n📥 Selecione um canal/grupo pelo número ou '0' para cancelar: ")
                    if (chatIndex !== "0") {
                        let selectedChat = filteredChats[Number(chatIndex) - 1]

                        if (!selectedChat) {
                            console.log("❌ Opção inválida. Tente novamente.")
                        } else {
                            console.log(`📂 Selecionado: ${selectedChat.title}`)
                            await mediaDownloader.downloadFromChat(selectedChat)
                            process.exit(0)
                        }
                    }
                }
                break

            case "3":
                let chatIndex = await askQuestion("📥 Selecione um canal/grupo pelo número: ")
                let selectedChat = chats[Number(chatIndex) - 1]

                if (!selectedChat) {
                    console.log("❌ Opção inválida. Tente novamente.")
                } else {
                    console.log(`📂 Selecionado: ${selectedChat.title}`)
                    await mediaDownloader.downloadFromChat(selectedChat)
                    process.exit(0)
                }
                break

            case "0":
                console.log("👋 Saindo...")
                process.exit(0)

            default:
                console.log("❌ Opção inválida. Tente novamente.")
        }
    }
}

main()
