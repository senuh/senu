const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// ========================
// 📥 File Downloader
// ========================
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// ========================
// 🎧 Convert mp3 → opus
// ========================
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

// ========================
// 🎵 Sinhala Slowed Song Search
// ========================
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const fullQuery = `${query} sinhala slowed reverb song`;
    const search = await yts(fullQuery);

    if (!search.videos || search.videos.length === 0)
      return reply("😭 Sinhala slowed song එකක් හොයාගන්න බැරිවුණා!");

    const video = search.videos.find(v => {
      const parts = v.timestamp?.split(':').map(Number);
      const seconds = parts ? parts.reduce((a, val) => a * 60 + val, 0) : 0;
      return seconds <= 480;
    });

    if (!video) return reply("⚠️ 8 minutes එකට අඩු ගීතයක් හොයාගන්න බැරිවුණා.");

    const caption = `🎵 *${video.title}*

🧘‍♀️ *MIND RELAXING SINHALA SONG* 🧘‍♂️
💖 Use headphones for best experience 💖
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
00:00 ───●────────── ${video.timestamp}
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
🎧 Enjoy the vibe...`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎙️ Powered by Zanta-XMD",
      buttons: [
        { buttonId: `song4_voice_${video.url}`, buttonText: { displayText: "🎧 Voice Note" }, type: 1 },
        { buttonId: `song4_mp3_${video.url}`, buttonText: { displayText: "🎵 MP3 Audio" }, type: 1 }
      ],
      headerType: 4
    });

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Song එක load වෙද්දි error එකක් ආව.");
  }
}

// ========================
// 🎶 Convert & Send Audio
// ========================
async function sendAudio(conn, jid, url, type) {
  const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(url)}&format=mp3&apikey=sadiya`;

  try {
    const { data } = await axios.get(apiUrl);
    if (!data.status || !data.result?.download)
      return conn.sendMessage(jid, { text: "⚠️ Download link එක ගන්න බැරිවුණා!" });

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);
    await downloadFile(data.result.download, mp3Path);

    if (type === "voice") {
      await convertToOpus(mp3Path, opusPath);
      await conn.sendMessage(jid, {
        audio: fs.readFileSync(opusPath),
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
      });
    } else {
      await conn.sendMessage(jid, {
        audio: fs.readFileSync(mp3Path),
        mimetype: 'audio/mpeg',
        fileName: "ZantaSong.mp3",
      });
    }

    // Clean temp files
    [mp3Path, opusPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));

  } catch (err) {
    console.error("Audio send error:", err);
    conn.sendMessage(jid, { text: "😢 Audio එක load වෙන්න fail උනා." });
  }
}

// ========================
// 🎵 Command: .song4
// ========================
cmd({
  pattern: "song4",
  desc: "Search Sinhala slowed/reverb song and send with buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const text = args && args.length > 0 ? args.join(" ") : "";
  if (!text) return reply("🎵 ගීතයේ නම type කරන්න!\n\nඋදා: *.song4 sanda wage da*");
  await sendSinhalaSong(conn, m.chat, reply, text);
});

// ========================
// 🎛️ Handle Button Clicks
// ========================
cmd({ on: "message" }, async (conn, mek, m) => {
  let buttonId;
  if (m?.message?.buttonsResponseMessage) {
    buttonId = m.message.buttonsResponseMessage.selectedButtonId;
  } else if (m?.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
    const data = JSON.parse(
      m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson
    );
    buttonId = data.id;
  }
  if (!buttonId) return;

  const jid = m.key.remoteJid;

  if (buttonId.startsWith("song4_voice_")) {
    await sendAudio(conn, jid, buttonId.replace("song4_voice_", ""), "voice");
  } else if (buttonId.startsWith("song4_mp3_")) {
    await sendAudio(conn, jid, buttonId.replace("song4_mp3_", ""), "mp3");
  }
});

// ========================
// 🎤 Manual Voice Command
// ========================
cmd({
  pattern: "voice",
  desc: "Download Sinhala song as voice note (opus)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const text = args && args.length > 0 ? args.join(" ") : "";
  if (!text) return reply("🎧 Voice එකක් ඕන නම්: *.voice sanda wage da*");
  const search = await yts(`${text} sinhala slowed reverb song`);
  if (!search.videos?.length) return reply("❌ Song එකක් හොයාගන්න බැරිවුණා!");
  await sendAudio(conn, m.chat, search.videos[0].url, "voice");
});

// ========================
// 🎵 Manual MP3 Command
// ========================
cmd({
  pattern: "mp3",
  desc: "Download Sinhala song as mp3",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const text = args && args.length > 0 ? args.join(" ") : "";
  if (!text) return reply("🎵 MP3 එකක් ඕන නම්: *.mp3 sanda wage da*");
  const search = await yts(`${text} sinhala slowed reverb song`);
  if (!search.videos?.length) return reply("❌ Song එකක් හොයාගන්න බැරිවුණා!");
  await sendAudio(conn, m.chat, search.videos[0].url, "mp3");
});