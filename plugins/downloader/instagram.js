import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'instagram',
    description: 'Download video from Instagram',
    category: 'downloader',
    usage: 'instagram <url>',
    example: '.instagram https://www.instagram.com/reel/DMNiqN2TV3v/?igsh=ahumvfwwwhz64',
    aliases: ['ig', 'igdl', 'reel', 'instadl'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('Instagram: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(www\.)?instagram\.com\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid Instagram URL.\n\nExample: .instagram https://www.instagram.com/reel/DMNiqN2TV3v/?igsh=ahumvfwwwhz64'
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
            const json = await siputzxRequest('/api/d/igdl', { url })

            if (!json.status || !json.data || !Array.isArray(json.data) || !json.data.length) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get Instagram video.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('Instagram: Could not get video', { url, json })
                return
            }

            let videoSent = false
            for (let i = 0; i < json.data.length; i++) {
                if (videoSent) break;
                try {
                    const item = json.data[i]
                    const videoUrl = item.url
                    const thumbnail = item.thumbnail
                    logger.info(`Instagram: Trying video URL ${i + 1}/${json.data.length}`)
                    await sock.sendMessage(msg.key.remoteJid, {
                        video: { url: videoUrl },
                        caption: `${global.FontStyler.toSmallCaps('Instagram video downloaded successfully')}\n\n⛨〡︎ *${global.FontStyler.toSmallCaps('Source')}:* Instagram\n\n🎥 ${global.FontStyler.toSmallCaps('powered by elysia')}`,
                        thumbnail: thumbnail ? { url: thumbnail } : undefined
                    }, { quoted: msg })
                    videoSent = true
                    logger.info(`Instagram: Successfully sent video using URL ${i + 1}`)
                    break;
                } catch (videoError) {
                    logger.error(`Instagram: Failed to send video with URL ${i + 1}:`, videoError.message)
                    if (i === json.data.length - 1) {
                        throw new Error('All video URLs failed to download')
                    }
                }
            }

            if (videoSent) {
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })
            }

        } catch (error) {
            logger.error('Instagram download error:', error)
            logger.error('Error message:', error.message)
            logger.error('Error stack:', error.stack)
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error downloading Instagram video.\n\nError: ${error.message || 'Unknown error'}\n\n${error.stack || ''}`
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        } finally {
            processingCache.delete(requestKey)
        }
    }
}
