
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export default {
  command: 'toimg',
  description: 'Convert sticker to image (jpg/png)',
  category: 'media',
  usage: '[reply sticker]',
  example: '.toimg (reply sticker)',
  aliases: ['stimg'],
  cooldown: 3,

  async execute(context) {
    const { sock, msg } = context
    const chatId = msg.key.remoteJid
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const stickerMsg = quoted?.stickerMessage

    await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })

    if (!stickerMsg) {
      return sock.sendMessage(chatId, {
        text: '❌ Reply sticker yang ingin diubah ke gambar!'
      }, { quoted: msg })
    }

    let buffer
    try {
      const stream = await downloadContentFromMessage(stickerMsg, 'sticker')
      const chunks = []
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      buffer = Buffer.concat(chunks)
    } catch (e) {
      return sock.sendMessage(chatId, { text: '❌ Gagal download sticker.' }, { quoted: msg })
    }
    if (!buffer) {
      return sock.sendMessage(chatId, { text: '❌ Gagal download sticker.' }, { quoted: msg })
    }

    const id = uuidv4()
    const inputPath = path.join(tmpdir(), `toimg_input_${id}.webp`)
    const outputPath = path.join(tmpdir(), `toimg_output_${id}.png`)
    await writeFile(inputPath, buffer)

    const cmd = `ffmpeg -y -i "${inputPath}" "${outputPath}"`
    exec(cmd, async (err) => {
      try {
        if (err) {
          await unlink(inputPath).catch(() => {})
          return sock.sendMessage(chatId, { text: '❌ Konversi gagal.' }, { quoted: msg })
        }
        const outBuffer = await import('fs').then(fs => fs.readFileSync(outputPath))
        await sock.sendMessage(chatId, { image: outBuffer }, { quoted: msg })
        await unlink(inputPath).catch(() => {})
        await unlink(outputPath).catch(() => {})
      } catch (e) {
        await unlink(inputPath).catch(() => {})
        await unlink(outputPath).catch(() => {})
        sock.sendMessage(chatId, { text: '❌ Error konversi.' }, { quoted: msg })
      }
    })
  }
}
