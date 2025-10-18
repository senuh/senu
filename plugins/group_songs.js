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

//================= MOOD DETECTION =================
function detectMood(text) {
  text = text.toLowerCase();
  if (text.includes("sad") || text.includes("broken") || text.includes("lonely")) return "sad";
  if (text.includes("love") || text.includes("heart") || text.includes("romantic")) return "love";
  if (text.includes("vibe") || text.includes("slow") || text.includes("chill")) return "vibe";
  if (text.includes("party") || text.includes("beat") || text.includes("mashup")) return "party";
  return "default";
}

const moodStyles = {
  sad: {
    emoji: "🥀",
    footer: "🖤 Sad Vibe Mode • ZANTA-XMD BOT",
    sticker: "https://i.ibb.co/6sxHn8V/sadvibe.webp",
  },
  love: {
    emoji: "💞",
    footer: "💘 Love Mood • ZANTA-XMD BOT",
    sticker: "https://i.ibb.co/pzfMG1K/lovemood.webp",
  },
  vibe: {
    emoji: "🌙",
    footer: "🎧 Chill Vibe Mode • ZANTA-XMD BOT",
    sticker: "https://i.ibb.co/Y2k6JcN/musicvibe.webp",
  },
  party: {
    emoji: "🎉",
    footer: "⚡ Party Energy • ZANTA-XMD BOT",
    sticker: "https://i.ibb.co/MsK4VNG/partybeat.webp",
  },
  default: {
    emoji: "🎶",
    footer: "🎵 Sinhala Vibe Menu • ZANTA-XMD BOT",
    sticker: "https://i.ibb.co/sVKr0fj/defaultvibe.webp",
  },
};

//================= MAIN SONG FUNCTION =================
async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    lastQueryPerChat[jid] = query;
    const search = await yts(query);
    const video = search.videos.find(v => v.seconds <= 480);
    if (!video) return reply("😭 සුදුසු සින්දුවක් හමු නොවුණා.");

    if (!playedSongs[jid]) playedSongs[jid] = new Set();
    if (playedSongs[jid].has(video.videoId)) return sendSinhalaSong(conn, jid, reply, query);
    playedSongs[jid].add(video.videoId);
    if (playedSongs[jid].size > 20) playedSongs[jid].clear();

    const mood = detectMood(video.title);
    const moodSet = moodStyles[mood] || moodStyles.default;

    const caption = `${moodSet.emoji} *${video.title}* ${moodSet.emoji}

💆‍♂️ සිංහල Mind Relaxing Song
🎧 හොඳ vibe එකක් දැනගන්න Headphones එකක් අනිවාර්යයි!
⚡ Powered by ZANTA-XMD BOT`;

    await conn.sendMessage(jid, {
      image: { url: video.thumbnail },
      caption,
      footer: moodSet.footer,
      buttons: [
        { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
        { buttonId: ".groupsong", buttonText: { displayText: "👥 Group Auto Mode" }, type: 1 },
        { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
        { buttonId: ".clickhere", buttonText: { displayText: "🎛 Music Settings" }, type: 1 },
      ],
      headerType: 4,
    });

    // ===== Download & Convert =====
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);
    if (!data.status || !data.result?.download) return reply("⚠️ mp3 link එක ගන්න බැරි උනා.");

    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const mp3Path = path.join(__dirname, `${unique}.mp3`);
    const opusPath = path.join(__dirname, `${unique}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    // 🎤 Send as voice note
    await conn.sendMessage(jid, {
      audio: fs.readFileSync(opusPath),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });

    // 🧹 Cleanup
    try { fs.unlinkSync(mp3Path); } catch {}
    try { fs.unlinkSync(opusPath); } catch {}

    // 🎭 Send Mood Sticker Automatically
    setTimeout(async () => {
      await conn.sendMessage(jid, {
        sticker: { url: moodSet.sticker }
      });
    }, 2000);

    // 💬 Send feedback buttons 3s later
    setTimeout(async () => {
      await conn.sendMessage(jid, {
        text: `${moodSet.emoji} ඔයාට මේ සින්දුව කොහොමද?`,
        footer: moodSet.footer,
        buttons: [
          { buttonId: `.feedback good ${video.title}`, buttonText: { displayText: "🩷 හොඳයි" }, type: 1 },
          { buttonId: `.feedback bad ${video.title}`, buttonText: { displayText: "💔 හොඳ නෑ" }, type: 1 },
        ],
        headerType: 4,
      });
    }, 3000);

  } catch (err) {
    console.error("Send error:", err);
    const ownerPhone = OWNER_JID.split('@')[0];
    const waLink = `https://wa.me/${ownerPhone}?text=${encodeURIComponent('Hi, I need help with the bot. Error: ' + (err.message || 'unknown'))}`;
    await conn.sendMessage(jid, {
      text: `😭 Song එක යවන වෙලාවට error එකක් උනා.\n\n📞 Owner එකට Contact වෙන්න:\n${waLink}`,
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
    text: "🎧 *Auto Sinhala Slowed Songs Activated!*\nඔයාට හැම මිනිත්තු 10කටම නව Sinhala slowed song එකක් ලැබෙනවා.",
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

//================= GROUP AUTO SONG =================
cmd({
  pattern: "groupsong",
  desc: "Activate group auto Sinhala songs mode",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (autoSongIntervals[jid]) return reply("🟡 Group auto mode already active!");
  reply("👥 Group Sinhala Auto Song mode activated!");
  const sendGroup = async () => {
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaSong(conn, jid, reply, randomStyle);
  };
  await sendGroup();
  autoSongIntervals[jid] = setInterval(sendGroup, 10 * 60 * 1000);
});

//================= NEXT SONG =================
cmd({
  pattern: "nextsong",
  desc: "Play next Sinhala slowed song immediately",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  reply("✅ *Next Sinhala slowed song loading...* 🎧");
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
  if (!autoSongIntervals[jid]) return reply("⚠️ Auto mode එක අක්‍රියව නැහැ.");
  clearInterval(autoSongIntervals[jid]);
  delete autoSongIntervals[jid];
  reply("🛑 Auto Sinhala slowed songs mode එක නවතා දමන ලදි.");
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
    if (!videos || videos.length === 0) return reply("⚠️ Sinhala slowed songs හමු නොවුණා.");
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
    reply("❌ Sinhala songs list එක ගන්න Error එකක් උනා.");
  }
});

//================= FEEDBACK SYSTEM =================
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
    msgText = `🩷 *Feedback Alert!*\n👤 User: ${user}\n📞 wa.me/${senderNum}\n💬 Reaction: Liked the song\n🎶 Song: ${songName}\n📍 Chat: ${groupName}`;
    await reply("🩷 ඔබගේ අදහස Owner ට යවන ලදි ✅");
  } else if (type === "bad") {
    msgText = `💔 *Feedback Alert!*\n👤 User: ${user}\n📞 wa.me/${senderNum}\n💬 Reaction: Didn't like the song\n🎶 Song: ${songName}\n📍 Chat: ${groupName}`;
    await reply("💔 ඔබගේ අදහස Owner ට යවන ලදි 😢");
  } else return reply("⚠️ වැරදි feedback command එකක්!");

  try {
    await conn.sendMessage(ownerJid, { text: msgText });
  } catch (err) {
    console.error("Error sending feedback to owner:", err);
  }
});