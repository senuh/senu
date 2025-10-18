const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

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

// 🎧 Send Sinhala slowed song (1 song)
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const videos = search.videos
      .filter(v => {
        const time = v.timestamp.split(':').map(Number);
        const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
        return seconds <= 480;
      })
      .slice(0, 1); // only 1 song

    if (videos.length === 0) return reply("😢 No Sinhala slowed songs found.");

    const v = videos[0];

    // 🖼️ Send video info card with buttons
    await conn.sendMessage(targetJid, {
      image: { url: v.thumbnail },
      caption: `🎵 *${v.title}*\n🕒 ${v.timestamp}\n🔗 ${v.url}\n\n> 💆‍♂️ Mind relaxing Sinhala slowed song 🎧\n\n🎧 Use headphones for best experience.`,
      footer: "ZANTA-XMD BOT • Powered by Sadiya API",
      buttons: [
        { buttonId: `play_${v.url}`, buttonText: { displayText: "▶️ Play Song" }, type: 1 },
        { buttonId: "next_song", buttonText: { displayText: "⏭️ Next Song" }, type: 1 },
        { buttonId: "owner_contact", buttonText: { displayText: { displayText: "👑 Owner" } }, type: 1 },
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

// 🎵 Manual Sinhala slowed song search command
cmd({
  pattern: "song",
  desc: "Search & play Sinhala slowed song manually",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, args }) => {
  const query = args.join(" ") || styles[Math.floor(Math.random() * styles.length)];
  await sendSinhalaSong(conn, m.chat, reply, query);
});

// 👑 Owner contact
cmd({
  pattern: "owner_contact",
  desc: "Sends owner contact info",
  category: "info",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  await conn.sendContact(m.chat, [{ name: "👑 Bot Owner", number: "94760264995" }]);
  reply("👑 Here’s the owner’s contact!");
});

// ⏭️ Next Song button
cmd({
  pattern: "next_song",
  desc: "Play another random Sinhala slowed song",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];

  const messages = [
    "💫 නව සංගීත vibe එක load වෙමින්...",
    "🌊 Melody එකේ ලෝකය වෙත පිවිසෙමින්...",
    "🎧 හදවත සන්සුන් කරවන Sinhala slowed song එක loading..."
  ];

  for (const msg of messages) {
    await reply(msg);
    await new Promise(res => setTimeout(res, 1500));
  }

  await sendSinhalaSong(conn, m.chat, reply, randomStyle);
});