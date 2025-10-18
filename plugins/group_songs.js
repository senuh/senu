const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// ====== Global Variables ======
let playedSongs = {};
const OWNER_JID = "94760264995@s.whatsapp.net"; // <-- OWNER NUMBER

// ====== Helper Functions ======
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function convertToOpus(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec("libopus")
      .audioBitrate("64k")
      .format("opus")
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
}

// ====== Send Sinhala Song ======
async function sendSinhalaSong(conn, jid, reply, query, senderName) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => v.seconds <= 480);
    if (!video) return reply("😭 Suitable song not found.");

    if (!playedSongs[jid]) playedSongs[jid] = new Set();
    if (playedSongs[jid].has(video.videoId)) return sendSinhalaSong(conn, jid, reply, query, senderName);
    playedSongs[jid].add(video.videoId);
    if (playedSongs[jid].size > 20) playedSongs[jid].clear();

    const caption = `🎶 *${video.title}* 🎶
    
💆‍♂️ Mind Relaxing Sinhala Slowed Song  
🎧 Use headphones for best vibe  
⚡ Powered by ZANTA-XMD BOT`;

    const msg = await conn.sendMessage(jid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎵 Sinhala Song Menu",
      buttons: [
        { buttonId: `.good_${video.videoId}`, buttonText: { displayText: "🩷 හොඳයි" }, type: 1 },
        { buttonId: `.bad_${video.videoId}`, buttonText: { displayText: "💔 හොඳ නෑ" }, type: 1 },
        { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
      ],
      headerType: 4,
    });

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download)
      return reply("⚠️ Couldn't fetch mp3 link.");

    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const mp3Path = path.join(__dirname, `${unique}.mp3`);
    const opusPath = path.join(__dirname, `${unique}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    await conn.sendMessage(jid, {
      audio: fs.readFileSync(opusPath),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });

    try { fs.unlinkSync(mp3Path); } catch {}
    try { fs.unlinkSync(opusPath); } catch {}

  } catch (err) {
    console.error("Send error:", err);
    const ownerPhone = OWNER_JID.split('@')[0];
    const waLink = `https://wa.me/${ownerPhone}?text=${encodeURIComponent('Hi, I need help with the bot. Error: ' + (err.message || 'unknown'))}`;

    await conn.sendMessage(jid, {
      text: `😭 Something went wrong while sending the song.\n\n📞 Contact owner for help:\n${waLink}`,
      buttons: [
        { buttonId: ".retry", buttonText: { displayText: "🔁 Retry" }, type: 1 },
        { buttonId: ".contactowner", buttonText: { displayText: "📞 Contact Owner" }, type: 1 },
      ],
      headerType: 1,
    });
  }
}

// ====== Song Search Command ======
cmd({
  pattern: "song3",
  desc: "Search Sinhala slowed song manually",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  const senderName = m.pushName || "User";

  await conn.sendMessage(jid, {
    text: "🎵 *Enter Sinhala Song Name* 🎶\n\nExample: `.song3 adare`",
    footer: "🎧 Sinhala Music Mode",
  });
});

// ====== Handle Manual Query ======
cmd({
  pattern: "song3 (.+)",
  desc: "Search and play Sinhala slowed song",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { match, reply }) => {
  const query = match[1];
  const jid = m.chat;
  const senderName = m.pushName || "User";
  reply(`🎧 Loading *${query} slowed song* ...`);
  await sendSinhalaSong(conn, jid, reply, `${query} sinhala slowed song`, senderName);
});

// ====== Reaction Feedback Handler ======
cmd({
  pattern: "good_(.+)",
  dontAddCommandList: true,
}, async (conn, mek, m, { match }) => {
  const videoId = match[1];
  const user = m.pushName || "Unknown User";
  const sender = m.sender;
  const message = `💖 *Positive Feedback Received!*\n\n👤 From: ${user}\n📱 Number: ${sender}\n🎵 Reaction: 🩷 හොඳයි\n🎬 Video ID: ${videoId}`;

  await conn.sendMessage(OWNER_JID, { text: message });
  await conn.sendMessage(m.chat, { text: "🩷 ඔබගේ අදහස Owner වෙත යවා ඇත! 🙏" });
});

cmd({
  pattern: "bad_(.+)",
  dontAddCommandList: true,
}, async (conn, mek, m, { match }) => {
  const videoId = match[1];
  const user = m.pushName || "Unknown User";
  const sender = m.sender;
  const message = `💔 *Negative Feedback Received!*\n\n👤 From: ${user}\n📱 Number: ${sender}\n🎵 Reaction: 💔 හොඳ නෑ\n🎬 Video ID: ${videoId}`;

  await conn.sendMessage(OWNER_JID, { text: message });
  await conn.sendMessage(m.chat, { text: "💔 ඔබගේ අදහස Owner වෙත යවා ඇත! 🙏" });
});

// ====== Next Song ======
cmd({
  pattern: "nextsong",
  desc: "Play next random Sinhala slowed song",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const randomQueries = [
    "sinhala slowed reverb song",
    "sinhala love slowed song",
    "sinhala vibe slowed song",
    "sinhala sad slowed song",
    "sinhala mashup slowed reverb",
  ];
  const randomStyle = randomQueries[Math.floor(Math.random() * randomQueries.length)];
  reply("🎧 Loading next Sinhala slowed song...");
  await sendSinhalaSong(conn, m.chat, reply, randomStyle, m.pushName);
});