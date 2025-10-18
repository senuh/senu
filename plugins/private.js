const { cmd } = require("../lib/command");
const fs = require("fs");
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

//==============================================
// 🔐 PRIVACY MENU BUTTON + LIST
//==============================================

cmd({
    pattern: "privacy1",
    alias: ["privacymenu1"],
    desc: "Open Privacy Menu (v1)",
    category: "privacy",
    react: "🔐",
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {
    try {
        const menu = `👋 Hello *${pushname || "User"}*  
🔐 Welcome to *Privacy Control Panel v1*

📋 Choose an option below to manage your bot’s privacy settings.`;

        await conn.sendMessage(from, {
            text: menu,
            footer: "🧙‍♂️ ZANTA × MD OFC | Privacy Control v1",
            buttons: [
                { buttonId: ".blocklist1", buttonText: { displayText: "📋 Blocklist" }, type: 1 },
                { buttonId: ".getprivacy1", buttonText: { displayText: "🔍 View Privacy" }, type: 1 },
            ],
            viewOnce: true,
            sections: [{
                title: "🔐 Privacy Settings Menu v1",
                rows: [
                    { title: "💬 Get Bio", rowId: ".getbio1", description: "Get a user's WhatsApp bio" },
                    { title: "🖼️ Set Profile Privacy", rowId: ".setppall1 all", description: "Set profile picture privacy" },
                    { title: "🟢 Set Online Privacy", rowId: ".setonline1 all", description: "Set visibility of online status" },
                    { title: "✏️ Update Bio", rowId: ".updatebio1 Hello there!", description: "Change bot's about info" },
                    { title: "👥 Group Add Privacy", rowId: ".groupsprivacy1 contacts", description: "Control who can add bot to groups" },
                    { title: "🧑‍🦰 Get User Profile Picture", rowId: ".getpp1", description: "Fetch user's profile picture" },
                    { title: "🏷️ Change Bot Name", rowId: ".setmyname1 Zanta-MD", description: "Change bot display name" },
                    { title: "🖼️ Change Bot Profile Pic", rowId: ".setpp1", description: "Reply to an image to set as profile pic" },
                ],
            }],
            headerType: 4,
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`⚠️ Error while sending menu:\n${e.message}`);
    }
});

//==============================================
// 📋 BLOCKLIST
//==============================================

cmd({
    pattern: "blocklist1",
    desc: "Show blocked users",
    category: "privacy",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply("🚫 Only the bot owner can use this.");
    try {
        const blocked = await conn.fetchBlocklist();
        if (!blocked || !blocked.length) return reply("✅ No blocked users.");
        const text = blocked.map((u, i) => `${i + 1}. @${u.split("@")[0]}`).join("\n");
        await conn.sendMessage(m.chat, { text: `🚫 *Blocked Users:*\n\n${text}`, mentions: blocked }, { quoted: mek });
    } catch (e) {
        reply(`⚠️ Error: ${e.message}`);
    }
});

//==============================================
// 💬 GET BIO
//==============================================

cmd({
    pattern: "getbio1",
    desc: "Get a user's bio",
    category: "privacy",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const jid = args[0] || mek.key.remoteJid;
        const about = await conn.fetchStatus?.(jid);
        if (!about?.status) return reply("No bio found.");
        reply(`💬 *User Bio:* ${about.status}`);
    } catch (e) {
        reply("⚠️ Couldn't fetch bio.");
    }
});

//==============================================
// 🔍 GET PRIVACY
//==============================================

cmd({
    pattern: "getprivacy1",
    desc: "Show bot privacy settings",
    category: "privacy",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply("🚫 Only the owner can use this.");
    try {
        const data = await conn.fetchPrivacySettings(true);
        if (!data) return reply("⚠️ Could not fetch privacy settings.");

        let msg = `╭───「 *Privacy Settings v1* 」───◆
│ 👀 Last Seen: ${data.last}
│ 🖼️ Profile Photo: ${data.profile}
│ 💬 Status: ${data.status}
│ 🟢 Online: ${data.online}
│ 👥 Group Add: ${data.groupadd}
│ 📞 Call Privacy: ${data.calladd}
│ 📩 Read Receipts: ${data.readreceipts}
╰────────────────────`;
        reply(msg);
    } catch (e) {
        reply(`⚠️ Error fetching privacy:\n${e.message}`);
    }
});

//==============================================
// ✏️ UPDATE BIO
//==============================================

cmd({
    pattern: "updatebio1",
    desc: "Update bot's about section",
    category: "privacy",
    react: "✏️",
    filename: __filename
},
async (conn, mek, m, { q, reply, isOwner }) => {
    if (!isOwner) return reply("🚫 Only the bot owner can update bio.");
    if (!q) return reply("❓ Please provide new bio text.");
    if (q.length > 139) return reply("❗ Bio too long (max 139 chars).");
    try {
        await conn.updateProfileStatus(q);
        reply("✅ Bot bio updated successfully!");
    } catch (e) {
        reply(`⚠️ Error: ${e.message}`);
    }
});

//==============================================
// 🧑‍🦰 GET PROFILE PIC
//==============================================

cmd({
    pattern: "getpp1",
    desc: "Get a user's profile picture",
    category: "privacy",
    react: "🧑‍🦰",
    filename: __filename
},
async (conn, mek, m, { quoted, sender, reply }) => {
    try {
        const target = quoted?.sender || sender;
        const url = await conn.profilePictureUrl(target, "image").catch(() => null);
        if (!url) return reply("⚠️ No profile picture found.");
        await conn.sendMessage(m.chat, { image: { url }, caption: "🖼️ User Profile Picture" }, { quoted: mek });
    } catch (e) {
        reply(`⚠️ Error: ${e.message}`);
    }
});