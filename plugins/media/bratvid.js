import logger from '../../lib/logger.js'
import { video2webp } from '../../lib/sticker.js'

const processingCache = new Map()

export default {
  command: 'bratvid',
  description: 'Generate sticker video brat style (convert ke webp agar bisa dilihat di WhatsApp)',
  category: 'media',
  usage: 'bratvid <teks>',
  example: '.bratvid haii sayang',
  aliases: [],
  cooldown: 5,

  async execute(context) {
    const { sock, msg, args } = context
    const chatId = msg.key.remoteJid
    const userId = msg.key.participant || msg.key.remoteJid
    const requestKey = `${userId}-${chatId}-${msg.key.id}`

    if (processingCache.has(requestKey)) {
      logger.info('BratVid: Duplicate request detected, ignoring')
      return
    }
    processingCache.set(requestKey, true)
    setTimeout(() => processingCache.delete(requestKey), 15000)

    await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })

    try {
      const text = args.join(' ').trim()
      if (!text) {
        await sock.sendMessage(chatId, {
          text: 'Masukkan teks untuk brat video sticker. Contoh: .bratvid haii sayang'
        }, { quoted: msg })
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
        return
      }
      // Default params
      const params = `text=${encodeURIComponent(text)}&background=%23ffffff&color=%23000000&emojiStyle=apple&delay=500&endDelay=1000&width=352&height=352`
      const url = `https://brat.siputzx.my.id/mp4?${params}`
      const response = await fetch(url)
      const contentType = response.headers.get('content-type') || ''
      if (!response.ok || !contentType.includes('video')) {
        const errText = await response.text().catch(() => '')
        throw new Error(`Gagal request ke API bratvid. Status: ${response.status} ${response.statusText}.\nContent-Type: ${contentType}\nBody: ${errText}`)
      }
      const videoBuffer = Buffer.from(await response.arrayBuffer())
      if (!videoBuffer || videoBuffer.length === 0) throw new Error('Gagal mendapatkan file dari API')
      // Convert video (webm/mp4) ke animated WebP agar bisa jadi sticker WhatsApp
      let stickerBuffer
      try {
        stickerBuffer = await video2webp(videoBuffer, 15)
      } catch (err) {
        throw new Error('Gagal convert ke animated sticker webp')
      }
      await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
      logger.info('BratVid: Success')
    } catch (e) {
      logger.error('BratVid: Failed', e)
      await sock.sendMessage(chatId, { text: `Gagal generate brat video sticker. Error: ${e.message}` }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
    } finally {
      processingCache.delete(requestKey)
    }
  }
}
