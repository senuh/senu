async function sendSinhalaSong(conn, targetJid, reply, query) {
  try {
    const search = await yts(query);
    const videos = search.videos
      .filter(v => {
        const time = v.timestamp.split(':').map(Number);
        const seconds = time.length === 3 ? time[0] * 3600 + time[1] * 60 + time[2] : time[0] * 60 + time[1];
        return seconds <= 480; // under 8 min
      })
      .slice(0, 2); // 👉 pick 2 songs

    if (videos.length === 0) return reply("😭 No suitable songs found.");

    // 🎨 make a double display caption
    const caption = videos
      .map((v, i) => `🎵 *${i + 1}. ${v.title}*\n🔗 ${v.url}\n🕒 ${v.timestamp}`)
      .join("\n\n") +
      `\n\n> *💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ꜱɪɴʜᴀʟᴀ ꜱʟᴏᴡᴇᴅ ꜱᴏɴɢꜱ 💆‍♀️🎧*`;

    // 🖼️ send both thumbnails side by side using a media carousel (WhatsApp supports multiple images)
    const media = videos.map(v => ({
      image: { url: v.thumbnail },
      caption: `🎶 ${v.title}\n🕒 ${v.timestamp}\n🔗 ${v.url}`,
    }));

    for (const item of media) {
      await conn.sendMessage(targetJid, item);
    }

    // 🧩 Download first one for audio sending
    const video = videos[0];
    const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.download)
      return reply("⚠️ Couldn't fetch mp3 link.");

    const mp3Path = path.join(__dirname, `${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `${Date.now()}.opus`);

    await downloadFile(data.result.download, mp3Path);
    await convertToOpus(mp3Path, opusPath);

    // 🎙️ Send voice note
    await conn.sendMessage(targetJid, {
      audio: fs.readFileSync(opusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });

    // 🎧 Send MP3 as document
    await conn.sendMessage(targetJid, {
      document: fs.readFileSync(mp3Path),
      mimetype: 'audio/mp3',
      fileName: `${video.title}.mp3`,
    });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);
  } catch (err) {
    console.error("Send error:", err);
    reply("😭 Something went wrong while sending the songs.");
  }
}