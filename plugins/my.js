const config = require('../settings');
const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 🧠 Convert mp3 → opus (WhatsApp playable)
async function convertToOpus(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libopus')
      .audioBitrate('64k')
      .format('opus')
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) return reply("😢 Song not found.");

    const caption = `🎧 *${video.title}*\n\n❤️ Sinhala Slowed / Reverb Version 🎙️`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
    });

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);
    if (!data.status || !data.result?.download) return reply("⚠️ Couldn't get audio link.");

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);

    // 🔁 convert to playable voice format
    await convertToOpus(mp3Path, opusPath);

    // 🎙️ send as WhatsApp voice note (PTT)
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

  } catch (err) {
    console.error(err);
    reply("⚠️ Error while sending voice song.");
  }
}

// 🟢 .song command
cmd({
  pattern: "song",
  desc: "Download Sinhala slowed/reverb song as playable voice note",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, args }) => {
  const query = args.join(" ");
  if (!query) return reply("🌀 Type a song name. Example: *.song pahasara slowed*");
  reply(`🔍 Searching for *${query}* ...`);
  await sendSinhalaSong(conn, m.chat, reply, query + " sinhala slowed reverb");
});