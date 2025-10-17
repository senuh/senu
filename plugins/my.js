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
  "sinhala boot slowed song",
  "sinhala love slowed song",
  "sinhala song slowed",
  "sinhala vibe and new slowed song",
  "sinhala old slowed song",
  "sinhala 2025 slowed song",
  "sinhala 2015 slowed song",
  "sinhala nonstop slowed song",
  "sinhala slowed reverb",
  "sinhala vibe slowed rap",
  "sinhala sad slowed song",
  "sinhala new boot slowed song",
  "sinhala slowed reverb 2024 song",
  "sinhala teledrama slowed reverb song",
  "sinhala mashup slowed reverb song"
];

// 🧠 Helper: Download file safely
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 🧠 Helper: Send one random Sinhala slowed song
async function sendRandomSong(conn, targetJid, reply, intervalMinutes) {
  try {
    const style = styles[Math.floor(Math.random() * styles.length)];
    const search = await yts(style);

    const video = search.videos.find(v => {
      if (sentSongUrls.has(v.url)) return false;
      const time = v.timestamp.split(':').map(Number);
      const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
      return seconds <= 480; // <= 8 minutes
    });

    if (!video) {
      clearInterval(autoSongInterval);
      autoSongInterval = null;
      return reply("✅ All suitable songs sent — stopping auto mode.");
    }

    sentSongUrls.add(video.url);

    const desc = `*"${video.title}"*

> *💆‍♂️ Mind Relaxing Best Song 💆‍♂️❤‍🩹*
> *🎧 ${style.toUpperCase()}*
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
         00:00 ───●────────── ${video.timestamp}   
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
> ❑ Use headphones for best experience.. 🙇‍♂️🎧💗
> ❑ POWERED BY ZANTA-XMD WHATSAPP BOT
> ❑ OWNER - +94760264995`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption: desc,
    });

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download) {
      console.error("⚠️ Invalid API response:", data);
      return reply("⚠️ MP3 link not found or invalid from API.");
    }

    const mp3Url = data.result.download;
    const tempFile = path.join(__dirname, `${Date.now()}.mp3`);

    // ✅ Verify URL first
    try {
      await axios.head(mp3Url);
    } catch {
      return reply("⚠️ Audio file not reachable (URL dead). Skipping...");
    }

    // ✅ Download MP3 locally
    await downloadFile(mp3Url, tempFile);

    // ✅ Send it safely
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(tempFile),
      mimetype: 'audio/mpeg',
    });

    fs.unlinkSync(tempFile); // cleanup

  } catch (err) {
    console.error("Song sending error:", err);
    reply("⚠️ Failed to send song. Retrying next cycle...");
  }
}

// 🎵 .voice1 — every 20 minutes
cmd({
  pattern: "voice1",
  desc: "Start sending Sinhala slowed songs every 20 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");

  const targetJid = m.chat;
  reply(`✅ Auto song sending started!\n🎶 Styles: ${styles.length} Sinhala slowed types.\n🕒 Sending every 20 minutes.`);

  autoSongInterval = setInterval(() => sendRandomSong(conn, targetJid, reply, 20), 20 * 60 * 1000);
  await sendRandomSong(conn, targetJid, reply, 20); // send first immediately
});

// 🎵 .music1 — every 30 minutes
cmd({
  pattern: "music1",
  desc: "Start sending Sinhala slowed songs every 30 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");

  const targetJid = m.chat;
  reply(`✅ Auto song sending started!\n🎶 Songs will be sent every 30 minutes.`);

  autoSongInterval = setInterval(() => sendRandomSong(conn, targetJid, reply, 30), 30 * 60 * 1000);
  await sendRandomSong(conn, targetJid, reply, 30);
});

// ⛔ .stop — stop the loop
cmd({
  pattern: "stop",
  desc: "Stop automatic song sending",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⛔ Not running currently.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply("🛑 Auto song sending stopped.");
});