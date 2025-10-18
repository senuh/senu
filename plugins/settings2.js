const { cmd } = require('../lib/command')
const config = require('../settings')

cmd({
    pattern: "settings2",
    react: "⚙️",
    desc: "Display Bot Settings Menu (Button List)",
    category: "main",
    use: '.settings',
    filename: __filename
}, async (conn, mek, m, { from, isMe, reply }) => {
    try {
        if (!isMe) return reply(config.LANG === 'SI' ? "*ඔබ Bot හිමිකරු නොවේ!*" : "*You are not the bot owner!*")

        const caption = `⚙️ *ZANTA-XMD SETTINGS MENU*

👨‍💻 Powered by MR SURANGA | MOD-Z
━━━━━━━━━━━━━━━━━━
Select any setting below 👇`

        const sections = [
            {
                title: "🧩 BOT CONTROL SETTINGS",
                rows: [
                    { title: "🤖 Bot Private Mode", rowId: ".onlygroup on", description: "Turn Bot to Private" },
                    { title: "🌐 Bot Public Mode", rowId: ".onlygroup off", description: "Turn Bot to Public" },
                    { title: "🛑 Shutdown Bot", rowId: ".disablepm on", description: "Disable Bot in PM" },
                    { title: "✅ Enable Bot", rowId: ".disablepm off", description: "Enable Bot in PM" },
                ]
            },
            {
                title: "🎛️ AUTO FEATURES",
                rows: [
                    { title: "🎤 Auto Voice", rowId: ".autovoice on", description: "Enable auto voice" },
                    { title: "🖼️ Auto Sticker", rowId: ".autosticker on", description: "Enable auto sticker" },
                    { title: "💬 Auto Reply", rowId: ".autoreply on", description: "Enable auto reply" },
                    { title: "📜 Auto Bio", rowId: ".autobio on", description: "Enable auto bio" },
                    { title: "📲 Auto Status View", rowId: ".autostatus on", description: "Enable auto status view" },
                ]
            },
            {
                title: "🧠 AI FEATURES",
                rows: [
                    { title: "🤖 AI Chatbot", rowId: ".aichatbot on", description: "Enable AI chat" },
                    { title: "🧮 AI Maths", rowId: ".mathsai on", description: "Enable AI Maths" },
                    { title: "🎨 AI Image", rowId: ".aiimage on", description: "Enable AI Image generation" },
                ]
            },
            {
                title: "🚫 PROTECTION SETTINGS",
                rows: [
                    { title: "🔗 Anti Link", rowId: ".antilink on", description: "Block links in groups" },
                    { title: "💀 Anti Bad", rowId: ".antibad on", description: "Block bad words" },
                    { title: "📴 Anti Delete", rowId: ".antidelete on", description: "Stop message delete" },
                    { title: "📞 Anti Call", rowId: ".anticall on", description: "Block incoming calls" },
                    { title: "🤖 Anti Bot", rowId: ".antibot on", description: "Block other bots" },
                ]
            },
            {
                title: "👋 WELCOME / STATUS",
                rows: [
                    { title: "👋 Auto Welcome", rowId: ".autowelcome on", description: "Welcome new users" },
                    { title: "🪪 Welcome Message", rowId: ".welcome on", description: "Enable welcome message" },
                ]
            },
            {
                title: "⚡ OWNER & REACTION SETTINGS",
                rows: [
                    { title: "👑 Owner React", rowId: ".oreact on", description: "Enable Owner React" },
                    { title: "😎 Auto React", rowId: ".autoreact on", description: "Enable Auto Reaction" },
                    { title: "🕒 Cmd Read", rowId: ".cmdread on", description: "Enable command read receipts" },
                ]
            },
            {
                title: "🔐 MODE SETTINGS",
                rows: [
                    { title: "👥 Only Group Mode", rowId: ".onlygroup on", description: "Bot works only in groups" },
                    { title: "🙋‍♂️ Only Me Mode", rowId: ".onlyme on", description: "Owner-only mode" },
                    { title: "⚙️ Button Mode", rowId: ".mode on", description: "Enable Button Mode" },
                ]
            },
        ]

        const listMessage = {
            title: '',
            text: caption,
            footer: config.FOOTER || "ZANTA-XMD Bot",
            buttonText: "📋 Open Settings Menu",
            sections,
            buttons: [
                { buttonId: '.status', buttonText: { displayText: '🧾 View Current Status' }, type: 1 },
                { buttonId: '.menu', buttonText: { displayText: '📚 Main Menu' }, type: 1 },
                { buttonId: '.ping', buttonText: { displayText: '⚡ Bot Status' }, type: 1 },
            ],
            image: { url: config.LOGO },
            headerType: 4
        }

        await conn.sendMessage(from, listMessage, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply("*Error while opening settings menu!*")
    }
})