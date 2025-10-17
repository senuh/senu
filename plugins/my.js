const config = require('../settings');
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

// 🧠 Helper: download file safely
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 🧠 Helper: send Sinhala slowed song (voice message)
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const time = v.timestamp.split(':').map(Number);
      const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
      return seconds <= 480; // under 8 minutes
    });

    if (!video) return reply("😢 No suitable song found for that name.");

    const caption = `*"${video.title}"*

> 💆‍♂️ *Mind Relaxing Best Song* 💗  
> 🎧 *${query.toUpperCase()}*
───────────────────────
Use 🎧 for best experience 💫  
Powered by *ZANTA-XMD BOT*  
Owner: +94760264995`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
    });

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download) {
      return reply("⚠️ MP3 link not found or invalid from API.");
    }

    const mp3Url = data.result.download;
    const tempFile = path.join(__dirname, `${Date.now()}.mp3`);

    // verify & download
    try {
      await axios.head(mp3Url);
    } catch {
      return reply("⚠️ Audio file not reachable (URL dead).");
    }

    await downloadFile(mp3Url, tempFile);

    // ✅ send as voice note
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(tempFile),
      mimetype: 'audio/mpeg',
      ptt: true, // 🎙️ Voice note mode
    });

    fs.unlinkSync(tempFile);
  } catch (err) {
    console.error("❌ Error sending song:", err);
    reply("⚠️ Something went wrong while sending song.");
  }
}

// 🟢 .song1 command — user request mode
cmd({
  pattern: "song1",
  desc: "Download any Sinhala slowed/reverb song as a voice message",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, args }) => {
  const query = args.join(" ");
  if (!query) return reply("🌀 Please type a song name.\nExample: *.song pahasara slowed*");

  reply(`🔍 Searching for *${query}* ...`);
  await sendSinhalaSong(conn, m.chat, reply, query);
});

// 🎵 .voice1 — auto every 20 min
cmd({
  pattern: "voice1",
  desc: "Auto Sinhala slowed songs as voice every 20 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");
  const targetJid = m.chat;

  reply("✅ Auto Sinhala slowed song (🎙️ voice mode) started — every 20 minutes.");

  await sendSinhalaSong(conn, targetJid, reply, styles[Math.floor(Math.random() * styles.length)]);
  autoSongInterval = setInterval(() => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    sendSinhalaSong(conn, targetJid, reply, randomStyle);
  }, 20 * 60 * 1000);
});

// 🎵 .music1 — auto every 30 min
cmd({
  pattern: "music1",
  desc: "Auto Sinhala slowed songs as voice every 30 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");
  const targetJid = m.chat;

  reply("✅ Auto Sinhala slowed song (🎙️ voice mode) started — every 30 minutes.");

  await sendSinhalaSong(conn, targetJid, reply, styles[Math.floor(Math.random() * styles.length)]);
  autoSongInterval = setInterval(() => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    sendSinhalaSong(conn, targetJid, reply, randomStyle);
  }, 30 * 60 * 1000);
});

// ⛔ stop auto mode
cmd({
  pattern: "stop",
  desc: "Stop automatic song sending",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⛔ Not running.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply("🛑 Auto song sending stopped.");
});