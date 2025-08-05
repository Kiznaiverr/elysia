import { uploadToPomf2 } from '../../lib/uploader.js'

import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import config from '../../lib/config.js'


export default {
  command: 'smeme',
  description: 'Sticker meme custom dari gambar + teks atas/bawah',
  category: 'sticker',
  usage: 'smeme <teks atas>|<teks bawah>',
  example: '.smeme Shiro|Neko',
  aliases: [],
  cooldown: 5,
  limit: true,

  async execute(context) {
    const { sock, msg, args } = context
    const chatId = msg.key.remoteJid
    const text = args.join(' ')
    let [top, bottom] = text.split('|').map(s => s?.trim() || '-')
    if (!top) top = '-'
    if (!bottom) bottom = '-'


    let messageToDownload = null
    if (msg.message?.imageMessage) {
      messageToDownload = msg.message.imageMessage
    } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      messageToDownload = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage
    }
    if (!messageToDownload) {
      await sock.sendMessage(chatId, { text: 'Kirim/reply gambar dengan .smeme teks atas|teks bawah' }, { quoted: msg })
      return
    }

    await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })


    const { downloadContentFromMessage } = await import('@whiskeysockets/baileys')
    const stream = await downloadContentFromMessage(messageToDownload, 'image')
    const chunks = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const media = Buffer.concat(chunks)
    if (!media || media.length === 0) {
      await sock.sendMessage(chatId, { text: 'Gagal download gambar.' }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
      return
    }


    let url
    try {
      const up = await uploadToPomf2(media)
      if (up.success === false || !up.files?.[0]?.url) throw new Error(up.description || 'Upload gagal')
      url = up.files[0].url
    } catch (e) {
      await sock.sendMessage(chatId, { text: 'Gagal upload gambar ke server.' }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
      return
    }

    const memeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(top)}/${encodeURIComponent(bottom)}.png?background=${encodeURIComponent(url)}`
    let stickerBuffer
    try {
      const sticker = new Sticker(memeUrl, {
        pack: config.get('botSettings', 'packname'),
        author: config.get('botSettings', 'stickerAuthor'),
        type: StickerTypes.FULL
      })
      stickerBuffer = await sticker.toBuffer()
      await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
    } catch (e) {
      await sock.sendMessage(chatId, { text: 'Gagal membuat sticker meme.' }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
    }
  }
}
