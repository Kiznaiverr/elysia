import { siputzxRequest } from '../../lib/siputzxApi.js'
import logger from '../../lib/logger.js'

const processingCache = new Map()

export default {
  command: 'profilegi',
  description: 'Cek profil Genshin Impact via UID',
  category: 'media',
  usage: '<uid>',
  example: '.profilegi 856012067',
  aliases: ['genshinprofile','genshinid'],
  cooldown: 5,

  async execute(context) {
    const { sock, msg, args } = context
    const chatId = msg.key.remoteJid
    const userId = msg.key.participant || msg.key.remoteJid
    const uid = args[0]
    const requestKey = `${userId}-${chatId}-${uid}`

    if (processingCache.has(requestKey)) {
      logger.info('ProfileGI: Duplicate request detected, ignoring')
      return
    }
    if (!uid || !/^\d{9}$/.test(uid)) {
      await sock.sendMessage(chatId, {
        text: '❌ Masukkan UID Genshin Impact yang valid. Contoh: .profilegi 856012067'
      }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
      return
    }
    processingCache.set(requestKey, true)
    setTimeout(() => processingCache.delete(requestKey), 20000)

    await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })

    try {
      const json = await siputzxRequest('/api/check/genshin', { uid })
      if (!json.status || !json.data || !json.data.playerData) throw new Error('Data tidak ditemukan')
      const p = json.data.playerData
      const cards = json.data.characterCards || []
      let caption = `👤 *${p.username}*\n\n*AR:* ${p.adventureRank}\n*WL:* ${p.worldLevel}\n*Signature:* ${p.signature || '-'}\n\n*Achievement:* ${p.stats?.totalAchievement || '-'}\n*Abyss:* ${p.stats?.spiralAbyss || '-'}\n*Theater:* ${p.stats?.theater || '-'}\n\nPowered by elysia`;
      await sock.sendMessage(chatId, {
        image: { url: p.avatar },
        caption
      }, { quoted: msg })
      if (cards.length > 0) {
        for (const card of cards) {
          await sock.sendMessage(chatId, { image: { url: card } }, { quoted: msg })
        }
      }
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
      logger.info('ProfileGI: Success')
    } catch (error) {
      logger.error('ProfileGI: Failed', error)
      await sock.sendMessage(chatId, {
        text: `❌ Gagal mengambil profil Genshin. Error: ${error.message}`
      }, { quoted: msg })
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
    } finally {
      processingCache.delete(requestKey)
    }
  }
}
