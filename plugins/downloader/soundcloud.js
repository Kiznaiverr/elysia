import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'soundcloud',
    description: 'Download audio from SoundCloud',
    category: 'downloader',
    usage: 'soundcloud <url>',
    example: '.soundcloud https://soundcloud.com/teguhtm/dia-anji',
    aliases: ['sc', 'scdl', 'soundclouddl'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('SoundCloud: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(www\.|m\.)?soundcloud\.com\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid SoundCloud URL.\n\nExample: .soundcloud https://m.soundcloud.com/teguh-hariyadi-652597010/anji-dia'
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
            let fixedUrl = url.replace(/^https?:\/\/(www\.)?soundcloud\.com\//, 'https://m.soundcloud.com/')
            const json = await siputzxRequest('/api/d/soundcloud', { url: fixedUrl })

            if (!json.status || !json.data || !json.data.url) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get SoundCloud audio.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('SoundCloud: Could not get audio', { url, json })
                return
            }

            const data = json.data

            if (data.thumbnail) {
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: data.thumbnail },
                    caption: `${global.FontStyler.toSmallCaps('SoundCloud track thumbnail')}`
                }, { quoted: msg })
            }

            try {
                const response = await fetch(data.url)
                if (!response.ok) {
                    throw new Error(`Failed to fetch audio: ${response.status}`)
                }
                const audioBuffer = Buffer.from(await response.arrayBuffer())
                
                // Check file size (max 100MB for WhatsApp)
                const sizeInMB = audioBuffer.length / 1024 / 1024
                if (sizeInMB > 100) {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: `❌ Audio file too large (${sizeInMB.toFixed(2)} MB). WhatsApp limit is 100MB.`
                    }, { quoted: msg })
                    return
                }
                
                await sock.sendMessage(msg.key.remoteJid, {
                    audio: audioBuffer,
                    mimetype: 'audio/mp4',
                    fileName: `${data.title || 'SoundCloud_Audio'}.mp3`,
                    caption: `${global.FontStyler.toSmallCaps('SoundCloud audio downloaded successfully')}\n\n⛨〡︎ *${global.FontStyler.toSmallCaps('Title')}:* ${data.title || 'No title'}\n⛨〡︎ *${global.FontStyler.toSmallCaps('User')}:* ${data.user || 'Unknown'}\n⛨〡︎ *${global.FontStyler.toSmallCaps('Duration')}:* ${data.duration ? (Math.floor(data.duration/60000)+':'+String(Math.floor((data.duration%60000)/1000)).padStart(2,'0'))+' min' : 'N/A'}\n\n🎵 powered by elysia`
                }, { quoted: msg })
            } catch (audioError) {
                logger.error('SoundCloud: Failed to send audio:', audioError)
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ Failed to download/send audio file.\n\nError: ${audioError.message}`
                }, { quoted: msg })
                
                try {
                    await sock.sendMessage(msg.key.remoteJid, {
                        document: { url: data.url },
                        fileName: `${data.title || 'SoundCloud_Audio'}.mp3`,
                        mimetype: 'audio/mp3',
                        caption: `${global.FontStyler.toSmallCaps('SoundCloud audio as document')}\n\n⛨〡︎ *${global.FontStyler.toSmallCaps('Title')}:* ${data.title || 'No title'}\n⛨〡︎ *${global.FontStyler.toSmallCaps('User')}:* ${data.user || 'Unknown'}\n\n🎵 powered by elysia`
                    }, { quoted: msg })
                } catch (docError) {
                    logger.error('SoundCloud: Failed to send as document:', docError)
                    throw new Error('Failed to send audio both as audio and document')
                }
            }

            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })

        } catch (error) {
            logger.error('SoundCloud download error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error downloading SoundCloud audio.\n\nError: ${error.message || 'Unknown error'}`
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        } finally {
            processingCache.delete(requestKey)
        }
    }
}
