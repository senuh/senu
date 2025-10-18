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

📋 *Tap a button to turn each feature ON or OFF.*
━━━━━━━━━━━━━━━━━━
`

        const buttons = [
            // 🧩 BOT CONTROL
            { buttonId: '.onlygroup on', buttonText: { displayText: '🤖 Private Mode ON' }, type: 1 },
            { buttonId: '.onlygroup off', buttonText: { displayText: '🌐 Public Mode OFF' }, type: 1 },
            { buttonId: '.disablepm on', buttonText: { displayText: '🛑 Disable Bot' }, type: 1 },
            { buttonId: '.disablepm off', buttonText: { displayText: '✅ Enable Bot' }, type: 1 },

            // 🎛️ AUTO FEATURES
            { buttonId: '.autoreply on', buttonText: { displayText: '💬 Auto Reply ON' }, type: 1 },
            { buttonId: '.autoreply off', buttonText: { displayText: '💬 Auto Reply OFF' }, type: 1 },
            { buttonId: '.autosticker on', buttonText: { displayText: '🖼️ Auto Sticker ON' }, type: 1 },
            { buttonId: '.autosticker off', buttonText: { displayText: '🖼️ Auto Sticker OFF' }, type: 1 },
            { buttonId: '.autovoice on', buttonText: { displayText: '🎤 Auto Voice ON' }, type: 1 },
            { buttonId: '.autovoice off', buttonText: { displayText: '🎤 Auto Voice OFF' }, type: 1 },
            { buttonId: '.autobio on', buttonText: { displayText: '📜 Auto Bio ON' }, type: 1 },
            { buttonId: '.autobio off', buttonText: { displayText: '📜 Auto Bio OFF' }, type: 1 },
            { buttonId: '.autostatus on', buttonText: { displayText: '📲 Auto Status ON' }, type: 1 },
            { buttonId: '.autostatus off', buttonText: { displayText: '📲 Auto Status OFF' }, type: 1 },

            // 🧠 AI FEATURES
            { buttonId: '.aichatbot on', buttonText: { displayText: '🤖 AI Chatbot ON' }, type: 1 },
            { buttonId: '.aichatbot off', buttonText: { displayText: '🤖 AI Chatbot OFF' }, type: 1 },
            { buttonId: '.mathsai on', buttonText: { displayText: '🧮 Maths AI ON' }, type: 1 },
            { buttonId: '.mathsai off', buttonText: { displayText: '🧮 Maths AI OFF' }, type: 1 },
            { buttonId: '.aiimage on', buttonText: { displayText: '🎨 AI Image ON' }, type: 1 },
            { buttonId: '.aiimage off', buttonText: { displayText: '🎨 AI Image OFF' }, type: 1 },

            // 🚫 PROTECTION SETTINGS
            { buttonId: '.antilink on', buttonText: { displayText: '🔗 Anti Link ON' }, type: 1 },
            { buttonId: '.antilink off', buttonText: { displayText: '🔗 Anti Link OFF' }, type: 1 },
            { buttonId: '.antibad on', buttonText: { displayText: '💀 Anti Bad ON' }, type: 1 },
            { buttonId: '.antibad off', buttonText: { displayText: '💀 Anti Bad OFF' }, type: 1 },
            { buttonId: '.antidelete on', buttonText: { displayText: '🗑️ Anti Delete ON' }, type: 1 },
            { buttonId: '.antidelete off', buttonText: { displayText: '🗑️ Anti Delete OFF' }, type: 1 },
            { buttonId: '.anticall on', buttonText: { displayText: '📞 Anti Call ON' }, type: 1 },
            { buttonId: '.anticall off', buttonText: { displayText: '📞 Anti Call OFF' }, type: 1 },
            { buttonId: '.antibot on', buttonText: { displayText: '🤖 Anti Bot ON' }, type: 1 },
            { buttonId: '.antibot off', buttonText: { displayText: '🤖 Anti Bot OFF' }, type: 1 },

            // 👋 WELCOME / STATUS
            { buttonId: '.autowelcome on', buttonText: { displayText: '👋 Auto Welcome ON' }, type: 1 },
            { buttonId: '.autowelcome off', buttonText: { displayText: '👋 Auto Welcome OFF' }, type: 1 },
            { buttonId: '.welcome on', buttonText: { displayText: '🪪 Welcome Msg ON' }, type: 1 },
            { buttonId: '.welcome off', buttonText: { displayText: '🪪 Welcome Msg OFF' }, type: 1 },

            // ⚡ REACTION / OWNER
            { buttonId: '.oreact on', buttonText: { displayText: '👑 Owner React ON' }, type: 1 },
            { buttonId: '.oreact off', buttonText: { displayText: '👑 Owner React OFF' }, type: 1 },
            { buttonId: '.autoreact on', buttonText: { displayText: '😎 Auto React ON' }, type: 1 },
            { buttonId: '.autoreact off', buttonText: { displayText: '😎 Auto React OFF' }, type: 1 },
            { buttonId: '.cmdread on', buttonText: { displayText: '🕒 CMD Read ON' }, type: 1 },
            { buttonId: '.cmdread off', buttonText: { displayText: '🕒 CMD Read OFF' }, type: 1 },

            // 🔐 MODE SETTINGS
            { buttonId: '.onlyme on', buttonText: { displayText: '🙋 Only Me Mode ON' }, type: 1 },
            { buttonId: '.onlyme off', buttonText: { displayText: '🙋 Only Me Mode OFF' }, type: 1 },
            { buttonId: '.mode on', buttonText: { displayText: '⚙️ Button Mode ON' }, type: 1 },
            { buttonId: '.mode off', buttonText: { displayText: '⚙️ Button Mode OFF' }, type: 1 },

            // 📡 SYSTEM
            { buttonId: '.status', buttonText: { displayText: '🧾 View Status' }, type: 1 },
            { buttonId: '.menu', buttonText: { displayText: '📚 Main Menu' }, type: 1 },
            { buttonId: '.ping', buttonText: { displayText: '⚡ Bot Speed' }, type: 1 },
        ]

        await conn.sendMessage(from, {
            image: { url: config.LOGO },
            caption: caption.trim(),
            footer: config.FOOTER || "ZANTA-XMD Bot System",
            buttons: buttons,
            headerType: 4
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply("*Error while opening settings menu!*")
    }
})