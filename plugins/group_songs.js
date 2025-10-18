const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// ====== Global Variables ======
let autoSongIntervals = {};
let autoTrendInterval = null;
let playedSongs = {};

// ====== Sinhala Song Styles ======
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

// ====== Main Song Sender ======
async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    const search = await yts(`${query} sinhala slowed reverb`);
    const video = search.videos.find(v => {
      const lower = v.title.toLowerCase();
      const isSinhala = lower.includes("sinhala") || lower.includes("සිංහල");
      const isSlowed = lower.includes("slowed") || lower.includes("reverb");
      return isSinhala && isSlowed && v.seconds < 480;
    });

    if (!video) return reply("😔 Sinhala slowed song එකක් හමු නොවුණා.");

    if (!playedSongs[jid]) playedSongs[jid] = new Set();
    if (playedSongs[jid].has(video.videoId)) return sendSinhalaSong(conn, jid, reply, query);
    playedSongs[jid].add(video.videoId);
    if (playedSongs[jid].size > 20) playedSongs[jid].clear();

    const caption = `🎶 *${video.title}* 🎶

💆‍♂️ Mind Relaxing Sinhala Slowed Song  
🎧 Use headphones for best vibe  
⚡ Powered by *ZANTA-XMD BOT*`;

    await conn.sendMessage(jid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎵 Sinhala Vibe Menu",
      buttons: [
        { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
        { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
        { buttonId: ".clickhere", buttonText: { displayText: "📀 Click Here Menu" }, type: 1 },
      ],
      headerType: 4,
    });

    reply("🎧 Downloading Sinhala slowed song... ⏳");

    // === Sinhala MP3 Downloader API ===
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download)
      return reply("⚠️ Couldn't fetch mp3 link from API.");

    const downloadUrl = data.result.download;

    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const mp3Path = path.join(__dirname, `${unique}.mp3`);
    const opusPath = path.join(__dirname, `${unique}.opus`);

    await downloadFile(downloadUrl, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    await conn.sendMessage(jid, {
      audio: fs.readFileSync(opusPath),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Song එක ගන්න error එකක් ආවා. Try again!");
  }
}

// ====== Auto Sinhala Slowed Mode ======
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;

  if (autoSongIntervals[jid]) return reply("🟡 Already running auto Sinhala songs!");

  await conn.sendMessage(jid, {
    text: `🎧 *Auto Sinhala Slowed Songs Activated!*  
You'll get a new Sinhala slowed song every 20 minutes.  
Use buttons below 👇`,
    footer: "🎵 Sinhala Vibe Menu",
    buttons: [
      { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
      { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      { buttonId: ".clickhere", buttonText: { displayText: "📀 Click Here Menu" }, type: 1 },
    ],
    headerType: 4,
  });

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, randomStyle);
  };

  await sendRandom();
  autoSongIntervals[jid] = setInterval(sendRandom, 20 * 60 * 1000);
});

// ====== Manual Commands ======
cmd({
  pattern: "nextsong",
  desc: "Play next Sinhala slowed song",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  reply("🎵 Loading next Sinhala slowed song...");
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  await sendSinhalaSong(conn, jid, reply, randomStyle);
});

cmd({
  pattern: "stop3",
  desc: "Stop auto Sinhala mode",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!autoSongIntervals[jid]) return reply("⚠️ Auto mode not running.");
  clearInterval(autoSongIntervals[jid]);
  delete autoSongIntervals[jid];
  reply("🛑 Auto Sinhala slowed songs stopped.");
});

// ====== Menu ======
cmd({
  pattern: "clickhere",
  desc: "Sinhala style menu",
  category: "music",
  filename: __filename,
}, async (conn, mek, m) => {
  const jid = m.chat;
  await conn.sendMessage(jid, {
    text: "📀 *Choose your Sinhala Slowed Vibe* 🎧\nSelect below 👇",
    footer: "🎵 Sinhala Style Playlist Menu",
    buttons: [
      { buttonId: ".style love", buttonText: { displayText: "💞 Love Slowed" }, type: 1 },
      { buttonId: ".style sad", buttonText: { displayText: "😢 Sad Vibe" }, type: 1 },
      { buttonId: ".style mashup", buttonText: { displayText: "🎧 Mashup Reverb" }, type: 1 },
      { buttonId: ".style teledrama", buttonText: { displayText: "📺 Teledrama Song" }, type: 1 },
      { buttonId: ".style 2024", buttonText: { displayText: "⚡ 2024 Trend" }, type: 1 },
      { buttonId: ".trendinglist", buttonText: { displayText: "🔥 Trending Playlist" }, type: 1 },
    ],
    headerType: 4,
  });
});

cmd({
  pattern: "style",
  desc: "Play Sinhala slowed song by style",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const jid = m.chat;
  const type = args.join(" ").toLowerCase() || "sinhala slowed reverb song";
  reply(`🎧 Loading ${type}...`);
  await sendSinhalaSong(conn, jid, reply, type);
});