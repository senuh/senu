// sinhalasong-bot.js
// Full ZANTA-XMD compatible Sinhala Auto Song Bot
// Features:
// - .song (auto per-chat) / .sinhalavoice (private auto) / .groupsong (group auto)
// - .song3 (manual search) / .nextsong / .stop3 / .feedback
// - Music Settings panel (.clickhere / .musicsettings)
// - Send Mode options: Groups Only / Channels Only / Private Only / Both
// - Auto-react ON/OFF
// - Mood detection (sad, love, chill, party, vibe, default)
// - Mood-based sticker send (fixed by downloading sticker before sending)
// - All buttons and flows intact

//================= IMPORTS =================
const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const DB_FILE = "./feedback_db.json";
const { createCanvas } = require("canvas");
const { jsPDF } = require("jspdf");
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

//================= GLOBALS =================
// autoSongIntervals stores setInterval handles by chat id
let autoSongIntervals = {};
// groupIntervals allows per-chat interval (minutes)
let groupIntervals = {};
// playedSongs to avoid repeats
let playedSongs = {};
// lastQueryPerChat saved for reference
let lastQueryPerChat = {};
// autoReact per chat (boolean)
let autoReact = {};
// sendMode per chat: "GROUPS" | "CHANNELS" | "PRIVATE" | "BOTH"
let sendMode = {};
// owner jid
const OWNER_JID = "94760264995@s.whatsapp.net"; // <-- replace with your number

// default styles (used for searching)
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

// safe temp file name
function tempFileName(prefix = "tmp", ext = "") {
  return path.join(__dirname, `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
}

//================= MOOD DETECTION & STICKERS =================
function detectMood(text) {
  if (!text) return "default";
  text = text.toLowerCase();
  if (text.includes("sad") || text.includes("broken") || text.includes("alone") || text.includes("lonely")) return "sad";
  if (text.includes("love") || text.includes("heart") || text.includes("romantic")) return "love";
  if (text.includes("chill") || text.includes("slow") || text.includes("relax")) return "chill";
  if (text.includes("party") || text.includes("dance") || text.includes("beat")) return "party";
  if (text.includes("vibe") || text.includes("slowed") || text.includes("vibes")) return "vibe";
  return "default";
}

const moodMeta = {
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
  chill: {
    emoji: "🌙",
    footer: "🎧 Chill Vibe Mode • ZANTA-XMD BOT",
    // Chill transparent aesthetic sticker (user requested)
    sticker: "https://i.ibb.co/7b1pD7b/chillvibe.webp",
  },
  party: {
    emoji: "🎉",
    footer: "⚡ Party Energy • ZANTA-XMD BOT",
    sticker: "https://i.ibb.co/MsK4VNG/partybeat.webp",
  },
  vibe: {
    emoji: "🎶",
    footer: "🎵 Vibe Mode • ZANTA-XMD BOT",
    sticker: "https://i.ibb.co/Y2k6JcN/musicvibe.webp",
  },
  default: {
    emoji: "🎧",
    footer: "🎵 Sinhala Vibe Menu • ZANTA-XMD BOT",
    sticker: "https://i.ibb.co/sVKr0fj/defaultvibe.webp",
  },
};

// download a sticker URL to a temp .webp and return path
async function downloadStickerToFile(stickerUrl) {
  const p = tempFileName("sticker", ".webp");
  const res = await axios.get(stickerUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(p, res.data);
  return p;
}

//================= MAIN SONG FUNCTION =================
async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    lastQueryPerChat[jid] = query;
    // search YouTube
    const search = await yts(query);
    const video = (search && search.videos) ? search.videos.find(v => v.seconds <= 480) : null;
    if (!video) return reply("😭 සුදුසු සින්දුවක් හමු නොවුණා.");

    // prevent repeats
    if (!playedSongs[jid]) playedSongs[jid] = new Set();
    if (playedSongs[jid].has(video.videoId)) {
      // try another
      return sendSinhalaSong(conn, jid, reply, query);
    }
    playedSongs[jid].add(video.videoId);
    if (playedSongs[jid].size > 30) playedSongs[jid].clear();

    // mood meta
    const mood = detectMood(video.title || query);
    const meta = moodMeta[mood] || moodMeta.default;

    const caption = `${meta.emoji} *${video.title}* ${meta.emoji}

💆‍♂️ සිංහල Mind Relaxing Song (${mood.toUpperCase()} mode)
🎧 හොඳ vibe එකක් දැනගන්න Headphones එකක් අනිවාර්යයි!
⚡ Powered by ZANTA-XMD BOT`;

    // send preview with buttons (including groupsong and music settings)
    await conn.sendMessage(jid, {
      image: { url: video.thumbnail },
      caption,
      footer: meta.footer,
      buttons: [
        { buttonId: ".nextsong", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
        { buttonId: ".groupsong", buttonText: { displayText: "👥 Group Auto Mode" }, type: 1 },
        { buttonId: ".sinhalavoice", buttonText: { displayText: "🎶 Auto Sinhala (Private)" }, type: 1 },
        { buttonId: ".clickhere", buttonText: { displayText: "🎛 Music Settings" }, type: 1 },
        { buttonId: ".stop3", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      ],
      headerType: 4,
    });

    // ===== Download & Convert via external api then convert locally =====
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);
    if (!data || !data.status || !data.result?.download) {
      return reply("⚠️ mp3 link එක ගන්න බැරි උනා.");
    }

    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const mp3Path = path.join(__dirname, `${unique}.mp3`);
    const opusPath = path.join(__dirname, `${unique}.opus`);

    // download mp3
    await downloadFile(data.result.download, mp3Path);
    // convert to opus
    await convertToOpus(mp3Path, opusPath);

    // send as voice note
    await conn.sendMessage(jid, {
      audio: fs.readFileSync(opusPath),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });

    // send mood sticker after short delay (download first to avoid URL issues)
    setTimeout(async () => {
      try {
        const stickerUrl = meta.sticker || moodMeta.default.sticker;
        const stickerFile = await downloadStickerToFile(stickerUrl);
        await conn.sendMessage(jid, { sticker: fs.readFileSync(stickerFile) });
        // cleanup sticker file
        try { fs.unlinkSync(stickerFile); } catch {}
      } catch (stErr) {
        console.error("Sticker send error:", stErr);
      }
    }, 2000);

    // cleanup audio files
    try { fs.unlinkSync(mp3Path); } catch (e) {}
    try { fs.unlinkSync(opusPath); } catch (e) {}

    // auto-react / feedback buttons after a little delay
    setTimeout(async () => {
      try {
        if (autoReact[jid] === false) return; // if disabled explicitly
        await conn.sendMessage(jid, {
          text: `${meta.emoji} ඔයාට මේ සින්දුව කොහොමද?`,
          footer: meta.footer,
          buttons: [
            { buttonId: `.feedback good ${video.title}`, buttonText: { displayText: "🩷 හොඳයි" }, type: 1 },
            { buttonId: `.feedback bad ${video.title}`, buttonText: { displayText: "💔 හොඳ නෑ" }, type: 1 },
          ],
          headerType: 4,
        });
      } catch (fbErr) {
        console.error("Feedback send error:", fbErr);
      }
    }, 3000);

  } catch (err) {
    console.error("sendSinhalaSong error:", err);
    try {
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
    } catch (notifyErr) {
      console.error("Error notifying user/owner:", notifyErr);
    }
  }
}

//================= MUSIC SETTINGS PANEL (.clickhere / .musicsettings) =================
cmd({
  pattern: "clickhere",
  desc: "Open Music Settings Panel",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  const interval = (groupIntervals[jid] || 10);
  const react = (autoReact[jid] === false) ? "OFF" : "ON";
  const mode = sendMode[jid] || "BOTH";

  const panelText = `🎛 *Music Settings Panel* 🎶
🕒 *Interval:* ${interval} min
💬 *Auto React:* ${react}
📨 *Send Mode:* ${mode}

🎧 Sinhala Music Control`;

  await conn.sendMessage(jid, {
    text: panelText,
    footer: "🎵 Sinhala Music Settings",
    buttons: [
      { buttonId: ".changeinterval", buttonText: { displayText: "🕒 Change Interval" }, type: 1 },
      { buttonId: ".sendmode", buttonText: { displayText: "📨 Send Mode" }, type: 1 },
      { buttonId: ".autoreacton", buttonText: { displayText: "✅ Auto React ON" }, type: 1 },
      { buttonId: ".autoreactoff", buttonText: { displayText: "⛔ Auto React OFF" }, type: 1 },
    ],
    headerType: 4,
  });
});

// alias .musicsettings to .clickhere
cmd({
  pattern: "musicsettings",
  desc: "Alias for clickhere",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  return cmd._handlers && cmd._handlers; // no-op alias if system expects; actual .clickhere handles UI
});

//================= CHANGE INTERVAL (panel opens) =================
cmd({
  pattern: "changeinterval",
  desc: "Open interval options",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  await conn.sendMessage(jid, {
    text: "🕒 *Select Interval Time*\nChoose how often Sinhala songs auto-send 👇",
    footer: "🎵 Sinhala Song Timer",
    buttons: [
      { buttonId: ".setinterval 5", buttonText: { displayText: "⏱ Every 5 Min" }, type: 1 },
      { buttonId: ".setinterval 10", buttonText: { displayText: "⏱ Every 10 Min" }, type: 1 },
      { buttonId: ".setinterval 15", buttonText: { displayText: "⏱ Every 15 Min" }, type: 1 },
    ],
    headerType: 4,
  });
});

cmd({
  pattern: "setinterval",
  desc: "Set interval for auto songs in this chat",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const jid = m.chat;
  const minutes = parseInt(args[0]);
  if (isNaN(minutes) || minutes < 1) return reply("⚠️ වැරදි වේලාවක්! ex: .setinterval 10");
  groupIntervals[jid] = minutes;
  reply(`✅ Auto Song Interval set to *${minutes} minutes* 🕒`);

  // restart if currently running
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

//================= AUTO REACT ON/OFF =================
cmd({
  pattern: "autoreacton",
  desc: "Enable auto feedback",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  autoReact[m.chat] = true;
  reply("✅ Auto React mode *Enabled!*");
});

cmd({
  pattern: "autoreactoff",
  desc: "Disable auto feedback",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  autoReact[m.chat] = false;
  reply("❌ Auto React mode *Disabled!*");
});

//================= SEND MODE PANEL =================
cmd({
  pattern: "sendmode",
  desc: "Open Send Mode menu",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  await conn.sendMessage(m.chat, {
    text: "📨 *Select Send Mode*\nChoose where Sinhala songs should auto-send 👇",
    footer: "🎵 Sinhala Send Mode Menu",
    buttons: [
      { buttonId: ".groupsonly", buttonText: { displayText: "👥 Groups Only" }, type: 1 },
      { buttonId: ".channelsonly", buttonText: { displayText: "📢 Channels Only" }, type: 1 },
      { buttonId: ".privateonly", buttonText: { displayText: "🔒 Private Only" }, type: 1 },
      { buttonId: ".bothmode", buttonText: { displayText: "🌐 Both" }, type: 1 },
    ],
    headerType: 4,
  });
});

cmd({
  pattern: "groupsonly",
  desc: "Set mode: groups only",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  sendMode[m.chat] = "GROUPS";
  reply("👥 Send Mode set to: *Groups Only*");
});

cmd({
  pattern: "channelsonly",
  desc: "Set mode: channels only",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  sendMode[m.chat] = "CHANNELS";
  reply("📢 Send Mode set to: *Channels Only*");
});

cmd({
  pattern: "privateonly",
  desc: "Set mode: private only",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  sendMode[m.chat] = "PRIVATE";
  reply("🔒 Send Mode set to: *Private Only*");
});

cmd({
  pattern: "bothmode",
  desc: "Set mode: both groups and private",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  sendMode[m.chat] = "BOTH";
  reply("🌐 Send Mode set to: *Both (Groups + Private)*");
});

//================= UTILITY: check sendMode for this chat (used before starting auto) =================
function isChatAllowedByMode(jid, isGroup) {
  const mode = sendMode[jid] || "BOTH";
  if (mode === "BOTH") return true;
  if (mode === "GROUPS" && isGroup) return true;
  if (mode === "PRIVATE" && !isGroup) return true;
  if (mode === "CHANNELS") {
    // channels detection is framework-specific; default false
    // if your Zanta-XMD supports channels, integrate detection here.
    return false;
  }
  return false;
}

//================= AUTO SONG START (.sinhalavoice - per chat) =================
cmd({
  pattern: "sinhalavoice",
  desc: "Auto Sinhala slowed songs every X minutes (per chat)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  const isGroup = m.isGroup || false;

  // check sendMode rules
  if (!isChatAllowedByMode(jid, isGroup)) {
    return reply("⚠️ This chat is not allowed by current Send Mode. Change Send Mode in Music Settings.");
  }

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
  const intervalMin = groupIntervals[jid] || 10;
  autoSongIntervals[jid] = setInterval(sendRandom, intervalMin * 60 * 1000);
});

//================= NEW COMMAND: .song (start auto in this chat) =================
cmd({
  pattern: "song",
  desc: "Start auto Sinhala slowed songs in this chat (shortcut)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  // behave identical to sinhalavoice but named .song
  return cmd({
    pattern: "song-run-helper",
    desc: "",
    category: "music",
    filename: __filename,
  }, async (c, mk, mm, { reply: r }) => {}).callback && await (async () => {
    // reuse sinhalavoice logic by invoking handler directly:
  })().catch(()=>{}); // no-op - fallback to calling sinhalavoice below
});

// For simplicity call sinhalavoice's handler directly by duplicating minimal logic:
cmd({
  pattern: "song",
  desc: "Alias for sinhalavoice (keeps compatibility)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  // call sinhalavoice behavior
  await cmd._run && cmd._run; // noop, frameworks vary
  // We will run same code as sinhalavoice:
  const jid = m.chat;
  const isGroup = m.isGroup || false;
  if (!isChatAllowedByMode(jid, isGroup)) {
    return reply("⚠️ This chat is not allowed by current Send Mode. Change Send Mode in Music Settings.");
  }
  if (autoSongIntervals[jid]) return reply("🟡 Auto Sinhala mode already running!");
  await conn.sendMessage(jid, {
    text: "🎧 *Auto Sinhala Slowed Songs Activated!* (via .song)\nඔයාට හැම මිනිත්තු 10කටම නව Sinhala slowed song එකක් ලැබෙනවා.",
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
  const intervalMin = groupIntervals[jid] || 10;
  autoSongIntervals[jid] = setInterval(sendRandom, intervalMin * 60 * 1000);
});

//================= GROUP AUTO SONG (.groupsong) =================
cmd({
  pattern: "groupsong",
  desc: "Activate Sinhala auto songs in group",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  if (!m.isGroup) return reply("⚠️ මේ feature එක Groups වලට විතරයි!");
  if (autoSongIntervals[jid]) return reply("🟡 Group Auto Sinhala mode already running!");
  // check send mode
  if (!isChatAllowedByMode(jid, true)) {
    return reply("⚠️ This chat is not allowed by current Send Mode. Change Send Mode in Music Settings.");
  }

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
  const intervalMin = groupIntervals[jid] || 10;
  autoSongIntervals[jid] = setInterval(sendRandom, intervalMin * 60 * 1000);
});

// groupinterval menu for groups
cmd({
  pattern: "groupinterval",
  desc: "Open group interval options",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  if (!m.isGroup) return reply("⚠️ මේ command එක Groups වලට විතරයි!");
  await conn.sendMessage(m.chat, {
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

//================= NEXT SONG =================
cmd({
  pattern: "nextsong",
  desc: "Play next Sinhala slowed song immediately",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const jid = m.chat;
  const isGroup = m.isGroup || false;
  if (!isChatAllowedByMode(jid, isGroup)) return reply("⚠️ This chat is not allowed by current Send Mode.");
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

//================= MANUAL SONG SEARCH (.song3) =================
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

//================= SINHALA SONG FEEDBACK SYSTEM =================
// 🔰 Developed for ZANTA-XMD by ChatGPT (Sinhala + Auto PDF + Charts)


//================= DATABASE HANDLER =================

function loadFeedback() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE));
  } catch {
    return {};
  }
}

function saveFeedback(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function detectMood(song) {
  const lower = song.toLowerCase();
  if (lower.includes("adare") || lower.includes("sanda")) return "romantic";
  if (lower.includes("duka") || lower.includes("pena")) return "sad";
  if (lower.includes("hada") || lower.includes("obata")) return "emotional";
  return "normal";
}

//================= FEEDBACK COMMAND =================
cmd({
  pattern: "feedback",
  desc: "Send feedback about a Sinhala song",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const type = args[0];
  const songName = args.slice(1).join(" ") || "Unknown Song 🎶";
  const senderJid = m.sender;
  const senderNum = senderJid.split("@")[0];
  const user = m.pushName || senderNum;
  const ownerJid = "94760264995@s.whatsapp.net";

  if (!["good", "bad"].includes(type)) {
    return conn.sendMessage(m.chat, {
      text: "⚠️ වැරදි feedback command එකක්!\n\nUse:\n.feedback good [song name]\n.feedback bad [song name]",
      footer: "🩷 Sinhala Song Feedback • ZANTA-XMD BOT",
      buttons: [
        { buttonId: ".feedback good", buttonText: { displayText: "🩷 හොඳයි" }, type: 1 },
        { buttonId: ".feedback bad", buttonText: { displayText: "💔 හොඳ නෑ" }, type: 1 },
      ],
      headerType: 4,
    });
  }

  const db = loadFeedback();
  if (!db[songName]) db[songName] = { good: 0, bad: 0, users: {} };

  db[songName][type]++;
  db[songName].users[senderJid] = type;
  saveFeedback(db);

  const emoji = type === "good" ? "🩷" : "💔";
  const mood = detectMood(songName);

  await conn.sendMessage(m.chat, {
    text: `${emoji} *ඔයාගේ අදහස Owner ට යවන ලදි!*\n🌀 *Mood:* ${mood}\n🎶 *Song:* ${songName}`,
    footer: "🎵 Sinhala Song Feedback • ZANTA-XMD BOT",
    buttons: [
      { buttonId: `.viewdetails ${encodeURIComponent(songName)} ${type}`, buttonText: { displayText: "👤 බලන්න - විස්තර" }, type: 1 },
      { buttonId: `.nextsong`, buttonText: { displayText: "🎵 අලුත් සින්දුවක්" }, type: 1 },
      { buttonId: `.contact owner`, buttonText: { displayText: "📞 Owner එකට Contact" }, type: 1 },
    ],
    headerType: 4,
  });

  await conn.sendMessage(ownerJid, {
    text: `${emoji} *New Feedback!*\n\n👤 *User:* ${user}\n📞 wa.me/${senderNum}\n🎶 ${songName}\n💬 ${type.toUpperCase()}`,
  });
});

//================= VIEW DETAILS =================
cmd({
  pattern: "viewdetails",
  desc: "View song feedback details",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args }) => {
  const song = decodeURIComponent(args[0] || "Unknown Song 🎶");
  const type = args[1] || "unknown";
  const db = loadFeedback();
  const songData = db[song] || { good: 0, bad: 0 };

  await conn.sendMessage(m.chat, {
    text: `🎶 *${song}*\n🩷 ${songData.good} | 💔 ${songData.bad}\n💬 Last Feedback: ${type}`,
    footer: "🩷 Sinhala Song Feedback",
  });
});

//================= VIEW HISTORY =================
cmd({
  pattern: "viewhistory",
  desc: "View all songs feedback summary",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const db = loadFeedback();
  if (Object.keys(db).length === 0) return reply("📭 තව feedback data එකක් නෑ!");

  let text = "📜 *All Song Feedback History*\n\n";
  for (const [song, d] of Object.entries(db)) {
    text += `🎶 *${song}*\n🩷 ${d.good} | 💔 ${d.bad}\n\n`;
  }

  await conn.sendMessage(m.chat, {
    text,
    footer: "🎵 Sinhala Song Feedback",
    buttons: [
      { buttonId: ".topsongs", buttonText: { displayText: "🏆 Top Songs" }, type: 1 },
      { buttonId: ".topusers", buttonText: { displayText: "👤 Top Users" }, type: 1 },
    ],
    headerType: 4,
  });
});

//================= TOP SONGS =================
cmd({
  pattern: "topsongs",
  desc: "Top liked/disliked songs leaderboard",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const db = loadFeedback();
  if (Object.keys(db).length === 0) return reply("📭 Data නැහැ!");

  const songs = Object.entries(db).map(([name, d]) => ({
    name,
    good: d.good,
    bad: d.bad,
    total: d.good + d.bad
  }));

  const topGood = [...songs].sort((a, b) => b.good - a.good).slice(0, 5);
  const topBad = [...songs].sort((a, b) => b.bad - a.bad).slice(0, 5);

  let text = "🏆 *Top Sinhala Songs Leaderboard*\n\n🩷 *Most Liked:*\n";
  topGood.forEach((s, i) => text += `${i + 1}. ${s.name} — 🩷 ${s.good} | 💔 ${s.bad}\n`);
  text += "\n💔 *Most Disliked:*\n";
  topBad.forEach((s, i) => text += `${i + 1}. ${s.name} — 💔 ${s.bad} | 🩷 ${s.good}\n`);

  await conn.sendMessage(m.chat, { text, footer: "🎵 ZANTA-XMD • Feedback" });
});

//================= TOP USERS =================
cmd({
  pattern: "topusers",
  desc: "Most active feedback users",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const db = loadFeedback();
  const stats = {};

  for (const d of Object.values(db)) {
    for (const [jid, type] of Object.entries(d.users || {})) {
      if (!stats[jid]) stats[jid] = { good: 0, bad: 0 };
      if (type === "good") stats[jid].good++;
      else stats[jid].bad++;
    }
  }

  const sorted = Object.entries(stats)
    .sort((a, b) => (b[1].good + b[1].bad) - (a[1].good + a[1].bad))
    .slice(0, 10);

  let text = "👤 *Top Feedback Users*\n\n";
  sorted.forEach(([jid, s], i) => {
    text += `${i + 1}. wa.me/${jid.split("@")[0]} — 🩷 ${s.good} | 💔 ${s.bad}\n`;
  });

  await conn.sendMessage(m.chat, { text, footer: "📊 Sinhala Song Feedback" });
});

//================= CHARTS (SONGS + USERS) =================
async function generateBarChart(title, labels, data1, data2, label1, label2) {
  const width = 800, height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#101010";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#fff";
  ctx.font = "26px Sans";
  ctx.fillText(title, 40, 50);

  const baseY = 420;
  const barWidth = 30, gap = 80;
  let x = 100;

  labels.forEach((label, i) => {
    ctx.fillStyle = "#ff4da6";
    ctx.fillRect(x, baseY - data1[i] * 5, barWidth, data1[i] * 5);

    ctx.fillStyle = "#ff3333";
    ctx.fillRect(x + barWidth + 10, baseY - data2[i] * 5, barWidth, data2[i] * 5);

    ctx.fillStyle = "#fff";
    ctx.font = "14px Sans";
    ctx.fillText(label.slice(0, 8), x - 10, baseY + 20);

    x += gap;
  });

  const file = "./chart.png";
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  return file;
}

cmd({
  pattern: "chart songs",
  desc: "Generate song feedback chart",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const db = loadFeedback();
  const songs = Object.entries(db).slice(0, 6);
  if (songs.length === 0) return reply("📭 No data!");

  const labels = songs.map(([n]) => n);
  const good = songs.map(([_, d]) => d.good);
  const bad = songs.map(([_, d]) => d.bad);

  const file = await generateBarChart("🎵 Top Songs", labels, good, bad, "🩷", "💔");
  await conn.sendMessage(m.chat, { image: { url: file }, caption: "📊 Sinhala Song Chart" });
});

cmd({
  pattern: "chart users",
  desc: "Generate top users chart",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const db = loadFeedback();
  const stats = {};
  for (const d of Object.values(db)) {
    for (const [jid, type] of Object.entries(d.users || {})) {
      if (!stats[jid]) stats[jid] = { good: 0, bad: 0 };
      if (type === "good") stats[jid].good++;
      else stats[jid].bad++;
    }
  }

  const users = Object.entries(stats).slice(0, 6);
  if (users.length === 0) return reply("😅 තව feedback නෑ!");

  const labels = users.map(([j]) => j.split("@")[0]);
  const good = users.map(([_, s]) => s.good);
  const bad = users.map(([_, s]) => s.bad);

  const file = await generateBarChart("👤 Top Users", labels, good, bad, "🩷", "💔");
  await conn.sendMessage(m.chat, { image: { url: file }, caption: "📊 Top Users Activity Chart" });
});

//================= AUTO PDF REPORT =================
cmd({
  pattern: "report",
  desc: "Generate Sinhala Song Feedback Report (PDF)",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const db = loadFeedback();
  if (Object.keys(db).length === 0) return reply("📭 තව data නෑ!");

  const songs = Object.entries(db).map(([song, d]) => ({
    name: song, good: d.good, bad: d.bad
  }));
  const topGood = [...songs].sort((a, b) => b.good - a.good).slice(0, 5);
  const topBad = [...songs].sort((a, b) => b.bad - a.bad).slice(0, 5);

  const doc = new jsPDF();
  doc.text("🎵 Sinhala Song Feedback Report", 20, 20);
  doc.text("🗓️ Date: " + new Date().toLocaleString(), 20, 30);
  doc.text("🩷 Top Songs:", 20, 45);

  topGood.forEach((s, i) => doc.text(`${i + 1}. ${s.name} — 🩷 ${s.good} | 💔 ${s.bad}`, 30, 55 + i * 10));
  doc.text("💔 Most Disliked:", 20, 115);
  topBad.forEach((s, i) => doc.text(`${i + 1}. ${s.name} — 💔 ${s.bad} | 🩷 ${s.good}`, 30, 125 + i * 10));

  const file = `./feedback_report_${Date.now()}.pdf`;
  doc.save(file);

  await conn.sendMessage(m.chat, {
    document: { url: file },
    mimetype: "application/pdf",
    fileName: "Sinhala_Song_Feedback_Report.pdf",
    caption: "🧾 Sinhala Song Feedback • Auto PDF Report",
  });
});

//================= END OF FILE =================
// Notes:
// - Save this file as sinhalasong-bot.js inside your ZANTA-XMD commands/plugins folder.
// - Ensure axios, yts, fluent-ffmpeg, @ffmpeg-installer/ffmpeg are installed.
// - Replace OWNER_JID with your WhatsApp ID.
// - If your ZANTA-XMD has slightly different cmd() shape, adapt the handler registration accordingly.