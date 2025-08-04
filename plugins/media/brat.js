import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
  command: 'brat',
  description: 'Generate sticker dengan teks gaya brat (emoji style Apple)',
  category: 'media',
  usage: 'brat <teks>',
  example: '.brat haloo sayang',
  aliases: [],
  cooldown: 5,

  async execute(context) {
    const { sock, msg, args } = context
    const chatId = msg.key.remoteJid
    const userId = msg.key.participant || msg.key.remoteJid
    const requestKey = `${userId}-${chatId}-${msg.key.id}`

    if (processingCache.has(requestKey)) {
      logger.info('Brat: Duplicate request detected, ignoring')
      return
    }
    processingCache.set(requestKey, true)
    setTimeout(() => processingCache.delete(requestKey), 15000)

    await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })

    try {
      const text = args.join(' ').trim()
      if (!text) {
        await sock.sendMessage(chatId, {
          text: 'Masukkan teks untuk brat sticker. Contoh: .brat haloo sayang'
        }, { quoted: msg })
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
        return
      }
      // Default: background putih, warna hitam, emoji style apple
      const url = `https://brat.siputzx.my.id/image?text=${encodeURIComponent(text)}&background=%23ffffff&color=%23000000&emojiStyle=apple`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Gagal request ke API brat')
      const buffer = Buffer.from(await response.arrayBuffer())
      if (!buffer || buffer.length === 0) throw new Error('Gagal mendapatkan gambar dari API')
      await sock.sendMessage(chatId, { sticker: buffer }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
      logger.info('Brat: Success')
    } catch (e) {
      logger.error('Brat: Failed', e)
      await sock.sendMessage(chatId, { text: `Gagal generate brat sticker. Error: ${e.message}` }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
    } finally {
      processingCache.delete(requestKey)
    }
  }
}
