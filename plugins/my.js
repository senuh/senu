const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yts = require('yt-search');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// ✅ File downloader
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// ✅ Convert mp3 → opus
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

// ✅ Send Sinhala slowed song preview
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const fullQuery = `${query} sinhala slowed reverb song`;
    const search = await yts(fullQuery);

    if (!search.videos || search.videos.length === 0)
      return reply("😭 Sinhala slowed song එකක් හොයාගන්න බැරිවුණා!");

    const video = search.videos.find(v => {
      const parts = v.timestamp?.split(':').map(Number);
      const seconds = parts ? parts.reduce((a, val) => a * 60 + val, 0) : 0;
      return seconds <= 480;
    });

    if (!video) return reply("⚠️ 8 minutes එකට අඩු ගීතයක් හොයාගන්න බැරිවුණා.");

    const caption = `🎵 *${video.title}*

> 💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ꜱɪɴʜᴀʟᴀ ꜱᴏɴɢ 💆❤‍🩹
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
00:00 ───●────────── ${video.timestamp}
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
🎧 Use headphones for best experience`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎙️ Powered by Zanta-XMD",
      buttons: [
        { buttonId: `songvoice_${video.url}`, buttonText: { displayText: "🎧 Voice Note" }, type: 1 },
        { buttonId: `songmp3_${video.url}`, buttonText: { displayText: "🎵 MP3 Audio" }, type: 1 }
      ],
      headerType: 4
    });

  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Song එක load වෙද්දි error එකක් ආව.");
  }
}

// ✅ Convert & send audio (shared function)
async function sendAudio(conn, jid, url, type) {
  const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(url)}&format=mp3&apikey=sadiya`;
  const { data } = await axios.get(apiUrl);

  if (!data.status || !data.result?.download)
    return conn.sendMessage(jid, { text: "⚠️ Download link fetch එක fail!" });

  const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
  const opusPath = path.join(__dirname, `${Date.now()}.opus`);

  try {
    await downloadFile(data.result.download, mp3Path);

    if (type === "voice") {
      await convertToOpus(mp3Path, opusPath);
      await conn.sendMessage(jid, {
        audio: fs.readFileSync(opusPath),
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
      });
    } else {
      await conn.sendMessage(jid, {
        audio: fs.readFileSync(mp3Path),
        mimetype: 'audio/mpeg',
        fileName: "ZantaSong.mp3",
      });
    }
  } catch (err) {
    console.error("Error sending audio:", err);
    await conn.sendMessage(jid, { text: "😢 Audio එක load වෙන්න fail උනා." });
  } finally {
    for (const file of [mp3Path, opusPath]) {
      try { fs.existsSync(file) && fs.unlinkSync(file); } catch {}
    }
  }
}

// ✅ Main preview command (.song4)
cmd({
  pattern: "song4",
  desc: "Search Sinhala slowed/reverb song and send with buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const text = args && args.length > 0 ? args.join(" ") : "";
  if (!text) return reply("🎵 ගීතයෙ නම type කරන්න!\n\nඋදාහරණය: *.song4 sanda wage da*");
  await sendSinhalaSong(conn, m.chat, reply, text);
});

// ✅ Handle Button Clicks (for new commands)
cmd({ on: "message" }, async (conn, mek, m) => {
  let buttonId;

  // detect both old/new WhatsApp formats
  if (m?.message?.buttonsResponseMessage) {
    buttonId = m.message.buttonsResponseMessage.selectedButtonId;
  } else if (m?.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
    const data = JSON.parse(
      m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson
    );
    buttonId = data.id;
  }
  if (!buttonId) return;

  const jid = m.key.remoteJid;
  if (buttonId.startsWith("songvoice_")) {
    await sendAudio(conn, jid, buttonId.replace("songvoice_", ""), "voice");
  } else if (buttonId.startsWith("songmp3_")) {
    await sendAudio(conn, jid, buttonId.replace("songmp3_", ""), "mp3");
  }
});

// ✅ Direct Sinhala Voice Command (.songvoice)
cmd({
  pattern: "songvoice",
  desc: "Download Sinhala slowed/reverb song as WhatsApp voice note",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const text = args && args.length > 0 ? args.join(" ") : "";
  if (!text) return reply("🎧 Voice එකක් ඕන නම්: *.songvoice sanda wage da*");

  const search = await yts(`${text} sinhala slowed reverb song`);
  if (!search.videos?.length) return reply("❌ Song එකක් හොයාගන්න බැරිවුණා!");

  await sendAudio(conn, m.chat, search.videos[0].url, "voice");
});

// ✅ Direct Sinhala MP3 Command (.songmp3)
cmd({
  pattern: "songmp3",
  desc: "Download Sinhala slowed/reverb song as MP3",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  const text = args && args.length > 0 ? args.join(" ") : "";
  if (!text) return reply("🎵 MP3 එකක් ඕන නම්: *.songmp3 sanda wage da*");

  const search = await yts(`${text} sinhala slowed reverb song`);
  if (!search.videos?.length) return reply("❌ Song එකක් හොයාගන්න බැරිවුණා!");

  await sendAudio(conn, m.chat, search.videos[0].url, "mp3");
});