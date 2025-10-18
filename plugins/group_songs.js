const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// 🔊 Sinhala slowed styles
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

// 🔹 Download helper
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 🔹 Convert mp3 → opus
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

// 🔹 Send Sinhala song info + buttons
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const videos = search.videos
      .filter(v => {
        const time = v.timestamp.split(':').map(Number);
        const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
        return seconds <= 480;
      })
      .slice(0, 1);

    if (videos.length === 0) return reply("😢 No Sinhala slowed songs found.");

    const v = videos[0];

    await conn.sendMessage(targetJid, {
      image: { url: v.thumbnail },
      caption: `🎵 *${v.title}*\n🕒 ${v.timestamp}\n🔗 ${v.url}\n\n> 💆‍♂️ Mind relaxing Sinhala slowed song 🎧\n\n🎧 Use headphones for best experience.`,
      footer: "ZANTA-XMD BOT • Powered by Sadiya API",
      buttons: [
        { buttonId: `.play ${v.url}`, buttonText: { displayText: "▶️ Play Song" }, type: 1 },
        { buttonId: `.nextsong`, buttonText: { displayText: "⏭️ Next Song" }, type: 1 },
        { buttonId: `.owner`, buttonText: { displayText: "👑 Owner" }, type: 1 },
      ],
      headerType: 4,
    });

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending Sinhala song info.");
  }
}

// 🎧 Main song command — default: pahasara
cmd({
  pattern: "song",
  desc: "Search Sinhala slowed song manually",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, args }) => {
  const query = args.join(" ") || "pahasara slowed reverb sinhala song";
  await sendSinhalaSong(conn, m.chat, reply, query);
});

// ▶️ Play song
cmd({
  pattern: "play",
  desc: "Play Sinhala song from YouTube",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("❌ Please provide a YouTube link!");

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download)
      return reply("⚠️ Couldn't fetch mp3 link.");

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(mp3Path),
      mimetype: 'audio/mp3',
      fileName: "Sinhala_Slowed_Song.mp3",
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

  } catch (e) {
    console.error(e);
    reply("💥 Error while downloading or sending the song!");
  }
});

// ⏭️ Next song
cmd({
  pattern: "nextsong",
  desc: "Get another random Sinhala slowed song",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  await reply("💫 Loading another Sinhala slowed song...");
  await sendSinhalaSong(conn, m.chat, reply, randomStyle);
});

// 👑 Owner contact
cmd({
  pattern: "owner",
  desc: "Send bot owner's contact",
  category: "info",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  await conn.sendContact(m.chat, [{ name: "👑 Bot Owner", number: "94760264995" }]);
  reply("👑 Here’s the owner’s contact!");
});