const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

let autoSongInterval = null;
let sentSongUrls = new Set();

const styles = [
  "sinhala slowed reverb song",
  "sinhala love slowed song",
  "sinhala vibe slowed song",
  "sinhala sad slowed song",
  "sinhala teledrama slowed song",
  "sinhala 2024 slowed reverb song",
  "sinhala mashup slowed reverb",
  "sinhala boot slowed song",
];

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

// 🧠 Main function to send song
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const time = v.timestamp.split(':').map(Number);
      const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
      return seconds <= 480; // under 8 min
    });

    if (!video) return reply("😢 No suitable song found.");

    const caption = `🎧 *${video.title}*\n\n❤️ Sinhala Slowed / Reverb Song 🎙️\n───────────────────────\nUse 🎧 for best vibe 💫\nPowered by *ZANTA-XMD BOT*`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
    });

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download)
      return reply("⚠️ Couldn't fetch mp3 link.");

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    // Download MP3
    await downloadFile(data.result.download, mp3Path);

    // Convert to Opus
    await convertToOpus(mp3Path, opusPath);

    // Send as voice note 🎙️
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    // Clean temp files
    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

  } catch (err) {
    console.error("Send error:", err);
    reply("⚠️ Something went wrong while sending the song.");
  }
}

// 🎵 .song — Manual song request
cmd({
  pattern: "song",
  desc: "Download Sinhala slowed/reverb song as voice note",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, args }) => {
  const query = args.join(" ");
  if (!query) return reply("🌀 Type a song name. Example: *.song pahasara*");
  reply(`🔍 Searching *${query} slowed reverb sinhala* ...`);
  await sendSinhalaSong(conn, m.chat, reply, query + " slowed reverb sinhala");
});

// 🎶 .voice1 — auto every 20 min
cmd({
  pattern: "voice1",
  desc: "Auto Sinhala slowed songs as voice note every 20 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");
  const targetJid = m.chat;
  reply("✅ Auto Sinhala slowed songs (🎙️ voice mode) started — every 20 minutes.");

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, targetJid, reply, randomStyle);
  };

  await sendRandom();
  autoSongInterval = setInterval(sendRandom, 20 * 60 * 1000);
});

// 🎶 .music1 — auto every 30 min
cmd({
  pattern: "music1",
  desc: "Auto Sinhala slowed songs as voice note every 30 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");
  const targetJid = m.chat;
  reply("✅ Auto Sinhala slowed songs (🎙️ voice mode) started — every 30 minutes.");

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, targetJid, reply, randomStyle);
  };

  await sendRandom();
  autoSongInterval = setInterval(sendRandom, 30 * 60 * 1000);
});

// ⛔ .stop — Stop auto
cmd({
  pattern: "stop",
  desc: "Stop automatic Sinhala slowed song sending",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⛔ Auto mode is not running.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply("🛑 Auto Sinhala slowed song sending stopped.");
});