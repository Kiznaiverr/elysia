// Utility for converting image/gif to WhatsApp sticker

import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import config from './config.js';

/**
 * Convert image or gif buffer to webp sticker buffer with metadata
 * @param {Buffer} buffer - Image or GIF buffer
 * @param {Object} [options]
 * @param {boolean} [options.isGif] - Is the buffer a GIF
 * @param {string} [options.packname] - Sticker pack name
 * @param {string} [options.author] - Sticker author
 * @returns {Promise<Buffer>} - WebP sticker buffer
 */
export async function imageToSticker(buffer, options = {}) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer provided')
  }

  try {
    const sticker = new Sticker(buffer, {
      pack: options.packname || config.get('botSettings', 'packname') || 'Sticker',
      author: options.author || config.get('botSettings', 'stickerAuthor') || '',
      type: options.isGif ? StickerTypes.FULL : StickerTypes.FULL,
      quality: 50
    })
    
    return await sticker.toBuffer()
  } catch (error) {
    console.error('Sticker conversion error:', error)
    throw new Error(`Sticker conversion failed: ${error.message}`)
  }
}

/**
 * Convert video/gif buffer to animated webp sticker buffer with metadata
 * @param {Buffer} buffer - Video or GIF buffer
 * @param {number} fps - Target FPS (default 15)
 * @param {Object} [options]
 * @param {string} [options.packname] - Sticker pack name
 * @param {string} [options.author] - Sticker author
 * @returns {Promise<Buffer>} - WebP sticker buffer
 */
export async function video2webp(buffer, fps = 15, options = {}) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer provided');
  }
  
  try {
    const sticker = new Sticker(buffer, {
      pack: options.packname || config.get('botSettings', 'packname') || 'Sticker',
      author: options.author || config.get('botSettings', 'stickerAuthor') || '',
      type: StickerTypes.FULL,
      quality: 50
    })
    
    return await sticker.toBuffer()
  } catch (error) {
    console.error('Video sticker conversion error:', error)
    throw new Error(`Video sticker conversion failed: ${error.message}`)
  }
}
