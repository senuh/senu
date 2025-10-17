const config = require('../settings');
const { cmd } = require('../lib/command');
const { getBuffer } = require('../lib/functions');
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

// 🧠 Helper: send a random song
async function sendRandomSong(conn, targetJid, reply) {
  try {
    const style = styles[Math.floor(Math.random() * styles.length)];
    const search = await yts(style);

    const video = search.videos.find(v => {
      if (sentSongUrls.has(v.url)) return false;
      const time = v.timestamp.split(':').map(Number);
      const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
      return seconds <= 480; // under 8 minutes
    });

    if (!video) {
      clearInterval(autoSongInterval);
      autoSongInterval = null;
      return reply("✅ All suitable songs sent — auto mode stopped.");
    }

    sentSongUrls.add(video.url);

    const caption = `*"${video.title}"*

> 💆‍♂️ *Mind Relaxing Best Song* 💗  
> 🎧 *${style.toUpperCase()}*
───────────────────────
Use 🎧 for best experience 💫  
Powered by *ZANTA-XMD BOT*  
Owner: +94760264995`;

    // send thumbnail
    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
    });

    // get mp3 download link
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download) {
      return reply("⚠️ MP3 link not found or invalid from API.");
    }

    const mp3Url = data.result.download;
    const tempFile = path.join(__dirname, `${Date.now()}.mp3`);

    // verify and download
    try {
      await axios.head(mp3Url);
    } catch {
      return reply("⚠️ Audio file not reachable (URL dead). Skipping...");
    }

    await downloadFile(mp3Url, tempFile);

    // ✅ send as VOICE NOTE (PTT)
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(tempFile),
      mimetype: 'audio/mpeg',
      ptt: true, // 🔥 voice message style
    });

    fs.unlinkSync(tempFile);

  } catch (err) {
    console.error("❌ Song send error:", err);
    reply("⚠️ Something went wrong while sending song.");
  }
}

// 🎵 .voice1 — every 20 minutes
cmd({
  pattern: "voice1",
  desc: "Auto Sinhala slowed songs as voice every 20 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");
  const targetJid = m.chat;

  reply("✅ Auto Sinhala slowed song (🎙️ voice mode) started — every 20 minutes.");

  await sendRandomSong(conn, targetJid, reply);
  autoSongInterval = setInterval(() => sendRandomSong(conn, targetJid, reply), 1 * 60 * 1000);
});

// 🎵 .music1 — every 30 minutes
cmd({
  pattern: "music1",
  desc: "Auto Sinhala slowed songs as voice every 30 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");
  const targetJid = m.chat;

  reply("✅ Auto Sinhala slowed song (🎙️ voice mode) started — every 30 minutes.");

  await sendRandomSong(conn, targetJid, reply);
  autoSongInterval = setInterval(() => sendRandomSong(conn, targetJid, reply), 1 * 60 * 1000);
});

// ⛔ stop command
cmd({
  pattern: "stop",
  desc: "Stop auto song sending",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⛔ Not running.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply("🛑 Auto song sending stopped.");
});