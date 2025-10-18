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

// ====== Main Sinhala Song Function ======
async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    const search = await yts(`${query} sinhala slowed reverb`);
    if (!search.videos || !search.videos.length)
      return reply("😔 Sinhala slowed song එකක් හමු නොවුණා.");

    const video = search.videos.find(v => {
      const lower = v.title.toLowerCase();
      const isSinhala = lower.includes("sinhala") || lower.includes("සිංහල");
      const isSlowed = lower.includes("slowed") || lower.includes("reverb");
      const seconds = v.seconds || 0;
      return isSinhala && isSlowed && seconds <= 480;
    });

    if (!video) return reply("😔 Sinhala slowed song එකක් හමු නොවුණා.");

    // prevent duplicates
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
      buttons: [
        { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" } },
        { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" } },
        { buttonId: ".clickhere", buttonText: { displayText: "📀 Click Here Menu" } },
      ],
      footer: "🎵 Sinhala Vibe Menu"
    });

    // ====== UPDATED YouTube Download API ======
    const apiUrl = `https://api.akuarik.repl.co/api/ytdl?url=${encodeURIComponent(video.url)}&type=audio`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result || !data.result.audio)
      return reply("⚠️ Couldn't fetch mp3 link from YouTube. Try again later.");

    const downloadUrl = data.result.audio;
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const mp3Path = path.join(__dirname, `${unique}.mp3`);
    const opusPath = path.join(__dirname, `${unique}.opus`);

    reply("🎧 Downloading Sinhala slowed song... ⏳");
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
    reply("😭 Song එක ගන්න ගිහිල්ලා error එකක් ආවා.");
  }
}

// ====== Auto Sinhala Slowed Mode ======
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs with buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (autoSongIntervals[jid]) return reply("🟡 Auto Sinhala mode already running!");

  await conn.sendMessage(jid, {
    text: `🎧 *Auto Sinhala Slowed Songs Activated!*  
You'll get a new Sinhala slowed song every 20 minutes.  
Use the menu below to control playback 👇`,
    buttons: [
      { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" } },
      { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" } },
      { buttonId: ".clickhere", buttonText: { displayText: "📀 Click Here Menu" } },
    ],
    footer: "🎵 Sinhala Vibe Menu"
  });

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, randomStyle);
  };

  await sendRandom();
  autoSongIntervals[jid] = setInterval(sendRandom, 20 * 60 * 1000);
});

// ====== Next Song ======
cmd({
  pattern: "nextsong",
  desc: "Play next Sinhala slowed song immediately",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  reply("✅ Loading next Sinhala slowed song...");
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  await sendSinhalaSong(conn, jid, reply, randomStyle);
});

// ====== Stop Auto Sinhala ======
cmd({
  pattern: "stop3",
  desc: "Stop automatic Sinhala slowed songs",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!autoSongIntervals[jid]) return reply("⚠️ Auto mode not running.");
  clearInterval(autoSongIntervals[jid]);
  delete autoSongIntervals[jid];
  reply("🛑 Auto Sinhala slowed songs stopped.");
});

// ====== Click Here Menu ======
cmd({
  pattern: "clickhere",
  desc: "Open Sinhala slowed song playlist menu",
  category: "music",
  filename: __filename,
}, async (conn, mek, m) => {
  const jid = m.chat;
  await conn.sendMessage(jid, {
    text: "📀 *Choose your Sinhala Slowed Vibe* 🎧\nSelect a style below 👇",
    buttons: [
      { buttonId: ".style love", buttonText: { displayText: "💞 Love Slowed" } },
      { buttonId: ".style sad", buttonText: { displayText: "😢 Sad Vibe" } },
      { buttonId: ".style mashup", buttonText: { displayText: "🎧 Mashup Reverb" } },
      { buttonId: ".style teledrama", buttonText: { displayText: "📺 Teledrama Song" } },
      { buttonId: ".style 2024", buttonText: { displayText: "⚡ 2024 Trend" } },
      { buttonId: ".trendinglist", buttonText: { displayText: "🔥 Trending Playlist" } },
    ],
    footer: "🎵 Sinhala Style Playlist Menu"
  });
});

// ====== Style Command ======
cmd({
  pattern: "style",
  desc: "Play Sinhala slowed song by style",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const jid = m.chat;
  const type = args.join(" ").toLowerCase() || "sinhala slowed reverb song";
  reply(`🎵 Loading ${type}...`);
  await sendSinhalaSong(conn, jid, reply, type);
});

// ====== Trending Playlist ======
cmd({
  pattern: "trendinglist",
  desc: "Show trending Sinhala slowed/reverb songs",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  reply("📡 Fetching latest trending Sinhala slowed songs...");

  try {
    const search = await yts("sinhala slowed reverb song");
    const trending = search.videos
      .filter(v => {
        const lower = v.title.toLowerCase();
        return (lower.includes("sinhala") || lower.includes("සිංහල")) &&
               (lower.includes("slowed") || lower.includes("reverb")) &&
               v.seconds < 480;
      })
      .slice(0, 8);

    if (!trending.length) return reply("😔 No Sinhala slowed trending songs found.");

    let msg = "🔥 *Trending Sinhala Slowed/Reverb Songs* 🔥\n\n";
    trending.forEach((v, i) => {
      msg += `🎵 *${i + 1}. ${v.title}*\n📺 https://youtu.be/${v.videoId}\n\n`;
    });
    msg += "⚡ Use `.style trend` to play a random trending one.";

    await conn.sendMessage(jid, {
      text: msg,
      buttons: [
        { buttonId: ".style trend", buttonText: { displayText: "🎧 Play Trending Song" } },
        { buttonId: ".clickhere", buttonText: { displayText: "📀 Back to Menu" } },
      ],
      footer: "🎶 Sinhala Trending Playlist"
    });
  } catch (err) {
    console.error(err);
    reply("❌ Error while fetching Sinhala trending songs.");
  }
});