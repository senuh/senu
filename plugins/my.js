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

// 🧠 Main function to send Sinhala Song
async function sendSinhalaSong(conn, targetJid, reply, query) {
try {
const search = await yts(query);
const video = search.videos.find(v => {
const seconds = v.timestamp ? v.timestamp.split(':').reduce((a,b)=>a*60+ +b,0) : 0;
return seconds <= 480; // under 8 min
});

if (!video) return reply("😭 No suitable song found.");  

// prevent duplicates in auto mode  
if (sentSongUrls.has(video.url)) return;  
sentSongUrls.add(video.url);  

const caption = `*"${video.title}"*

> 💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ʙᴇꜱᴛ ꜱᴏɴɢ 💆❤‍🩹
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
00:00 ───●────────── ${video.timestamp}
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
❑ Use Headphones for Best Experience 🎧
❑ Powered by Zanta-XMD WhatsApp Bot
❑ Owner - +94760264995`;



await conn.sendMessage(targetJid, {  
  image: { url: video.thumbnail },  
  caption,  
});  

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

} catch (err) {
console.error("Send error:", err);
reply("😭 Something went wrong while sending the song.");
}
}

// 🎶 .channelmusic — auto every 20 min
cmd({
pattern: "channelmusic",
desc: "Auto Sinhala slowed songs as voice note every 20 minutes",
category: "music",
filename: __filename,
}, async (conn, mek, m, { reply }) => {
if (autoSongInterval) return reply("🟡 Already running!");
const targetJid = m.chat;
reply("✅ Auto Sinhala slowed songs (🎙️ voice mode) started — every 20 minutes.");

const sendRandom = async () => {
const randomStyle = styles[Math.floor(Math.random() * styles.length)];
await sendSinhalaSong(conn, targetJid, reply, randomStyle);
};

await sendRandom();
autoSongInterval = setInterval(sendRandom, 20 * 60 * 1000);
});

// ⛔ .stop5 — Stop auto
cmd({
pattern: "stop5",
desc: "Stop automatic Sinhala slowed song sending",
category: "music",
filename: __filename,
}, async (conn, mek, m, { reply }) => {
if (!autoSongInterval) return reply("⛔ Auto mode is not running.");
clearInterval(autoSongInterval);
autoSongInterval = null;
reply("🛑 Auto Sinhala slowed song sending stopped.");
});

// 🎵 .song — Manual Sinhala Song Downloader
cmd({
pattern: "song4",
desc: "Download Sinhala slowed song by name",
category: "music",
filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
if (!text) return reply("🎵 Please enter a song name!\n\n👉 Example: .song sanda wage da");
await sendSinhalaSong(conn, m.chat, reply, text);
});

