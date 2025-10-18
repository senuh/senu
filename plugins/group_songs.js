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

// 🌀 Slow + Reverb + Convert to Opus
async function slowAndConvert(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters([
        'asetrate=44100*0.85',
        'atempo=1.1',
        'aecho=0.8:0.9:1000:0.3',
        'volume=1.3'
      ])
      .audioCodec('libopus')
      .audioBitrate('64k')
      .format('opus')
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

// 🎵 Send Sinhala slowed song (with all buttons)
async function sendSinhalaSong(conn, chatId, reply, query) {
  try {
    const search = await yts(query);
    if (!search.videos.length) return reply("😢 ඒ නමින් slowed song එකක් හොයාගන්න බැහැ!");

    const v = search.videos[Math.floor(Math.random() * Math.min(5, search.videos.length))];
    const infoMsg = `🎶 *${v.title}*\n🕒 ${v.timestamp}\n🔗 ${v.url}\n\n> Mind relaxing Sinhala slowed reverb song 🎧`;

    const buttons = [
      { buttonId: `play_song_${v.videoId}`, buttonText: { displayText: "🎧 Play Song" }, type: 1 },
      { buttonId: `next_song`, buttonText: { displayText: "⏭ Next Song" }, type: 1 },
      { buttonId: `owner_info`, buttonText: { displayText: "👑 Owner" }, type: 1 },
      { buttonId: `follow_channel`, buttonText: { displayText: "📢 Follow Channel" }, type: 1 },
    ];

    await conn.sendMessage(chatId, {
      image: { url: v.thumbnail },
      caption: infoMsg,
      footer: "Tap below buttons to enjoy more Sinhala slowed songs 💫",
      buttons,
      headerType: 4
    });
  } catch (err) {
    console.error(err);
    reply("⚠️ Song එක load වෙද්දි error එකක් ඇති!");
  }
}

// 🎧 Handle All Button Clicks
cmd({
  onButton: true
}, async (conn, mek, m, { buttonId, reply, from }) => {
  try {
    // ▶️ Play Song button
    if (buttonId.startsWith('play_song_')) {
      const videoId = buttonId.replace('play_song_', '');
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      await reply("🎧 Song එක සකස් වෙමින් පවතී...");

      const tmpMp4 = path.join(__dirname, `${Date.now()}.mp4`);
      const tmpOpus = path.join(__dirname, `${Date.now()}.opus`);

      const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(tmpMp4);
        stream.pipe(file);
        file.on('finish', resolve);
        file.on('error', reject);
      });

      await slowAndConvert(tmpMp4, tmpOpus);

      await conn.sendMessage(from, {
        audio: fs.readFileSync(tmpOpus),
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      });

      fs.unlinkSync(tmpMp4);
      fs.unlinkSync(tmpOpus);
      await reply("✅ Song එක Play වෙලා! 🎧");
    }

    // ⏭ Next Song button
    else if (buttonId === 'next_song') {
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      await reply("💫 තවත් slowed song එකක් load වෙමින්...");
      await sendSinhalaSong(conn, from, reply, randomStyle);
    }

    // 👑 Owner Info button
    else if (buttonId === 'owner_info') {
      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Pahasara Bot Owner
ORG:ZANTA-XMD BOT;
TEL;type=CELL;type=VOICE;waid=94760264995:+94 76 026 4995
END:VCARD`.trim();

      await conn.sendMessage(from, {
        contacts: { displayName: "👑 Pahasara Bot Owner", contacts: [{ vcard }] },
      });
      await reply("👑 Owner contact shared!");
    }

    // 📢 Follow Channel button
    else if (buttonId === 'follow_channel') {
      await conn.sendMessage(from, {
        text: "📢 Follow our official WhatsApp Channel for more Sinhala slowed songs:\n👉 https://whatsapp.com/channel/0029Vb4F314CMY0OBErLlV2M",
      });
    }

  } catch (err) {
    console.error(err);
    reply("⚠️ Button click එකට error එකක් ඇති!");
  }
});

// 🎵 .song Command (all buttons)
cmd({
  pattern: "song",
  desc: "Download Sinhala slowed song with all buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply, from }) => {
  const query = args.join(" ");
  if (!query) return reply("🎵 කරුණාකර සිංදුවේ නම type කරන්න (උදා: *.song Pahasara*)");

  await reply("🎧 Song එක load වෙමින් පවතී...");
  await sendSinhalaSong(conn, from, reply, query + " sinhala slowed reverb song");
});