
import ytSearch from 'yt-search'

export default {
    command: 'ytsearch',
    description: 'Cari video YouTube berdasarkan kata kunci',
    category: 'tools',
    usage: 'ytsearch <query>',
    example: '.ytsearch lofi hip hop',
    aliases: ['yts', 'ytsc', 'youtubesearch'],
    cooldown: 3,

    async execute(context) {
        const { sock, msg, args } = context
        const query = args.join(' ')
        if (!query) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Masukkan kata kunci pencarian.\n\nContoh: .ytsearch lofi hip hop'
            }, { quoted: msg })
            return
        }

        await sock.sendMessage(msg.key.remoteJid, { react: { text: '🔎', key: msg.key } })

        try {
            const res = await ytSearch(query)
            const videos = res.videos.slice(0, 5)
            if (!videos.length) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Tidak ditemukan hasil untuk kata kunci tersebut.'
                }, { quoted: msg })
                return
            }

            let text = `${global.FontStyler.toSmallCaps('Hasil Pencarian YouTube')}\n\n`
            for (let i = 0; i < videos.length; i++) {
                const v = videos[i]
                text += `⛨〡︎ *${global.FontStyler.toSmallCaps('Title')}:* ${v.title || '-'}\n` +
                    `⛨〡︎ *${global.FontStyler.toSmallCaps('Channel')}:* ${v.author?.name || '-'}\n` +
                    `⛨〡︎ *${global.FontStyler.toSmallCaps('Duration')}:* ${v.timestamp || '-'}\n` +
                    `⛨〡︎ *${global.FontStyler.toSmallCaps('Views')}:* ${v.views || '-'}\n` +
                    `⛨〡︎ *${global.FontStyler.toSmallCaps('URL')}:* https://youtu.be/${v.videoId}\n\n`
            }
            text += `🎵 ${global.FontStyler.toSmallCaps('powered by elysia')}`

            await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } })
        } catch (err) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Terjadi error saat mencari YouTube.'
            }, { quoted: msg })
            await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } })
        }
    }
}
