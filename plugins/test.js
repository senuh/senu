const config = require('../settings')
const fs = require('fs')
const prefix = config.PREFIX
const { cmd } = require('../lib/command')

cmd({
    pattern: "person1",
    react: "👤",
    alias: ["userinfo", "profile"],
    desc: "Get complete user profile information via menu",
    category: "utility",
    use: '.person [@tag or reply]',
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply, quoted, participants }) => {
    try {
        // 1️⃣ Determine Target User
        let userJid = quoted?.sender ||
                      mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                      sender;

        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ User not found on WhatsApp");

        // 2️⃣ Profile Picture
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        }

        // 3️⃣ Name
        let userName = userJid.split('@')[0];
        try {
            if (isGroup) {
                const member = participants.find(p => p.id === userJid);
                if (member?.notify) userName = member.notify;
            }
        } catch {}

        // 4️⃣ Bio / About Section
        let bio = {};
        try {
            const statusData = await conn.fetchStatus(userJid).catch(() => null);
            if (statusData?.status) {
                bio = {
                    text: statusData.status,
                    type: "Personal",
                    updated: statusData.setAt ? new Date(statusData.setAt * 1000) : null
                };
            } else {
                const businessProfile = await conn.getBusinessProfile(userJid).catch(() => null);
                if (businessProfile?.description) {
                    bio = {
                        text: businessProfile.description,
                        type: "Business",
                        updated: null
                    };
                }
            }
        } catch {}

        // 5️⃣ Group Role
        let groupRole = "";
        if (isGroup) {
            const participant = participants.find(p => p.id === userJid);
            groupRole = participant?.admin ? "👑 Admin" : "👥 Member";
        }

        // 6️⃣ Format Data
        const userInfo = `
*📛 Name:* ${userName}
🔢 *Number:* ${userJid.replace(/@.+/, '')}
📌 *Account Type:* ${user.isBusiness ? "💼 Business" : user.isEnterprise ? "🏢 Enterprise" : "👤 Personal"}
${isGroup ? `👥 *Group Role:* ${groupRole}` : ''}
`.trim();

        const formattedBio = bio.text
            ? `${bio.text}\n└─ 📌 ${bio.type} Bio${bio.updated ? ` | 🕒 ${bio.updated.toLocaleString()}` : ''}`
            : "No bio available";

        // 7️⃣ Define Menu Sections
        const sections = [
            {
                title: "🧊 User Information Menu",
                rows: [
                    {
                        title: "👤 Basic Info",
                        description: "View name, number, and account type",
                        rowId: `info_${userJid}`
                    },
                    {
                        title: "📝 Bio / About",
                        description: "View user's bio or business description",
                        rowId: `bio_${userJid}`
                    },
                    {
                        title: "🖼️ Profile Picture",
                        description: "View user's profile photo",
                        rowId: `pp_${userJid}`
                    },
                    {
                        title: "📇 Send Contact (vCard)",
                        description: "Save this user's contact",
                        rowId: `vcard_${userJid}`
                    }
                ]
            }
        ];

        // 8️⃣ Send List Menu
        const listMessage = {
            text: `👤 *Select what you want to view about this user:*`,
            footer: `${userName}`,
            title: "📋 Person Information Menu",
            buttonText: "Open Menu",
            sections,
            mentions: [userJid]
        };

        await conn.sendMessage(from, listMessage, { quoted: mek });

        // 9️⃣ Listen for user selection
        conn.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message?.listResponseMessage) return;
            const rowId = msg.message.listResponseMessage.singleSelectReply.selectedRowId;

            // Validate target
            if (!rowId.includes(userJid)) return;

            if (rowId === `info_${userJid}`) {
                await conn.sendMessage(from, { text: userInfo, mentions: [userJid] }, { quoted: msg });
            } 
            else if (rowId === `bio_${userJid}`) {
                await conn.sendMessage(from, { text: `📝 *User Bio:*\n${formattedBio}`, mentions: [userJid] }, { quoted: msg });
            } 
            else if (rowId === `pp_${userJid}`) {
                await conn.sendMessage(from, { image: { url: ppUrl }, caption: `🖼️ *${userName}'s Profile Picture*`, mentions: [userJid] }, { quoted: msg });
            } 
            else if (rowId === `vcard_${userJid}`) {
                const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${userName}\nTEL;type=CELL;type=VOICE;waid=${userJid.replace(/@.+/, '')}:${userJid.replace(/@.+/, '')}\nEND:VCARD`;
                await conn.sendMessage(from, {
                    contacts: {
                        displayName: userName,
                        contacts: [{ vcard }]
                    }
                }, { quoted: msg });
            }
        });

    } catch (e) {
        console.error("Person list menu error:", e);
        reply(`❌ Error: ${e.message || "Failed to fetch user info"}`);
    }
});