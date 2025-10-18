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

// 🧑‍💻 Change your owner number here
const OWNER_NUMBER = "+94760264995";

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

// 🧩 Safe file downloader
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 🧩 Convert MP3 → Opus (voice)
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

// 🎵 Main Sinhala song sender
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const time = v.timestamp.split(':').map(Number);
      const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
      return seconds <= 480;
    });

    if (!video) return reply(`😭 No suitable Sinhala slowed song found.\n\n📞 *Contact Owner:* ${OWNER_NUMBER}`);

    // Avoid duplicates
    if (sentSongUrls.has(video.url)) return sendSinhalaSong(conn, targetJid, reply, query);
    sentSongUrls.add(video.url);

    const caption = `🎵 *${video.title}*

> 💆‍♂️ Mind Relaxing Sinhala Slowed Song 🎧
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
00:00 ───●────────── ${video.timestamp}
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
> ❑ Use headphones for best experience 🎧
> ❑ Powered by ᴢᴀɴᴛᴀ-xᴍᴅ WhatsApp Bot
> ❑ Owner: ${OWNER_NUMBER}`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
    });

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download)
      return reply(`⚠️ Couldn't fetch mp3 link.\n\n📞 *Contact Owner:* ${OWNER_NUMBER}`);

    const tmpDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const mp3Path = path.join(tmpDir, `${Date.now()}.mp3`);
    const opusPath = path.join(tmpDir, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    // 🎙️ Voice note
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    // 📁 MP3 file
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(mp3Path),
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
    });

    // 💽 As Document
    await conn.sendMessage(targetJid, {
      document: fs.readFileSync(mp3Path),
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

  } catch (err) {
    console.error("Send error:", err);
    reply(`😭 Something went wrong while sending the song.\n\n📞 *Contact Owner:* ${OWNER_NUMBER}`);
  }
}

// 🎶 Auto Sinhala slowed songs every 20 minutes
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs (voice + mp3 + doc every 20 min)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");
  const targetJid = m.chat;
  reply(`✅ Sinhala slowed song auto mode started.\n🎙️ Voice + 📁 MP3 + 💽 Document every 20 minutes.\n\n📞 *Owner:* ${OWNER_NUMBER}`);

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, targetJid, reply, randomStyle);
  };

  await sendRandom();
  autoSongInterval = setInterval(sendRandom, 20 * 60 * 1000);
});

// ⛔ Stop auto mode
cmd({
  pattern: "stop3",
  desc: "Stop Sinhala slowed song auto mode",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⛔ Auto mode is not running.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply(`🛑 Sinhala auto song mode stopped.\n📞 *Owner:* ${OWNER_NUMBER}`);
});

// 👑 .owner command
cmd({
  pattern: "owner",
  desc: "Show bot owner's contact info",
  category: "general",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:ZANTA-XMD OWNER
TEL;type=CELL;type=VOICE;waid=${OWNER_NUMBER.replace('+', '')}:${OWNER_NUMBER}
END:VCARD`;

  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: "ZANTA-XMD OWNER",
      contacts: [{ vcard }],
    },
  });

  reply(`📞 *Bot Owner:* ${OWNER_NUMBER}\n💬 You can message or call the owner directly on WhatsApp.`);
});