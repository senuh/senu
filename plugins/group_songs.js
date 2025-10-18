const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

let autoSongIntervals = {}; // ✅ separate interval per chat
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

// ---------------- Helpers ----------------
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function convertToOpus(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec("libopus")
      .audioBitrate("64k")
      .format("opus")
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
}

async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const t = v.timestamp.split(':').map(Number);
      const seconds = t.length === 3 ? t[0]*3600 + t[1]*60 + t[2] : t[0]*60 + t[1];
      return seconds <= 480;
    });
    if (!video) return reply("😭 No suitable song found.");

    const caption = `🎶 *${video.title}* 🎶

💆‍♂️ Mind Relaxing Sinhala Song  
🎧 Use headphones for best vibe  
⚡ Powered by *ZANTA-XMD BOT*`;

    await conn.sendMessage(jid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎵 Sinhala Vibe Menu",
      buttons: [
        { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
        { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      ],
      headerType: 4,
    });

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download) return reply("⚠️ Couldn't fetch mp3 link.");

    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const mp3Path = path.join(__dirname, `${unique}.mp3`);
    const opusPath = path.join(__dirname, `${unique}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    await conn.sendMessage(jid, {
      audio: fs.readFileSync(opusPath),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });

    try { fs.unlinkSync(mp3Path); } catch {}
    try { fs.unlinkSync(opusPath); } catch {}

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending the song.");
  }
}

// ---------------- Commands ----------------
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs with buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;

  if (autoSongIntervals[jid]) return reply("🟡 Auto Sinhala mode already running!");

  await conn.sendMessage(jid, {
    text: `🎧 *Auto Sinhala Slowed Songs Activated!*  
You'll get a new Sinhala slowed song every 20 minutes.  
Use the menu below to control playback 👇`,
    footer: "🎵 Sinhala Vibe Menu",
    buttons: [
      { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
      { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
    ],
    headerType: 4,
  });

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, randomStyle);
  };

  await sendRandom();
  autoSongIntervals[jid] = setInterval(sendRandom, 20 * 60 * 1000);
});

// ---------------- Next Song ----------------
cmd({
  pattern: "nextsong",
  desc: "Play next Sinhala slowed song immediately",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  reply("✅ Loading next Sinhala slowed song...");
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  await sendSinhalaSong(conn, jid, reply, randomStyle);
});

// ---------------- Stop Auto ----------------
cmd({
  pattern: "stop3",
  desc: "Stop automatic Sinhala slowed songs",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!autoSongIntervals[jid]) return reply("⚠️ Auto mode not running.");
  clearInterval(autoSongIntervals[jid]);
  delete autoSongIntervals[jid];
  reply("🛑 Auto Sinhala slowed songs stopped.");
});