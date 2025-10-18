const { cmd } = require('../lib/command')
const config = require('../settings')
const { get_set, input_set } = require('../lib/set_db')
const { getBuffer } = require('../lib/functions')
const fs = require('fs')

var BOTOW = config.LANG === 'SI' ? "ඔබ Bot's හිමිකරු හෝ උපපරිපාලක නොවේ !" : "You are not bot's owner or moderator !"

cmd({
  pattern: "settings2",
  react: "⚙️",
  desc: "Bot full settings control panel",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { from, reply, isMe, prefix }) => {
  try {
    if (!isMe) return reply(BOTOW)

    const settings = [
      { name: "Auto Voice", cmd: "autovoice" },
      { name: "Auto Sticker", cmd: "autosticker" },
      { name: "Auto Reply", cmd: "autoreply" },
      { name: "Auto Bio", cmd: "autobio" },
      { name: "Auto Status View", cmd: "autostatus" },
      { name: "Auto Typing", cmd: "autotyping" },
      { name: "Auto Recording", cmd: "autorecording" },
      { name: "Auto Read", cmd: "autoread" },
      { name: "Auto React", cmd: "autoreact" },
      { name: "Always Online", cmd: "alwaysonline" },
      { name: "Auto Block", cmd: "autoblock" },
      { name: "Auto Welcome", cmd: "autowelcome" },
      { name: "Anti Bot", cmd: "antibot" },
      { name: "Anti Link", cmd: "antilink" },
      { name: "Anti Bad", cmd: "antibad" },
      { name: "Anti Delete", cmd: "antidelete" },
      { name: "Anti Call", cmd: "anticall" },
      { name: "AI Image", cmd: "aiimage" },
      { name: "AI ChatBot", cmd: "aichatbot" },
      { name: "AI Maths", cmd: "mathsai" },
      { name: "Welcome", cmd: "welcome" },
      { name: "Owner React", cmd: "oreact" },
      { name: "Cmd Read", cmd: "cmdread" },
      { name: "Only Group", cmd: "onlygroup" },
      { name: "Only Me", cmd: "onlyme" },
      { name: "Mode", cmd: "mode" },
    ]

    let caption = `⚙️ *ZANTA-XMD SETTINGS PANEL*\n\n_Select a setting below and choose ON/OFF._\n\n👨‍💻 Powered by Mr Suranga | MOD-Z`

    // බටන් arrays
    const buttons = settings.map(s => ({
      title: s.name,
      rows: [
        {
          title: `${s.name} ON ✅`,
          id: `${prefix}${s.cmd} on`
        },
        {
          title: `${s.name} OFF ❌`,
          id: `${prefix}${s.cmd} off`
        }
      ]
    }))

    const msg = {
      image: { url: config.LOGO },
      caption,
      footer: config.FOOTER,
      title: '🧠 Bot Configuration Menu',
      buttonText: '📜 Open Settings',
      sections: buttons
    }

    await conn.replyList(from, msg, { quoted: mek })

  } catch (e) {
    console.log(e)
    reply('⚠️ Error while loading settings!')
  }
})