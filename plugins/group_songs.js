const fs = require("fs");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const yt = require("yt-search");
const path = require("path");
const { cmd } = require("../command");

const OWNER_JID = "94700000000@s.whatsapp.net"; // <-- ඔබේ WhatsApp JID එක මෙතන දාන්න

const playedSongs = {};
const autoSongIntervals = {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function downloadAndConvertAudio(videoUrl, outputPath) {
  try {
    const api = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${videoUrl}`;
    const { data } = await axios.get(api);
    const audioUrl = data?.result?.audio?.url;
    if (!audioUrl) throw new Error("Audio URL not found");

    const temp = path.join(__dirname, "temp.mp3");
    const writer = fs.createWriteStream(temp);
    const response = await axios({ url: audioUrl, method: "GET", responseType: "stream" });
    response.data.pipe(writer);

    await new Promise((res, rej) => writer.on("finish", res).on("error", rej));

    return new Promise((res, rej) => {
      ffmpeg(temp)
        .audioCodec("libopus")
        .format("opus")
        .on("end", () => {
          fs.unlinkSync(temp);
          res(outputPath);
        })
        .on("error", rej)
        .save(outputPath);
    });
  } catch (e) {
    console.error("Download error:", e);
    throw e;
  }
}

async function sendSong(conn, jid, query) {
  const styles = ["sinhala slowed", "sinhala remix", "sinhala lofi", "sinhala reverb"];
  const keyword = query || styles[Math.floor(Math.random() * styles.length)];

  const r = await yt(keyword);
  if (!r.videos.length) return conn.sendMessage(jid, { text: "😢 Song not found!" });

  const video = r.videos.find((v) => v.seconds <= 480);
  if (!video) return conn.sendMessage(jid, { text: "❌ No suitable video found!" });

  const opusPath = path.join(__dirname, `${Date.now()}.opus`);
  await downloadAndConvertAudio(video.url, opusPath);

  const sentMsg = await conn.sendMessage(jid, {
    audio: fs.readFileSync(opusPath),
    mimetype: "audio/ogg; codecs=opus",
    ptt: true,
  });

  // 🩷 Add reaction buttons after voice note
  await conn.sendMessage(jid, {
    text: `🎶 *${video.title}*\n\nඔයාට මේ සින්දුව කොහොමද? 🎧`,
    footer: "⚡ Powered by ZANTA-XMD BOT",
    buttons: [
      { buttonId: `.reactgood ${sentMsg.key.id} ${video.title}`, buttonText: { displayText: "🩷 හොඳයි" }, type: 1 },
      { buttonId: `.reactbad ${sentMsg.key.id} ${video.title}`, buttonText: { displayText: "💔 හොඳ නෑ" }, type: 1 },
    ],
    headerType: 4,
  });

  fs.unlinkSync(opusPath);
  return video;
}

//================ COMMANDS =================

// Auto Sinhala Mode
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala songs every 10 min",
  category: "music",
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;

  if (autoSongIntervals[jid]) {
    return reply("🌀 Sinhala Auto Mode Already Active!");
  }

  reply("🎧 Sinhala Voice Auto Mode Activated! Songs will play every 10 minutes.");

  const play = async () => {
    const video = await sendSong(conn, jid);
    if (video) {
      if (!playedSongs[jid]) playedSongs[jid] = [];
      playedSongs[jid].push(video.videoId);
    }
  };

  await play();
  autoSongIntervals[jid] = setInterval(play, 10 * 60 * 1000);
});

// Stop Auto Mode
cmd({
  pattern: "stop3",
  desc: "Stop Sinhala auto voice mode",
  category: "music",
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!autoSongIntervals[jid]) return reply("⚠️ Auto Mode Not Active!");

  clearInterval(autoSongIntervals[jid]);
  delete autoSongIntervals[jid];
  reply("🛑 Sinhala Voice Auto Mode Stopped.");
});

// Play Next Song
cmd({
  pattern: "nextsong",
  desc: "Play next Sinhala song",
  category: "music",
}, async (conn, mek, m, { reply }) => {
  await sendSong(conn, m.chat);
  reply("⏭️ Playing Next Sinhala Song...");
});

// Manual Song
cmd({
  pattern: "song3",
  desc: "Play Sinhala slowed song manually",
  category: "music",
}, async (conn, mek, m, { text, reply }) => {
  if (!text) return reply("❗ Use like: .song3 song name");
  await sendSong(conn, m.chat, text);
});

//================= REACTIONS (Works in Inbox + Groups) =================
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
  const ownerJid = OWNER_JID;

  try {
    await conn.sendMessage(m.chat, { react: { text: "❤️", key: { id: msgId, remoteJid: m.chat } } });
    const msgText = `🩷 *Voice Feedback!*\n👤 ${user}\n📞 wa.me/${senderNum}\n💬 ❤️ Liked\n🎶 ${songName}\n📍 ${chatName}`;
    await conn.sendMessage(ownerJid, { text: msgText });
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
  const ownerJid = OWNER_JID;

  try {
    await conn.sendMessage(m.chat, { react: { text: "💔", key: { id: msgId, remoteJid: m.chat } } });
    const msgText = `💔 *Voice Feedback!*\n👤 ${user}\n📞 wa.me/${senderNum}\n💬 💔 Didn't Like\n🎶 ${songName}\n📍 ${chatName}`;
    await conn.sendMessage(ownerJid, { text: msgText });
    await reply("💔 ඔබගේ අදහස Owner ට යවන ලදි 😢");
  } catch (e) {
    reply("⚠️ Reaction failed: " + e.message);
  }
});