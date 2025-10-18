const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// ✅ Safe file download
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// ✅ Convert mp3 → opus (voice note)
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

// 🎶 Send Sinhala Song
async function sendSinhalaSong(conn, targetJid, reply, query, asVoice = false, asMp3 = false) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const seconds = v.timestamp
        ? v.timestamp.split(':').reduce((a, b) => a * 60 + +b, 0)
        : 0;
      return seconds <= 480;
    });
    if (!video) return reply("😭 No suitable song found.");

    const caption = `🎵 *${video.title}*

> 💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ꜱɪɴʜᴀʟᴀ ꜱʟᴏᴡᴇᴅ ꜱᴏɴɢ 💆❤‍🩹  
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  
00:00 ───●────────── ${video.timestamp}   
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  
🎧 Use Headphones for Best Experience  
⚙️ Powered by *Zanta-XMD Bot*`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎶 Choose what you want 👇",
      buttons: [
        { buttonId: `.songvoice ${query}`, buttonText: { displayText: "🎙 Song Voice" }, type: 1 },
        { buttonId: `.songmp3 ${query}`, buttonText: { displayText: "💾 Song MP3" }, type: 1 }
      ],
      headerType: 4
    });

    // 🎧 If user pressed button (asVoice / asMp3 true)
    if (asVoice || asMp3) {
      const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
      const { data } = await axios.get(apiUrl);

      if (!data.status || !data.result?.download)
        return reply("⚠️ Couldn't fetch MP3 link.");

      const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
      const opusPath = path.join(__dirname, `${Date.now()}.opus`);

      try {
        await downloadFile(data.result.download, mp3Path);

        if (asMp3) {
          await conn.sendMessage(targetJid, {
            audio: fs.readFileSync(mp3Path),
            mimetype: 'audio/mpeg',
            caption: `🎵 *${video.title}*`
          });
        } else if (asVoice) {
          await convertToOpus(mp3Path, opusPath);
          await conn.sendMessage(targetJid, {
            audio: fs.readFileSync(opusPath),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
          });
        }
      } finally {
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
        if (fs.existsSync(opusPath)) fs.unlinkSync(opusPath);
      }
    }
  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending the song.");
  }
}

// 🎵 .song4 — Main Command (Welcome UI)
cmd({
  pattern: "song4",
  desc: "Sinhala slowed songs downloader with Voice & MP3 buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/SR7HX7m/musicbot.jpg" },
      caption: `✨ *Welcome to Sinhala Slowed Song Downloader!* ✨

🎶 Relax and enjoy Sinhala slowed vibes 💫  
Select what you want below 👇`,
      footer: "Zanta-XMD Bot 🎧",
      buttons: [
        { buttonId: ".songvoice sinhala slowed reverb song", buttonText: { displayText: "🎙 Song Voice" }, type: 1 },
        { buttonId: ".songmp3 sinhala slowed reverb song", buttonText: { displayText: "💾 Song MP3" }, type: 1 }
      ],
      headerType: 4
    });
    return;
  }

  await sendSinhalaSong(conn, m.chat, (msg) =>
    conn.sendMessage(m.chat, { text: msg }), text);
});

// 🎙 .songvoice — Send Voice Note
cmd({
  pattern: "songvoice",
  desc: "Send Sinhala slowed song as WhatsApp voice note",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("🎙 Please enter a song name!");
  await sendSinhalaSong(conn, m.chat, reply, text, true, false);
});

// 💾 .songmp3 — Send MP3
cmd({
  pattern: "songmp3",
  desc: "Send Sinhala slowed song as normal MP3 file",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("💾 Please enter a song name!");
  await sendSinhalaSong(conn, m.chat, reply, text, false, true);
});