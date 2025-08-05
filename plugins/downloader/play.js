import ytSearch from 'yt-search'
import { ytmp3 } from '@vreden/youtube_scraper'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
    command: 'play',
    description: 'Cari dan download audio YouTube dari query',
    category: 'downloader',
    usage: 'play <query>',
    example: '.play lofi hip hop',
    aliases: ['ytplay', 'playaudio'],
    cooldown: 5,

    async execute(context) {
        const { sock, msg, args } = context
        const query = args.join(' ')
        const chatId = msg.key.remoteJid
        const userId = msg.key.participant || msg.key.remoteJid

        if (!query) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Masukkan kata kunci pencarian.\n\nContoh: .play lofi hip hop'
            }, { quoted: msg })
            return
        }

        const requestKey = `${userId}-${chatId}-${query}`
        if (processingCache.has(requestKey)) {
            logger.info('PLAY: Duplicate request detected, ignoring')
            return
        }
        processingCache.set(requestKey, true)
        setTimeout(() => {
            processingCache.delete(requestKey)
        }, 30000)

        await sock.sendMessage(msg.key.remoteJid, { react: { text: '🔎', key: msg.key } })

        try {
            const res = await ytSearch(query)
            const video = res.videos[0]
            if (!video) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Tidak ditemukan hasil untuk kata kunci tersebut.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                return
            }
            const url = `https://youtu.be/${video.videoId}`

            const result = await ytmp3(url, '128')
            if (!result.status || !result.download || !result.download.url) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Gagal download audio dari YouTube.'
                }, { quoted: msg })
                await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
                logger.error('PLAY: Could not get audio', { url, result })
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
            const caption = `${global.FontStyler.toSmallCaps('YouTube audio downloaded successfully')}.\n\n` +
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
            logger.error('PLAY: Error', err)
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Terjadi error saat mencari atau mendownload audio.'
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        }
    }
}
