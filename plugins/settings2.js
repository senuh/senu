const { cmd } = require('../lib/command');
const config = require('../settings');

cmd({
    pattern: "settings2",
    react: "⚙️",
    desc: "Show all bot settings with toggle buttons",
    category: "main",
    use: '.settings',
    filename: __filename
}, async (conn, mek, m, { from, isMe, reply }) => {
    try {
        if (!isMe) return reply(config.LANG === 'SI' ? "*ඔබ Bot හිමිකරු නොවේ!*" : "*You are not the bot owner!*");

        const isSinhala = config.LANG === 'SI';
        const t = (si, en) => isSinhala ? si : en;

        let caption = t(
`⚙️ *ZANTA-XMD සැකසුම් මෙනුව*  
ඔබට අවශ්‍ය Setting එක ON/ OFF කිරීමට බටන් මත ඔබන්න 👇`,
`⚙️ *ZANTA-XMD Settings Menu*  
Click buttons below to toggle each feature 👇`
        );

        const buttons = [
            // 1 - Bot Mode
            { buttonId: '.onlygroup on', buttonText: { displayText: '🔒 Private Mode ON' }, type: 1 },
            { buttonId: '.onlygroup off', buttonText: { displayText: '🔓 Public Mode OFF' }, type: 1 },

            // 2 - Shutdown
            { buttonId: '.disablepm on', buttonText: { displayText: '💤 Bot Shutdown ON' }, type: 1 },
            { buttonId: '.disablepm off', buttonText: { displayText: '🚀 Bot Active OFF' }, type: 1 },

            // 3 - Auto Voice
            { buttonId: '.autovoice on', buttonText: { displayText: '🎙️ Auto Voice ON' }, type: 1 },
            { buttonId: '.autovoice off', buttonText: { displayText: '🎙️ Auto Voice OFF' }, type: 1 },

            // 4 - Auto Sticker
            { buttonId: '.autosticker on', buttonText: { displayText: '🖼️ Auto Sticker ON' }, type: 1 },
            { buttonId: '.autosticker off', buttonText: { displayText: '🖼️ Auto Sticker OFF' }, type: 1 },

            // 5 - Auto Reply
            { buttonId: '.autoreply on', buttonText: { displayText: '💬 Auto Reply ON' }, type: 1 },
            { buttonId: '.autoreply off', buttonText: { displayText: '💬 Auto Reply OFF' }, type: 1 },

            // 6 - Auto Bio
            { buttonId: '.autobio on', buttonText: { displayText: '📱 Auto Bio ON' }, type: 1 },
            { buttonId: '.autobio off', buttonText: { displayText: '📱 Auto Bio OFF' }, type: 1 },

            // 7 - Auto Status
            { buttonId: '.autostatus on', buttonText: { displayText: '📶 Auto Status ON' }, type: 1 },
            { buttonId: '.autostatus off', buttonText: { displayText: '📶 Auto Status OFF' }, type: 1 },

            // 8 - Auto Typing
            { buttonId: '.autotyping on', buttonText: { displayText: '⌨️ Auto Typing ON' }, type: 1 },
            { buttonId: '.autotyping off', buttonText: { displayText: '⌨️ Auto Typing OFF' }, type: 1 },

            // 9 - Auto Recording
            { buttonId: '.autorecording on', buttonText: { displayText: '🎧 Auto Recording ON' }, type: 1 },
            { buttonId: '.autorecording off', buttonText: { displayText: '🎧 Auto Recording OFF' }, type: 1 },

            // 10 - Auto Read
            { buttonId: '.autoread on', buttonText: { displayText: '📖 Auto Read ON' }, type: 1 },
            { buttonId: '.autoread off', buttonText: { displayText: '📖 Auto Read OFF' }, type: 1 },

            // 11 - Auto React
            { buttonId: '.autoreact on', buttonText: { displayText: '😎 Auto React ON' }, type: 1 },
            { buttonId: '.autoreact off', buttonText: { displayText: '😎 Auto React OFF' }, type: 1 },

            // 12 - Always Online
            { buttonId: '.alwaysonline on', buttonText: { displayText: '🌐 Always Online ON' }, type: 1 },
            { buttonId: '.alwaysonline off', buttonText: { displayText: '🌐 Always Online OFF' }, type: 1 },

            // 13 - Auto Block
            { buttonId: '.autoblock on', buttonText: { displayText: '🚫 Auto Block ON' }, type: 1 },
            { buttonId: '.autoblock off', buttonText: { displayText: '🚫 Auto Block OFF' }, type: 1 },

            // 14 - Auto Welcome
            { buttonId: '.autowelcome on', buttonText: { displayText: '👋 Auto Welcome ON' }, type: 1 },
            { buttonId: '.autowelcome off', buttonText: { displayText: '👋 Auto Welcome OFF' }, type: 1 },

            // 15 - Anti Bot
            { buttonId: '.antibot on', buttonText: { displayText: '🤖 AntiBot ON' }, type: 1 },
            { buttonId: '.antibot off', buttonText: { displayText: '🤖 AntiBot OFF' }, type: 1 },

            // 16 - Anti Link
            { buttonId: '.antilink on', buttonText: { displayText: '🔗 AntiLink ON' }, type: 1 },
            { buttonId: '.antilink off', buttonText: { displayText: '🔗 AntiLink OFF' }, type: 1 },

            // 17 - Anti Bad
            { buttonId: '.antibad on', buttonText: { displayText: '🚯 AntiBad ON' }, type: 1 },
            { buttonId: '.antibad off', buttonText: { displayText: '🚯 AntiBad OFF' }, type: 1 },

            // 18 - Anti Delete
            { buttonId: '.antidelete on', buttonText: { displayText: '🗑️ AntiDelete ON' }, type: 1 },
            { buttonId: '.antidelete off', buttonText: { displayText: '🗑️ AntiDelete OFF' }, type: 1 },

            // 19 - Anti Call
            { buttonId: '.anticall on', buttonText: { displayText: '📞 AntiCall ON' }, type: 1 },
            { buttonId: '.anticall off', buttonText: { displayText: '📞 AntiCall OFF' }, type: 1 },

            // 20 - AI Image
            { buttonId: '.aiimage on', buttonText: { displayText: '🧠 AI Image ON' }, type: 1 },
            { buttonId: '.aiimage off', buttonText: { displayText: '🧠 AI Image OFF' }, type: 1 },

            // 21 - AI Chatbot
            { buttonId: '.aichatbot on', buttonText: { displayText: '💡 AI Chatbot ON' }, type: 1 },
            { buttonId: '.aichatbot off', buttonText: { displayText: '💡 AI Chatbot OFF' }, type: 1 },

            // 22 - AI Maths
            { buttonId: '.mathsai on', buttonText: { displayText: '🧮 AI Maths ON' }, type: 1 },
            { buttonId: '.mathsai off', buttonText: { displayText: '🧮 AI Maths OFF' }, type: 1 },

            // 23 - Welcome
            { buttonId: '.welcome on', buttonText: { displayText: '🏠 Welcome ON' }, type: 1 },
            { buttonId: '.welcome off', buttonText: { displayText: '🏠 Welcome OFF' }, type: 1 },

            // 24 - Owner React
            { buttonId: '.oreact on', buttonText: { displayText: '👑 Owner React ON' }, type: 1 },
            { buttonId: '.oreact off', buttonText: { displayText: '👑 Owner React OFF' }, type: 1 },

            // 25 - Cmd Read
            { buttonId: '.cmdread on', buttonText: { displayText: '📜 CmdRead ON' }, type: 1 },
            { buttonId: '.cmdread off', buttonText: { displayText: '📜 CmdRead OFF' }, type: 1 },

            // 26 - OnlyGroup
            { buttonId: '.onlygroup on', buttonText: { displayText: '👥 OnlyGroup ON' }, type: 1 },
            { buttonId: '.onlygroup off', buttonText: { displayText: '👥 OnlyGroup OFF' }, type: 1 },

            // 27 - OnlyMe
            { buttonId: '.onlyme on', buttonText: { displayText: '🙋 OnlyMe ON' }, type: 1 },
            { buttonId: '.onlyme off', buttonText: { displayText: '🙋 OnlyMe OFF' }, type: 1 },

            // 28 - Mode
            { buttonId: '.mode on', buttonText: { displayText: '⚡ Button Mode ON' }, type: 1 },
            { buttonId: '.mode off', buttonText: { displayText: '⚡ Button Mode OFF' }, type: 1 },
        ];

        await conn.sendButtonMsg(from, {
            text: caption,
            footer: config.FOOTER,
            buttons,
            headerType: 4,
            image: { url: config.LOGO },
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply('*❌ Error occurred while showing settings!*');
    }
});