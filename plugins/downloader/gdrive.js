import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'gdrive',
    description: 'Download file from Google Drive (max 100MB)',
    category: 'downloader',
    usage: 'gdrive <url>',
    example: '.gdrive https://drive.google.com/file/d/1YTD7Ymux9puFNqu__5WPlYdFZHcGI3Wz/view?usp=drivesdk',
    aliases: ['drive', 'googledrive', 'gdrivedl'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('GDrive: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(drive\.google\.com)\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid Google Drive URL.\n\nExample: .gdrive https://drive.google.com/file/d/1YTD7Ymux9puFNqu__5WPlYdFZHcGI3Wz/view?usp=drivesdk'
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
            return
        }

        processingCache.set(requestKey, true)
        setTimeout(() => {
            processingCache.delete(requestKey)
        }, 30000)

        await sock.sendMessage(msg.key.remoteJid, { react: { text: '🕔', key: msg.key } })

        try {
            const json = await siputzxRequest('/api/d/gdrive', { url })

            if (!json.status || !json.data || !json.data.download) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get Google Drive file.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('GDrive: Could not get file', { url, json })
                return
            }

            const fileName = json.data.name || 'GoogleDriveFile'
            const fileUrl = json.data.download

            // Check file size before sending (max 100MB)
            let fileSize = 0
            try {
                const headRes = await fetch(fileUrl, { method: 'HEAD' })
                if (headRes.ok) {
                    fileSize = parseInt(headRes.headers.get('content-length') || '0', 10)
                }
            } catch (e) {
                logger.warn('GDrive: Could not fetch file size', e)
            }

            if (fileSize > 100 * 1024 * 1024) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ File size exceeds 100MB limit. File size: ${(fileSize / (1024*1024)).toFixed(2)} MB`
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                return
            }

            await sock.sendMessage(msg.key.remoteJid, {
                document: { url: fileUrl },
                fileName,
                mimetype: 'application/octet-stream',
                caption: `${global.FontStyler.toSmallCaps('Google Drive file downloaded successfully')}\n\n⛨〡︎ *${global.FontStyler.toSmallCaps('File Name')}:* ${fileName}\n⛨〡︎ *${global.FontStyler.toSmallCaps('Source')}:* Google Drive\n\n📁 ${global.FontStyler.toSmallCaps('powered by elysia')}`
            }, { quoted: msg })

            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })

        } catch (error) {
            logger.error('GDrive download error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error downloading Google Drive file.\n\nError: ${error.message || 'Unknown error'}`
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        } finally {
            processingCache.delete(requestKey)
        }
    }
}
