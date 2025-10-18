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
        { buttonId: "next_song", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
        { buttonId: "stop_auto", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      ],
      headerType: 4,
    });

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download) return reply("⚠️ Couldn't fetch mp3 link.");

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    await conn.sendMessage(jid, {
      audio: fs.readFileSync(opusPath),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

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
      { buttonId: "next_song", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
      { buttonId: "stop_auto", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
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

// ---------------- Button Events ----------------
cmd({ on: "message" }, async (conn, m) => {
  try {
    // Detect new button types (Baileys >= 6.5)
    const btn =
      m.message?.templateButtonReplyMessage?.selectedId ||
      m.message?.buttonsResponseMessage?.selectedButtonId;
    if (!btn) return;

    const chatId = m.key.remoteJid;
    console.log("🎛 Button clicked:", btn);

    if (btn === "next_song") {
      await conn.sendMessage(chatId, { text: "✅ Loading next Sinhala slowed song..." });
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      await sendSinhalaSong(conn, chatId, (t) => conn.sendMessage(chatId, { text: t }), randomStyle);
    }

    if (btn === "stop_auto") {
      await conn.sendMessage(chatId, { text: "🛑 Stopping auto Sinhala songs..." });
      if (autoSongIntervals[chatId]) {
        clearInterval(autoSongIntervals[chatId]);
        delete autoSongIntervals[chatId];
        await conn.sendMessage(chatId, { text: "✅ Auto Sinhala slowed songs stopped." });
      } else {
        await conn.sendMessage(chatId, { text: "⚠️ Auto mode not running." });
      }
    }
  } catch (e) {
    console.error("Button error:", e);
  }
});

// ---------------- Manual Stop ----------------
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