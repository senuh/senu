const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// ====== Global Variables ======
let autoSongIntervals = {}; // per-chat auto mode
let autoTrendInterval = null; // trending playlist updater
let playedSongs = {}; // prevent duplicate songs

// ====== Auto React Feature ======
let autoReactEnabled = true; // default ON
const reactEmoji = "🎧"; // emoji for auto react

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

// ====== Sinhala Song Sender ======
async function sendSinhalaSong(conn, jid, reply, query, m) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const t = v.timestamp.split(':').map(Number);
      const seconds = t.length === 3 ? t[0]*3600 + t[1]*60 + t[2] : t[0]*60 + t[1];
      return seconds <= 480;
    });
    if (!video) return reply("😭 No suitable song found.");

    // prevent duplicates
    if (!playedSongs[jid]) playedSongs[jid] = new Set();  
    if (playedSongs[jid].has(video.videoId)) return sendSinhalaSong(conn, jid, reply, query, m);  
    playedSongs[jid].add(video.videoId);  
    if (playedSongs[jid].size > 20) playedSongs[jid].clear();  

    const caption = `🎶 *${video.title}* 🎶

💆‍♂️ Mind Relaxing Sinhala Song
🎧 Use headphones for best vibe
⚡ Powered by ZANTA-XMD BOT`;

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

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;  
    const { data } = await axios.get(apiUrl);  

    if (!data.status || !data.result?.download) return reply("⚠️ Couldn't fetch mp3 link.");  

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

    // === Auto React ===
    if (autoReactEnabled && m?.key) {
      try {
        await conn.sendMessage(jid, { react: { text: reactEmoji, key: m.key } });
      } catch (e) {
        console.error("Auto react failed:", e);
      }
    }

    try { fs.unlinkSync(mp3Path); } catch {}  
    try { fs.unlinkSync(opusPath); } catch {}

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending the song.");
  }
}

// ====== Sinhala Voice Auto Mode ======
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs with buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;

  if (autoSongIntervals[jid]) return reply("🟡 Auto Sinhala mode already running!");

  await conn.sendMessage(jid, {
    text: "🎧 *Auto Sinhala Slowed Songs Activated!*\nYou'll get a new Sinhala slowed song every 20 minutes.\nUse the menu below to control playback 👇",
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
    await sendSinhalaSong(conn, jid, reply, randomStyle, m);
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
  await sendSinhalaSong(conn, jid, reply, randomStyle, m);
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
    text: "📀 Choose your Sinhala Slowed Vibe 🎧\nSelect a style below 👇",
    footer: "🎵 Sinhala Style Playlist Menu",
    buttons: [
      { buttonId: ".style love", buttonText: { displayText: "💞 Love Slowed" }, type: 1 },
      { buttonId: ".style sad", buttonText: { displayText: "😢 Sad Vibe" }, type: 1 },
      { buttonId: ".style mashup", buttonText: { displayText: "🎧 Mashup Reverb" }, type: 1 },
      { buttonId: ".style teledrama", buttonText: { displayText: "📺 Teledrama Song" }, type: 1 },
      { buttonId: ".style 2024", buttonText: { displayText: "⚡ 2024 Trend" }, type: 1 },
      { buttonId: ".trendinglist", buttonText: { displayText: "🔥 Trending Playlist" }, type: 1 },
      { buttonId: ".autoreact on", buttonText: { displayText: "⚙️ Auto React ON" }, type: 1 },
      { buttonId: ".autoreact off", buttonText: { displayText: "🛑 Auto React OFF" }, type: 1 },
    ],
    headerType: 4,
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
  const type = args.join(" ").toLowerCase() || "sinhala slowed song";
  reply(`🎵 Loading ${type}...`);
  await sendSinhalaSong(conn, jid, reply, type, m);
});

// ====== Auto React Toggle (Owner Only) ======
cmd({
  pattern: "autoreact",
  desc: "Enable or disable auto react for Sinhala songs (Owner only)",
  category: "owner",
  filename: __filename,
}, async (conn, mek, m, { reply, isCreator, args }) => {
  if (!isCreator) return reply("⚠️ Only the *Owner* can toggle auto react.");

  const choice = args[0]?.toLowerCase();
  if (!choice || !["on", "off"].includes(choice)) {
    return reply(`⚙️ *Auto React Status:* ${autoReactEnabled ? "✅ ON" : "❌ OFF"}\n\nUse:\n.autoreact on\n.autoreact off`);
  }

  autoReactEnabled = choice === "on";
  reply(`🎵 Auto React has been *${autoReactEnabled ? "Enabled ✅" : "Disabled ❌"}*`);
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
    const trending = search.videos.filter(v => v.seconds < 480).slice(0, 8);

    if (!trending.length) return reply("😔 No trending Sinhala songs found right now.");  

    let msg = "🔥 *Trending Sinhala Slowed/Reverb Songs* 🔥\n\n";  
    trending.forEach((v, i) => {  
      msg += `🎵 *${i + 1}. ${v.title}*\n📺 https://youtu.be/${v.videoId}\n\n`;  
    });  
    msg += "⚡ Choose one by copying the link or use `.style trend` to play a random trending one.";  

    await conn.sendMessage(jid, {  
      text: msg,  
      footer: "🎶 Auto-updated playlist (YouTube trending)",  
      buttons: [  
        { buttonId: ".style trend", buttonText: { displayText: "🎧 Play Trending Song" }, type: 1 },  
        { buttonId: ".clickhere", buttonText: { displayText: "📀 Back to Menu" }, type: 1 },  
      ],  
      headerType: 4,  
    });
  } catch (err) {
    console.error(err);
    reply("❌ Error while fetching trending list.");
  }
});