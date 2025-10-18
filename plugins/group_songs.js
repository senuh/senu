const { cmd } = require('../lib/command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let autoSongInterval = null;

// Sinhala song styles
const styles = [
  "sinhala slowed reverb song",
  "sinhala love slowed song",
  "sinhala sad slowed song",
  "sinhala mashup slowed reverb",
  "sinhala vibe slowed song"
];

async function sendSinhalaCard(conn, chat, reply, query) {
  try {
    const api = `https://sadiya-tech-apis.vercel.app/ytsearch?query=${encodeURIComponent(query)}&apikey=sadiya`;
    const res = await axios.get(api);
    const results = res.data.result.slice(0, 2); // only 2 songs

    for (const song of results) {
      const mp3 = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(song.url)}&format=mp3&apikey=sadiya`;

      await conn.sendMessage(chat, {
        image: { url: song.thumbnail },
        caption: `🎶 *${song.title}*\n🕒 Duration: ${song.timestamp}\n\n💫 Sinhala slowed reverb song mode activated!\n🎧 Use headphones for best experience.`,
        footer: "ZANTA-XMD BOT • Powered by Sadiya API",
        buttons: [
          { buttonId: `voice_${song.url}`, buttonText: { displayText: "▶️ Play Voice" }, type: 1 },
          { buttonId: `mp3_${mp3}`, buttonText: { displayText: "🎧 MP3 Download" }, type: 1 }
        ],
        headerType: 4,
      });
    }

    reply("✅ 2 Sinhala songs sent successfully 🎵");
  } catch (e) {
    console.log(e);
    reply("⚠️ Error fetching Sinhala songs.");
  }
}

// Main command
cmd({
  pattern: "sinhalavoice2",
  desc: "Send Sinhala slowed 2-song card with mp3 button",
  category: "music",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Sinhala voice mode already running!");
  const chat = m.chat;
  reply("🎧 Sinhala slowed song card mode started — every 20 minutes.");

  const sendNow = async () => {
    const style = styles[Math.floor(Math.random() * styles.length)];
    await sendSinhalaCard(conn, chat, reply, style);
  };

  await sendNow();
  autoSongInterval = setInterval(sendNow, 20 * 60 * 1000);
});

// Stop command
cmd({
  pattern: "stop5",
  desc: "Stop Sinhala slowed auto mode",
  category: "music",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⚠️ Auto mode not running.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply("🛑 Sinhala slowed song card mode stopped.");
});