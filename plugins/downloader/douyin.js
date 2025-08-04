import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'douyin',
    description: 'Download video from Douyin',
    category: 'downloader',
    usage: 'douyin <url>',
    example: '.douyin https://www.douyin.com/video/7256984651137289483',
    aliases: ['dy', 'douyindl'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('Douyin: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(www\.)?douyin\.com\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid Douyin URL.\n\nExample: .douyin https://www.douyin.com/video/7256984651137289483'
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
            const json = await siputzxRequest('/api/d/douyin', { url })

            if (!json.status || !json.data || !json.data.downloads || !json.data.downloads.length) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get Douyin video.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('Douyin: Could not get video', { url, json })
                return
            }

            const caption = `${global.FontStyler.toSmallCaps('Hello')}! ${global.FontStyler.toSmallCaps('Douyin video downloaded successfully')}.

⛨〡︎ *${global.FontStyler.toSmallCaps('Title')}:* ${json.data.title || 'No title'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Source')}:* Douyin

🎥 ${global.FontStyler.toSmallCaps('powered by elysia')}`

            let videoSent = false
            for (let i = 0; i < json.data.downloads.length; i++) {
                if (videoSent) break; 
                
                try {
                    const downloadItem = json.data.downloads[i]
                    const videoUrl = downloadItem.url
                    logger.info(`Douyin: Trying video URL ${i + 1}/${json.data.downloads.length} (${downloadItem.quality})`)
                    
                    await sock.sendMessage(msg.key.remoteJid, {
                        video: { url: videoUrl },
                        caption,
                        thumbnail: json.data.thumbnail ? { url: json.data.thumbnail } : undefined
                    }, { quoted: msg })
                    
                    videoSent = true
                    logger.info(`Douyin: Successfully sent video using URL ${i + 1} (${downloadItem.quality})`)
                    break; 
                    
                } catch (videoError) {
                    logger.error(`Douyin: Failed to send video with URL ${i + 1}:`, videoError.message)
                    if (i === json.data.downloads.length - 1) {
                        throw new Error('All video URLs failed to download')
                    }
                }
            }

            if (videoSent) {
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })
            }

        } catch (error) {
            logger.error('Douyin download error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error downloading Douyin video.\n\nError: ${error.message || 'Unknown error'}`
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        } finally {
            processingCache.delete(requestKey)
        }
    }
}
