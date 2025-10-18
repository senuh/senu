const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

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

// 🧠 Main Song Sender
async function sendSinhalaSong(conn, targetJid, reply, query, asVoice = false, asMp3 = false) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => v.seconds <= 480);
    if (!video) return reply("😭 No suitable song found!");

    const caption = `🎵 *${video.title}*
    
👤 *Artist:* ${video.author.name}
🕒 *Duration:* ${video.timestamp}
👁 *Views:* ${video.views.toLocaleString()}
📅 *Uploaded:* ${video.ago}

> 💆‍♂️ *Mind Relaxing Sinhala Slowed Song* 💆❤‍🩹  
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  
🎧 Use Headphones for Best Experience  
⚙️ Powered by *VAJIRA-MD-X*`;

    // Show thumbnail + buttons
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

    if (asVoice || asMp3) {
      const waitMsg = await conn.sendMessage(targetJid, { text: "🎧 Downloading... Please wait" });

      const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
      const { data } = await axios.get(apiUrl);
      if (!data.status || !data.result?.download) {
        await conn.sendMessage(targetJid, { text: "⚠️ Failed to fetch download link." });
        return;
      }

      const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
      const opusPath = path.join(__dirname, `${Date.now()}.opus`);
      try {
        await downloadFile(data.result.download, mp3Path);
        if (asMp3) {
          await conn.sendMessage(targetJid, {
            audio: fs.readFileSync(mp3Path),
            mimetype: 'audio/mpeg',
            caption: `🎶 ${video.title}\n\nEnjoy your song 💫`
          });
        } else {
          await convertToOpus(mp3Path, opusPath);
          await conn.sendMessage(targetJid, {
            audio: fs.readFileSync(opusPath),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          });
        }
        await conn.sendMessage(targetJid, { text: "✅ Sent successfully!" });
      } finally {
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
        if (fs.existsSync(opusPath)) fs.unlinkSync(opusPath);
      }
    }

  } catch (err) {
    console.error(err);
    reply("❌ Something went wrong while processing the song.");
  }
}

// 🎵 .songpro – main command
cmd({
  pattern: "songpro",
  desc: "Sinhala slowed song downloader (Pro Edition)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/SR7HX7m/musicbot.jpg" },
      caption: `✨ *Welcome to Sinhala Song Downloader (Pro Edition)* ✨  

🎶 Relax and enjoy Sinhala slowed vibes 💫  
Select your preferred mode below 👇`,
      footer: "VAJIRA-MD-X 🎧",
      buttons: [
        { buttonId: ".songvoice sinhala slowed reverb song", buttonText: { displayText: "🎙 Song Voice" }, type: 1 },
        { buttonId: ".songmp3 sinhala slowed reverb song", buttonText: { displayText: "💾 Song MP3" }, type: 1 }
      ],
      headerType: 4
    });
    return;
  }
  await sendSinhalaSong(conn, m.chat, (msg) => conn.sendMessage(m.chat, { text: msg }), text);
});

// 🎙 Voice version
cmd({
  pattern: "songvoice",
  desc: "Send Sinhala slowed song as WhatsApp voice note",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("🎙 Please enter a song name!");
  await sendSinhalaSong(conn, m.chat, reply, text, true, false);
});

// 💾 MP3 version
cmd({
  pattern: "songmp3",
  desc: "Send Sinhala slowed song as MP3 file",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("💾 Please enter a song name!");
  await sendSinhalaSong(conn, m.chat, reply, text, false, true);
});