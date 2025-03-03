import fs from "fs"

export function ensureFolderExists(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }
}

export function sanitizeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*\n]/g, "_").trim()
}
