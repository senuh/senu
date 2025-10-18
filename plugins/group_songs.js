const { cmd } = require('../lib/command');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// 🌀 Convert & Add Slowed + Reverb effects, output Opus (Voice note)
async function makeVoiceNote(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioFilters([
        'asetrate=44100*0.85',   // slowed
        'atempo=1.1',            // adjust timing
        'aecho=0.8:0.9:1000:0.3',// reverb
        'volume=1.3'             // volume boost
      ])
      .audioCodec('libopus')
      .audioBitrate('64k')
      .format('opus')
      .on('end', resolve)
      .on('error', reject)
      .save(output);
  });
}

// 🎧 Download + process song
async function playSong(conn, from, reply, query) {
  try {
    const search = await yts(query);
    if (!search.videos.length) return reply("😢 ඒ නමින් slowed song එකක් හොයාගන්න බැහැ!");

    const v = search.videos[0];
    await reply(`🎧 *${v.title}* එක සකස් වෙමින් පවතී...`);

    const tmpMp4 = path.join(__dirname, `${Date.now()}.mp4`);
    const tmpOpus = path.join(__dirname, `${Date.now()}.opus`);

    const stream = ytdl(v.url, { filter: 'audioonly', quality: 'highestaudio' });
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(tmpMp4);
      stream.pipe(file);
      file.on('finish', resolve);
      file.on('error', reject);
    });

    await makeVoiceNote(tmpMp4, tmpOpus);

    await conn.sendMessage(from, {
      audio: fs.readFileSync(tmpOpus),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true // ✅ Voice Note bubble style
    });

    fs.unlinkSync(tmpMp4);
    fs.unlinkSync(tmpOpus);
  } catch (err) {
    console.error(err);
    reply("⚠️ Song එක play වෙද්දි error එකක් ඇති!");
  }
}

// 🔁 Send playlist (Sad ❤️ Love)
async function sendPlaylist(conn, from, reply, mood) {
  try {
    const searchQuery = mood === 'sad' ? 'sinhala sad slowed reverb song' : 'sinhala love slowed reverb song';
    const title = mood === 'sad' ? '😢 Sinhala Sad Vibe Playlist' : '❤️ Sinhala Love Vibe Playlist';
    const footer = '🎧 ZANTA-XMD Slowed Player';

    await reply(`${title} එක load වෙමින් පවතී...`);

    const search = await yts(searchQuery);
    const songs = search.videos.slice(0, 8);
    if (!songs.length) return reply("😢 Playlist එක load වෙලා නැහැ!");

    const buttons = songs.map((song, i) => ({
      buttonId: `play_${mood}_${encodeURIComponent(song.title)}`,
      buttonText: { displayText: `🎵 ${i + 1}. ${song.title.slice(0, 25)}...` },
      type: 1
    }));

    buttons.push({
      buttonId: mood === "sad" ? "switch_love" : "switch_sad",
      buttonText: { displayText: mood === "sad" ? "❤️ Switch to Love Mode" : "😢 Switch to Sad Mode" },
      type: 1
    });

    await conn.sendMessage(from, {
      text: `${title}\n\n🎶 Mind-calming Sinhala slowed reverb songs.`,
      footer,
      buttons,
      headerType: 1
    });
  } catch (err) {
    console.error(err);
    reply("⚠️ Playlist එක load වෙද්දි error එකක් ඇති!");
  }
}

// 🎵 .playlist — start from Sad mode
cmd({
  pattern: "playlist",
  desc: "Show Sinhala Sad/Love slowed playlist",
  category: "music",
  filename: __filename
}, async (conn, mek, m, { reply, from }) => {
  await sendPlaylist(conn, from, reply, 'sad');
});

// 🎧 Handle buttons
cmd({
  onButton: true
}, async (conn, mek, m, { buttonId, reply, from }) => {
  if (buttonId.startsWith('play_sad_')) {
    const query = decodeURIComponent(buttonId.replace('play_sad_', ''));
    await playSong(conn, from, reply, query + ' sinhala sad slowed reverb song');
  }
  if (buttonId.startsWith('play_love_')) {
    const query = decodeURIComponent(buttonId.replace('play_love_', ''));
    await playSong(conn, from, reply, query + ' sinhala love slowed reverb song');
  }
  if (buttonId === 'switch_love') {
    await sendPlaylist(conn, from, reply, 'love');
  }
  if (buttonId === 'switch_sad') {
    await sendPlaylist(conn, from, reply, 'sad');
  }
});

// 🎶 .song — choose mood + voice note version
cmd({
  pattern: "song",
  desc: "Play Sinhala slowed song (Sad ❤️ Love)",
  category: "music",
  filename: __filename
}, async (conn, mek, m, { args, reply, from }) => {
  const query = args.join(" ");
  if (!query) return reply("🎵 කරුණාකර සිංදුවේ නම type කරන්න (උදා: *.song Pahasara*)");

  const buttons = [
    { buttonId: `play_sad_${encodeURIComponent(query)}`, buttonText: { displayText: "😢 Play Sad Version" }, type: 1 },
    { buttonId: `play_love_${encodeURIComponent(query)}`, buttonText: { displayText: "❤️ Play Love Version" }, type: 1 },
    { buttonId: "switch_love", buttonText: { displayText: "🔁 Open Playlist" }, type: 1 },
  ];

  await conn.sendMessage(from, {
    text: `🎧 Sinhala Slowed Reverb Song Finder 🇱🇰\n\n🎶 *${query}*\nMood එක තෝරන්න 👇`,
    footer: "ZANTA-XMD Dual Mood Player",
    buttons,
    headerType: 1
  });
});