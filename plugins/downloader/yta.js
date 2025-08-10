import { ytmp3 } from '@vreden/youtube_scraper'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'yta',
    description: 'Download audio from YouTube',
    category: 'downloader',
    usage: 'yta <url>',
    example: '.yta https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    aliases: ['ytmp3', 'ytaudio'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const url = args[0]
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        const requestKey = `${userId}-${chatId}-${url}`
        if (processingCache.has(requestKey)) {
            logger.info('YTA: Duplicate request detected, ignoring')
            return
        }

        if (!url || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a valid YouTube URL.\n\nExample: .yta https://www.youtube.com/watch?v=dQw4w9WgXcQ atau .yta https://youtu.be/Imdh_LX0ZZA'
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
            const result = await ytmp3(url, '128')
            if (!result.status || !result.download || !result.download.url) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Could not get YouTube audio.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('YTA: Could not get audio', { url, result })
                return
            }

            const downloadUrl = result.download.url
            const filename = result.download.filename || 'audio.mp3'
            const tmpPath = path.join('tmp', filename)

            const response = await axios.get(downloadUrl, { responseType: 'stream' })
            await new Promise((resolve, reject) => {
                const stream = fs.createWriteStream(tmpPath)
                response.data.pipe(stream)
                stream.on('finish', resolve)
                stream.on('error', reject)
            })


            const metadata = result.metadata
            const caption = `${global.FontStyler.toSmallCaps('Hello')}! ${global.FontStyler.toSmallCaps('YouTube audio downloaded successfully')}.\n\n` +
                `⛨〡︎ *${global.FontStyler.toSmallCaps('Title')}:* ${metadata.title || '-'}\n` +
                `⛨〡︎ *${global.FontStyler.toSmallCaps('Author')}:* ${metadata.author?.name || '-'}\n` +
                `⛨〡︎ *${global.FontStyler.toSmallCaps('Duration')}:* ${metadata.timestamp || '-'}\n` +
                `⛨〡︎ *${global.FontStyler.toSmallCaps('Views')}:* ${metadata.views || '-'}\n` +
                `⛨〡︎ *${global.FontStyler.toSmallCaps('Source')}:* YouTube\n` +
                `⛨〡︎ *${global.FontStyler.toSmallCaps('URL')}:* ${metadata.url || url}\n` +
                `\n🎵 ${global.FontStyler.toSmallCaps('powered by elysia')}`

            if (metadata.thumbnail) {
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: metadata.thumbnail },
                    caption
                }, { quoted: msg })
            }

            await sock.sendMessage(msg.key.remoteJid, {
                audio: { url: tmpPath },
                mimetype: 'audio/mp4',
                fileName: filename
            }, { quoted: msg })

            fs.unlink(tmpPath, () => {})
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })
        } catch (err) {
            logger.error('YTA: Error', err)
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error occurred while downloading audio.'
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        }
    }
}
