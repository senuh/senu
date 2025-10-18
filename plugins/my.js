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

// 🧩 Download file safely
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 🧩 Convert mp3 → opus (WhatsApp voice format)
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

// 🧠 Send Sinhala Song (with command buttons)
async function sendSinhalaSong(conn, targetJid, reply, query, asVoice = false, asMp3 = false) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const seconds = v.timestamp ? v.timestamp.split(':').reduce((a,b)=>a*60+ +b,0) : 0;
      return seconds <= 480;
    });
    if (!video) return reply("😭 No suitable song found.");

    if (sentSongUrls.has(video.url) && !asVoice && !asMp3) return;
    sentSongUrls.add(video.url);

    const caption = `🎵 *${video.title}*
> 💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ꜱɪɴʜᴀʟᴀ ꜱʟᴏᴡᴇᴅ ꜱᴏɴɢ 💆❤‍🩹  
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  
00:00 ───●────────── ${video.timestamp}   
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  
🎧 Use Headphones for Best Experience  
⚙️ Powered by *Zanta-XMD Bot*`;

    // 🎛 Send buttons (each triggers a command)
    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎶 Choose your action below 👇",
      buttons: [
        { buttonId: `.songvoice ${query}`, buttonText: { displayText: "🎙 Voice Note" }, type: 1 },
        { buttonId: `.songmp3 ${query}`, buttonText: { displayText: "💾 Download MP3" }, type: 1 },
        { buttonId: `.song ${styles[Math.floor(Math.random() * styles.length)]}`, buttonText: { displayText: "🔁 Next Song" }, type: 1 }
      ],
      headerType: 4
    });

    // direct voice/mp3 sending logic
    if (asVoice || asMp3) {
      const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
      const { data } = await axios.get(apiUrl);
      if (!data.status || !data.result?.download)
        return reply("⚠️ Couldn't fetch mp3 link.");

      const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
      const opusPath = path.join(__dirname, `${Date.now()}.opus`);
      try {
        await downloadFile(data.result.download, mp3Path);

        if (asMp3) {
          await conn.sendMessage(targetJid, { audio: fs.readFileSync(mp3Path), mimetype: 'audio/mpeg' });
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

// 🎵 .song — Main Sinhala Slowed Song (with buttons)
cmd({
  pattern: "song4",
  desc: "Download Sinhala slowed song by name (with buttons)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("🎵 Please enter a song name!\n\n👉 Example: *.song sanda wage da*");
  await sendSinhalaSong(conn, m.chat, reply, text);
});

// 🎙 .songvoice — Send Sinhala song as voice note
cmd({
  pattern: "songvoice",
  desc: "Send Sinhala slowed song as voice note",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("🎙 Please enter a song name!");
  await sendSinhalaSong(conn, m.chat, reply, text, true, false);
});

// 💾 .songmp3 — Send Sinhala song as MP3
cmd({
  pattern: "songmp3",
  desc: "Send Sinhala slowed song as normal MP3",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("💾 Please enter a song name!");
  await sendSinhalaSong(conn, m.chat, reply, text, false, true);
});