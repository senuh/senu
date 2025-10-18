const { cmd } = require('../lib/command')
const config = require('../settings')

cmd({
    pattern: "settings2",
    react: "⚙️",
    desc: "Display Full Bot Settings Menu",
    category: "main",
    use: '.settings',
    filename: __filename
}, async (conn, mek, m, { from, isMe, reply }) => {
    try {
        if (!isMe) return reply(config.LANG === 'SI' ? "*ඔබ Bot හිමිකරු නොවේ!*" : "*You are not the bot owner!*")

        const caption = `
╭───────────────────
│ ⚙️ *ZANTA-XMD FULL SETTINGS MENU*
│ 👨‍💻 *Powered by MR SURANGA | MOD-Z*
╰───────────────────

📋 *Select a setting below using buttons or type commands manually.*

━━━━━━━━━━━━━━━━━━
🧩 *BOT CONTROL*
> 🤖 Private Mode — .onlygroup on  
> 🌐 Public Mode — .onlygroup off  
> 🛑 Shutdown Bot — .disablepm on  
> ✅ Enable Bot — .disablepm off

━━━━━━━━━━━━━━━━━━
🎛️ *AUTO FEATURES*
> 💬 Auto Reply — .autoreply on  
> 🖼️ Auto Sticker — .autosticker on  
> 🎤 Auto Voice — .autovoice on  
> 📜 Auto Bio — .autobio on  
> 📲 Auto Status View — .autostatus on  

━━━━━━━━━━━━━━━━━━
🧠 *AI FEATURES*
> 🤖 AI Chatbot — .aichatbot on  
> 🧮 AI Maths — .mathsai on  
> 🎨 AI Image — .aiimage on  

━━━━━━━━━━━━━━━━━━
🚫 *PROTECTION SETTINGS*
> 🔗 Anti Link — .antilink on  
> 💀 Anti Bad — .antibad on  
> 📴 Anti Delete — .antidelete on  
> 📞 Anti Call — .anticall on  
> 🤖 Anti Bot — .antibot on  

━━━━━━━━━━━━━━━━━━
👋 *WELCOME / STATUS*
> 👋 Auto Welcome — .autowelcome on  
> 🪪 Welcome Message — .welcome on  

━━━━━━━━━━━━━━━━━━
⚡ *REACTIONS / OWNER SETTINGS*
> 👑 Owner React — .oreact on  
> 😎 Auto React — .autoreact on  
> 🕒 Cmd Read — .cmdread on  

━━━━━━━━━━━━━━━━━━
🔐 *MODE SETTINGS*
> 👥 Only Group Mode — .onlygroup on  
> 🙋‍♂️ Only Me Mode — .onlyme on  
> ⚙️ Button Mode — .mode on  

━━━━━━━━━━━━━━━━━━
📡 *SYSTEM OPTIONS*
> 🧾 View Current Status — .status  
> 📚 Main Menu — .menu  
> ⚡ Bot Status — .ping
━━━━━━━━━━━━━━━━━━
`

        await conn.sendMessage(from, {
            image: { url: config.LOGO },
            caption: caption.trim(),
            footer: config.FOOTER || "ZANTA-XMD Bot System",
            buttons: [
                { buttonId: '.status', buttonText: { displayText: '🧾 View Status' }, type: 1 },
                { buttonId: '.menu', buttonText: { displayText: '📚 Main Menu' }, type: 1 },
                { buttonId: '.ping', buttonText: { displayText: '⚡ Bot Speed Test' }, type: 1 },
                { buttonId: '.onlygroup on', buttonText: { displayText: '🔒 Private Mode' }, type: 1 },
                { buttonId: '.onlygroup off', buttonText: { displayText: '🌐 Public Mode' }, type: 1 },
                { buttonId: '.autoreply on', buttonText: { displayText: '💬 Auto Reply ON' }, type: 1 },
                { buttonId: '.autosticker on', buttonText: { displayText: '🖼️ Auto Sticker ON' }, type: 1 },
                { buttonId: '.aichatbot on', buttonText: { displayText: '🤖 Enable AI Chatbot' }, type: 1 },
                { buttonId: '.antilink on', buttonText: { displayText: '🔗 Anti Link ON' }, type: 1 },
                { buttonId: '.antibad on', buttonText: { displayText: '💀 Anti Bad ON' }, type: 1 },
                { buttonId: '.autowelcome on', buttonText: { displayText: '👋 Auto Welcome ON' }, type: 1 },
                { buttonId: '.oreact on', buttonText: { displayText: '👑 Owner React ON' }, type: 1 },
            ],
            headerType: 4
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply("*Error while opening settings menu!*")
    }
})