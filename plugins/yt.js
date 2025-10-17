const config = require('../settings')
const { cmd, commands } = require('../lib/command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson,clockString, jsonformat} = require('../lib/functions')
var { updateCMDStore,isbtnID,getCMDStore,getCmdForCmdId,connectdb,input,get, updb,updfb } = require("../lib/database")
const yts = require("yt-search");

function ytreg(url) {
    const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed|shorts\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/
    return ytIdRegex.test(url);
}



// Function to extract the video ID from youtu.be or YouTube links
function extractYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Function to convert any YouTube URL to a full YouTube watch URL
function convertYouTubeLink(q) {
    const videoId = extractYouTubeId(q);
    if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return q;
}

const formatViews = views => views >= 1_000_000_000 ? `${(views / 1_000_000_000).toFixed(1)}B` : views >= 1_000_000 ? `${(views / 1_000_000).toFixed(1)}M` : views >= 1_000 ? `${(views / 1_000).toFixed(1)}K` : views.toString(); 



const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

let autoSongInterval = null;
let sentSongUrls = new Set();

const styles = [
  "sinhala boot slowed song",
  "sinhala love slowed song",
  "sinhala song slowed",
  "sinhala vibe and new slowed song",
  "sinhala old slowed song",
  "sinhala 2025 slowed song",
  "sinhala 2015 slowed song",
  "sinhala nonstop  slowed song",
  "sinhala slowed reverb",
  "sinhala slowed reverb",
  "sinhala vibe slowed rap",
  "sinhala new boot slowed song",
  "sinhala sad slowed song",
  "sinhala love slowed song",
  "sinhala slowed reverb 2014 song",
  "sinhala slowed reverb 2024 song",
  "sinhala one week uploded slowed reverb song",
  "sinhala old is gold slowed reverb song",
  "sinhala new full vibe slowed reverb song",
  "sinhala teledrama slowed reverb song",
  "sinhala new dj slowed reverb song",
  "sinhala mashshup song",
  
];



cmd({
  pattern: "mp3",
  desc: "Start sending YouTube songs under 8 minutes every 8 minutes (no repeats)",
  category: "download",
  filename: __filename,
},
async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");

  const targetJid = m.chat;
  reply(`✅ Auto song sending started.\n🎶 Styles: ${styles.join(", ")}\nSongs will be sent every 20 minutes.`);

  autoSongInterval = setInterval(async () => {
    try {
      const style = styles[Math.floor(Math.random() * styles.length)];
      const search = await yts(style);

      // ✅ Pick only a new song not already sent
      const video = search.videos.find(v => {
        if (sentSongUrls.has(v.url)) return false;

        const time = v.timestamp.split(":").map(Number);
        const durationInSec = time.length === 3
          ? time[0] * 3600 + time[1] * 60 + time[2]
          : time[0] * 60 + time[1];

        return durationInSec <= 480; // 8 minutes
      });

      if (!video) {
        clearInterval(autoSongInterval);
        autoSongInterval = null;
        return reply("✅ All suitable songs sent (no repeats left). Stopping...");
      }

      // ✅ Mark as sent
      sentSongUrls.add(video.url);

      const desc = `*"${video.title}"*

> *💆‍♂️ Mind Relaxing Best Song 💆❤‍🩹*
> *🎧 ${style.toUpperCase()}*
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
         00:00 ───●────────── ${video.timestamp}   
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
> ❑ Use headphones for best experience..🙇‍♂️🎧"🫀
> ❑ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɴᴛᴀ-xᴍᴅ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ
> ❑ ᴢᴀɴᴛᴀ-xᴍᴅ ᴏᴡɴᴇʀ - +94760264995

                               ♡          ⎙          ➦ 
                            ʳᵉᵃᶜᵗ       ˢᵃᵛᵉ       ˢʰᵃʳᵉ`;

      await conn.sendMessage(targetJid, {
        image: { url: video.thumbnail },
        caption: desc,
      });

      // Download MP3 link
      const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
      const { data } = await axios.get(apiUrl);

      if (data.status && data.result && data.result.download) {
        const mp3Url = data.result.download;

        await conn.sendMessage(targetJid, {
          audio: { url: mp3Url },
          mimetype: "audio/mpeg"
        });
      } else {
        reply("⚠️ Mp3 link not found from API.");
      }

    } catch (e) {
      console.error("Song sending error:", e);
    }
  }, 30 * 60 * 1000); // every 20 minutes
});




cmd({
  pattern: "music",
  desc: "Start sending YouTube songs under 8 minutes every 8 minutes (auto styles)",
  category: "download",
  filename: __filename,
},
async (conn, mek, m, { reply }) => {
  if (autoSongInterval) return reply("🟡 Already running!");

  const targetJid = m.chat;
  reply(`✅ Auto song sending started.\n🎶 Styles: ${styles.join(", ")}\nSongs will be sent every 30 minutes.`);

  autoSongInterval = setInterval(async () => {
    try {
      const style = styles[Math.floor(Math.random() * styles.length)];
      const search = await yts(style);

      const video = search.videos.find(v => {
        if (sentSongUrls.has(v.url)) return false;

        const time = v.timestamp.split(":").map(Number);
        const durationInSec = time.length === 3
          ? time[0] * 3600 + time[1] * 60 + time[2]
          : time[0] * 60 + time[1];

        return durationInSec <= 480;
      });

      if (!video) {
        clearInterval(autoSongInterval);
        autoSongInterval = null;
        return reply("✅ All suitable songs sent. Stopping...");
      }

      sentSongUrls.add(video.url);

      const desc = `*"${video.title}*

> *💆‍♂️ Mind Relaxing Best Song 💆❤‍🩹*
> *🎧 ${style.toUpperCase()}*
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
         00:00 ───●────────── ${video.timestamp}   
❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍❍
▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬
> ❑ Use headphones for best experience..🙇‍♂️🎧"🫀
> ❑ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɴᴛᴀ-xᴍᴅ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ
> ❑ ᴢᴀɴᴛᴀ-xᴍᴅ ᴏᴡɴᴇʀ - +94760264995

                               ♡          ⎙          ➦ 
                            ʳᵉᵃᶜᵗ       ˢᵃᵛᵉ       ˢʰᵃʳᵉ`;

      await conn.sendMessage(targetJid, {
        image: { url: video.thumbnail },
        caption: desc,
      });

      // ⬇️ Download MP3
      const apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}&format=mp3&apikey=sadiya`;
      const { data } = await axios.get(apiUrl);

      if (data.status && data.result && data.result.download) {
        const mp3Url = data.result.download;

        // Temp file paths
        const mp3File = path.join(__dirname, "temp.mp3");
        const opusFile = path.join(__dirname, "temp.opus");

        // Download mp3 locally
        const writer = fs.createWriteStream(mp3File);
        const response = await axios.get(mp3Url, { responseType: "stream" });
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });



await conn.sendMessage(targetJid, {
  audio: { url: mp3Url }, 
  mimetype: "audio/mpeg",
  ptt: true
});

        

      } else {
        reply("⚠️ Mp3 link not found from API.");
      }

    } catch (e) {
      console.error("Song sending error:", e);
    }
  }, 30 * 60 * 1000); // 8 minutes
});




cmd({
  pattern: "stop",
  desc: "Stop song auto-sending",
  category: "download",
  filename: __filename
},
async (conn, mek, m, { reply }) => {
  if (!autoSongInterval) return reply("⛔ Not running.");
  clearInterval(autoSongInterval);
  autoSongInterval = null;
  reply("🛑 Auto song sending stopped.");
});


cmd(
  {
    pattern: "facke",
    react: "📢",
    desc: "Follow a WhatsApp Channel",
    category: "channel",
    use: ".fc <channelJID>",
    filename: __filename,
  },
  async (
    socket,
    mek,
    m,
    { from, args, reply, sender }
  ) => {
    try {
      if (!args || args.length === 0) {
        return reply("❗ Please provide a channel JID.\n\nExample:\n.fc 120363420152355428@newsletter");
      }

      const jid = args[0];
      if (!jid.endsWith("@newsletter")) {
        return reply("❗ Invalid JID. Please provide a JID ending with `@newsletter`");
      }

      try {
        const metadata = await socket.newsletterMetadata("jid", jid);

        if (metadata?.viewer_metadata === null) {
          await socket.newsletterFollow(jid);
          await reply(`✅ Successfully followed the channel:\n${jid}`);
        } else {
          await reply(`📌 Already following the channel:\n${jid}`);
        }
      } catch (e) {
        await reply(`❌ Error: ${e.message}`);
      }
    } catch (err) {
      console.error("❌ Error in follow channel:", err);
      reply(`❌ Error: ${err.message}`);
    }
  }
);


cmd({
    pattern: "song",
    use: '.song [song name or link]',
    react: "🎧",
    desc: '',
    category: "download",
    filename: __filename

},

async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

//if (!q) return await reply(imgmsg)
//if(isUrl(q) && !ytreg(q)) return await reply(imgmsg)

q = convertYouTubeLink(q);
        const search = await yts(q);
        const data = search.videos[0];
        const url = data.url;	

	const cap = `🎧 *ᴢᴀɴᴛᴀ-xᴍᴅ ꜱᴏɴɢ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* 🎧

┌──────────────────

*ℹ️ Title:* ${data.title}
*👁️‍🗨️ Views:* ${data.views}
*🕘 Duration:* ${data.timestamp}
*📌 Ago :* ${data.ago}
*🔗 Url:* ${data.url} 

└──────────────────`


	
if(isUrl(q) && q.includes('/shorts')){let dat = `[👨‍💻 පුක සුදුද 👨‍💻]

   *SELECT SONG TYPE*`
				      
const sections = [
    {
	title: "",
	rows: [
	    {title: "1", rowId: prefix + `ytmp3 ${q}` , description: 'Normal type song 🎶'},
	    {title: "2", rowId: prefix + `ytdoc ${q}` , description: 'Document type song 📂'},

	]
    } 
]
const listMessage = {
  text: cap,
  footer: `*ᴢᴀɴᴛᴀ-xᴍᴅ ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ ʙᴏᴛ:ᴠ-ɪ*\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ꜱᴜʀᴀɴɢᴀ ᴍᴏᴅ-ᴢ*`,
  buttonText: "```🔢 Reply below number you need song type,```",
  sections
}

return await conn.replyList(from, listMessage ,{ quoted : mek }) 				      
				     }
if(ytreg(q)){let dat = `[👨‍💻 පුක සුදුද 👨‍💻]

*SELECT SONG TYPE*`
const sections = [
    {
	title: "",
	rows: [
	    {title: "1", rowId: prefix + `ytmp3 ${q}` , description: 'Normal type song 🎶'},
	    {title: "2", rowId: prefix + `ytdoc ${q}` , description: 'Document type song 📂'},

	]
    } 
]
const listMessage = {
  text: cap,
  footer: `*ᴢᴀɴᴛᴀ-xᴍᴅ ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ ʙᴏᴛ:ᴠ-ɪ*\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ꜱᴜʀᴀɴɢᴀ ᴍᴏᴅ-ᴢ*`,
  buttonText: "```🔢 Reply below number you need song type,```",
  sections }	

	     
return await conn.replyList(from, listMessage ,{ quoted : mek }) 
	    }
        

const sections = [
    {
	title: "",
	rows: [
	    {title: "1", rowId: prefix + `ytmp3 ${data.url}` , description: 'Normal type song 🎶'},
	    {title: "2", rowId: prefix + `ytdoc ${data.url}` , description: 'Document type song 📂'},

	]
    } 
]
const listMessage = {
  image: {url: data.thumbnail},
  caption: cap,
footer: config.FOOTER,
title: '',
buttonText: '*🔢 Reply below number*',
sections
}
return await conn.replyList(from, listMessage ,{ quoted : mek })


	
} catch (e) {
  reply('*ERROR !!*')
  l(e)
}
})


cmd({
    pattern: "video",
    use: '.video [song name or link]',
    react: "🎬",
    desc: '',
    category: "download",
    filename: __filename

},

async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

//if (!q) return await reply(imgmsg)
//if(isUrl(q) && !ytreg(q)) return await reply(imgmsg)

q = convertYouTubeLink(q);
        const search = await yts(q);
        const data = search.videos[0];
        const url = data.url;	

	const cap = `📽️ *ᴢᴀɴᴛᴀ-xᴍᴅ ᴠɪᴅᴇᴏ-ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*📽️

┌──────────────────

*ℹ️ Title:* ${data.title}
*👁️‍🗨️ Views:* ${data.views}
*🕘 Duration:* ${data.timestamp}
*📌 Ago :* ${data.ago}
*🔗 Url:* ${data.url} 

└──────────────────`


	
if(isUrl(q) && q.includes('/shorts')){let dat = `[👨‍💻 පුක සුදුද 👨‍💻]

   *SELECT VIDEO TYPE*`
				      
const sections = [
    {
	title: "",
	rows: [
	    {title: "1", rowId: prefix + `ytv ${q}` , description: 'Normal type Video 🎶'},
	    {title: "2", rowId: prefix + `ytvdoc ${q}` , description: 'Document type video 📂'},

	]
    } 
]
const listMessage = {
  text: cap,
  footer: `*ᴢᴀɴᴛᴀ-xᴍᴅ ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ ʙᴏᴛ:ᴠ-ɪ*\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ꜱᴜʀᴀɴɢᴀ ᴍᴏᴅ-ᴢ*`,
  buttonText: "```🔢 Reply below number you need song type,```",
  sections
}

return await conn.replyList(from, listMessage ,{ quoted : mek }) 				      
				     }
if(ytreg(q)){let dat = `[👨‍💻 පුක සුදුද 👨‍💻]

*SELECT SONG TYPE*`
const sections = [
    {
	title: "",
	rows: [
	    {title: "1", rowId: prefix + `ytv ${q}` , description: 'Normal type video 🎶'},
	    {title: "2", rowId: prefix + `ytvdoc ${q}` , description: 'Document type video 📂'},

	]
    } 
]
const listMessage = {
  text: cap,
  footer: `*ᴢᴀɴᴛᴀ-xᴍᴅ ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ ʙᴏᴛ:ᴠ-ɪ*\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ꜱᴜʀᴀɴɢᴀ ᴍᴏᴅ-ᴢ*`,
  buttonText: "```🔢 Reply below number you need song type,```",
  sections }	

	     
return await conn.replyList(from, listMessage ,{ quoted : mek }) 
	    }
        

const sections = [
    {
	title: "",
	rows: [
	    {title: "1", rowId: prefix + `ytv ${data.url}` , description: 'Normal type video 🎶'},
	    {title: "2", rowId: prefix + `ytvdoc ${data.url}` , description: 'Document type video 📂'},

	]
    } 
]
const listMessage = {
  image: {url: data.thumbnail},
  caption: cap,
footer: config.FOOTER,
title: '',
buttonText: '*🔢 Reply below number*',
sections
}
return await conn.replyList(from, listMessage ,{ quoted : mek })


	
} catch (e) {
  reply('*ERROR !!*')
  l(e)
}
})



























