const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

let autoSongInterval = null;
const sentUrls = new Set(); // ✅ Prevent duplicate songs

const styles = [
  "sinhala slowed reverb song",
  "sinhala love slowed song",
  "sinhala sad slowed song",
  "sinhala vibe slowed song",
  "sinhala teledrama slowed song",
  "sinhala mashup slowed reverb song"
];

async function downloadFile(url, outPath) {
  const writer = fs.createWriteStream(outPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function convertToOpus(inPath, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inPath)
      .audioCodec('libopus')
      .audioBitrate('64k')
      .format('opus')
      .on('end', resolve)
      .on('error', reject)
      .save(outPath);
  });
}

async function getDownloadLink(url) {
  try {
    const api = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(url)}&apikey=sadiya`;
    const { data } = await axios.get(api);
    const mp3 = data?.result?.audio || data?.result?.download;
    if (mp3) return mp3;

    const alt = await axios.get(`https://api.ryzendesu.com/api/yt?url=${encodeURIComponent(url)}`);
    return alt.data?.result?.audio?.url;
  } catch {
    return null;
  }
}

async function sendSinhalaSong(conn, jid, reply, query, sendVoice = false) {
  try {
    let video;
    let attempts = 0;

    // 🔁 Find unique song (not sent before)
    while (!video && attempts < 5) {
      const search = await yts(query);
      const candidate = search.videos.find(v => {
        if (sentUrls.has(v.url)) return false;
        const t = v.timestamp.split(':').map(Number);
        const sec = t.length === 3 ? t[0] * 3600 + t[1] * 60 + t[2] : t[0] * 60 + t[1];
        return sec <= 480;
      });
      if (candidate) {
        video = candidate;
        sentUrls.add(video.url);
      } else {
        attempts++;
      }
    }

    if (!video) return reply('😢 All suitable Sinhala songs already sent (no repeats left).');

    const caption = `🎧 *${video.title}*\n\n💆 Sinhala Slowed / Reverb Song 💫\n───────────────────────\nUse 🎧 for full vibe 💫\nPowered by *ZANTA-XMD BOT*`;

    await conn.sendMessage(jid, { image: { url: video.thumbnail }, caption });

    const mp3Url = await getDownloadLink(video.url);
    if (!mp3Url) return reply('⚠️ Could not fetch audio.');

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    await downloadFile(mp3Url, mp3Path);

    if (sendVoice) {
      const opusPath = path.join(__dirname, `${Date.now()}.opus`);
      await convertToOpus(mp3Path, opusPath);
      await conn.sendMessage(jid, {
        audio: fs.readFileSync(opusPath),
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
      });
      fs.unlinkSync(opusPath);
    } else {
      await conn.sendMessage(jid, {
        audio: fs.readFileSync(mp3Path),
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      });
    }

    fs.unlinkSync(mp3Path);
  } catch (e) {
    console.error('Error:', e);
    reply('⚠️ Error sending Sinhala song.');
  }
}

// 🎵 Auto MP3 mode (20min)
cmd({
  pattern: 'voice1',
  desc: 'Auto Sinhala slowed MP3 mode (no repeats)',
  category: 'music',
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply('🟡 Already running.');
  const jid = m.chat;
  reply('✅ Sinhala auto MP3 mode started (every 20min, no repeats) 🎵');

  const run = async () => {
    const style = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, style, false);
  };
  await run();
  autoSongInterval = setInterval(run, 20 * 60 * 1000);
});

// 🎙️ Auto Voice Note mode (30min)
cmd({
  pattern: 'music1',
  desc: 'Auto Sinhala slowed Voice Note mode (no repeats)',
  category: 'music',
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply('🟡 Already running.');
  const jid = m.chat;
  reply('✅ Sinhala auto Voice Note mode started (every 30min, no repeats) 🎙️');

  const run = async () => {
    const style = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, style, true);
  };
  await run();
  autoSongInterval = setInterval(run, 30 * 60 * 1000);
});

// 🛑 Stop auto mode
cmd({
  pattern: 'stop',
  desc: 'Stop Sinhala song auto mode',
  category: 'music',
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply('⛔ No auto mode running.');
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply('🛑 Sinhala song auto mode stopped.');
});