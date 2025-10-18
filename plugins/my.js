const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// 📥 Download file
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 🎧 Convert mp3 to opus
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

// 🎶 Download & send both audio types
async function sendBothAudio(conn, jid, url, title) {
  const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(url)}&format=mp3&apikey=sadiya`;

  try {
    const { data } = await axios.get(apiUrl);
    if (!data.status || !data.result?.download)
      return conn.sendMessage(jid, { text: "⚠️ Download link එක fail උනා!" });

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    // Voice note send
    await conn.sendMessage(jid, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      caption: `🎧 *${title}*\n💆 Sinhala Slowed Song (Voice Note)`
    });

    // MP3 send
    await conn.sendMessage(jid, {
      audio: fs.readFileSync(mp3Path),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: `🎵 *${title}* - MP3 Audio\nPowered by Zanta-XMD`
    });

    [mp3Path, opusPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));

  } catch (err) {
    console.error("Error sending audio:", err);
    conn.sendMessage(jid, { text: "😢 Audio එක load වෙන්න fail උනා." });
  }
}

// 🎵 Main Command
cmd({
  pattern: "song4",
  alias: ["songauto", "songdl4"],
  desc: "Search Sinhala slowed song and auto send voice & mp3",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const text = args?.length ? args.join(" ") : "";
  if (!text) return reply("🎵 ගීතයේ නම type කරන්න!\nඋදා: *.song4 sanda wage da*");

  try {
    reply("🔎 Sinhala slowed song එක සොයමින්...");

    const search = await yts(`${text} sinhala slowed reverb song`);
    if (!search.videos?.length)
      return reply("❌ Song එකක් හොයාගන්න බැරිවුණා!");

    const video = search.videos.find(v => v.seconds <= 480);
    if (!video) return reply("⚠️ 8 minutes එකට අඩු ගීතයක් හොයාගන්න බැරිවුණා.");

    const caption = `🎵 *${video.title}*\n🕒 Duration: ${video.timestamp}\n📎 ${video.url}\n\n💆 Sinhala Slowed & Reverb Song`;
    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption
    });

    await sendBothAudio(conn, m.chat, video.url, video.title);
  } catch (err) {
    console.error("Main error:", err);
    reply("😢 Song එක load වෙද්දි error එකක් ආව!");
  }
});