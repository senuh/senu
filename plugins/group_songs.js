const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// Sinhala slowed song styles
const styles = [
  "sinhala slowed reverb song",
  "sinhala love slowed song",
  "sinhala vibe slowed song",
  "sinhala sad slowed song",
  "sinhala teledrama slowed song",
  "sinhala mashup slowed reverb",
];

// 🔧 Convert to Opus
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

// 🎵 Send Sinhala slowed song with Play button
async function sendSinhalaSong(conn, chatId, reply, query) {
  try {
    const search = await yts(query);
    if (!search.videos.length) return reply("😢 ඒ නමින් slowed song එකක් හොයාගන්න බැහැ!");

    const v = search.videos[Math.floor(Math.random() * Math.min(5, search.videos.length))];
    const infoMsg = `🎶 *${v.title}*\n🕒 ${v.timestamp}\n🔗 ${v.url}\n\n> Mind relaxing Sinhala slowed reverb song 🎧`;

    const buttons = [
      {
        buttonId: `play_song_${v.videoId}`,
        buttonText: { displayText: "🎧 Play Song" },
        type: 1
      }
    ];

    await conn.sendMessage(chatId, {
      image: { url: v.thumbnail },
      caption: infoMsg,
      footer: "Tap 🎧 Play Song to listen!",
      buttons,
      headerType: 4
    });
  } catch (err) {
    console.error(err);
    reply("⚠️ Song එක load වෙද්දි error එකක් ඇති!");
  }
}

// 🎧 Handle Play button clicks
cmd({
  onButton: true
}, async (conn, mek, m, { buttonId, reply, from }) => {
  if (buttonId.startsWith('play_song_')) {
    const videoId = buttonId.replace('play_song_', '');
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    await reply("🎧 Song එක සකස් වෙමින් පවතී...");

    try {
      const tmpMp4 = path.join(__dirname, `${Date.now()}.mp4`);
      const tmpOpus = path.join(__dirname, `${Date.now()}.opus`);

      const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(tmpMp4);
        stream.pipe(file);
        file.on('finish', resolve);
        file.on('error', reject);
      });

      await convertToOpus(tmpMp4, tmpOpus);

      await conn.sendMessage(from, {
        audio: fs.readFileSync(tmpOpus),
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      });

      fs.unlinkSync(tmpMp4);
      fs.unlinkSync(tmpOpus);
    } catch (err) {
      console.error(err);
      reply("⚠️ Song එක play වෙද්දි error එකක් ඇති!");
    }
  }
});

// 🎵 .song command — now works with argument directly
cmd({
  pattern: "song",
  desc: "Download Sinhala slowed song with play button",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply, from }) => {
  const query = args.join(" ");
  if (!query) return reply("🎵 කරුණාකර සිංදුවේ නම type කරන්න (උදා: *.song Pahasara*)");

  await reply("🎧 Song එක load වෙමින් පවතී...");
  await sendSinhalaSong(conn, from, reply, query + " sinhala slowed reverb song");
});

// ⏭️ .nextsong — random Sinhala slowed song
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

// 👑 .owner2
cmd({
  pattern: "owner2",
  desc: "Send bot owner contact",
  category: "info",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Pahasara Bot Owner
ORG:ZANTA-XMD BOT;
TEL;type=CELL;type=VOICE;waid=94760264995:+94 76 026 4995
END:VCARD`.trim();

  await conn.sendMessage(m.chat, {
    contacts: { displayName: "👑 Pahasara Bot Owner", contacts: [{ vcard }] },
  });
  await reply("👑 Owner contact shared!");
});

// 📢 .followchannel
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