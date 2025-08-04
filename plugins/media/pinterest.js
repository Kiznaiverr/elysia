import logger from '../../lib/logger.js'

import { siputzxRequest } from '../../lib/siputzxApi.js'

const processingCache = new Map()

export default {
  command: 'pinterest',
  description: 'Cari dan kirim gambar random dari Pinterest',
  category: 'media',
  usage: 'pinterest <query>',
  example: '.pinterest hu tao',
  aliases: ['pin'],
  cooldown: 5,

  async execute(context) {
    const { sock, msg, args } = context
    const chatId = msg.key.remoteJid
    const userId = msg.key.participant || msg.key.remoteJid
    const requestKey = `${userId}-${chatId}-${msg.key.id}`

    if (processingCache.has(requestKey)) {
      logger.info('Pinterest: Duplicate request detected, ignoring')
      return
    }
    processingCache.set(requestKey, true)
    setTimeout(() => processingCache.delete(requestKey), 15000)

    await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })

    try {
      const query = args.join(' ').trim()
      if (!query) {
        await sock.sendMessage(chatId, {
          text: 'Masukkan kata kunci pencarian. Contoh: .pinterest hu tao'
        }, { quoted: msg })
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
        return
      }
      const data = await siputzxRequest('/api/s/pinterest', { query, type: 'image' })
      if (!data?.status || !Array.isArray(data.data) || data.data.length === 0) throw new Error('Tidak ada hasil ditemukan')
      const images = data.data.filter(item => item.image_url)
      if (images.length === 0) throw new Error('Tidak ada gambar ditemukan')
      const random = images[Math.floor(Math.random() * images.length)]
      const imageUrl = random.image_url
      if (!imageUrl) throw new Error('Gagal mendapatkan url gambar')
      await sock.sendMessage(chatId, { image: { url: imageUrl }, caption: `Pinterest: ${query}` }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
      logger.info('Pinterest: Success')
    } catch (e) {
      logger.error('Pinterest: Failed', e)
      await sock.sendMessage(chatId, { text: `Gagal mencari gambar Pinterest. Error: ${e.message}` }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
    } finally {
      processingCache.delete(requestKey)
    }
  }
}
