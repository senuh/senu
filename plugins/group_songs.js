//================= IMPORTS =================
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
let playedSongs = {};
let autoReactEnabled = true;
let lastQueryPerChat = {};
const OWNER_JID = "94760264995@s.whatsapp.net"; // <-- Replace with your number

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

    // ===== Download & Convert =====
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

    // ===== Auto Feedback Message After 10s =====
    setTimeout(async () => {
      await conn.sendMessage(jid, {
        text: `💬 ඔයාට මේ සින්දුව කොහොමද? 🎧`,
        footer: "⚡ Powered by ZANTA-XMD BOT",
        buttons: [
          { buttonId: `.feedback good ${video.title}`, buttonText: { displayText: "🩷 හොඳයි" }, type: 1 },
          { buttonId: `.feedback bad ${video.title}`, buttonText: { displayText: "💔 හොඳ නෑ" }, type: 1 },
        ],
        headerType: 4,
      });
    }, 10000);

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

//================= AUTO SINHALA =================
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

//================= NEXT SONG =================
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

//================= STOP AUTO =================
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

//================= MANUAL SONG SEARCH =================
cmd({
  pattern: "song3",
  desc: "Search Sinhala slowed song or trending list",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const jid = m.chat;
  const query = args.join(" ").trim();
  if (query) {
    const q = `${query} sinhala slowed reverb song`;
    reply(`🔍 Searching YouTube for *${query} slowed Sinhala song...* 🎧`);
    await sendSinhalaSong(conn, jid, reply, q);
    return;
  }
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

//================= FEEDBACK SYSTEM (Members + Admins) =================
cmd({
  pattern: "feedback",
  desc: "Send song feedback to bot owner",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const type = args[0];
  const songName = args.slice(1).join(" ") || "Unknown Song";
  const senderNum = m.sender.split("@")[0];
  const user = m.pushName || senderNum;
  const groupName = m.isGroup ? m.chat : "Private Chat";
  const ownerJid = OWNER_JID;

  let msgText;
  if (type === "good") {
    msgText = `🩷 *Feedback Alert!*\n👤 User: ${user}\n📞 Number: wa.me/${senderNum}\n💬 Reaction: Liked the song\n🎶 Song: ${songName}\n📍 Group/Chat: ${groupName}`;
    await reply("🩷 ඔබගේ අදහස Owner ට යවන ලදි ✅");
  } else if (type === "bad") {
    msgText = `💔 *Feedback Alert!*\n👤 User: ${user}\n📞 Number: wa.me/${senderNum}\n💬 Reaction: Didn't like the song\n🎶 Song: ${songName}\n📍 Group/Chat: ${groupName}`;
    await reply("💔 ඔබගේ අදහස Owner ට යවන ලදි 😢");
  } else return reply("⚠️ Invalid feedback!");

  try {
    await conn.sendMessage(ownerJid, { text: msgText });
  } catch (err) {
    console.error("Error sending feedback to owner:", err);
  }
});