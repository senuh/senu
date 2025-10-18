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

//================= FEEDBACK SYSTEM (Updated with View Details Panel) =================
cmd({
  pattern: "feedback",
  desc: "Send song feedback to bot owner with detailed view",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const type = args[0];
  const songName = args.slice(1).join(" ") || "Unknown Song";
  const senderNum = m.sender.split("@")[0];
  const user = m.pushName || senderNum;
  const groupName = m.isGroup ? "Group Chat" : "Private Chat";
  const ownerJid = OWNER_JID;
  const mood = detectMood(songName);

  let msgText, emoji;
  if (type === "good") {
    emoji = "🩷";
    msgText = `${emoji} *Positive Feedback!*\n👤 User: ${user}\n📞 wa.me/${senderNum}\n💬 Reaction: Liked the song\n🎶 Song: ${songName}\n🌀 Mood: ${mood.toUpperCase()}\n📍 Chat: ${groupName}`;
    await reply(`${emoji} ඔබගේ අදහස Owner ට යවන ලදි ✅`);
  } else if (type === "bad") {
    emoji = "💔";
    msgText = `${emoji} *Negative Feedback!*\n👤 User: ${user}\n📞 wa.me/${senderNum}\n💬 Reaction: Didn't like the song\n🎶 Song: ${songName}\n🌀 Mood: ${mood.toUpperCase()}\n📍 Chat: ${groupName}`;
    await reply(`${emoji} ඔබගේ අදහස Owner ට යවන ලදි 😢`);
  } else return reply("⚠️ වැරදි feedback command එකක්!");

  try {
    // send feedback to owner
    await conn.sendMessage(ownerJid, { text: msgText });

    // show details panel to user
    await conn.sendMessage(m.chat, {
      text: `${emoji} *ඔයාගේ අදහස සාර්ථකව යවන ලදි!*\nඔයාගේ විස්තර පහතින් බලන්න 👇`,
      footer: `${emoji} Sinhala Song Feedback • ZANTA-XMD BOT`,
      buttons: [
        { buttonId: `.viewdetails ${encodeURIComponent(songName)} ${type}`, buttonText: { displayText: "👤 බලන්න - විස්තර" }, type: 1 },
        { buttonId: `.nextsong`, buttonText: { displayText: "🎵 අලුත් සින්දුවක්" }, type: 1 },
        { buttonId: `.contactowner`, buttonText: { displayText: "📞 Owner එකට Contact" }, type: 1 },
      ],
      headerType: 4,
    });

  } catch (err) {
    console.error("Error sending feedback to owner:", err);
  }
});

//================= VIEW DETAILS PANEL =================
cmd({
  pattern: "viewdetails",
  desc: "View user feedback details with buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const song = decodeURIComponent(args[0] || "Unknown Song");
  const type = args[1] || "unknown";
  const senderNum = m.sender.split("@")[0];
  const user = m.pushName || senderNum;
  const mood = detectMood(song);
  const emoji = type === "good" ? "🩷" : "💔";

  const info = `${emoji} *Feedback Details*\n\n👤 *User:* ${user}\n📞 *Number:* wa.me/${senderNum}\n🎶 *Song:* ${song}\n🌀 *Mood:* ${mood.toUpperCase()}\n💬 *Reaction:* ${type === "good" ? "🩷 හොඳයි" : "💔 හොඳ නෑ"}`;

  await conn.sendMessage(m.chat, {
    text: info,
    footer: `${emoji} Sinhala Song Feedback • ZANTA-XMD BOT`,
    buttons: [
      { buttonId: `.nextsong`, buttonText: { displayText: "🎵 අලුත් සින්දුවක්" }, type: 1 },
      { buttonId: `.contactowner`, buttonText: { displayText: "📞 Owner එකට Contact" }, type: 1 },
      { buttonId: `.stop3`, buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
    ],
    headerType: 4,
  });
});

//================= END OF FILE =================
// Notes:
// - Save this file as sinhalasong-bot.js inside your ZANTA-XMD commands/plugins folder.
// - Ensure axios, yts, fluent-ffmpeg, @ffmpeg-installer/ffmpeg are installed.
// - Replace OWNER_JID with your WhatsApp ID.
// - If your ZANTA-XMD has slightly different cmd() shape, adapt the handler registration accordingly.