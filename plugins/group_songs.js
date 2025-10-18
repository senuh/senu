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
let playedSongs = {};
let autoReactEnabled = true;
let songIntervalMinutes = 10; // default interval
let sendMode = "both"; // "groups" | "channels" | "both"
const OWNER_JID = "94760264995@s.whatsapp.net";

// Load saved settings if exist
const settingsFile = path.join(__dirname, 'interval.json');
if (fs.existsSync(settingsFile)) {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsFile));
    songIntervalMinutes = saved.interval || 10;
    sendMode = saved.sendMode || "both";
  } catch {}
}

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
async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => v.seconds <= 480);
    if (!video) return reply("😭 No suitable song found.");

    if (!playedSongs[jid]) playedSongs[jid] = new Set();
    if (playedSongs[jid].has(video.videoId)) return sendSinhalaSong(conn, jid, reply, query);
    playedSongs[jid].add(video.videoId);
    if (playedSongs[jid].size > 20) playedSongs[jid].clear();

    const caption = `🎶 *${video.title}* 🎶

💆‍♂️ Mind Relaxing Sinhala Song
🎧 Use headphones for best vibe
⚡ Powered by ZANTA-XMD BOT`;

    // ====== Send target type handling ======
    if (sendMode === "channels" && !jid.includes("@newsletter")) {
      return; // Skip non-channels
    } else if (sendMode === "groups" && jid.includes("@newsletter")) {
      return; // Skip channels
    }

    const msg = await conn.sendMessage(jid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎵 Sinhala Vibe Menu",
      buttons: [
        { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
        { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
        { buttonId: ".clickhere", buttonText: { displayText: "🎛 Music Settings" }, type: 1 },
      ],
      headerType: 4,
    });

    if (autoReactEnabled) {
      await conn.sendMessage(jid, { react: { text: "😍", key: msg.key } });
    }

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

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);
  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending the song.");
  }
}

// ====== Sinhala Auto Mode ======
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs with custom interval",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (autoSongIntervals[jid]) return reply("🟡 Auto Sinhala mode already running!");

  await conn.sendMessage(jid, {
    text: `🎧 *Auto Sinhala Songs Activated!*\n⏱ Every *${songIntervalMinutes} minutes*\n📡 Send Mode: *${sendMode.toUpperCase()}*`,
    footer: "🎵 Sinhala Control Menu",
    buttons: [
      { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
      { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      { buttonId: ".clickhere", buttonText: { displayText: "🎛 Music Settings" }, type: 1 },
    ],
    headerType: 4,
  });

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, randomStyle);
  };

  await sendRandom();
  autoSongIntervals[jid] = setInterval(sendRandom, songIntervalMinutes * 60 * 1000);
});

// ====== Stop Auto Sinhala ======
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
  reply("🛑 Auto Sinhala songs stopped.");
});

// ====== Music Settings Menu ======
cmd({
  pattern: "clickhere",
  desc: "Open Sinhala music settings",
  category: "music",
  filename: __filename,
}, async (conn, mek, m) => {
  const jid = m.chat;
  await conn.sendMessage(jid, {
    text: `🎛 *Music Settings Panel* 🎶
    
🕒 Interval: *${songIntervalMinutes} min*
💬 Auto React: *${autoReactEnabled ? "ON" : "OFF"}*
📡 Send Mode: *${sendMode.toUpperCase()}*`,
    footer: "🎵 Sinhala Music Control",
    buttons: [
      { buttonId: ".intervalmenu", buttonText: { displayText: "⏱ Change Interval" }, type: 1 },
      { buttonId: ".sendmode", buttonText: { displayText: "📡 Send Mode" }, type: 1 },
      { buttonId: ".autoreact on", buttonText: { displayText: "⚙️ Auto React ON" }, type: 1 },
      { buttonId: ".autoreact off", buttonText: { displayText: "🛑 Auto React OFF" }, type: 1 },
    ],
    headerType: 4,
  });
});

// ====== Interval Change ======
cmd({
  pattern: "intervalmenu",
  desc: "Select auto-song interval",
  category: "owner",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (m.sender !== OWNER_JID) return reply("⚠️ Only owner can change interval.");
  const jid = m.chat;
  await conn.sendMessage(jid, {
    text: "⏱ Select song interval time:",
    footer: "🎵 Sinhala Interval Menu",
    buttons: [
      { buttonId: ".interval 5", buttonText: { displayText: "5 Minutes" }, type: 1 },
      { buttonId: ".interval 10", buttonText: { displayText: "10 Minutes" }, type: 1 },
      { buttonId: ".interval 15", buttonText: { displayText: "15 Minutes" }, type: 1 },
      { buttonId: ".interval 20", buttonText: { displayText: "20 Minutes" }, type: 1 },
    ],
    headerType: 4,
  });
});

cmd({
  pattern: "interval",
  desc: "Set auto song interval (owner only)",
  category: "owner",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  if (m.sender !== OWNER_JID) return reply("⚠️ Owner only.");
  const minutes = parseInt(args[0]);
  if (!minutes || minutes < 1 || minutes > 60) return reply("⏱ Enter valid number (1-60)");
  songIntervalMinutes = minutes;
  fs.writeFileSync(settingsFile, JSON.stringify({ interval: songIntervalMinutes, sendMode }));
  reply(`✅ Interval set to *${songIntervalMinutes} minutes*`);
});

// ====== Send Mode Control ======
cmd({
  pattern: "sendmode",
  desc: "Select where auto songs send (owner only)",
  category: "owner",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (m.sender !== OWNER_JID) return reply("⚠️ Owner only.");
  const jid = m.chat;
  await conn.sendMessage(jid, {
    text: "📡 *Select Send Mode*\n\nChoose where Sinhala songs should auto-send 👇",
    footer: "🎵 Sinhala Send Mode Menu",
    buttons: [
      { buttonId: ".setmode groups", buttonText: { displayText: "👥 Groups Only" }, type: 1 },
      { buttonId: ".setmode channels", buttonText: { displayText: "📢 Channels Only" }, type: 1 },
      { buttonId: ".setmode both", buttonText: { displayText: "🌐 Both" }, type: 1 },
    ],
    headerType: 4,
  });
});

cmd({
  pattern: "setmode",
  desc: "Set send mode",
  category: "owner",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  if (m.sender !== OWNER_JID) return reply("⚠️ Owner only.");
  const mode = args[0]?.toLowerCase();
  if (!["groups", "channels", "both"].includes(mode)) return reply("❌ Invalid mode. Use groups/channels/both");
  sendMode = mode;
  fs.writeFileSync(settingsFile, JSON.stringify({ interval: songIntervalMinutes, sendMode }));
  reply(`✅ Send Mode set to *${sendMode.toUpperCase()}*`);
});