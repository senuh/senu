const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const yt = require("yt-search");
const { cmd } = require("../command");

// ⚙️ Change to your WhatsApp JID (owner)
const OWNER_JID = "94760264995@s.whatsapp.net";

// 🧠 Memory for auto mode
const autoSongIntervals = {};

//================= Download & Convert YouTube Audio =================
async function downloadAndConvertAudio(videoUrl, outputPath) {
  const api = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${videoUrl}`;
  const { data } = await axios.get(api);
  const audioUrl = data?.result?.audio?.url;
  if (!audioUrl) throw new Error("Audio link not found!");

  const tempPath = path.join(__dirname, "../temp/temp_audio.mp3");
  const writer = fs.createWriteStream(tempPath);
  const response = await axios({ url: audioUrl, method: "GET", responseType: "stream" });
  response.data.pipe(writer);
  await new Promise((res, rej) => writer.on("finish", res).on("error", rej));

  return new Promise((res, rej) => {
    ffmpeg(tempPath)
      .audioCodec("libopus")
      .format("opus")
      .on("end", () => {
        fs.unlinkSync(tempPath);
        res(outputPath);
      })
      .on("error", rej)
      .save(outputPath);
  });
}

//================= Send Sinhala Song =================
async function sendSinhalaSong(conn, jid, query) {
  const styles = [
    "sinhala slowed reverb song",
    "sinhala lofi song",
    "sinhala remix slowed song",
    "sinhala vibe slowed song",
  ];
  const keyword = query || styles[Math.floor(Math.random() * styles.length)];

  const r = await yt(keyword);
  if (!r.videos.length) return conn.sendMessage(jid, { text: "😢 No songs found!" });

  const video = r.videos.find((v) => v.seconds <= 480);
  if (!video) return conn.sendMessage(jid, { text: "❌ No suitable video found!" });

  const opusPath = path.join(__dirname, `../temp/${Date.now()}.opus`);
  await downloadAndConvertAudio(video.url, opusPath);

  const caption = `🎶 *${video.title}*\n\n💆‍♂️ Mind Relaxing Sinhala Song\n🎧 Use headphones for best vibe\n⚡ Powered by ZANTA-XMD BOT`;

  // 1️⃣ Send image with info (song card)
  await conn.sendMessage(jid, {
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

  // 2️⃣ Send voice note (without buttons)
  const voiceMsg = await conn.sendMessage(jid, {
    audio: fs.readFileSync(opusPath),
    mimetype: "audio/ogg; codecs=opus",
    ptt: true,
  });
  fs.unlinkSync(opusPath);

  // 3️⃣ After 10 seconds → Send feedback message with buttons
  setTimeout(async () => {
    await conn.sendMessage(jid, {
      text: `💬 ඔයාට මේ සින්දුව කොහොමද? 🎧`,
      footer: "⚡ Powered by ZANTA-XMD BOT",
      buttons: [
        { buttonId: `.reactgood ${voiceMsg.key.id} ${video.title}`, buttonText: { displayText: "🩷 හොඳයි" }, type: 1 },
        { buttonId: `.reactbad ${voiceMsg.key.id} ${video.title}`, buttonText: { displayText: "💔 හොඳ නෑ" }, type: 1 },
      ],
      headerType: 4,
    });
  }, 10000);
}

//================= Manual Sinhala Song =================
cmd({
  pattern: "song3",
  desc: "Play Sinhala slowed song manually",
  category: "music",
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("❗ Use like: .song3 song name");
  reply(`🔍 Searching YouTube for *${text} slowed Sinhala song...* 🎧`);
  await sendSinhalaSong(conn, m.chat, text);
});

//================= Auto Sinhala Voice Mode =================
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala songs every 10 minutes",
  category: "music",
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (autoSongIntervals[jid]) return reply("🟡 Sinhala Auto Mode Already Active!");
  reply("🎧 Sinhala Auto Mode Activated! Songs will play every 10 minutes.");

  const play = async () => await sendSinhalaSong(conn, jid);
  await play();
  autoSongIntervals[jid] = setInterval(play, 10 * 60 * 1000);
});

//================= Stop Auto Mode =================
cmd({
  pattern: "stop3",
  desc: "Stop Sinhala auto mode",
  category: "music",
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!autoSongIntervals[jid]) return reply("⚠️ Auto Mode Not Running.");
  clearInterval(autoSongIntervals[jid]);
  delete autoSongIntervals[jid];
  reply("🛑 Sinhala Voice Auto Mode Stopped.");
});

//================= Feedback Buttons =================
cmd({
  pattern: "reactgood",
  desc: "React ❤️ and send feedback",
  category: "music",
}, async (conn, mek, m, { args, reply }) => {
  const msgId = args[0];
  const songName = args.slice(1).join(" ") || "Unknown Song";
  const senderNum = m.sender.split("@")[0];
  const user = m.pushName || senderNum;
  const chatName = m.isGroup ? m.chat : "Private Chat";

  try {
    await conn.sendMessage(m.chat, { react: { text: "❤️", key: { id: msgId, remoteJid: m.chat } } });
    const msgText = `🩷 *Song Feedback*\n👤 User: ${user}\n📞 wa.me/${senderNum}\n💬 Reaction: ❤️ Liked\n🎶 Song: ${songName}\n📍 Chat: ${chatName}`;
    await conn.sendMessage(OWNER_JID, { text: msgText });
    await reply("🩷 ඔබගේ අදහස Owner ට යවන ලදි ✅");
  } catch (e) {
    reply("⚠️ Reaction failed: " + e.message);
  }
});

cmd({
  pattern: "reactbad",
  desc: "React 💔 and send feedback",
  category: "music",
}, async (conn, mek, m, { args, reply }) => {
  const msgId = args[0];
  const songName = args.slice(1).join(" ") || "Unknown Song";
  const senderNum = m.sender.split("@")[0];
  const user = m.pushName || senderNum;
  const chatName = m.isGroup ? m.chat : "Private Chat";

  try {
    await conn.sendMessage(m.chat, { react: { text: "💔", key: { id: msgId, remoteJid: m.chat } } });
    const msgText = `💔 *Song Feedback*\n👤 User: ${user}\n📞 wa.me/${senderNum}\n💬 Reaction: 💔 Didn't Like\n🎶 Song: ${songName}\n📍 Chat: ${chatName}`;
    await conn.sendMessage(OWNER_JID, { text: msgText });
    await reply("💔 ඔබගේ අදහස Owner ට යවන ලදි 😢");
  } catch (e) {
    reply("⚠️ Reaction failed: " + e.message);
  }
});const fs = require("fs");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const yt = require("yt-search");
const path = require("path");
const { cmd } = require("../command");

const OWNER_JID = "94700000000@s.whatsapp.net"; // <-- ඔබේ WhatsApp JID එක මෙතන දාන්න

const playedSongs = {};
const autoSongIntervals = {};

async function downloadAndConvertAudio(videoUrl, outputPath) {
  const api = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${videoUrl}`;
  const { data } = await axios.get(api);
  const audioUrl = data?.result?.audio?.url;
  if (!audioUrl) throw new Error("Audio link not found!");

  const tempPath = path.join(__dirname, "temp.mp3");
  const writer = fs.createWriteStream(tempPath);
  const response = await axios({ url: audioUrl, method: "GET", responseType: "stream" });
  response.data.pipe(writer);
  await new Promise((res, rej) => writer.on("finish", res).on("error", rej));

  return new Promise((res, rej) => {
    ffmpeg(tempPath)
      .audioCodec("libopus")
      .format("opus")
      .on("end", () => {
        fs.unlinkSync(tempPath);
        res(outputPath);
      })
      .on("error", rej)
      .save(outputPath);
  });
}

async function sendSinhalaSong(conn, jid, query) {
  const styles = [
    "sinhala slowed reverb song",
    "sinhala lofi song",
    "sinhala remix slowed song",
    "sinhala vibe slowed song",
  ];
  const keyword = query || styles[Math.floor(Math.random() * styles.length)];

  const r = await yt(keyword);
  if (!r.videos.length) return conn.sendMessage(jid, { text: "😢 No songs found!" });

  const video = r.videos.find((v) => v.seconds <= 480);
  if (!video) return conn.sendMessage(jid, { text: "❌ No suitable video found!" });

  const opusPath = path.join(__dirname, `${Date.now()}.opus`);
  await downloadAndConvertAudio(video.url, opusPath);

  const caption = `🎶 *${video.title}*\n\n💆‍♂️ Mind Relaxing Sinhala Song\n🎧 Use headphones for best vibe\n⚡ Powered by ZANTA-XMD BOT`;

  // 1️⃣ Send thumbnail + details
  await conn.sendMessage(jid, {
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

  // 2️⃣ Send voice note (NO BUTTONS)
  const voiceMsg = await conn.sendMessage(jid, {
    audio: fs.readFileSync(opusPath),
    mimetype: "audio/ogg; codecs=opus",
    ptt: true,
  });
  fs.unlinkSync(opusPath);

  // 3️⃣ After 10 seconds → Send feedback buttons separately
  setTimeout(async () => {
    await conn.sendMessage(jid, {
      text: `💬 ඔයාට මේ සින්දුව කොහොමද? 🎧`,
      footer: "⚡ Powered by ZANTA-XMD BOT",
      buttons: [
        { buttonId: `.reactgood ${voiceMsg.key.id} ${video.title}`, buttonText: { displayText: "🩷 හොඳයි" }, type: 1 },
        { buttonId: `.reactbad ${voiceMsg.key.id} ${video.title}`, buttonText: { displayText: "💔 හොඳ නෑ" }, type: 1 },
      ],
      headerType: 4,
    });
  }, 10000);
}

//================ COMMANDS =================

// Manual Sinhala Song
cmd({
  pattern: "song3",
  desc: "Play Sinhala slowed song manually",
  category: "music",
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("❗ Use like: .song3 song name");
  reply(`🔍 Searching YouTube for *${text} slowed Sinhala song...* 🎧`);
  await sendSinhalaSong(conn, m.chat, text);
});

// Auto Sinhala Mode
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala songs every 10 min",
  category: "music",
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (autoSongIntervals[jid]) return reply("🟡 Sinhala Auto Mode Already Active!");
  reply("🎧 Sinhala Auto Mode Activated! Songs will play every 10 minutes.");

  const play = async () => await sendSinhalaSong(conn, jid);
  await play();
  autoSongIntervals[jid] = setInterval(play, 10 * 60 * 1000);
});

// Stop Auto Mode
cmd({
  pattern: "stop3",
  desc: "Stop Sinhala auto mode",
  category: "music",
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!autoSongIntervals[jid]) return reply("⚠️ Auto Mode Not Running.");
  clearInterval(autoSongIntervals[jid]);
  delete autoSongIntervals[jid];
  reply("🛑 Sinhala Voice Auto Mode Stopped.");
});

//================= FEEDBACK BUTTON HANDLERS =================
cmd({
  pattern: "reactgood",
  desc: "React ❤️ and send feedback",
  category: "music",
}, async (conn, mek, m, { args, reply }) => {
  const msgId = args[0];
  const songName = args.slice(1).join(" ") || "Unknown Song";
  const senderNum = m.sender.split("@")[0];
  const user = m.pushName || senderNum;
  const chatName = m.isGroup ? m.chat : "Private Chat";

  try {
    await conn.sendMessage(m.chat, { react: { text: "❤️", key: { id: msgId, remoteJid: m.chat } } });
    const msgText = `🩷 *Song Feedback*\n👤 User: ${user}\n📞 wa.me/${senderNum}\n💬 Reaction: ❤️ Liked\n🎶 Song: ${songName}\n📍 Chat: ${chatName}`;
    await conn.sendMessage(OWNER_JID, { text: msgText });
    await reply("🩷 ඔබගේ අදහස Owner ට යවන ලදි ✅");
  } catch (e) {
    reply("⚠️ Reaction failed: " + e.message);
  }
});

cmd({
  pattern: "reactbad",
  desc: "React 💔 and send feedback",
  category: "music",
}, async (conn, mek, m, { args, reply }) => {
  const msgId = args[0];
  const songName = args.slice(1).join(" ") || "Unknown Song";
  const senderNum = m.sender.split("@")[0];
  const user = m.pushName || senderNum;
  const chatName = m.isGroup ? m.chat : "Private Chat";

  try {
    await conn.sendMessage(m.chat, { react: { text: "💔", key: { id: msgId, remoteJid: m.chat } } });
    const msgText = `💔 *Song Feedback*\n👤 User: ${user}\n📞 wa.me/${senderNum}\n💬 Reaction: 💔 Didn't Like\n🎶 Song: ${songName}\n📍 Chat: ${chatName}`;
    await conn.sendMessage(OWNER_JID, { text: msgText });
    await reply("💔 ඔබගේ අදහස Owner ට යවන ලදි 😢");
  } catch (e) {
    reply("⚠️ Reaction failed: " + e.message);
  }
});