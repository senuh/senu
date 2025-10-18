const { cmd } = require('../lib/command')
const config = require('../settings')

cmd({
    pattern: "settings",
    react: "⚙️",
    desc: "Display full settings list menu",
    category: "main",
    use: '.settings',
    filename: __filename
}, async (conn, mek, m, { from, isMe, reply }) => {
    try {
        if (!isMe) return reply(config.LANG === 'SI' ? "*ඔබ Bot හිමිකරු නොවේ!*" : "*You are not the bot owner!*")

        const sections = [
            {
                title: "🧩 BOT CONTROL",
                rows: [
                    { title: "🤖 Private Mode ON", rowId: ".onlygroup on" },
                    { title: "🌐 Public Mode OFF", rowId: ".onlygroup off" },
                    { title: "🛑 Disable PM", rowId: ".disablepm on" },
                    { title: "✅ Enable PM", rowId: ".disablepm off" },
                ]
            },
            {
                title: "🎛️ AUTO FEATURES",
                rows: [
                    { title: "💬 Auto Reply ON", rowId: ".autoreply on" },
                    { title: "💬 Auto Reply OFF", rowId: ".autoreply off" },
                    { title: "🖼️ Auto Sticker ON", rowId: ".autosticker on" },
                    { title: "🖼️ Auto Sticker OFF", rowId: ".autosticker off" },
                    { title: "🎤 Auto Voice ON", rowId: ".autovoice on" },
                    { title: "🎤 Auto Voice OFF", rowId: ".autovoice off" },
                    { title: "📜 Auto Bio ON", rowId: ".autobio on" },
                    { title: "📜 Auto Bio OFF", rowId: ".autobio off" },
                    { title: "📲 Auto Status ON", rowId: ".autostatus on" },
                    { title: "📲 Auto Status OFF", rowId: ".autostatus off" },
                ]
            },
            {
                title: "🧠 AI FEATURES",
                rows: [
                    { title: "🤖 AI Chatbot ON", rowId: ".aichatbot on" },
                    { title: "🤖 AI Chatbot OFF", rowId: ".aichatbot off" },
                    { title: "🧮 Maths AI ON", rowId: ".mathsai on" },
                    { title: "🧮 Maths AI OFF", rowId: ".mathsai off" },
                    { title: "🎨 AI Image ON", rowId: ".aiimage on" },
                    { title: "🎨 AI Image OFF", rowId: ".aiimage off" },
                ]
            },
            {
                title: "🚫 PROTECTION SETTINGS",
                rows: [
                    { title: "🔗 Anti Link ON", rowId: ".antilink on" },
                    { title: "🔗 Anti Link OFF", rowId: ".antilink off" },
                    { title: "💀 Anti Bad ON", rowId: ".antibad on" },
                    { title: "💀 Anti Bad OFF", rowId: ".antibad off" },
                    { title: "🗑️ Anti Delete ON", rowId: ".antidelete on" },
                    { title: "🗑️ Anti Delete OFF", rowId: ".antidelete off" },
                    { title: "📞 Anti Call ON", rowId: ".anticall on" },
                    { title: "📞 Anti Call OFF", rowId: ".anticall off" },
                    { title: "🤖 Anti Bot ON", rowId: ".antibot on" },
                    { title: "🤖 Anti Bot OFF", rowId: ".antibot off" },
                ]
            },
            {
                title: "👋 WELCOME / STATUS",
                rows: [
                    { title: "👋 Auto Welcome ON", rowId: ".autowelcome on" },
                    { title: "👋 Auto Welcome OFF", rowId: ".autowelcome off" },
                    { title: "🪪 Welcome Msg ON", rowId: ".welcome on" },
                    { title: "🪪 Welcome Msg OFF", rowId: ".welcome off" },
                ]
            },
            {
                title: "⚡ REACTIONS / OWNER SETTINGS",
                rows: [
                    { title: "👑 Owner React ON", rowId: ".oreact on" },
                    { title: "👑 Owner React OFF", rowId: ".oreact off" },
                    { title: "😎 Auto React ON", rowId: ".autoreact on" },
                    { title: "😎 Auto React OFF", rowId: ".autoreact off" },
                    { title: "🕒 CMD Read ON", rowId: ".cmdread on" },
                    { title: "🕒 CMD Read OFF", rowId: ".cmdread off" },
                ]
            },
            {
                title: "🔐 MODE SETTINGS",
                rows: [
                    { title: "👥 Only Group Mode ON", rowId: ".onlygroup on" },
                    { title: "👥 Only Group Mode OFF", rowId: ".onlygroup off" },
                    { title: "🙋 Only Me Mode ON", rowId: ".onlyme on" },
                    { title: "🙋 Only Me Mode OFF", rowId: ".onlyme off" },
                    { title: "⚙️ Button Mode ON", rowId: ".mode on" },
                    { title: "⚙️ Button Mode OFF", rowId: ".mode off" },
                ]
            },
            {
                title: "📡 SYSTEM OPTIONS",
                rows: [
                    { title: "🧾 View Current Status", rowId: ".status" },
                    { title: "📚 Main Menu", rowId: ".menu" },
                    { title: "⚡ Bot Speed", rowId: ".ping" },
                ]
            }
        ]

        const listMessage = {
            text: `⚙️ *ZANTA-XMD SETTINGS PANEL*  
Select a setting from the list below to turn ON or OFF.`,
            footer: config.FOOTER || "ZANTA-XMD BOT SYSTEM",
            title: "👨‍💻 *Full Settings Control Menu*",
            buttonText: "📜 Open Settings List",
            sections
        }

        await conn.sendMessage(from, listMessage, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply("*Error while opening list settings menu!*")
    }
})