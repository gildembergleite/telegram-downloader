import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions/index.js"
import { config } from "../config/dotenv-loader"
import { updateEnvFile } from "../config/env-updater"
import { askQuestion } from "../utils/readline-utils"

export class TelegramService {
    private client: TelegramClient

    constructor() {
        this.client = new TelegramClient(
            new StringSession(config.sessionString),
            config.apiId,
            config.apiHash,
            { connectionRetries: 5 }
        )
    }

    async connect(): Promise<void> {
        console.log("\n🔄 Conectando ao Telegram...\n")

        if (!config.sessionString) {
            await this.authenticate()
        } else {
            try {
                await this.client.connect()
                console.log("\n✅ Bot conectado!")
            } catch {
                console.error("❌ Erro na conexão. Apague o arquivo .env e reinicie a aplicação.")
                process.exit(1)
            }
        }
    }

    private async authenticate(): Promise<void> {
        try {
            console.log("📲 Autenticando no Telegram...")

            await this.client.start({
                phoneNumber: async () => config.phoneNumber || await askQuestion("📞 Digite seu número de telefone (com DDD e código do país): "),
                phoneCode: async () => await askQuestion("📲 Digite o código recebido no Telegram: "),
                password: config.password ? async () => config.password! : async () => "",
                onError: (error) => console.error("❌ Erro de autenticação:", error)
            })

            const sessionString = this.client.session.save() as unknown as string
            updateEnvFile("SESSION_STRING", sessionString)

            console.log("\n✅ Autenticado com sucesso!")
        } catch (error) {
            console.error("❌ Erro inesperado na autenticação:", error)
            process.exit(1)
        }
    }


    async listChats(): Promise<any[]> {
        console.log("\n🔍 Buscando canais e grupos...")

        const chats: any[] = []
        for await (const dialog of this.client.iterDialogs()) {
            if (dialog.isChannel || dialog.isGroup) {
                chats.push(dialog)
            }
        }

        return chats
    }

    getClient(): TelegramClient {
        return this.client
    }
}
