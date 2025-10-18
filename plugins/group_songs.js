const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const OWNER_NUMBER = "+94760264995";
let songQueue = {};
const savedSongsPath = path.join(__dirname, "saved_songs.json");

// Create save file if not exist
if (!fs.existsSync(savedSongsPath)) fs.writeFileSync(savedSongsPath, JSON.stringify({}));

function loadSavedSongs() {
  return JSON.parse(fs.readFileSync(savedSongsPath));
}
function saveSongs(data) {
  fs.writeFileSync(savedSongsPath, JSON.stringify(data, null, 2));
}

// Download safely
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Convert mp3 -> opus
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

// 🎵 Sinhala Pahasara Command
cmd({
  pattern: "sinhalasongs",
  desc: "Get Sinhala slowed song (pahasara version)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, text }) => {
  try {
    const style = text && text.trim().toLowerCase() === "pahasara"
      ? "sinhala pahasara slowed reverb song"
      : text || "sinhala slowed reverb song";

    const search = await yts(style);
    const video = search.videos.find(v => {
      const t = v.timestamp.split(':').map(Number);
      const s = t.length === 3 ? t[0] * 3600 + t[1] * 60 + t[2] : t[0] * 60 + t[1];
      return s <= 480;
    });

    if (!video) return reply("😭 No suitable song found.");

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);
    if (!data.status || !data.result?.download)
      return reply("⚠️ Couldn't fetch mp3 link.");

    const tmpDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const mp3Path = path.join(tmpDir, `${Date.now()}.mp3`);
    const opusPath = path.join(tmpDir, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    songQueue[m.chat] = {
      mp3Path,
      opusPath,
      title: video.title,
      url: video.url,
    };

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: `🎵 *${video.title}*  — *Pahasara Vibe*\n\nChoose a format:\n\n1️⃣ MP3 File\n2️⃣ Voice Note\n3️⃣ Document File\n\n_Reply with 1 / 2 / 3_\n💾 *After sending, song will be saved automatically!*`,
    });
  } catch (e) {
    console.error(e);
    reply(`😭 Something went wrong.\n📞 Owner: ${OWNER_NUMBER}`);
  }
});

// Handle reply (1 / 2 / 3)
cmd({
  on: "text",
  fromMe: false,
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const msg = m.text.trim();
  const chatId = m.chat;

  if (!songQueue[chatId]) return;
  const { mp3Path, opusPath, title, url } = songQueue[chatId];

  try {
    if (msg === "1") {
      await conn.sendMessage(chatId, {
        audio: fs.readFileSync(mp3Path),
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
      });
      reply("✅ Sent as MP3 File!");
    } else if (msg === "2") {
      await conn.sendMessage(chatId, {
        audio: fs.readFileSync(opusPath),
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
      });
      reply("🎙️ Sent as Voice Note!");
    } else if (msg === "3") {
      await conn.sendMessage(chatId, {
        document: fs.readFileSync(mp3Path),
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
      });
      reply("💽 Sent as Document File!");
    } else {
      return; // ignore other text
    }

    // 💾 Save the song automatically
    const savedData = loadSavedSongs();
    if (!savedData[chatId]) savedData[chatId] = [];
    savedData[chatId].push({
      title,
      url,
      date: new Date().toLocaleString(),
    });
    saveSongs(savedData);
    reply("💾 *Pahasara song saved to your list!*");

    // Clean up
    delete songQueue[chatId];
    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);
  } catch (err) {
    console.error(err);
    reply(`⚠️ Error sending file.\n📞 Owner: ${OWNER_NUMBER}`);
  }
});

// 🧾 View Saved Songs
cmd({
  pattern: "mysongs",
  desc: "View your saved Sinhala song list",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const savedData = loadSavedSongs();
  const userSongs = savedData[m.chat] || [];

  if (userSongs.length === 0)
    return reply("📭 You haven't saved any songs yet!");

  let msg = `🎧 *Your Saved Sinhala Songs*\n\n`;
  userSongs.slice(-15).forEach((s, i) => {
    msg += `${i + 1}. ${s.title}\n🔗 ${s.url}\n🕒 ${s.date}\n\n`;
  });

  reply(msg);
});