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
  "sinhala boot slowed reverb song",
  "sinhala mashup slowed song",
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

async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      if (sentUrls.has(v.url)) return false;
      const t = v.timestamp.split(':').map(Number);
      const sec = t.length === 3 ? t[0] * 3600 + t[1] * 60 + t[2] : t[0] * 60 + t[1];
      return sec <= 480; // under 8min
    });
    if (!video) return reply('😢 No suitable Sinhala slowed song found.');

    sentUrls.add(video.url);

    const caption = `*"${video.title}"*

> *💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ʙᴇꜱᴛ ꜱᴏɴɢ 💆❤‍🩹*
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
         00:00 ───●──────────${video.timestamp}    
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
> ❑ ᴜꜱᴇ ʜᴇᴀᴅᴘʜᴏɴᴇꜱ ꜰᴏʀ ʙᴇꜱᴛ ᴇxᴘᴇʀɪᴇɴᴄᴇ..🙇‍♂️🎧"🫀
> ❑ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɴᴛᴀ-xᴍᴅ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ
> ❑ ᴢᴀɴᴛᴀ-xᴍᴅ ᴏᴡɴᴇʀ - +94760264995

                               ♡          ⎙          ➦ 
                            ʳᵉᵃᶜᵗ       ˢᵃᵛᵉ       ˢʰᵃʳᵉ`;

    await conn.sendMessage(jid, { image: { url: video.thumbnail }, caption });

    // 🔹 Get mp3 link
    const api = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(api);
    if (!data.status || !data.result?.download) return reply('⚠️ Mp3 link not found.');

    const mp3 = path.join(__dirname, `${Date.now()}.mp3`);
    const opus = path.join(__dirname, `${Date.now()}.opus`);
    await downloadFile(data.result.download, mp3);
    await convertToOpus(mp3, opus);

    // 🎙️ Send as voice
    await conn.sendMessage(jid, {
      audio: fs.readFileSync(opus),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    // 🎬 Send video version
    const videoApi = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp4&apikey=sadiya`;
    const { data: vid } = await axios.get(videoApi);
    if (vid.status && vid.result?.download) {
      await conn.sendMessage(jid, {
        video: { url: vid.result.download },
        caption: `🎬 *${video.title}* | Sinhala Slowed Video 💫`,
      });
    }

    fs.unlinkSync(mp3);
    fs.unlinkSync(opus);
  } catch (e) {
    console.error('Error sending Sinhala song:', e);
    reply('⚠️ Something went wrong.');
  }
}

// 🎵 Manual command
cmd({
  pattern: 'song',
  desc: 'Send Sinhala slowed song (voice + video)',
  category: 'download',
  filename: __filename,
}, async (conn, mek, m, { reply, args }) => {
  const q = args.join(' ');
  if (!q) return reply('💬 Type a song name. Example: *.song pahasara*');
  await sendSinhalaSong(conn, m.chat, reply, q + ' sinhala slowed reverb');
});

// 🎧 Auto mode every 20min (voice1)
cmd({
  pattern: 'voice1',
  desc: 'Auto Sinhala slowed song (voice + video) every 20min',
  category: 'download',
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply('🟡 Already running.');
  const jid = m.chat;
  reply('✅ Sinhala auto voice mode started (every 20min) 🎧🎬');

  const playRandom = async () => {
    const style = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, style);
  };

  await playRandom();
  autoSongInterval = setInterval(playRandom, 1 * 60 * 1000);
});

// 🎵 Auto mode every 30min (music1)
cmd({
  pattern: 'music1',
  desc: 'Auto Sinhala slowed song (voice + video) every 30min',
  category: 'download',
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply('🟡 Already running.');
  const jid = m.chat;
  reply('✅ Sinhala auto music mode started (every 30min) 🎧🎬');

  const playRandom = async () => {
    const style = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, style);
  };

  await playRandom();
  autoSongInterval = setInterval(playRandom, 1 * 60 * 1000);
});

// 🛑 Stop
cmd({
  pattern: 'stop',
  desc: 'Stop Sinhala song auto mode',
  category: 'download',
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply('⛔ No auto mode running.');
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply('🛑 Sinhala song auto mode stopped.');
});