const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

let autoSongInterval = null;
const sentUrls = new Set();
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

async function getDownloadLinks(url) {
  try {
    // primary api
    const api = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(url)}&apikey=sadiya`;
    const { data } = await axios.get(api);
    const mp3 = data?.result?.audio || data?.result?.download;
    const mp4 = data?.result?.video || data?.result?.download;
    if (mp3 && mp4) return { mp3, mp4 };

    // fallback api
    const alt = await axios.get(`https://api.ryzendesu.com/api/yt?url=${encodeURIComponent(url)}`);
    return {
      mp3: alt.data?.result?.audio?.url,
      mp4: alt.data?.result?.video?.url,
    };
  } catch {
    return {};
  }
}

async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      if (sentUrls.has(v.url)) return false;
      const t = v.timestamp.split(':').map(Number);
      const sec = t.length === 3 ? t[0] * 3600 + t[1] * 60 + t[2] : t[0] * 60 + t[1];
      return sec <= 480;
    });
    if (!video) return reply('😢 No suitable Sinhala slowed song found.');

    sentUrls.add(video.url);

    const caption = `🎧 *${video.title}*\n\n💆 Sinhala Slowed / Reverb Song 💫\n───────────────────────\nUse 🎧 for full vibe 💫\nPowered by *ZANTA-XMD BOT*`;

    await conn.sendMessage(jid, { image: { url: video.thumbnail }, caption });

    const { mp3, mp4 } = await getDownloadLinks(video.url);
    if (!mp3) return reply('⚠️ Could not fetch audio.');

    // download + convert voice
    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);
    await downloadFile(mp3, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    await conn.sendMessage(jid, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    if (mp4) {
      await conn.sendMessage(jid, {
        video: { url: mp4 },
        caption: `🎬 *${video.title}* | Sinhala slowed video 💫`,
      });
    }

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);
  } catch (e) {
    console.error('Error:', e);
    reply('⚠️ Error sending Sinhala song.');
  }
}

// manual
cmd({
  pattern: 'song',
  desc: 'Send Sinhala slowed song (voice + video)',
  category: 'music',
  filename: __filename,
}, async (conn, mek, m, { reply, args }) => {
  const q = args.join(' ');
  if (!q) return reply('💬 Type a song name. Example: *.song pahasara*');
  await sendSinhalaSong(conn, m.chat, reply, q + ' sinhala slowed reverb');
});

// auto every 20min
cmd({
  pattern: 'voice1',
  desc: 'Auto Sinhala slowed (voice + video) every 20min',
  category: 'music',
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply('🟡 Already running.');
  const jid = m.chat;
  reply('✅ Sinhala auto voice mode started (every 20min) 🎧🎬');

  const run = async () => {
    const style = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, style);
  };
  await run();
  autoSongInterval = setInterval(run, 20 * 60 * 1000);
});

// auto every 30min
cmd({
  pattern: 'music1',
  desc: 'Auto Sinhala slowed (voice + video) every 30min',
  category: 'music',
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply('🟡 Already running.');
  const jid = m.chat;
  reply('✅ Sinhala auto music mode started (every 30min) 🎧🎬');

  const run = async () => {
    const style = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, style);
  };
  await run();
  autoSongInterval = setInterval(run, 30 * 60 * 1000);
});

// stop
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