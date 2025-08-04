import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'tiktokv2',
    description: 'Download video from TikTok (Alternative endpoint)',
    category: 'downloader',
    usage: 'tiktokv2 <url>',
    example: '.tiktokv2 https://vt.tiktok.com/ZSjXNEnbC/',
    aliases: ['ttv2', 'tt2', 'tiktok2'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('TikTokV2: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(vt\.tiktok\.com|www\.tiktok\.com|vm\.tiktok\.com)\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid TikTok URL.\n\nExample: .tiktokv2 https://vt.tiktok.com/ZSjXNEnbC/'
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
            const json = await siputzxRequest('/api/d/tiktok/v2', { url })
            
            if (!json.status || !json.data?.success || !json.data?.data?.download?.video || !json.data.data.download.video.length) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get TikTok video (v2).'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('TikTokV2: Could not get video', { url, json })
                return
            }

            const metadata = json.data.data.metadata || {}
            const stats = metadata.stats || {}
            const videoUrls = json.data.data.download.video
            
            const caption = `${global.FontStyler.toSmallCaps('Hello')}! ${global.FontStyler.toSmallCaps('TikTok video downloaded successfully')}.

⛨〡︎ *${global.FontStyler.toSmallCaps('Post ID')}:* ${json.data.postId || 'Unknown'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Title')}:* ${metadata.title || metadata.description || 'No description'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Likes')}:* ${stats.likeCount ? stats.likeCount.toLocaleString() : 'N/A'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Views')}:* ${stats.playCount ? stats.playCount.toLocaleString() : 'N/A'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Comments')}:* ${stats.commentCount ? stats.commentCount.toLocaleString() : 'N/A'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Shares')}:* ${stats.shareCount ? stats.shareCount.toLocaleString() : 'N/A'}
⛨〡︎ *${global.FontStyler.toSmallCaps('Location')}:* ${metadata.locationCreated || 'Unknown'}

🎥 ${global.FontStyler.toSmallCaps('powered by elysia')}`

            let videoSent = false
            for (let i = 0; i < videoUrls.length; i++) {
                if (videoSent) break; 
                
                try {
                    const videoUrl = videoUrls[i]
                    logger.info(`TikTokV2: Trying video URL ${i + 1}/${videoUrls.length}`)
                    
                    await sock.sendMessage(msg.key.remoteJid, {
                        video: { url: videoUrl },
                        caption
                    }, { quoted: msg })
                    
                    videoSent = true
                    logger.info(`TikTokV2: Successfully sent video using URL ${i + 1}`)
                    break; 
                    
                } catch (videoError) {
                    logger.error(`TikTokV2: Failed to send video with URL ${i + 1}:`, videoError.message)
                    if (i === videoUrls.length - 1) {
                        throw new Error('All video URLs failed to download')
                    }
                }
            }

            if (videoSent) {
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })
            }

        } catch (error) {
            logger.error('TikTokV2 download error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error downloading TikTok video (v2).\n\nError: ${error.message || 'Unknown error'}`
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        } finally {
            processingCache.delete(requestKey)
        }
    }
}