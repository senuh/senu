// Gift command for Sinhala bot — sends Photo + Message + Music (mp3, voice, doc)
// Drop into your existing bot module (it expects axios, yts, ffmpeg, download helpers already present)

const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const OWNER_NUMBER = "+94760264995";
const tmpDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

// small helper functions (reuse if you already have them)
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

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

// presets
const styles = [
  "sinhala slowed reverb song",
  "sinhala vibe slowed song",
  "sinhala pahasara slowed song",
  "sinhala love slowed song",
  "sinhala sad slowed song",
];

const giftMessages = [
  "🌸 පුංචි gift එකක් — හිතට සැනසිල්ලක් වෙයි කියලා හිතන ගීතයක් එවමි. Enjoy! 💛",
  "🎁 ඔයාට මෙන්න පොඩි ගංසක gift එකක් — music + message + photo! 😍",
  "💌 Friend, here's a little vibe for your day — listen, smile, repeat. 🎧",
  "✨ ආදරෙන්: මේ ගීතේ vibes ඔයාට හොඳට වේවා! 🕊️",
  "🎶 සුපිරි සුන්දර හඩක් — have a peaceful moment. 🌙"
];

const photoUrls = [
  // public aesthetic photos (you can replace with your own hosted images)
  "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
];

// internal helper: pick random element
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Core function to fetch a song (mp3 link), download & convert
async function prepareSongFromQuery(query) {
  const search = await yts(query);
  const video = search.videos.find(v => {
    if (!v || !v.timestamp) return false;
    const t = v.timestamp.split(':').map(Number);
    const s = t.length === 3 ? t[0] * 3600 + t[1] * 60 + t[2] : t[0] * 60 + t[1];
    return s <= 480; // <= 8 minutes
  });
  if (!video) throw new Error('No suitable video found');

  // use sadiya API to get mp3 url
  const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
  const { data } = await axios.get(apiUrl);
  if (!data.status || !data.result?.download) throw new Error('Could not fetch mp3 link');

  const mp3Path = path.join(tmpDir, `${Date.now()}-gift.mp3`);
  const opusPath = path.join(tmpDir, `${Date.now()}-gift.opus`);

  await downloadFile(data.result.download, mp3Path);
  await convertToOpus(mp3Path, opusPath);

  return { mp3Path, opusPath, title: video.title, thumbnail: video.thumbnail, url: video.url };
}

// Gift command
cmd({
  pattern: "gift",
  desc: "Send a gift (photo + message + music). Usage: .gift [music|photo|message]",
  category: "fun",
  filename: __filename,
}, async (conn, mek, m, { reply, text }) => {
  try {
    const arg = (text || "").trim().toLowerCase();
    // if user provided single type, only send that; otherwise send mixed gift
    const wantMusic = (!arg || arg === "music" || arg === "all" || arg === "mixed");
    const wantPhoto = (!arg || arg === "photo" || arg === "all" || arg === "mixed");
    const wantMessage = (!arg || arg === "message" || arg === "all" || arg === "mixed");

    // 1) send photo (if requested)
    if (wantPhoto) {
      const photo = rand(photoUrls);
      await conn.sendMessage(m.chat, {
        image: { url: photo },
        caption: "🎁 *A little photo gift for you!*",
      });
    }

    // 2) send message (if requested)
    if (wantMessage) {
      const textMsg = rand(giftMessages);
      await reply(textMsg);
    }

    // 3) prepare & send music (if requested)
    if (wantMusic) {
      // pick style randomly
      const styleQuery = rand(styles);
      let song;
      try {
        // prepare (download + convert)
        song = await prepareSongFromQuery(styleQuery);
      } catch (err) {
        console.error("Gift music prepare failed:", err);
        return reply(`⚠️ Couldn't prepare music gift.\n📞 Owner: ${OWNER_NUMBER}`);
      }

      // send thumbnail + caption
      try {
        await conn.sendMessage(m.chat, {
          image: { url: song.thumbnail },
          caption: `🎵 *${song.title}*  — *Gift Music*\n\nChoose how you want it next time: 1=mp3 2=voice 3=document`,
        });
      } catch (e) {
        // if thumbnail fails, ignore and continue
      }

      // send voice note (opus)
      try {
        await conn.sendMessage(m.chat, {
          audio: fs.readFileSync(song.opusPath),
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true,
        });
      } catch (e) {
        console.error("Failed sending voice note:", e);
      }

      // send mp3 file
      try {
        await conn.sendMessage(m.chat, {
          audio: fs.readFileSync(song.mp3Path),
          mimetype: 'audio/mpeg',
          fileName: `${song.title}.mp3`,
        });
      } catch (e) {
        console.error("Failed sending mp3:", e);
      }

      // send as document
      try {
        await conn.sendMessage(m.chat, {
          document: fs.readFileSync(song.mp3Path),
          mimetype: 'audio/mpeg',
          fileName: `${song.title}.mp3`,
        });
      } catch (e) {
        console.error("Failed sending document:", e);
      }

      // cleanup song files
      try { fs.unlinkSync(song.mp3Path); } catch (e) {}
      try { fs.unlinkSync(song.opusPath); } catch (e) {}
    }

  } catch (err) {
    console.error("Gift command error:", err);
    reply(`😭 Something went wrong while sending gift.\n📞 Owner: ${OWNER_NUMBER}`);
  }
});