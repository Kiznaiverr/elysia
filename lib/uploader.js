import axios from 'axios'
import crypto from 'crypto'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

/**
 * Uploads a file to Pomf2.
 * @param {Buffer} content - The file content as a Buffer.
 * @returns {Promise<Object>} - The response from the Pomf2 API.
 */
export async function uploadToPomf2(content) {
    if (!Buffer.isBuffer(content)) {
        throw new Error("Content must be a Buffer")
    }

    const { ext, mime } = (await fileTypeFromBuffer(content)) || {}

    if (!mime || !ext) {
        throw new Error("Unsupported file type")
    }

    const blob = new Blob([content], { type: mime })
    const formData = new FormData()
    const randomBytes = crypto.randomBytes(5).toString("hex")
    formData.append("files[]", blob, `${randomBytes}.${ext}`)

    const headers = {
        ...formData.headers,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
    }

    try {
        const response = await axios.post("https://pomf2.lain.la/upload.php", formData, {
            headers: headers,
        })
        return response.data
    } catch (error) {
        return {
            success: false,
            errorcode: error.response?.status || 500,
            description: error.response?.data?.description || error.message,
        }
    }
}
