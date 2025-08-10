import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'twitter',
    description: 'Download video from Twitter',
    category: 'downloader',
    usage: 'twitter <url>',
    example: '.twitter https://twitter.com/9GAG/status/1661175429859012608',
    aliases: ['tw', 'twdl', 'twitterdl'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('Twitter: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(www\.)?(twitter\.com)\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid Twitter URL.\n\nExample: .twitter https://twitter.com/9GAG/status/1661175429859012608'
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
            const json = await siputzxRequest('/api/d/twitter', { url })

            if (!json.status || !json.data || !json.data.downloadLink) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get Twitter video.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('Twitter: Could not get video', { url, json })
                return
            }

            const data = json.data
            const caption = `${global.FontStyler.toSmallCaps('Twitter video downloaded successfully')}\n\n⛨〡︎ *${global.FontStyler.toSmallCaps('Title')}:* ${data.videoTitle || 'No title'}\n⛨〡︎ *${global.FontStyler.toSmallCaps('Description')}:* ${data.videoDescription || '-'}\n\n🎥 powered by elysia`

            await sock.sendMessage(msg.key.remoteJid, {
                video: { url: data.downloadLink },
                caption,
                thumbnail: data.imgUrl ? { url: data.imgUrl } : undefined
            }, { quoted: msg })

            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })

        } catch (error) {
            logger.error('Twitter download error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error downloading Twitter video.\n\nError: ${error.message || 'Unknown error'}`
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        } finally {
            processingCache.delete(requestKey)
        }
    }
}
