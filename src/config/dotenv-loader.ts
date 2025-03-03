import dotenv from "dotenv"

dotenv.config()

export const config = {
    apiId: Number(process.env.API_ID),
    apiHash: process.env.API_HASH ?? "",
    sessionString: process.env.SESSION_STRING,
    phoneNumber: process.env.PHONE_NUMBER,
    password: process.env.PASSWORD,
}
