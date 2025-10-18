const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// 🧩 Download file safely
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 🧩 Convert mp3 → opus (WhatsApp voice format)
async function convertToOpus(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libopus')
      .audioBitrate('64k')
      .format('opus')
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

// 🧠 Sinhala song sender (manual search)
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    // Sinhala slowed/reverb search style එක auto append වෙනවා 🔍
    const fullQuery = `${query} sinhala slowed reverb song`;
    const search = await yts(fullQuery);

    if (!search.videos || search.videos.length === 0) {
      return reply("😭 No matching Sinhala slowed song found!");
    }

    const video = search.videos.find(v => {
      const seconds = v.timestamp ? v.timestamp.split(':').reduce((a, b) => a * 60 + +b, 0) : 0;
      return seconds <= 480; // under 8 min
    });

    if (!video) return reply("⚠️ No short Sinhala song found under 8 minutes.");

    const caption = `*"${video.title}"*

> 💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ʙᴇꜱᴛ ꜱᴏɴɢ 💆❤‍🩹
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
00:00 ───●────────── ${video.timestamp}
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
🎧 Use Headphones for Best Experience
🎙️ Powered by Zanta-XMD`;

    // Thumbnail send
    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
    });

    // 🎵 Download from external API
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download) {
      return reply("⚠️ Couldn't fetch mp3 link.");
    }

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    try {
      await downloadFile(data.result.download, mp3Path);
      await convertToOpus(mp3Path, opusPath);

      // 🎤 Send as voice note
      await conn.sendMessage(targetJid, {
        audio: fs.readFileSync(opusPath),
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
      });
    } finally {
      if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
      if (fs.existsSync(opusPath)) fs.unlinkSync(opusPath);
    }

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while searching or sending the song.");
  }
}

// 🎵 .song4 — Manual Sinhala slowed/reverb song searcher
cmd({
  pattern: "song4",
  desc: "Search Sinhala slowed/reverb song by name",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("🎵 Please enter a song name!\n\n👉 Example: .song4 sanda wage da");
  await sendSinhalaSong(conn, m.chat, reply, text);
});