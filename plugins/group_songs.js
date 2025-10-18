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

// 🎧 Main function — Send two Sinhala songs (with thumbnails)
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const videos = search.videos
      .filter(v => {
        const time = v.timestamp.split(':').map(Number);
        const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
        return seconds <= 480;
      })
      .slice(0, 2); // only 2 songs

    if (videos.length === 0) return reply("😢 No Sinhala slowed songs found.");

    // 🖼️ Send each video as a nice display card
    for (const v of videos) {
      // Download mp3 for button
      const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(v.url)}&format=mp3&apikey=sadiya`;
      const { data } = await axios.get(apiUrl);

      let mp3Url = data?.result?.download || v.url;

      await conn.sendMessage(targetJid, {
        image: { url: v.thumbnail },
        caption: `🎵 *${v.title}*\n🕒 ${v.timestamp}\n\n> 💆‍♂️ Mind relaxing Sinhala slowed song 🎧\n> Use headphones for best experience.`,
        footer: "ZANTA-XMD BOT • Powered by Sadiya API",
        buttons: [
          { buttonId: `play_${v.url}`, buttonText: { displayText: "▶️ Play Voice" }, type: 1 },
          { buttonId: `mp3_${mp3Url}`, buttonText: { displayText: "🎧 MP3 Download" }, type: 1 },
        ],
        headerType: 4,
      });
    }

    // 🎙️ Download & send first one as voice note
    const firstVideo = videos[0];
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(firstVideo.url)}&format=mp3&apikey=sadiya`;
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
      fileName: `${firstVideo.title}.mp3`,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending Sinhala songs.");
  }
}

// 🔁 Auto Sinhala slowed 2-song mode
cmd({
  pattern: "sinhalavoice2",
  desc: "Auto Sinhala slowed songs (2 song cards with mp3 button) every 20 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Sinhala 2-song auto mode already running!");
  const targetJid = m.chat;
  reply("✅ Sinhala slowed 2-song auto mode started — every 20 minutes 🎶");

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