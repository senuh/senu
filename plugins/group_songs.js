const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

let autoSongInterval = null;

// 🎶 Sinhala styles list
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

// 🧩 File downloader
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

// 🎵 Send two Sinhala songs with nice cards
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const videos = search.videos
      .filter(v => {
        const time = v.timestamp.split(':').map(Number);
        const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
        return seconds <= 480;
      })
      .slice(0, 2);

    if (videos.length === 0) return reply("😢 No Sinhala slowed songs found.");

    // 🖼️ Send both thumbnails as separate cards
    for (const v of videos) {
      await conn.sendMessage(targetJid, {
        image: { url: v.thumbnail },
        caption: `🎵 *${v.title}*\n🕒 ${v.timestamp}\n🔗 ${v.url}\n\n> Mind relaxing Sinhala slowed song 💆‍♂️🎧`,
        footer: "ZANTA-XMD BOT",
        buttons: [
          { buttonId: `play_${v.url}`, buttonText: { displayText: "▶️ Play" }, type: 1 },
          { buttonId: `copy_${v.url}`, buttonText: { displayText: "📋 Copy Link" }, type: 1 },
        ],
        headerType: 4,
      });
    }

    // 🎧 Download + send first as voice note
    const video = videos[0];
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download)
      return reply("⚠️ Couldn't fetch mp3 link.");

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    // 🎙️ Voice note
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    // 🎧 MP3 document
    await conn.sendMessage(targetJid, {
      document: fs.readFileSync(mp3Path),
      mimetype: 'audio/mp3',
      fileName: `${video.title}.mp3`,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending songs.");
  }
}

// 🔁 Auto Sinhala slowed songs every 20 minutes
cmd({
  pattern: "sinhalavoice2",
  desc: "Auto Sinhala slowed songs (2 side by side) every 20 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");
  const targetJid = m.chat;
  reply("✅ Auto Sinhala slowed 2-song mode started — every 20 minutes 🎧");

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
  desc: "Stop Sinhala slowed 2-song auto mode",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⛔ Auto mode not running.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply("🛑 Sinhala slowed 2-song auto mode stopped.");
});