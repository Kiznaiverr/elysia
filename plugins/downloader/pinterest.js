import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'pinterestdl',
    description: 'Download highest resolution image from Pinterest',
    category: 'downloader',
    usage: 'pindl <url>',
    example: '.pindl https://pin.it/7jWBaQGhd',
    aliases: ['pindl'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('Pinterest: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(www\.)?(pin\.it|pinterest\.com)\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid Pinterest URL.\n\nExample: .pindl https://pin.it/7jWBaQGhd'
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
            const json = await siputzxRequest('/api/d/pinterest', { url })

            if (!json.status || !json.data || !json.data.media_urls || !json.data.media_urls.length) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get Pinterest image.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('Pinterest: Could not get image', { url, json })
                return
            }

            // Ambil resolusi tertinggi (paling besar width*height)
            const highest = json.data.media_urls.reduce((max, curr) => {
                if (curr.type !== 'image') return max
                const currRes = (curr.width || 0) * (curr.height || 0)
                const maxRes = (max.width || 0) * (max.height || 0)
                return currRes > maxRes ? curr : max
            }, json.data.media_urls[0])

            if (!highest || !highest.url) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ No valid image found.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                return
            }

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: highest.url },
                caption: `${global.FontStyler.toSmallCaps('Pinterest image downloaded successfully')}\n\n⛨〡︎ *${global.FontStyler.toSmallCaps('Resolution')}:* ${highest.width}x${highest.height}\n⛨〡︎ *${global.FontStyler.toSmallCaps('Source')}:* Pinterest\n\n🖼️ ${global.FontStyler.toSmallCaps('powered by elysia')}`
            }, { quoted: msg })

            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })

        } catch (error) {
            logger.error('Pinterest download error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error downloading Pinterest image.\n\nError: ${error.message || 'Unknown error'}`
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        } finally {
            processingCache.delete(requestKey)
        }
    }
}
