const { cmd } = require("../lib/command");
const fs = require("fs");
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

//===========================================================
// 🔐 PRIVACY LIST MENU (with buttons + sections)
//===========================================================

cmd({
    pattern: "privacy1",
    alias: ["privacymenu1"],
    desc: "Privacy menu with list buttons",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, pushname, reply }) => {
    try {
        const menuText = `👋 Hello *${pushname || "User"}*!
🔐 Welcome to *ZANTA × MD Privacy Center v1*

Use this interactive list to manage your bot's privacy settings safely.`;

        await conn.sendMessage(from, {
            text: menuText,
            footer: "🧙‍♂️ 𝐙𝐀𝐍𝐓𝐀 × 𝐌𝐃 𝐎𝐅𝐂 | Privacy System",
            title: "🔐 Privacy Control Panel v1",
            buttonText: "📋 OPEN PRIVACY MENU",
            sections: [
                {
                    title: "📋 View Privacy Info",
                    rows: [
                        { title: "🔍 View All Privacy Settings", rowId: ".getprivacy1", description: "Check all current privacy settings" },
                        { title: "📋 Blocked List", rowId: ".blocklist1", description: "View users blocked by the bot" },
                    ]
                },
                {
                    title: "⚙️ Update Privacy Options",
                    rows: [
                        { title: "🖼️ Set Profile Picture Privacy", rowId: ".setppall1 contacts", description: "Choose who can see the bot's profile picture" },
                        { title: "🟢 Set Online Privacy", rowId: ".setonline1 match_last_seen", description: "Hide or show online status" },
                        { title: "👥 Set Group Add Privacy", rowId: ".groupsprivacy1 contacts", description: "Choose who can add the bot to groups" },
                    ]
                },
                {
                    title: "✏️ Profile Updates",
                    rows: [
                        { title: "🏷️ Change Bot Name", rowId: ".setmyname1 ZANTA-MD", description: "Update your bot's WhatsApp name" },
                        { title: "💬 Update Bot Bio", rowId: ".updatebio1 Hello I’m ZANTA MD 🤖", description: "Set a new 'About' status" },
                        { title: "🖼️ Change Bot Profile Picture", rowId: ".setpp1", description: "Reply to an image and run this command" },
                    ]
                },
                {
                    title: "🧑‍🦰 User Tools",
                    rows: [
                        { title: "💬 Get User Bio", rowId: ".getbio1", description: "Fetch a user’s WhatsApp bio" },
                        { title: "🧑‍🦰 Get User Profile Picture", rowId: ".getpp1", description: "Fetch someone's profile picture" },
                    ]
                },
            ]
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`⚠️ Error while loading privacy menu:\n${e.message}`);
    }
});

//===========================================================
// 🧩 SUBCOMMANDS BELOW
//===========================================================

cmd({
    pattern: "blocklist1",
    desc: "View blocked users",
    category: "privacy",
    react: "📋",
    filename: __filename
}, 
async (conn, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply("🚫 Only the bot owner can use this.");
    try {
        const blocked = await conn.fetchBlocklist();
        if (!blocked || blocked.length === 0) return reply("✅ No blocked users found.");
        const list = blocked.map((u, i) => `${i + 1}. @${u.split("@")[0]}`).join("\n");
        await conn.sendMessage(m.chat, { text: `🚫 *Blocked Users:*\n\n${list}`, mentions: blocked }, { quoted: mek });
    } catch (e) {
        reply(`⚠️ Error: ${e.message}`);
    }
});

cmd({
    pattern: "getprivacy1",
    desc: "Show bot privacy settings",
    category: "privacy",
    react: "🔍",
    filename: __filename
}, 
async (conn, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply("🚫 Only the bot owner can use this.");
    try {
        const p = await conn.fetchPrivacySettings(true);
        if (!p) return reply("⚠️ Could not fetch privacy settings.");
        let txt = `╭───「 *Privacy Settings* 」───◆
│ 👀 Last Seen: ${p.last}
│ 🖼️ Profile Photo: ${p.profile}
│ 💬 Status: ${p.status}
│ 🟢 Online: ${p.online}
│ 👥 Group Add: ${p.groupadd}
│ 📞 Call Privacy: ${p.calladd}
│ 📩 Read Receipts: ${p.readreceipts}
╰────────────────────`;
        reply(txt);
    } catch (e) {
        reply(`⚠️ Error: ${e.message}`);
    }
});

cmd({
    pattern: "getbio1",
    desc: "Fetch user bio",
    category: "privacy",
    react: "💬",
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

cmd({
    pattern: "getpp1",
    desc: "Get profile pic of a user",
    category: "privacy",
    react: "🖼️",
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

cmd({
    pattern: "updatebio1",
    desc: "Update bot about text",
    category: "privacy",
    react: "✏️",
    filename: __filename
}, 
async (conn, mek, m, { q, reply, isOwner }) => {
    if (!isOwner) return reply("🚫 Only the owner can update the bio.");
    if (!q) return reply("❓ Please enter a new bio.");
    if (q.length > 139) return reply("❗ Bio text too long.");
    try {
        await conn.updateProfileStatus(q);
        reply("✅ Bio updated successfully!");
    } catch (e) {
        reply(`⚠️ Error: ${e.message}`);
    }
});