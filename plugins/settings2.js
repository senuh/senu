const { cmd } = require('../lib/command')
const config = require('../settings')
const { get_set , input_set } = require('../lib/set_db')
const fs = require('fs')
const path = require('path')

// Language texts
var BOTOW = (config.LANG === 'SI') ? "ඔබ Bot හිමිකරු හෝ උපපරිපාලක නොවේ !" : "You are not bot's owner or moderator !"
var N_FOUND = (config.LANG === 'SI') ? "මට කිසිවක් සොයාගත නොහැකි විය :(" : "I couldn't find anything :("
var alredy = (config.LANG === 'SI') ? "මෙම සැකසුම දැනටමත් යාවත්කාලීන කර ඇත !" : "This setting already updated !"

//===========================================================================

cmd({
  pattern: "settings",
  react: "⚙️",
  desc: "Show and manage bot settings",
  category: "main",
  use: '.settings',
  filename: __filename
},
async(conn, mek, m,{from, reply, isMe}) => {
try {
if (!isMe) return reply(BOTOW)

// Define all toggleable settings
const settingsList = [
  {name: "Bot Work Mode", cmd: "onlygroup"},
  {name: "Shutdown Mode", cmd: "disablepm"},
  {name: "Auto Voice", cmd: "autovoice"},
  {name: "Auto Sticker", cmd: "autosticker"},
  {name: "Auto Reply", cmd: "autoreply"},
  {name: "Auto Bio", cmd: "autobio"},
  {name: "Auto Status View", cmd: "autostatus"},
  {name: "Auto Typing", cmd: "autotyping"},
  {name: "Auto Recording", cmd: "autorecording"},
  {name: "Auto Read", cmd: "autoread"},
  {name: "Auto React", cmd: "autoreact"},
  {name: "Always Online", cmd: "alwaysonline"},
  {name: "Auto Block", cmd: "autoblock"},
  {name: "Auto Welcome", cmd: "autowelcome"},
  {name: "Anti Bot", cmd: "antibot"},
  {name: "Anti Link", cmd: "antilink"},
  {name: "Anti Bad", cmd: "antibad"},
  {name: "Anti Delete", cmd: "antidelete"},
  {name: "Anti Call", cmd: "anticall"},
  {name: "AI Image", cmd: "aiimage"},
  {name: "AI Chatbot", cmd: "aichatbot"},
  {name: "AI Maths", cmd: "mathsai"},
  {name: "Welcome", cmd: "welcome"},
  {name: "Owner React", cmd: "oreact"},
  {name: "Cmd Read", cmd: "cmdread"},
  {name: "Only Group", cmd: "onlygroup"},
  {name: "Only Me", cmd: "onlyme"},
  {name: "Mode", cmd: "mode"}
]

// Create buttons dynamically
const buttons = []
for (const set of settingsList) {
  buttons.push(
    {buttonId: `.${set.cmd} on`, buttonText: {displayText: `${set.name} ON 🔛`}, type: 1},
    {buttonId: `.${set.cmd} off`, buttonText: {displayText: `${set.name} OFF 🔒`}, type: 1}
  )
}

// Caption message
let caption = `👨‍💻 *ZANTA-XMD CONTROL PANEL*\n\n`
caption += `Use the buttons below to toggle bot features ON or OFF.\n`
caption += `━━━━━━━━━━━━━━━━━━\n`
caption += settingsList.map((x, i) => `*${i+1}.* ${x.name}`).join('\n')

// Send message with buttons
await conn.sendMessage(from, {
  image: {url: config.LOGO},
  caption: caption,
  footer: config.FOOTER || "ZANTA-XMD | Powered by MR SURANGA MOD-Z",
  buttons: buttons,
  headerType: 4
}, {quoted: mek})

} catch (e) {
console.log(e)
reply('❌ Error while opening settings panel!')
}
})