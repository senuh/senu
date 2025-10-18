const config = require("../settings");
const fs = require("fs");
const path = require("path");
const { cmd } = require("../lib/command");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

//───────────────────────────────
// 🧙‍♂️ PRIVACY MENU MAIN
//───────────────────────────────

cmd(
  {
    pattern: "privacy1",
    alias: ["privacymenu", "privmenu"],
    desc: "Full privacy settings control panel",
    category: "privacy",
    react: "🔐",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, sender, pushname, reply }) => {
    try {
      const menuText = `🔐 *Privacy Settings Center*

Hello *${pushname || "User"}* 👋  
Welcome to your privacy control panel.

📋 *Available Options:*
1️⃣ Blocklist  
2️⃣ Get Bio  
3️⃣ Set Profile Picture Privacy  
4️⃣ Set Online Privacy  
5️⃣ Update Bio  
6️⃣ Get Current Privacy  
7️⃣ Change Profile Picture  
8️⃣ Change Display Name  
9️⃣ Group Add Privacy  
🔟 Get Profile Picture`;

      await conn.sendMessage(
        from,
        {
          text: menuText,
          footer: "🧙‍♂️ ZANTA × MD OFC | Privacy Control",
          buttons: [
            { buttonId: ".blocklist", buttonText: { displayText: "📋 Blocklist" }, type: 1 },
            { buttonId: ".getbio", buttonText: { displayText: "💬 Get Bio" }, type: 1 },
            { buttonId: ".getprivacy", buttonText: { displayText: "🔍 View Privacy" }, type: 1 },
          ],
          sections: [
            {
              title: "🔐 Privacy Management Menu",
              rows: [
                { title: "📋 Blocklist", rowId: ".blocklist", description: "View blocked users" },
                { title: "💬 Get Bio", rowId: ".getbio", description: "Check user's WhatsApp bio" },
                { title: "🖼️ Set Profile Privacy", rowId: ".setppall all", description: "Set who can see profile picture" },
                { title: "🟢 Set Online Privacy", rowId: ".setonline all", description: "Set visibility of your online status" },
                { title: "✏️ Update Bio", rowId: ".updatebio Hello there!", description: "Change bot's about text" },
                { title: "🔍 View Current Privacy", rowId: ".getprivacy", description: "See all privacy settings" },
                { title: "🖼️ Change Bot Profile Picture", rowId: ".setpp", description: "Reply with an image to use as profile picture" },
                { title: "🏷️ Change Bot Display Name", rowId: ".setmyname My New Bot", description: "Update display name" },
                { title: "👥 Group Add Privacy", rowId: ".groupsprivacy contacts", description: "Control who can add bot to groups" },
                { title: "🧑‍🦰 Get User Profile Picture", rowId: ".getpp", description: "Fetch a user's profile photo" },
              ],
            },
          ],
          headerType: 4,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error(e);
      reply(`⚠️ Error: ${e.message}`);
    }
  }
);

//───────────────────────────────
// 📋 BLOCKLIST
//───────────────────────────────

cmd(
  {
    pattern: "blocklist",
    desc: "View the list of blocked users.",
    category: "privacy",
    react: "📋",
    filename: __filename,
  },
  async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 You are not the owner!*");
    try {
      const blockedUsers = await conn.fetchBlocklist();
      if (!blockedUsers.length) return reply("📋 Your block list is empty.");
      const list = blockedUsers.map((u, i) => `🚫 ${i + 1}. ${u.split("@")[0]}`).join("\n");
      reply(`📋 *Blocked Users (${blockedUsers.length}):*\n\n${list}`);
    } catch (err) {
      reply(`❌ Failed to fetch block list: ${err.message}`);
    }
  }
);

//───────────────────────────────
// 💬 GET BIO
//───────────────────────────────

cmd(
  {
    pattern: "getbio",
    desc: "Displays the user's bio.",
    category: "privacy",
    filename: __filename,
  },
  async (conn, mek, m, { args, reply }) => {
    try {
      const jid = args[0] || mek.key.remoteJid;
      const about = await conn.fetchStatus?.(jid);
      if (!about) return reply("No bio found.");
      reply(`🧾 *User Bio:*\n\n${about.status}`);
    } catch (e) {
      reply("⚠️ Error fetching bio.");
    }
  }
);

//───────────────────────────────
// 🖼️ SET PROFILE PRIVACY
//───────────────────────────────

cmd(
  {
    pattern: "setppall",
    desc: "Update Profile Picture Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename,
  },
  async (conn, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    try {
      const value = args[0] || "all";
      const valid = ["all", "contacts", "contact_blacklist", "none"];
      if (!valid.includes(value))
        return reply("❌ Invalid option. Use: all, contacts, contact_blacklist, none");
      await conn.updatePrivacySetting("profile", value);
      reply(`✅ Profile picture privacy set to *${value}*`);
    } catch (e) {
      reply(`❌ Error: ${e.message}`);
    }
  }
);

//───────────────────────────────
// 🟢 SET ONLINE PRIVACY
//───────────────────────────────

cmd(
  {
    pattern: "setonline",
    desc: "Update Online Privacy",
    category: "privacy",
    react: "🟢",
    filename: __filename,
  },
  async (conn, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    try {
      const value = args[0] || "all";
      const valid = ["all", "match_last_seen"];
      if (!valid.includes(value))
        return reply("❌ Invalid option. Use: all or match_last_seen");
      await conn.updatePrivacySetting("online", value);
      reply(`✅ Online privacy updated to *${value}*`);
    } catch (e) {
      reply(`⚠️ Error: ${e.message}`);
    }
  }
);

//───────────────────────────────
// 🖼️ SET PROFILE PICTURE
//───────────────────────────────

cmd(
  {
    pattern: "setpp",
    desc: "Set bot profile picture.",
    category: "privacy",
    react: "🖼️",
    filename: __filename,
  },
  async (conn, mek, m, { quoted, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted?.message?.imageMessage)
      return reply("❌ Please reply to an image.");
    try {
      const stream = await downloadContentFromMessage(
        quoted.message.imageMessage,
        "image"
      );
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      const file = path.join(__dirname, `${Date.now()}.jpg`);
      fs.writeFileSync(file, buffer);
      await conn.updateProfilePicture(conn.user.id, { url: `file://${file}` });
      fs.unlinkSync(file);
      reply("🖼️ Profile picture updated successfully!");
    } catch (e) {
      reply(`❌ Error: ${e.message}`);
    }
  }
);

//───────────────────────────────
// 🏷️ SET DISPLAY NAME
//───────────────────────────────

cmd(
  {
    pattern: "setmyname",
    desc: "Set your WhatsApp display name.",
    category: "privacy",
    react: "🏷️",
    filename: __filename,
  },
  async (conn, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    const name = args.join(" ");
    if (!name) return reply("❌ Provide a name.");
    try {
      await conn.updateProfileName(name);
      reply(`✅ Display name updated to: *${name}*`);
    } catch (e) {
      reply("❌ Failed to set name.");
    }
  }
);

//───────────────────────────────
// ✏️ UPDATE BIO
//───────────────────────────────

cmd(
  {
    pattern: "updatebio",
    desc: "Change the Bot's Bio (About).",
    category: "privacy",
    react: "✏️",
    filename: __filename,
  },
  async (conn, mek, m, { q, reply, isOwner }) => {
    if (!isOwner) return reply("🚫 Only owner can use this.");
    if (!q) return reply("❓ Enter new bio text.");
    if (q.length > 139) return reply("❗ Max 139 characters.");
    try {
      await conn.updateProfileStatus(q);
      reply("✅ Bio updated successfully!");
    } catch (e) {
      reply(`❌ Error: ${e.message}`);
    }
  }
);

//───────────────────────────────
// 👥 GROUP ADD PRIVACY
//───────────────────────────────

cmd(
  {
    pattern: "groupsprivacy",
    desc: "Update who can add bot to groups.",
    category: "privacy",
    react: "👥",
    filename: __filename,
  },
  async (conn, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    try {
      const value = args[0] || "all";
      const valid = ["all", "contacts", "contact_blacklist", "none"];
      if (!valid.includes(value))
        return reply("❌ Invalid option. Use: all, contacts, contact_blacklist, none");
      await conn.updatePrivacySetting("groupadd", value);
      reply(`✅ Group add privacy set to *${value}*`);
    } catch (e) {
      reply(`⚠️ Error: ${e.message}`);
    }
  }
);

//───────────────────────────────
// 🔍 GET PRIVACY SETTINGS
//───────────────────────────────

cmd(
  {
    pattern: "getprivacy",
    desc: "View all privacy settings.",
    category: "privacy",
    react: "🔍",
    filename: __filename,
  },
  async (conn, mek, m, { reply, isOwner, from }) => {
    if (!isOwner) return reply("🚫 Owner only.");
    try {
      const p = await conn.fetchPrivacySettings(true);
      if (!p) return reply("❌ Could not fetch privacy settings.");
      const msg = `
╭───「 PRIVACY SETTINGS 」───◆
│ 👀 Last Seen: ${p.last}
│ 🖼️ Profile Photo: ${p.profile}
│ 💬 Status: ${p.status}
│ 🟢 Online: ${p.online}
│ 👥 Group Add: ${p.groupadd}
│ 📞 Calls: ${p.calladd}
│ 📩 Read Receipts: ${p.readreceipts}
╰────────────────────`;
      conn.sendMessage(from, { text: msg }, { quoted: mek });
    } catch (e) {
      reply(`⚠️ Error: ${e.message}`);
    }
  }
);

//───────────────────────────────
// 🧑‍🦰 GET PROFILE PICTURE
//───────────────────────────────

cmd(
  {
    pattern: "getpp",
    desc: "Fetch a user's profile picture.",
    category: "privacy",
    react: "🧑‍🦰",
    filename: __filename,
  },
  async (conn, mek, m, { quoted, sender, reply }) => {
    try {
      const target =
        quoted?.sender || (m.mentionedJid && m.mentionedJid[0]) || sender;
      const url = await conn
        .profilePictureUrl(target, "image")
        .catch(() => null);
      if (!url) return reply("⚠️ No profile picture found.");
      await conn.sendMessage(m.chat, {
        image: { url },
        caption: "🖼️ Profile picture fetched successfully!",
      });
    } catch (e) {
      reply(`❌ Error: ${e.message}`);
    }
  }
);