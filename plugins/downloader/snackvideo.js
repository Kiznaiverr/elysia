import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'snackvideo',
    description: 'Download video from SnackVideo',
    category: 'downloader',
    usage: 'snackvideo <url>',
    example: '.snackvideo https://s.snackvideo.com/p/dwlMd51U',
    aliases: ['snack', 'snackdl', 'snackvid'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('SnackVideo: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(www\.)?(snackvideo\.com|s\.snackvideo\.com)\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid SnackVideo URL.\n\nExample: .snackvideo https://s.snackvideo.com/p/dwlMd51U'
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
            const json = await siputzxRequest('/api/d/snackvideo', { url })

            if (!json.status || !json.data || !json.data.videoUrl) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get SnackVideo video.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('SnackVideo: Could not get video', { url, json })
                return
            }

            const data = json.data
            const caption = `${global.FontStyler.toSmallCaps('SnackVideo downloaded successfully')}\n\n⛨〡︎ *${global.FontStyler.toSmallCaps('Creator')}:* ${data.creator?.name || 'Unknown'}\n⛨〡︎ *${global.FontStyler.toSmallCaps('Title')}:* ${data.title || 'No title'}\n⛨〡︎ *${global.FontStyler.toSmallCaps('Views')}:* ${data.interaction?.views?.toLocaleString() || 'N/A'}\n⛨〡︎ *${global.FontStyler.toSmallCaps('Likes')}:* ${data.interaction?.likes?.toLocaleString() || 'N/A'}\n⛨〡︎ *${global.FontStyler.toSmallCaps('Shares')}:* ${data.interaction?.shares?.toLocaleString() || 'N/A'}\n\n🎥 powered by elysia`

            await sock.sendMessage(msg.key.remoteJid, {
                video: { url: data.videoUrl },
                caption,
                thumbnail: data.thumbnail ? { url: data.thumbnail } : undefined
            }, { quoted: msg })

            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })

        } catch (error) {
            logger.error('SnackVideo download error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error downloading SnackVideo video.\n\nError: ${error.message || 'Unknown error'}`
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        } finally {
            processingCache.delete(requestKey)
        }
    }
}
