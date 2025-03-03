import fs from "fs"
import path from "path"
import { TelegramClient } from "telegram"
import { ensureFolderExists, sanitizeFileName } from "../utils/file-utils"

export class MediaDownloader {
    private client: TelegramClient
    private downloadsFolder: string

    constructor(client: TelegramClient, downloadsFolder: string) {
        this.client = client
        this.downloadsFolder = downloadsFolder
        ensureFolderExists(this.downloadsFolder)
    }

    async downloadFromChat(chat: any): Promise<void> {
        console.log(`\n📥 Iniciando download de mídias do: ${chat.title}`)

        const chatFolder = path.join(this.downloadsFolder, sanitizeFileName(chat.title))
        const logFile = path.join(chatFolder, `download_log.json`)

        ensureFolderExists(chatFolder)

        let downloadLog: Record<string, any> = {}
        if (fs.existsSync(logFile)) {
            try {
                downloadLog = JSON.parse(fs.readFileSync(logFile, "utf-8"))
            } catch (error) {
                console.error("⚠️ Erro ao carregar log de downloads:", error)
            }
        }

        for await (const message of this.client.iterMessages(chat.id, { reverse: true })) {
            if (!message.media) continue

            const fileExtension = this.getMediaExtension(message)
            const fileName = `${message.id}${fileExtension}`
            const filePath = path.join(chatFolder, fileName)

            if (downloadLog[message.id]) {
                console.log(`⏭️ Mensagem ${message.id} já baixada, pulando...`)
                continue
            }

            try {
                console.log(`📥 Baixando mídia da mensagem ${message.id}...`)
                await this.client.downloadMedia(message, { outputFile: filePath })
                console.log(`✅ Download concluído: ${fileName}`)

                downloadLog[message.id] = { id: message.id, file: fileName, date: new Date().toISOString() }
                fs.writeFileSync(logFile, JSON.stringify(downloadLog, null, 2))
            } catch (error) {
                console.error(`❌ Erro ao baixar ${fileName}:`, error)
            }
        }

        console.log("\n🚀 Processo concluído!")
    }

    private getMediaExtension(message: any): string {
        if (message.photo) return ".jpg"
        if (message.video) return ".mp4"
        if (message.audio) return ".mp3"
        if (message.document) return path.extname(message.document.fileName || ".bin")
        return ".dat"
    }
}
