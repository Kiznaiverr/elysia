// Utility for converting image/gif to WhatsApp sticker
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { readFileSync } from 'fs';

/**
 * Convert image or gif buffer to webp sticker buffer using ffmpeg
 * @param {Buffer} buffer - Image or GIF buffer
 * @param {Object} [options]
 * @param {boolean} [options.isGif] - Is the buffer a GIF
 * @returns {Promise<Buffer>} - WebP sticker buffer
 */
export async function imageToSticker(buffer, options = {}) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer provided')
  }

  const id = uuidv4();
  const inputExt = options.isGif ? '.gif' : '.jpg';
  const inputPath = path.join(tmpdir(), `sticker_input_${id}${inputExt}`);
  const outputPath = path.join(tmpdir(), `sticker_output_${id}.webp`);
  
  try {
    await writeFile(inputPath, buffer);
    
    return new Promise((resolve, reject) => {
      const cmd = options.isGif
        ? `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white,fps=15" -loop 0 -preset default -an -vsync 0 -f webp "${outputPath}"`
        : `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white" -preset default -an -f webp "${outputPath}"`;
      
      exec(cmd, async (err, stdout, stderr) => {
        try {
          if (err) {
            console.error('FFmpeg error:', err.message);
            console.error('FFmpeg stderr:', stderr);
            return reject(new Error(`FFmpeg conversion failed: ${err.message}`));
          }
          
          const webp = readFileSync(outputPath);
          await unlink(inputPath).catch(() => {});
          await unlink(outputPath).catch(() => {});
          resolve(webp);
        } catch (e) {
          await unlink(inputPath).catch(() => {});
          await unlink(outputPath).catch(() => {});
          reject(e);
        }
      });
    });
  } catch (error) {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    throw error;
  }
}

/**
 * Convert video/gif buffer to animated webp sticker buffer using ffmpeg
 * @param {Buffer} buffer - Video or GIF buffer
 * @param {number} fps - Target FPS (default 15)
 * @returns {Promise<Buffer>} - WebP sticker buffer
 */
export async function video2webp(buffer, fps = 15) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer provided');
  }
  const id = uuidv4();
  const inputPath = path.join(tmpdir(), `sticker_input_${id}.mp4`);
  const outputPath = path.join(tmpdir(), `sticker_output_${id}.webp`);
  await writeFile(inputPath, buffer);
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=${fps},pad=512:512:(ow-iw)/2:(oh-ih)/2:white" -loop 0 -preset default -an -vsync 0 -f webp "${outputPath}"`;
    exec(cmd, async (err, stdout, stderr) => {
      try {
        if (err) {
          console.error('FFmpeg error:', err.message);
          console.error('FFmpeg stderr:', stderr);
          return reject(new Error(`FFmpeg conversion failed: ${err.message}`));
        }
        const webp = readFileSync(outputPath);
        await unlink(inputPath).catch(() => {});
        await unlink(outputPath).catch(() => {});
        resolve(webp);
      } catch (e) {
        await unlink(inputPath).catch(() => {});
        await unlink(outputPath).catch(() => {});
        reject(e);
      }
    });
  });
}
