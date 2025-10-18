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
let autoReactEnabled = true; // default ON
const OWNER_JID = "94760264995@s.whatsapp.net"; // <-- replace with your number

// Error tracking & retry system
let lastErrorReports = {};
let lastQueryPerChat = {};

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
    // store last query for retry support
    lastQueryPerChat[jid] = query;

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

    // ✅ Auto react to bot's own message only
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

    try { fs.unlinkSync(mp3Path); } catch {}
    try { fs.unlinkSync(opusPath); } catch {}

  } catch (err) {
    console.error("Send error:", err);

    // Save error for retry & reporting
    lastErrorReports[jid] = {
      error: (err && err.message) ? err.message : String(err),
      query: lastQueryPerChat[jid] || null,
      time: new Date().toISOString(),
      from: jid
    };

    const ownerPhone = OWNER_JID.split('@')[0];
    const waLink = `https://wa.me/${ownerPhone}?text=${encodeURIComponent('Hi, I need help with the bot. Error: ' + (lastErrorReports[jid].error || 'unknown'))}`;

    const buttons = [
      { buttonId: ".contactowner", buttonText: { displayText: "📞 Contact Owner" }, type: 1 },
      { buttonId: ".retry", buttonText: { displayText: "🔁 Retry" }, type: 1 },
      { buttonId: ".reportlog", buttonText: { displayText: "🧾 Show Error" }, type: 1 },
    ];

    await conn.sendMessage(jid, {
      text: `😭 *Something went wrong while sending the song.*

Don't worry — you can ask the owner for help or try again.

📞 Contact directly: ${waLink}`,
      footer: "If you contact owner, please include chat id & song name.",
      buttons,
      headerType: 1,
    });
  }
}

// ====== Sinhala Auto Mode ======
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs every 10 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (autoSongIntervals[jid]) return reply("🟡 Auto Sinhala mode already running!");

  await conn.sendMessage(jid, {
    text: "🎧 *Auto Sinhala Slowed Songs Activated!*\nYou'll get a new Sinhala slowed song every 10 minutes.\nUse the menu below to control playback 👇",
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
  autoSongIntervals[jid] = setInterval(sendRandom, 10 * 60 * 1000);
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
  await conn.sendMessage(jid, {
    text: "🎛 *Music Settings Panel* 🎶\n\nCustomize your Sinhala Slowed Song Experience 👇",
    footer: "🎵 Sinhala Music Control Menu",
    buttons: [
      { buttonId: ".autoreact on", buttonText: { displayText: "⚙️ Auto React ON" }, type: 1 },
      { buttonId: ".autoreact off", buttonText: { displayText: "🛑 Auto React OFF" }, type: 1 },
    ],
    headerType: 4,
  });
});

// ====== Dynamic Sinhala Song Search (.song3) ======
cmd({
  pattern: "song3",
  desc: "Search Sinhala slowed song manually or show trending buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const jid = m.chat;
  const query = args.join(" ").trim();

  // If user typed name manually
  if (query) {
    const fullQuery = `${query} sinhala slowed reverb song`;
    reply(`🔍 Searching YouTube for *${query} slowed Sinhala song...* 🎧`);
    await sendSinhalaSong(conn, jid, reply, fullQuery);
    return;
  }

  // Auto trending list
  try {
    const { videos } = await yts("sinhala slowed reverb song");
    if (!videos || videos.length === 0) return reply("⚠️ No Sinhala slowed songs found.");

    const top5 = videos.slice(0, 5);
    const buttons = top5.map(v => ({
      buttonId: `.song3 ${v.title}`,
      buttonText: { displayText: `🎵 ${v.title.slice(0, 25)}...` },
      type: 1,
    }));

    await conn.sendMessage(jid, {
      text: `🎧 *Trending Sinhala Slowed Songs* 🎶\n\nඔයාට කැමති එකක් තෝරන්න 👇`,
      footer: "⚡ Powered by ZANTA-XMD BOT",
      buttons,
      headerType: 4,
    });
  } catch (err) {
    console.error(err);
    reply("❌ Error fetching trending Sinhala songs.");
  }
});

// ====== Owner-Only Auto React Toggle ======
cmd({
  pattern: "autoreact",
  desc: "Turn Sinhala song auto-react ON or OFF (owner only)",
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

// ===== Contact Owner & Retry Buttons =====
cmd({
  pattern: "contactowner",
  desc: "Report error to owner",
  category: "support",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  const info = lastErrorReports[jid];
  if (!info) return reply("⚠️ No recent error recorded.");

  const ownerMsg = `🚨 *Error Report*\nChat: ${jid}\nFrom: ${m.sender}\nTime: ${info.time}\nQuery: ${info.query}\nError: ${info.error}`;
  await conn.sendMessage(OWNER_JID, { text: ownerMsg });
  const waLink = `https://wa.me/${OWNER_JID.split('@')[0]}?text=Hi, I need help with your bot.`;
  reply(`✅ Report sent to the owner.\nYou can also message directly: ${waLink}`);
});

cmd({
  pattern: "retry",
  desc: "Retry last song request",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  const lastQ = lastQueryPerChat[jid];
  if (!lastQ) return reply("⚠️ No last song found to retry.");
  reply("🔁 Retrying your last song...");
  await sendSinhalaSong(conn, jid, reply, lastQ);
});

cmd({
  pattern: "reportlog",
  desc: "Show last error details",
  category: "support",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  const info = lastErrorReports[jid];
  if (!info) return reply("✅ No recent error logs.");
  reply(`📝 *Last Error Log:*\nTime: ${info.time}\nQuery: ${info.query}\nError: ${info.error}`);
});