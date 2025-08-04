import { imageToSticker, video2webp } from '../../lib/sticker.js'
import logger from '../../lib/logger.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const processingCache = new Map()

export default {
  command: 'sticker',
  description: 'Convert gambar/gif/video menjadi sticker WhatsApp',
  category: 'media',
  usage: 'sticker (gambar/gif/video)',
  example: '.sticker (dengan gambar/gif/video)',
  aliases: ['stiker', 's'],
  cooldown: 5,

  async execute(context) {
    const { sock, msg, args } = context
    const chatId = msg.key.remoteJid
    const userId = msg.key.participant || msg.key.remoteJid
    const requestKey = `${userId}-${chatId}-${msg.key.id}`

    if (processingCache.has(requestKey)) {
      logger.info('Sticker: Duplicate request detected, ignoring')
      return
    }
    processingCache.set(requestKey, true)
    setTimeout(() => processingCache.delete(requestKey), 15000)

    await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })

    try {
      let media, isGif = false, isVideo = false
      let messageToDownload = null

      // Check if current message has media
      if (msg.message?.imageMessage) {
        messageToDownload = msg.message.imageMessage
        isGif = false
      } else if (msg.message?.videoMessage) {
        messageToDownload = msg.message.videoMessage
        isGif = !!msg.message.videoMessage.gifPlayback
        isVideo = !isGif
      } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        // Check quoted message
        const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage
        if (quoted.imageMessage) {
          messageToDownload = quoted.imageMessage
          isGif = false
        } else if (quoted.videoMessage) {
          messageToDownload = quoted.videoMessage
          isGif = !!quoted.videoMessage.gifPlayback
          isVideo = !isGif
        }
      }

      if (!messageToDownload) {
        await sock.sendMessage(chatId, {
          text: 'Kirim gambar/gif/video dengan caption .sticker atau reply gambar/gif/video dengan .sticker'
        }, { quoted: msg })
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
        return
      }

      // Download media using Baileys downloadContentFromMessage
      const stream = await downloadContentFromMessage(messageToDownload, isGif ? 'video' : (isVideo ? 'video' : 'image'))
      const chunks = []
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      media = Buffer.concat(chunks)

      if (!media || media.length === 0) {
        throw new Error('Failed to download media')
      }

      logger.info(`Sticker: Converting ${isVideo ? 'video' : (isGif ? 'GIF' : 'image')} to sticker (${media.length} bytes)`)
      let stickerBuffer
      if (isVideo) {
        stickerBuffer = await video2webp(media, 15)
      } else {
        stickerBuffer = await imageToSticker(media, { isGif })
      }
      await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
      logger.info('Sticker: Success')
    } catch (e) {
      logger.error('Sticker: Failed', e)
      await sock.sendMessage(chatId, { 
        text: `Gagal convert ke sticker. Error: ${e.message}\n\nPastikan:\n- File adalah gambar/gif/video yang valid\n- FFmpeg sudah terinstall\n- Ukuran file tidak terlalu besar` 
      }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
    } finally {
      processingCache.delete(requestKey)
    }
  }
}
