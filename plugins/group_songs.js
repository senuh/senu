const { zokou } = require("../framework/zokou");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const yts = require("yt-search");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

let autoSongInterval = null;

const styles = [
  "sinhala slowed reverb song",
  "sinhala love slowed song",
  "sinhala vibe slowed song",
  "sinhala sad slowed song",
  "sinhala teledrama slowed song",
  "sinhala 2024 slowed reverb song",
  "sinhala mashup slowed reverb",
  "sinhala boot slowed song",
];

// 🧩 Download file safely
async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// 🧩 Convert mp3 → opus
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

// 🧠 Main Sinhala Song Sender
async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      const time = v.timestamp.split(":").map(Number);
      const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
      return seconds <= 480;
    });

    if (!video) return reply("😭 No suitable song found.");

    const caption = `🎶 *${video.title}* 🎶

🧘‍♂️ Mind Relaxing Sinhala Song  
🎧 Use headphones for best experience  
⚡ Powered by *ZANTA-XMD BOT*

00:00 ───●────────── ${video.timestamp}`;

    await conn.sendMessage(targetJid, {
      image: { url: video.thumbnail },
      caption,
      footer: "🎵 Sinhala Vibe Bot Menu",
      buttons: [
        { buttonId: "next_song", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
        { buttonId: "stop_auto", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      ],
      headerType: 4,
    });

    // Download and convert
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download)
      return reply("⚠️ Couldn't fetch mp3 link.");

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(opusPath),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);
  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending the song.");
  }
}

// 🎶 .sinhalavoice — auto mode with bottom menu buttons
zokou(
  {
    nomCom: "sinhalavoice",
    desc: "Auto Sinhala slowed songs menu",
    categorie: "🎵 Music",
  },
  async (conn, msg, { repondre }) => {
    const targetJid = msg.key.remoteJid;

    await conn.sendMessage(targetJid, {
      text: `🎧 *Auto Sinhala Slowed Songs Activated!*  

You will now get a new Sinhala slowed song every 20 minutes.  
Use the menu below to control playback 👇`,
      footer: "🎵 Sinhala Vibe Menu",
      buttons: [
        { buttonId: "next_song", buttonText: { displayText: "🎵 Next Song" }, type: 1 },
        { buttonId: "stop_auto", buttonText: { displayText: "⛔ Stop Auto" }, type: 1 },
      ],
      headerType: 4,
    });

    if (autoSongInterval) return repondre("🟡 Auto mode already running!");

    const sendRandom = async () => {
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      await sendSinhalaSong(conn, targetJid, repondre, randomStyle);
    };

    await sendRandom();
    autoSongInterval = setInterval(sendRandom, 20 * 60 * 1000);
  }
);

// 🛑 .stop3 — Stop Auto Mode
zokou(
  {
    nomCom: "stop3",
    desc: "Stop automatic Sinhala songs",
    categorie: "🎵 Music",
  },
  async (conn, msg, { repondre }) => {
    if (!autoSongInterval) return repondre("⛔ Auto mode is not running.");
    clearInterval(autoSongInterval);
    autoSongInterval = null;
    repondre("🛑 Auto Sinhala slowed songs stopped.");
  }
);

// 🎵 Button Handler for ZANTA-XMD
zokou(
  {
    nomCom: "buttons",
    fromMe: false,
    on: "buttonsResponse",
  },
  async (conn, msg, { buttonId }) => {
    const jid = msg.key.remoteJid;
    if (buttonId === "next_song") {
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      await sendSinhalaSong(conn, jid, (text) => conn.sendMessage(jid, { text }), randomStyle);
    } else if (buttonId === "stop_auto") {
      if (autoSongInterval) {
        clearInterval(autoSongInterval);
        autoSongInterval = null;
        await conn.sendMessage(jid, { text: "🛑 Auto Sinhala slowed songs stopped." });
      } else {
        await conn.sendMessage(jid, { text: "⚠️ Auto mode not running." });
      }
    }
  }
);