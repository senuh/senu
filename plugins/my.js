// ---------------- Sinhala Song Sender (No API Version) ----------------
const ytdl = require('ytdl-core');

async function sendSinhalaSong(conn, jid, reply, query) {
  try {
    const search = await yts(query);
    const video = search.videos.find(v => {
      if (!v.timestamp || !v.title || sentUrls.has(v.url)) return false;
      if (!v.title.toLowerCase().includes('sinhala')) return false;
      const t = v.timestamp.split(':').map(Number);
      if (!t.every(num => !isNaN(num))) return false;
      const sec = t.length === 3 ? t[0]*3600 + t[1]*60 + t[2] : t[0]*60 + t[1];
      return sec <= 480; // under 8 min
    });

    if (!video) return reply('😢 Sinhala slowed song not found.');

    sentUrls.add(video.url);

    const caption = `*"${video.title}"*

> *💆‍♂️ ᴍɪɴᴅ ʀᴇʟᴀxɪɴɢ ʙᴇꜱᴛ ꜱᴏɴɢ 💆❤‍🩹*
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
         00:00 ───●──────────${video.timestamp}    
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
> ❑ ᴜꜱᴇ ʜᴇᴀᴅᴘʜᴏɴᴇꜱ ꜰᴏʀ ʙᴇꜱᴛ ᴇxᴘᴇʀɪᴇɴᴄᴇ..🙇‍♂️🎧🫀`;

    // Send thumbnail + caption
    await conn.sendMessage(jid, { image: { url: video.thumbnail }, caption });

    // Temp files
    const mp3 = path.join(__dirname, `${Date.now()}.mp3`);
    const opus = path.join(__dirname, `${Date.now()}.opus`);

    // Download audio directly via ytdl
    try {
      const stream = ytdl(video.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
      });
      const writer = fs.createWriteStream(mp3);
      stream.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (err) {
      console.error('Download error:', err);
      return reply('⚠️ Error downloading song.');
    }

    // Convert to opus for WhatsApp
    try {
      await convertToOpus(mp3, opus);
    } catch (err) {
      console.error('Convert error:', err);
      return reply('⚠️ Error converting song.');
    }

    // Send voice message
    try {
      await conn.sendMessage(jid, {
        audio: fs.readFileSync(opus),
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
      });
    } catch (err) {
      console.error('Send error:', err);
      return reply('⚠️ Error sending voice message.');
    }

    // Send YouTube video (optional)
    try {
      await conn.sendMessage(jid, {
        video: { url: video.url },
        caption: `🎬 *${video.title}* | Sinhala Slowed Video 💫`,
      });
    } catch (err) {
      console.error('Video send error:', err);
    }

    // Delete temp files
    try { fs.unlinkSync(mp3); } catch {}
    try { fs.unlinkSync(opus); } catch {}

  } catch (e) {
    console.error('Error sending Sinhala song:', e);
    reply('⚠️ Something went wrong.');
  }
}