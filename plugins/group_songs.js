const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

let autoSongInterval = null;

// 🎶 Sinhala slowed song styles
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

// 🧩 Download helper
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 🧩 Convert mp3 → opus
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

// 🎧 Main function — Send ONE Sinhala slowed song
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const videos = search.videos
      .filter(v => {
        const time = v.timestamp.split(':').map(Number);
        const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
        return seconds <= 480;
      })
      .slice(0, 1); // only 1 song now 👈

    if (videos.length === 0) return reply("😢 No Sinhala slowed songs found.");

    const v = videos[0];

    // 🖼️ Send the video info card
    await conn.sendMessage(targetJid, {
      image: { url: v.thumbnail },
      caption: `🎵 *${v.title}*\n🕒 ${v.timestamp}\n🔗 ${v.url}\n\n> 💆‍♂️ Mind relaxing Sinhala slowed song 🎧\n\n🎧 Use headphones for best experience.`,
      footer: "ZANTA-XMD BOT • Powered by Sadiya API",
      buttons: [
        { buttonId: `play_${v.url}`, buttonText: { displayText: "▶️ Play" }, type: 1 },
        { buttonId: "next_song", buttonText: { displayText: "⏭️ Next Song" }, type: 1 },
        { buttonId: "owner_contact", buttonText: { displayText: "👑 Owner" }, type: 1 },
      ],
      headerType: 4,
    });

    // 🎙️ Download & send as voice note
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(v.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download)
      return reply("⚠️ Couldn't fetch mp3 link.");

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    // 🎤 Send voice note (opus)
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    // 💾 Send mp3 document
    await conn.sendMessage(targetJid, {
      document: fs.readFileSync(mp3Path),
      mimetype: 'audio/mp3',
      fileName: `${v.title}.mp3`,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending Sinhala song.");
  }
}

// 🔁 Auto Sinhala song every 20 minutes
cmd({
  pattern: "sinhalavoice2",
  desc: "Auto Sinhala slowed songs (1 song every 20 minutes)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Sinhala auto mode already running!");
  const targetJid = m.chat;
  reply("✅ Sinhala slowed song auto mode started — every 20 minutes 🎶");

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, targetJid, reply, randomStyle);
  };

  await sendRandom();
  autoSongInterval = setInterval(sendRandom, 20 * 60 * 1000);
});

// ⛔ Stop auto mode
cmd({
  pattern: "stop5",
  desc: "Stop Sinhala slowed auto mode",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⛔ Auto mode not running.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply("🛑 Sinhala slowed song auto mode stopped.");
});

// 👑 Owner contact button handler
cmd({
  pattern: "owner_contact",
  desc: "Sends owner contact info",
  category: "info",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  await conn.sendContact(m.chat, [{ name: "👑 Bot Owner", number: "94760264995" }]);
  reply("👑 Here’s the owner’s contact!");
});

// ⏭️ Next Song Button handler (with typing animation)
cmd({
  pattern: "next_song",
  desc: "Send a new random Sinhala slowed song immediately (with animation)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const targetJid = m.chat;
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];

  // ⌛ Typing animation simulation
  const messages = [
    "⏳ නව ගීතය සොයමින්...",
    "🎶 සුන්දර Sinhala slowed beat එකක් සෙවියි...",
    "🎧 සුළු මොහොතක් — නව vibe එකට connect වෙන්න 💫"
  ];

  for (const msg of messages) {
    await reply(msg);
    await new Promise(res => setTimeout(res, 1500)); // 1.5s delay per message
  }

  await sendSinhalaSong(conn, targetJid, reply, randomStyle);
});