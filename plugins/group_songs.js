//═══════════════════════════════════════════════════════════════════════════════
//        🎵 Sinhala Auto Music Bot - Full Complete Version (All Buttons)
//═══════════════════════════════════════════════════════════════════════════════

const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

//================= GLOBALS =================
let autoSongIntervals = {};
let groupIntervals = {}; 
let playedSongs = {};
let autoReact = {};
const OWNER_JID = "94760264995@s.whatsapp.net";

const styles = [
  "sinhala slowed reverb song",
  "sinhala love slowed song",
  "sinhala vibe slowed song",
  "sinhala sad slowed song",
  "sinhala 2024 slowed song",
  "sinhala mashup slowed reverb",
];

//================= HELPERS =================
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

//================= MAIN SONG FUNCTION =================
async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => v.seconds <= 480);
    if (!video) return reply("😭 සුදුසු සින්දුවක් හමු නොවුණා.");

    if (!playedSongs[jid]) playedSongs[jid] = new Set();
    if (playedSongs[jid].has(video.videoId)) return sendSinhalaSong(conn, jid, reply, query);
    playedSongs[jid].add(video.videoId);
    if (playedSongs[jid].size > 20) playedSongs[jid].clear();

    const caption = `🎶 *${video.title}* 🎶

💆‍♂️ සිංහල Mind Relaxing Song  
🎧 හොඳ vibe එකක් දැනගන්න Headphones එකක් අනිවාර්යයි!  
⚡ Powered by ZANTA-XMD BOT`;

    await conn.sendMessage(jid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎵 Sinhala Vibe Menu",
      buttons: [
        { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
        { buttonId: ".groupsong", buttonText: { displayText: "👥 Group Auto Mode" }, type: 1 },
        { buttonId: ".sinhalavoice", buttonText: { displayText: "🎶 Auto Sinhala (Private)" }, type: 1 },
        { buttonId: ".clickhere", buttonText: { displayText: "🎛 Music Settings" }, type: 1 },
        { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      ],
      headerType: 4,
    });

    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);
    if (!data.status || !data.result?.download) return reply("⚠️ mp3 link එක ගන්න බැරි උනා.");

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

    setTimeout(async () => {
      await conn.sendMessage(jid, {
        text: `💬 ඔයාට මේ සින්දුව කොහොමද? 🎧`,
        footer: "⚡ Powered by ZANTA-XMD BOT",
        buttons: [
          { buttonId: `.feedback good ${video.title}`, buttonText: { displayText: "🩷 හොඳයි" }, type: 1 },
          { buttonId: `.feedback bad ${video.title}`, buttonText: { displayText: "💔 හොඳ නෑ" }, type: 1 },
          { buttonId: ".groupsong", buttonText: { displayText: "👥 Activate Group Auto" }, type: 1 },
        ],
        headerType: 4,
      });
    }, 2000);

  } catch (err) {
    console.error("Send error:", err);
    reply("⚠️ Song එක යවන වෙලාවට Error එකක් උනා.");
  }
}

//================= PRIVATE AUTO SONG MODE =================
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs every 10 minutes",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (autoSongIntervals[jid]) return reply("🟡 Auto Sinhala mode already running!");
  await conn.sendMessage(jid, {
    text: "🎧 *Auto Sinhala Slowed Songs Activated!*\nඔයාට හැම මිනිත්තු 10කටම නව Sinhala slowed song එකක් ලැබෙනවා.\n👇 Control Buttons:",
    footer: "🎵 Sinhala Vibe Menu",
    buttons: [
      { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
      { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      { buttonId: ".clickhere", buttonText: { displayText: "🎛 Music Settings" }, type: 1 },
      { buttonId: ".groupsong", buttonText: { displayText: "👥 Group Auto Mode" }, type: 1 },
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

//================= GROUP AUTO SONG MODE =================
cmd({
  pattern: "groupsong",
  desc: "Activate Sinhala auto songs for group",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!m.isGroup) return reply("⚠️ මේ feature එක Groups වලට විතරයි!");
  if (autoSongIntervals[jid]) return reply("🟡 Group Auto Sinhala mode already running!");

  await conn.sendMessage(jid, {
    text: "👥 *Group Sinhala Auto Mode Activated!*\n🎶 හැම මිනිත්තු 10කටම Sinhala slowed song එකක් ලැබෙනවා.\n👇 Controls:",
    footer: "🎵 Sinhala Vibe Menu",
    buttons: [
      { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
      { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      { buttonId: ".groupinterval", buttonText: { displayText: "🕒 Change Interval" }, type: 1 },
      { buttonId: ".clickhere", buttonText: { displayText: "🎛 Music Settings" }, type: 1 },
    ],
    headerType: 4,
  });

  const sendRandom = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, randomStyle);
  };

  await sendRandom();
  const interval = (groupIntervals[jid] || 10) * 60 * 1000;
  autoSongIntervals[jid] = setInterval(sendRandom, interval);
});

//================= INTERVAL SETTINGS =================
cmd({
  pattern: "groupinterval",
  desc: "Change Sinhala auto song interval in group",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!m.isGroup) return reply("⚠️ මේ command එක Groups වලට විතරයි!");

  await conn.sendMessage(jid, {
    text: "🕒 *Select Auto Song Interval* \nඔයාට කැමති වේලාව තෝරන්න 👇",
    footer: "🎵 Sinhala Auto Settings",
    buttons: [
      { buttonId: ".setinterval 5", buttonText: { displayText: "5 Minutes" }, type: 1 },
      { buttonId: ".setinterval 10", buttonText: { displayText: "10 Minutes" }, type: 1 },
      { buttonId: ".setinterval 15", buttonText: { displayText: "15 Minutes" }, type: 1 },
      { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
    ],
    headerType: 4,
  });
});

cmd({
  pattern: "setinterval",
  desc: "Set Sinhala auto song interval time",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const jid = m.chat;
  const minutes = parseInt(args[0]);
  if (isNaN(minutes) || minutes < 1) return reply("⚠️ වැරදි වේලාවක්! ex: .setinterval 10");

  groupIntervals[jid] = minutes;
  reply(`✅ Auto Song Interval set to *${minutes} minutes* 🕒`);

  if (autoSongIntervals[jid]) {
    clearInterval(autoSongIntervals[jid]);
    const sendRandom = async () => {
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      await sendSinhalaSong(conn, jid, reply, randomStyle);
    };
    autoSongIntervals[jid] = setInterval(sendRandom, minutes * 60 * 1000);
    reply("🔁 Auto Sinhala system restarted with new interval!");
  }
});

//================= STOP AUTO =================
cmd({
  pattern: "stop3",
  desc: "Stop automatic Sinhala slowed songs",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!autoSongIntervals[jid]) return reply("⚠️ Auto mode එක අක්‍රියව නැහැ.");
  clearInterval(autoSongIntervals[jid]);
  delete autoSongIntervals[jid];
  reply("🛑 Auto Sinhala slowed songs mode එක නවතා දමන ලදි.");
});