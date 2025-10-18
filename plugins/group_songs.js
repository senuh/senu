const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

let autoSongInterval = null;

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

// 🧩 Convert mp3 → opus (voice note)
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

// 🧩 Create circular video note clip
async function createCircularVideo(thumbnailUrl, audioPath, outputPath) {
  const thumbPath = path.join(__dirname, 'thumb.jpg');
  const thumbRes = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data, 'binary'));

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(thumbPath)
      .loop(4)
      .input(audioPath)
      .complexFilter([
        'scale=480:480,format=rgba',
        'crop=480:480',
        'format=yuv420p',
      ])
      .outputOptions([
        '-t', '4',
        '-vf', 'scale=480:480:force_original_aspect_ratio=increase,crop=480:480',
      ])
      .videoCodec('libx264')
      .audioCodec('aac')
      .save(outputPath)
      .on('end', () => {
        fs.unlinkSync(thumbPath);
        resolve();
      })
      .on('error', reject);
  });
}

// 🧠 Main function
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const time = v.timestamp.split(':').map(Number);
      const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
      return seconds <= 480;
    });

    if (!video) return reply("😭 No suitable song found.");

    const caption = `*"${video.title}"*

> 💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ʙᴇꜱᴛ ꜱᴏɴɢ 💆❤‍🩹
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
00:00 ───●────────── ${video.timestamp}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
> 🎧 Use Headphones for best experience!
> ⚙️ Powered by Zanta-XMD Bot`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
    });

    // 🧩 Download MP3
    const apiUrl = `https://api-v2.ytjar.info/api/download?url=${encodeURIComponent(video.url)}&format=mp3`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.data?.audio?.url)
      return reply("⚠️ Couldn't fetch mp3 link.");

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);
    const vidPath = path.join(__dirname, `${Date.now()}.mp4`);
    const mp3Url = data.data.audio.url;

    await downloadFile(mp3Url, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    // 🌀 Create circular-style video
    await createCircularVideo(video.thumbnail, mp3Path, vidPath);

    // 🎙️ Send voice note
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    // 📁 Send MP3
    await conn.sendMessage(targetJid, {
      document: fs.readFileSync(mp3Path),
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
    });

    // 🌀 Send circular video note
    await conn.sendMessage(targetJid, {
      video: fs.readFileSync(vidPath),
      mimetype: 'video/mp4',
      ptt: true,
      viewOnce: true,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);
    fs.unlinkSync(vidPath);

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending the song.");
  }
}

// 🎶 .sinhalavoice
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs as voice + circular video note",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");
  const targetJid = m.chat;
  reply("✅ Auto Sinhala slowed songs (🎙️ + 🌀 circular video) started — every 20 minutes.");

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, targetJid, reply, randomStyle);
  };

  await sendRandom();
  autoSongInterval = setInterval(sendRandom, 20 * 60 * 1000);
});

// ⛔ .stop3
cmd({
  pattern: "stop3",
  desc: "Stop auto Sinhala slowed song sending",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⛔ Auto mode is not running.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply("🛑 Auto Sinhala slowed song sending stopped.");
});