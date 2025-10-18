const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = {
  name: "song4",
  alias: ["songdl4"],
  category: "downloader",
  desc: "Download Sinhala songs automatically",
  async exec(msg, conn, args) {
    try {
      const text = args.join(" ");
      if (!text) return msg.reply("🎵 කරුණාකර ගීත නමක් ඇතුලත් කරන්න!\nඋදාහරණය: .song4 sudu");

      msg.reply("🔎 ගීතය සොයමින් සිටියි... ⏳");

      // YouTube search
      const res = await yts(text);
      const video = res.videos[0];
      if (!video) return msg.reply("⚠️ ගීතයක් සොයාගත නොහැකි විය!");

      const title = video.title;
      const url = video.url;
      const seconds = video.seconds;
      const image = video.thumbnail;

      await conn.sendMessage(msg.chat, {
        image: { url: image },
        caption: `🎶 *${title}*\n🕐 Duration: ${Math.floor(seconds / 60)}:${seconds % 60}\n📎 ${url}\n\n🎧 ගීතය download වෙමින්...`,
      });

      // Get audio download link via API
      const api = await axios.get(`https://api.akuari.my.id/downloader/youtube?link=${url}`);
      const mp3 = api.data.mp3.result;

      // Send as voice note
      await conn.sendMessage(msg.chat, {
        audio: { url: mp3 },
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
        caption: `🎧 *${title}*\nMind Relaxing Sinhala Song 💗`,
      });

      // Send as MP3
      await conn.sendMessage(msg.chat, {
        audio: { url: mp3 },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        caption: `🎵 *${title}* - MP3 Audio\nPowered by Zanta-XMD`,
      });

      await msg.reply("✅ ගීතය යැවීම සම්පූර්ණයි!");
    } catch (e) {
      console.error(e);
      msg.reply("❌ Error: ගීතය download කිරීමේදී දෝෂයක් ඇතිවිය!");
    }
  },
};