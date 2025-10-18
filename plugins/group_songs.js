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
const OWNER_JID = "94760264995@s.whatsapp.net"; // <-- replace with your number
let songIntervalMinutes = 10; // default 10 min
let targetMode = "groups"; // "groups" | "channels"

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

    if (autoReactEnabled) await conn.sendMessage(jid, { react: { text: "😍", key: msg.key } });

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
  desc: "Auto Sinhala slowed songs every X minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, isGroup, isChannel }) => {
  const jid = m.chat;

  // Target check
  if ((targetMode === "groups" && !isGroup) || (targetMode === "channels" && !isChannel)) {
    return reply(`⚠️ Auto Sinhala mode currently allowed only for *${targetMode}*.`);
  }

  if (autoSongIntervals[jid]) return reply("🟡 Auto Sinhala mode already running!");

  await conn.sendMessage(jid, {
    text: `🎧 *Auto Sinhala Slowed Songs Activated!*\nYou'll get a new Sinhala slowed song every ${songIntervalMinutes} minutes.\nUse the menu below to control playback 👇`,
    footer: "🎵 Sinhala Vibe Menu",
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

// ====== Next Song ======
cmd({
  pattern: "nextsong",
  desc: "Play next Sinhala slowed song immediately",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  reply("✅ *Loading next Sinhala slowed song...* 🎧");
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

// ====== 🎛 Music Settings ======
cmd({
  pattern: "clickhere",
  desc: "Open Sinhala slowed song settings menu",
  category: "music",
  filename: __filename,
}, async (conn, mek, m) => {
  const jid = m.chat;
  const text = `🎛 *Music Settings Panel* 🎶

Customize your Sinhala Slowed Song Experience 👇
⏱ Interval: ${songIntervalMinutes} minutes
🎯 Target Mode: ${targetMode === "groups" ? "Groups Only" : "Channels Only"}
💬 Auto React: ${autoReactEnabled ? "ON ✅" : "OFF ❌"}`;

  await conn.sendMessage(jid, {
    text,
    footer: "🎵 Sinhala Music Control Menu",
    buttons: [
      { buttonId: ".setinterval", buttonText: { displayText: "⏱ Set Interval" }, type: 1 },
      { buttonId: ".toggletarget", buttonText: { displayText: "🎯 Change Target (Group/Channel)" }, type: 1 },
      { buttonId: ".autoreact on", buttonText: { displayText: "⚙️ Auto React ON" }, type: 1 },
      { buttonId: ".autoreact off", buttonText: { displayText: "🛑 Auto React OFF" }, type: 1 },
    ],
    headerType: 4,
  });
});

// ====== Set Interval (Owner Only) ======
cmd({
  pattern: "setinterval",
  desc: "Change auto song interval (owner only)",
  category: "owner",
  filename: __filename,
}, async (conn, mek, m, { reply, args }) => {
  if (m.sender !== OWNER_JID) return reply("⚠️ Only owner can set interval.");
  const minutes = parseInt(args[0]);
  if (isNaN(minutes) || minutes < 1 || minutes > 120)
    return reply("⚙️ Use: `.setinterval 5` (1–120 minutes)");
  songIntervalMinutes = minutes;
  reply(`✅ Interval updated to *${minutes} minutes*.`);
});

// ====== Toggle Target Mode (Owner Only) ======
cmd({
  pattern: "toggletarget",
  desc: "Switch between group and channel mode (owner only)",
  category: "owner",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (m.sender !== OWNER_JID) return reply("⚠️ Only owner can use this.");
  targetMode = targetMode === "groups" ? "channels" : "groups";
  reply(`🎯 Auto songs now work only in *${targetMode.toUpperCase()}* mode.`);
});

// ====== Auto React Control ======
cmd({
  pattern: "autoreact",
  desc: "Turn Sinhala song auto-react ON/OFF (owner only)",
  category: "owner",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  if (m.sender !== OWNER_JID) return reply("⚠️ Only the bot owner can use this command.");
  const action = args[0]?.toLowerCase();
  if (action === "on") {
    autoReactEnabled = true;
    reply("✅ Auto React has been *enabled*.");
  } else if (action === "off") {
    autoReactEnabled = false;
    reply("🛑 Auto React has been *disabled*.");
  } else {
    reply("⚙️ Use: `.autoreact on` or `.autoreact off`");
  }
});

// ====== Manual Sinhala Song Search ======
cmd({
  pattern: "song3",
  desc: "Search Sinhala slowed song manually (interactive)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const jid = m.chat;
  const query = args.join(" ").trim();

  if (!query) {
    await conn.sendMessage(jid, {
      text: "🎶 *Enter a Sinhala Song Name!* 🎵\n\nExample:\n› .song3 adare\n› .song3 mal madahasa\n\nඔයාට පහසුවට නමක් තෝරන්න👇",
      footer: "🎵 Sinhala Music Menu",
      buttons: [
        { buttonId: ".song3 adare", buttonText: { displayText: "💖 Adare" }, type: 1 },
        { buttonId: ".song3 mal madahasa", buttonText: { displayText: "🌸 Mal Madahasa" }, type: 1 },
        { buttonId: ".song3 sanda", buttonText: { displayText: "🌕 Sanda" }, type: 1 },
        { buttonId: ".song3 suwanda", buttonText: { displayText: "🌼 Suwanda" }, type: 1 },
        { buttonId: ".song3 maage", buttonText: { displayText: "🎧 Maage Hithe" }, type: 1 },
      ],
      headerType: 4,
    });
    return;
  }

  const fullQuery = `${query} sinhala slowed reverb song`;
  reply(`🔍 Searching YouTube for *${query} slowed Sinhala song...* 🎧`);
  await sendSinhalaSong(conn, jid, reply, fullQuery);
});