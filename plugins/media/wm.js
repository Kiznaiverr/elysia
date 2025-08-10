
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import config from '../../lib/config.js'

export default {
  command: 'wm',
  description: 'Convert gambar/sticker ke sticker dengan custom packname/author',
  category: 'sticker',
  usage: 'wm <packname>|<author>',
  example: '.wm Elysia|Kiznavierr',
  aliases: [],
  cooldown: 5,
  limit: true,

  async execute(context) {
    const { sock, msg, args } = context
    const chatId = msg.key.remoteJid
    const text = args.join(' ')
    let [packname, author] = text.split('|').map(s => s?.trim())
    if (!packname) packname = config.get('botSettings', 'packname')

    let messageToDownload = null
    let isGif = false
    if (msg.message?.imageMessage) {
      messageToDownload = msg.message.imageMessage
    } else if (msg.message?.stickerMessage) {
      messageToDownload = msg.message.stickerMessage
    } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage
      if (quoted.imageMessage) {
        messageToDownload = quoted.imageMessage
      } else if (quoted.stickerMessage) {
        messageToDownload = quoted.stickerMessage
      }
    }
    if (!messageToDownload) {
      await sock.sendMessage(chatId, { text: 'Kirim/reply gambar atau sticker dengan .wm <packname>|<author>' }, { quoted: msg })
      return
    }

    await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })

    let media
    try {
      const stream = await downloadContentFromMessage(messageToDownload, messageToDownload.mimetype?.includes('image') ? 'image' : 'sticker')
      const chunks = []
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      media = Buffer.concat(chunks)
    } catch (e) {
      await sock.sendMessage(chatId, { text: 'Gagal download media.' }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
      return
    }
    if (!media || media.length === 0) {
      await sock.sendMessage(chatId, { text: 'Gagal download media.' }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
      return
    }

    try {
      let stickerOptions = { pack: packname, type: StickerTypes.FULL, quality: 50 }
      if (author && author.trim().length > 0) {
        stickerOptions.author = author
      }
      
      const sticker = new Sticker(media, stickerOptions)
      const stickerBuffer = await sticker.toBuffer()
      await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
    } catch (e) {
      await sock.sendMessage(chatId, { text: 'Gagal convert ke sticker custom.' }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
    }
  }
}
