cmd({
  pattern: "sinhalacard",
  desc: "Send two Sinhala slowed song cards side-by-side with buttons",
  category: "music",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  try {
    const search = await yts("sinhala slowed reverb song");
    const videos = search.videos.slice(0, 2); // දෙකක් පමණක්

    if (videos.length < 2) return reply("😢 Couldn’t find two songs!");

    // 🖼️ WhatsApp Template Message (cards style)
    const sections = [
      {
        title: "🎧 Sinhala Slowed Song Cards",
        rows: videos.map((v, i) => ({
          title: `${i + 1}. ${v.title}`,
          description: `🕒 ${v.timestamp} | 👁 ${v.views} views`,
          rowId: v.url,
        })),
      },
    ];

    const listMessage = {
      text: "🎶 *Choose your Sinhala Slowed Song below!*",
      footer: "Powered by ZANTA-XMD BOT",
      title: "🎵 Mind Relaxing Songs",
      buttonText: "🎧 Open Songs List",
      sections,
    };

    await conn.sendMessage(m.chat, listMessage);

    // 🖼️ Send two thumbnails like cards
    await conn.sendMessage(m.chat, {
      image: { url: videos[0].thumbnail },
      caption: `🎵 *${videos[0].title}*\n🔗 ${videos[0].url}`,
      footer: "Click below to copy / play",
      buttons: [
        { buttonId: `copy_${videos[0].url}`, buttonText: { displayText: "📋 Copy Link" }, type: 1 },
        { buttonId: `play_${videos[0].url}`, buttonText: { displayText: "▶️ Play" }, type: 1 },
      ],
      headerType: 4,
    });

    await conn.sendMessage(m.chat, {
      image: { url: videos[1].thumbnail },
      caption: `🎵 *${videos[1].title}*\n🔗 ${videos[1].url}`,
      footer: "Click below to copy / play",
      buttons: [
        { buttonId: `copy_${videos[1].url}`, buttonText: { displayText: "📋 Copy Link" }, type: 1 },
        { buttonId: `play_${videos[1].url}`, buttonText: { displayText: "▶️ Play" }, type: 1 },
      ],
      headerType: 4,
    });

  } catch (e) {
    console.log(e);
    reply("❌ Error sending Sinhala cards.");
  }
});