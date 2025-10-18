const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// Sinhala song styles
const styles = [
  "sinhala slowed reverb song",
  "sinhala love slowed song",
  "sinhala vibe slowed song",
  "sinhala sad slowed song",
  "sinhala teledrama slowed song",
  "sinhala mashup slowed reverb",
];

// Helper functions
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function convertToOpus(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libopus')
      .audioBitrate('64k')
      .format('opus')
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

// Send Sinhala slowed song info (with Follow button)
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const v = search.videos[0];
    if (!v) return reply("😢 ඒ නමින් slowed song එකක් හොයාගන්න බැහැ!");

    await conn.sendMessage(targetJid, {
      image: { url: v.thumbnail },
      caption: `🎶 *${v.title}*\n🕒 ${v.timestamp}\n🔗 ${v.url}\n\n> Mind relaxing Sinhala slowed reverb song 🎧`,
      footer: "ZANTA-XMD BOT • Powered by Sadiya API",
      buttons: [
        { buttonId: `.nextsong`, buttonText: { displayText: "⏭️ Next Song" }, type: 1 },
        { buttonId: `.owner2`, buttonText: { displayText: "👑 Owner" }, type: 1 },
        { buttonId: `.followchannel`, buttonText: { displayText: "📢 Follow Us" }, type: 1 },
      ],
      headerType: 4,
    });
  } catch (err) {
    console.error(err);
    reply("⚠️ Error loading Sinhala slowed song info!");
  }
}

// 🎵 .song command — ask user for song name
cmd({
  pattern: "song",
  desc: "Ask user for Sinhala slowed song name",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, from }) => {
  await reply("🎵 කරුණාකර සිංදුවේ නම එකක් type කරන්න (උදා: *Pahasara*)");

  conn.once('message', async (msg) => {
    if (!msg.message) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text) return;

    await reply("🎧 Song එක load වෙමින් පවතී...");
    await sendSinhalaSong(conn, from, reply, text + " slowed reverb sinhala song");
  });
});

// ⏭️ Next song
cmd({
  pattern: "nextsong",
  desc: "Play another Sinhala slowed song",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  await reply("💫 තවත් slowed song එකක් load වෙමින්...");
  await sendSinhalaSong(conn, m.chat, reply, randomStyle);
});

// 👑 Owner2 command
cmd({
  pattern: "owner2",
  desc: "Send bot owner contact",
  category: "info",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  try {
    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Pahasara Bot Owner
ORG:ZANTA-XMD BOT;
TEL;type=CELL;type=VOICE;waid=94760264995:+94 76 026 4995
END:VCARD
    `.trim();

    await conn.sendMessage(m.chat, {
      contacts: {
        displayName: "👑 Pahasara Bot Owner",
        contacts: [{ vcard }],
      },
    });
    await reply("👑 Owner contact shared!");
  } catch (err) {
    console.error(err);
    reply("⚠️ Error sending owner contact!");
  }
});

// 📢 Follow Channel command
cmd({
  pattern: "followchannel",
  desc: "Send WhatsApp Channel link",
  category: "info",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  await conn.sendMessage(m.chat, {
    text: "📢 Follow our official WhatsApp Channel for more Sinhala slowed songs:\n👉 https://whatsapp.com/channel/0029Vb4F314CMY0OBErLlV2M",
  });
});