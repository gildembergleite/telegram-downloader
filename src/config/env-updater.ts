import fs from "fs"
import path from "path"

const envPath = path.resolve(__dirname, "../../.env")

export function updateEnvFile(key: string, value: string | number): void {
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : ""

    const newContent = envContent.includes(`${key}=`)
        ? envContent.replace(new RegExp(`^${key}=.*`, "m"), `${key}=${value}`)
        : `${envContent.trim()}\n${key}=${value}`

    fs.writeFileSync(envPath, newContent)
    console.log(`✅ ${key} salvo no .env`)
}
