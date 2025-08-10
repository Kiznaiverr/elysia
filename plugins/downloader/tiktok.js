import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'tiktok',
    description: 'Download video from TikTok',
    category: 'downloader',
    usage: 'tiktok <url>',
    example: '.tiktok https://vt.tiktok.com/ZSjXNEnbC/',
    aliases: ['tt', 'ttdl', 'tiktokdl'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('TikTok: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(vt\.tiktok\.com|www\.tiktok\.com|vm\.tiktok\.com)\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid TikTok URL.\n\nExample: .tiktok https://vt.tiktok.com/ZSjXNEnbC/'
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
            const json = await siputzxRequest('/api/d/tiktok', { url })
            
            if (!json.status || !json.data || !json.data.urls || !json.data.urls.length) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get TikTok video.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('TikTok: Could not get video', { url, json })
                return
            }

            const metadata = json.data.metadata || {}
            const caption = `${global.FontStyler.toSmallCaps('Hello')}! ${global.FontStyler.toSmallCaps('TikTok video downloaded successfully')}.

⛨〡︎ *${global.FontStyler.toSmallCaps('Creator')}:* ${metadata.creator || 'Unknown'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Title')}:* ${metadata.title || metadata.description || 'No description'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Type')}:* ${json.data.type || 'Video'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Source')}:* TikTok

🎥 ${global.FontStyler.toSmallCaps('powered by elysia')}`

            let videoSent = false
            for (let i = 0; i < json.data.urls.length; i++) {
                if (videoSent) break; 
                
                try {
                    const videoUrl = json.data.urls[i]
                    logger.info(`TikTok: Trying video URL ${i + 1}/${json.data.urls.length}`)
                    
                    await sock.sendMessage(msg.key.remoteJid, {
                        video: { url: videoUrl },
                        caption,
                        thumbnail: metadata.thumbnail ? { url: metadata.thumbnail } : undefined
                    }, { quoted: msg })
                    
                    videoSent = true
                    logger.info(`TikTok: Successfully sent video using URL ${i + 1}`)
                    break; 
                    
                } catch (videoError) {
                    logger.error(`TikTok: Failed to send video with URL ${i + 1}:`, videoError.message)
                    if (i === json.data.urls.length - 1) {
                        throw new Error('All video URLs failed to download')
                    }
                }
            }

            if (videoSent) {
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })
            }

        } catch (error) {
            logger.error('TikTok download error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error downloading TikTok video.\n\nError: ${error.message || 'Unknown error'}`
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        } finally {
            processingCache.delete(requestKey)
        }
    }
}