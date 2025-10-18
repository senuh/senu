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

// 🧠 Send Sinhala Song (with buttons)
async function sendSinhalaSong(conn, targetJid, reply, query, asVoice = false) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const seconds = v.timestamp ? v.timestamp.split(':').reduce((a,b)=>a*60+ +b,0) : 0;
      return seconds <= 480;
    });
    if (!video) return reply("😭 No suitable song found.");

    // prevent duplicates in auto mode
    if (sentSongUrls.has(video.url) && !asVoice) return;
    sentSongUrls.add(video.url);

    const caption = `🎵 *${video.title}*
    
> 💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ʙᴇꜱᴛ ꜱᴏɴɢ 💆❤‍🩹  
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  
00:00 ───●────────── ${video.timestamp}   
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  
🎧 Use headphones for best experience  
⚙️ Powered by *Zanta-XMD*`;

    // 🎛 Send buttons
    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
      footer: "Select an option below 👇",
      buttons: [
        { buttonId: `voice_${video.url}`, buttonText: { displayText: "🎙 Voice Note" }, type: 1 },
        { buttonId: `mp3_${video.url}`, buttonText: { displayText: "💾 Download MP3" }, type: 1 },
        { buttonId: `next_${query}`, buttonText: { displayText: "🔁 Next Song" }, type: 1 }
      ],
      headerType: 4
    });

    // if user selected asVoice=true, send voice
    if (asVoice) {
      const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
      const { data } = await axios.get(apiUrl);
      if (!data.status || !data.result?.download)
        return reply("⚠️ Couldn't fetch mp3 link.");

      const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
      const opusPath = path.join(__dirname, `${Date.now()}.opus`);
      try {
        await downloadFile(data.result.download, mp3Path);
        await convertToOpus(mp3Path, opusPath);
        await conn.sendMessage(targetJid, {
          audio: fs.readFileSync(opusPath),
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true,
        });
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

// 🎵 Manual Sinhala Song Downloader (with buttons)
cmd({
  pattern: "song",
  desc: "Download Sinhala slowed song by name (with buttons)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("🎵 Please enter a song name!\n\n👉 Example: *.song sanda wage da*");
  await sendSinhalaSong(conn, m.chat, reply, text);
});

// 🎶 Button actions handler
cmd({
  on: "button",
}, async (conn, mek, m, { reply, body }) => {
  try {
    if (body.startsWith("voice_")) {
      const url = body.split("voice_")[1];
      await sendSinhalaSong(conn, m.chat, reply, url, true);
    } else if (body.startsWith("mp3_")) {
      const url = body.split("mp3_")[1];
      const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(url)}&format=mp3&apikey=sadiya`;
      const { data } = await axios.get(apiUrl);
      if (!data.status || !data.result?.download)
        return reply("⚠️ Couldn't fetch mp3 link.");
      await conn.sendMessage(m.chat, { audio: { url: data.result.download }, mimetype: 'audio/mpeg' });
    } else if (body.startsWith("next_")) {
      const query = body.split("next_")[1];
      await sendSinhalaSong(conn, m.chat, reply, query);
    }
  } catch (err) {
    console.error("Button handler error:", err);
    reply("⚠️ Error handling button.");
  }
});