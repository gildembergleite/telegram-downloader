import readline from "readline"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

export function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve))
}

export function closeReadline(): void {
    rl.close()
}
