const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

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

// 🎧 Play Sinhala sad slowed song
async function playSinhalaSong(conn, from, reply, query) {
  try {
    const search = await yts(query);
    if (!search.videos.length) return reply("😢 ඒ නමින් song එකක් හොයාගන්න බැහැ!");

    const v = search.videos[0];
    const url = v.url;

    await reply(`🎧 *${v.title}* sad slowed version එක සකස් වෙමින් පවතී...`);

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
      ptt: true // voice note 🎤
    });

    fs.unlinkSync(tmpMp4);
    fs.unlinkSync(tmpOpus);
  } catch (err) {
    console.error(err);
    reply("⚠️ Song එක play වෙද්දි error එකක් ඇති!");
  }
}

// 🎵 .playlist — Sinhala Sad Vibe auto-update
cmd({
  pattern: "playlist",
  desc: "Show live Sinhala Sad slowed reverb playlist",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply, from }) => {
  try {
    await reply("😢 Sad vibe playlist එක load වෙමින් පවතී...");

    // YouTube search for sad vibe slowed songs
    const search = await yts("sinhala sad slowed reverb song");
    const songs = search.videos.slice(0, 8); // latest 8 sad songs

    if (!songs.length) return reply("😢 Sad songs playlist එක load වෙලා නැහැ!");

    const buttons = songs.map((song, i) => ({
      buttonId: `play_sad_${encodeURIComponent(song.title)}`,
      buttonText: { displayText: `🎧 ${i + 1}. ${song.title.slice(0, 25)}...` },
      type: 1,
    }));

    await conn.sendMessage(from, {
      text: "😔 *Sinhala Sad Vibe Slowed Playlist 🇱🇰*\n\n🪩 Mind-calming & emotional tracks 💔\n\nSelect a song below 👇",
      footer: "ZANTA-XMD Sad Vibe Player",
      buttons,
      headerType: 1
    });

  } catch (err) {
    console.error(err);
    reply("⚠️ Playlist එක load වෙද්දි error එකක් ඇති!");
  }
});

// 🎧 Handle Sad Playlist Button Clicks
cmd({
  onButton: true
}, async (conn, mek, m, { buttonId, reply, from }) => {
  if (buttonId.startsWith("play_sad_")) {
    const query = decodeURIComponent(buttonId.replace("play_sad_", ""));
    await playSinhalaSong(conn, from, reply, query + " sinhala sad slowed reverb song");
  }

  if (buttonId === "playlist_refresh_sad") {
    const search = await yts("sinhala sad slowed reverb song");
    const songs = search.videos.slice(0, 8);
    if (!songs.length) return reply("😢 Playlist එක refresh වෙලා නැහැ!");

    const buttons = songs.map((song, i) => ({
      buttonId: `play_sad_${encodeURIComponent(song.title)}`,
      buttonText: { displayText: `🎧 ${i + 1}. ${song.title.slice(0, 25)}...` },
      type: 1,
    }));

    await conn.sendMessage(from, {
      text: "🔁 *Updated Sinhala Sad Vibe Playlist* 😔\nSelect a song below 👇",
      footer: "ZANTA-XMD Sad Vibe Player",
      buttons,
      headerType: 1
    });
  }
});

// 🎵 .song — Sad song version too
cmd({
  pattern: "song",
  desc: "Play Sinhala sad slowed song with buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { args, reply, from }) => {
  const query = args.join(" ");
  if (!query) return reply("🎵 කරුණාකර සිංදුවේ නම type කරන්න (උදා: *.song Pahasara*)");

  await reply("😔 Sad song එක load වෙමින් පවතී...");

  const search = await yts(query + " sinhala sad slowed reverb song");
  if (!search.videos.length) return reply("😢 ඒ නමින් slowed song එකක් හොයාගන්න බැහැ!");

  const v = search.videos[0];
  const infoMsg = `💔 *${v.title}*\n🕒 ${v.timestamp}\n🔗 ${v.url}\n\n> Sinhala sad vibe slowed reverb song 😔`;

  const buttons = [
    { buttonId: `play_sad_${encodeURIComponent(v.title)}`, buttonText: { displayText: "🎧 Play Sad Song" }, type: 1 },
    { buttonId: "playlist_refresh_sad", buttonText: { displayText: "🔁 Sad Playlist" }, type: 1 },
  ];

  await conn.sendMessage(from, {
    image: { url: v.thumbnail },
    caption: infoMsg,
    footer: "Tap 🎧 to listen or 🔁 for playlist",
    buttons,
    headerType: 4
  });
});