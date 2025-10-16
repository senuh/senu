const config = require('../settings')
const os = require('os')
const fs = require('fs')
const si = require('systeminformation')
const prefix = config.PREFIX
const simpleGit = require('simple-git')
const Levels = require("discord-xp")
const git = simpleGit()
const Heroku = require('heroku-client')
const appname = process.env.APP_NAME || ''
const herokuapi = process.env.HEROKU_API
const pingSt = new Date();
const { cmd, commands } = require('../lib/command')
const DB = require('../lib/scraper')
const owner = JSON.parse(fs.readFileSync('./lib/owner.json'))
const devlopernumber = "94760264995"
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson,clockString, jsonformat} = require('../lib/functions')
var { updateCMDStore,isbtnID,getCMDStore,getCmdForCmdId,connectdb,input,get, updb,updfb } = require("../lib/database")
const {
    default: makeWASocket,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
    proto
} = require('@whiskeysockets/baileys')


 function genMsgId() {
  const prefix = "3EB";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomText = prefix;

  for (let i = prefix.length; i < 22; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomText += characters.charAt(randomIndex);
  }

  return randomText;
} 

const reportedMessages = {}
//const isBan = banUser.includes(mek.sender)
	    
	
var BOTOW = ''
if(config.LANG === 'SI') BOTOW = "*ඔබ Bot\'s හිමිකරු හෝ  උපපරිපාලක නොවේ !*"
else BOTOW = "*You are not bot\'s owner or moderator !*"
//============================================================================

const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive3",
    alias: ["alive", "online"],
    desc: "Bot online test",
    react: "⚡",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let cap = `
╭━━〔${new Date().getHours() < 12 ? '*🌄 සුබ උදෑසනක් 🌄*' : '*🌛 සුබ රාත්‍රියක්  🌛*'}〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *⛩️ 𝐎𝐰𝐧𝐞𝐫: ® 𝐂𝐘𝐁𝐄𝐑 𝐃𝐈𝐍𝐔 𝐈𝐃☺️*
┃◈└───────────┈⊷
╰──────────────┈
┏━❮ ⛩️ 𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐃𝐄𝐓𝐀𝐋𝐄𝐒 ⛩️ ❯━
┃◈┃🤖 ʙᴏᴛ ɴᴀᴍᴇ :SOLO-LEVELING
┃◈┃🔖 ᴠᴇʀsɪᴏɴ : 2.0
┃◈┃📟 ᴘʟᴀᴛғᴏʀᴍ : Linux
┃◈┃👨‍💻ᴏᴡɴᴇʀ: 𝐂𝐘𝐁𝐄𝐑 𝐃𝐈𝐍𝐔 𝐈𝐃 ⛩️
┃◈┃📆 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())} 
┃◈┃📈ʀᴀᴍ ᴜsᴀɢᴇ: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
┃◈┗━━━━━━━━━━━━━━𖣔𖣔
╰──────────────┈⊷
┏━❮🔢𝗥𝗘𝗟𝗣𝗬 𝗡𝗨𝗠𝗕𝗘𝗥❯━
┃◈╭─────────────·
┃◈┃•𝟏 || 𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐁𝐎𝐓 𝐒𝐏𝐄𝐄𝐃
┃◈┃•𝟐 || 𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐁𝐎𝐓 𝐌𝐄𝐍𝐔
┃◈└───────────┈⊷
┗━━━━━━━━━━━━━━𖣔𖣔
> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ  𝐂𝐘𝐁𝐄𝐑 𝐃𝐈𝐍𝐔 𝐈𝐃 🎧
`;
const aliveMessage = await conn.sendMessage(from, { 
            video: { url: `https://files.catbox.moe/vu0adv.mp4` }, 
            mimetype: "video/mp4",
            ptv: true,
            contextInfo: {
                externalAdReply: {
                    title: "𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃",
                    body: "𝐂𝐘𝐁𝐄𝐑 𝐃𝐈𝐍𝐔 𝐈𝐃",
                    mediaType: 1,
                    sourceUrl: "https://whatsapp.com/channel/0029VbAWWH9BFLgRMCXVlU38",
                    thumbnailUrl: "https://files.catbox.moe/8h21es.jpeg",
                    renderLargerThumbnail: true,
                    showAdAttribution: true
                }
            }
        }, { quoted: mek });

        const sentMsg = await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/imj9c7.jpeg` },
            caption: cap,
            contextInfo: {
                mentionedJid: ['94727163302@s.whatsapp.net'],
                groupMentions: [],
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401755639074@newsletter',
                    newsletterName: "QUEEN DINU MD FORWARD",
                    serverMessageId: 999
                },
                externalAdReply: {
                    title: '𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃',
                    body: '𝐂𝐘𝐁𝐄𝐑 𝐃𝐈𝐍𝐔 𝐈𝐃',
                    mediaType: 1,
                    sourceUrl: "https://whatsapp.com/channel/0029VbAWWH9BFLgRMCXVlU38",
                    thumbnailUrl: 'https://files.catbox.moe/9gnp53.jpeg',
                    renderLargerThumbnail: true,
                    showAdAttribution: true
                }
            }
        }, { quoted: mek });

        const aliveMessageID = sentMsg.key.id; // Save the alive message ID

        // Define all menu lists
        const menu1 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*==❒⁠⁠⁠⛩️ ⁠𝐃𝐎𝐖𝐍𝐋𝐎𝐃 𝐌𝐄𝐍𝐔 📥 ❒==*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛ�depart: true,
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*

🌐 *Social Media Commands*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: facebook
│ 🏷️ᴜsᴇ: prefix facebook [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: mediafire
│ 🏷️ᴜsᴇ: prefix mediafire [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: tiktok
│ 🏷️ᴜsᴇ: prefix tiktok [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: twitter
│ 🏷️ᴜsᴇ: prefix twitter [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: insta
│ 🏷️ᴜsᴇ: prefix insta [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: apk
│ 🏷️ᴜsᴇ: prefix apk [app]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: img
│ 🏷️ᴜsᴇ: prefix img [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: tt2
│ 🏷️ᴜsᴇ: prefix tt2 [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: pins
│ 🏷️ᴜsᴇ: prefix pins [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: apk2
│ 🏷️ᴜsᴇ: prefix apk2 [app]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: fb2
│ 🏷️ᴜsᴇ: prefix fb2 [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: pinterest
│ 🏷️ᴜsᴇ: prefix pinterest [url]
╰────────────────────✵✵

🎵 *Music/Video Commands*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: spotify
│ 🏷️ᴜsᴇ: prefix spotify [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: play
│ 🏷️ᴜsᴇ: prefix play [song]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: play2-10
│ 🏷️ᴜsᴇ: prefix play2-10 [song]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: audio
│ 🏷️ᴜsᴇ: prefix audio [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: video
│ 🏷️ᴜsᴇ: prefix spotify
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: .spotify
│ 🏷️ᴜsᴇ: prefix video [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: videos
│ 🏷️ᴜsᴇ: prefix videos [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: ytmp3
│ 🏷️ᴜsᴇ: prefix ytmp3 [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: ytmp4
│ 🏷️ᴜsᴇ: prefix ytmp4 [url]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: song
│ 🏷️ᴜsᴇ: prefix song [name]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: epi
│ 🏷️ᴜsᴇ: prefix epi [name]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: darama
│ 🏷️ᴜsᴇ: prefix darama [name]
╰────────────────────✵✵

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ  Qᴜᴇᴇɴ ᴅɪɴᴜ ᴍᴅ  ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ
`;
        const menu2 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒ ⛩️ 𝐆𝐑𝐎𝐔𝐏 𝐌𝐄𝐍𝐔 👥 ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*

 🛠️ *Management Commands*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: grouplink
│ 🏷️ᴜsᴇ: prefix grouplink
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: kickall
│ 🏷️ᴜsᴇ: prefix kickall
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: kickall2
│ 🏷️ᴜsᴇ: prefix kickall2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: kickall3
│ 🏷️ᴜsᴇ: prefix kickall3
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: add
│ 🏷️ᴜsᴇ: prefix add @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: remove
│ 🏷️ᴜsᴇ: prefix remove @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: kick
│ 🏷️ᴜsᴇ: prefix kick @user
╰────────────────────✵✵

⚡ *Admin Tools*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: promote
│ 🏷️ᴜsᴇ: prefix promote @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: demote
│ 🏷️ᴜsᴇ: prefix demote @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: dismiss
│ 🏷️ᴜsᴇ: prefix dismiss
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: revoke
│ 🏷️ᴜsᴇ: prefix revoke
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: mute
│ 🏷️ᴜsᴇ: prefix mute [time]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: unmute
│ 🏷️ᴜsᴇ: prefix unmute
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: lockgc
│ 🏷️ᴜsᴇ: prefix lockgc
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: unlockgc
│ 🏷️ᴜsᴇ: prefix unlockgc
╰────────────────────✵✵

🏷️ *Tagging Commands*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: tag
│ 🏷️ᴜsᴇ: prefix tag @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: hidetag
│ 🏷️ᴜsᴇ: prefix hidetag [message]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: tagall
│ 🏷️ᴜsᴇ: prefix tagall
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: tagadmins
│ 🏷️ᴜsᴇ: prefix tagadmins
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: invite
│ 🏷️ᴜsᴇ: prefix invite
╰────────────────────✵✵

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ  ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ
`;
        const menu3 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒⁠⁠⁠⛩️ ⁠𝐅𝐔𝐍 𝐌𝐄𝐍𝐔 😹 ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓 claws🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*

🎭 *Interactive Commands*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: shapar
│ 🏷️ᴜsᴇ: prefix shapar
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: rate
│ 🏷️ᴜsᴇ: prefix rate @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: insult
│ 🏷️ᴜsᴇ: prefix insult @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: hack
│ 🏷️ᴜsᴇ: prefix hack @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: ship
│ 🏷️ᴜsᴇ: prefix ship @user1 @user2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: character
│ 🏷️ᴜsᴇ: prefix character
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: pickup
│ 🏷️ᴜsᴇ: prefix pickup
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: joke
│ 🏷️ᴜsᴇ: prefix joke
╰────────────────────✵✵

😂 *Reaction Commands*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: hrt
│ 🏷️ᴜsᴇ: prefix hrt
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: hpy
│ 🏷️ᴜsᴇ: prefix hpy
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: syd
│ 🏷️ᴜsᴇ: prefix syd
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: anger
│ 🏷️ᴜsᴇ: prefix anger
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: shy
│ 🏷️ᴜsᴇ: prefix shy
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: kiss
│ 🏷️ᴜsᴇ: prefix kiss
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: mon
│ 🏷️ᴜsᴇ: prefix mon
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: cunfuzed
│ 🏷️ᴜsᴇ: prefix cunfuzed
╰────────────────────✵✵


> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ  ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ
`;
        const menu4 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒⁠⁠⁠⁠⛩️ 𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔 💀 ❒⁠⁠⁠⁠=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*
⚠️ *Restricted Commands*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: block
│ 🏷️ᴜsᴇ: prefix block @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: unblock
│ 🏷️ᴜsᴇ: prefix unblock @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: fullpp
│ 🏷️ᴜsᴇ: prefix fullpp [img]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: setpp
│ 🏷️ᴜsᴇ: prefix setpp [img]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: restart
│ 🏷️ᴜsᴇ: prefix restart
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: shutdown
│ 🏷️ᴜsᴇ: prefix shutdown
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: updatecmd
│ 🏷️ᴜsᴇ: prefix updatecmd
╰────────────────────✵✵

ℹ️ *Info Tools*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: gjid
│ 🏷️ᴜsᴇ: prefix gjid
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: jid
│ 🏷️ᴜsᴇ: prefix jid @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: listcmd
│ 🏷️ᴜsᴇ: prefix listcmd
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: allmenu
│ 🏷️ᴜsᴇ: prefix allmenu
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: botabout
│ 🏷️ᴜsᴇ: prefix botabout
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: botinfo
│ 🏷️ᴜsᴇ: prefix botinfo
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: system
│ 🏷️ᴜsᴇ: prefix system
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: dinu
│ 🏷️ᴜsᴇ: prefix dinu
╰────────────────────✵✵

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ  ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ
`;
       const menu5 = `
◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒⁠⁠⁠⁠⛩️ 𝐀𝐈 𝐌𝐄𝐍𝐔 😑 ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉*𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*

💬 *Chat AI*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: ai
│ 🏷️ᴜsᴇ: prefix ai [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: gpt3
│ 🏷️ᴜsᴇ: prefix gpt3 [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: ai2
│ 🏷️ᴜsᴇ: prefix ai2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: gemini2
│ 🏷️ᴜsᴇ: prefix gemini2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: totext
│ 🏷️ᴜsᴇ: prefix totext
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: botai
│ 🏷️ᴜsᴇ: prefix botai
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: geminj2
│ 🏷️ᴜsᴇ: prefix gemini2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: blackbox
│ 🏷️ᴜsᴇ: prefix blackbox
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: meta
│ 🏷️ᴜsᴇ: prefix meta [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: gpt2
│ 🏷️ᴜsᴇ: prefix gpt2 [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: applesiri
│ 🏷️ᴜsᴇ: prefix applesiri
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: gptmini
│ 🏷️ᴜsᴇ: prefix gptmini [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: gpt
│ 🏷️ᴜsᴇ: prefix gpt [query]
╰────────────────────✵✵

🖼️ *Image AI*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: aiimgs
│ 🏷️ᴜsᴇ: prefix aiimgs
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: aiimgs2
│ 🏷️ᴜsᴇ: prefix aiimgs2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: aiimgs3
│ 🏷️ᴜsᴇ: prefix aiimgs3
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: imagine
│ 🏷️ᴜsᴇ: prefix imagine [text]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: imagine3
│ 🏷️ᴜsᴇ: prefix imagine3 [name]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: imagine4
│ 🏷️ᴜsᴇ: prefix imagine4 [name]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: imagine2
│ 🏷️ᴜsᴇ: prefix imagine2 [text]
╰────────────────────✵✵

🔍 *Specialized*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: blackbox
│ 🏷️ᴜsᴇ: prefix blackbox [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: luma
│ 🏷️ᴜsᴇ: prefix luma [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: dj
│ 🏷️ᴜsᴇ: prefix dj [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: khan
│ 🏷️ᴜsᴇ: prefix khan [query]
╰────────────────────✵✵

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ  ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ
`;
        const menu6 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒ ⛩️𝐀𝐍𝐈𝐌𝐄 𝐌𝐄𝐍𝐔 🐉 ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*
🖼️ *𝐈mages*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: fack
│ 🏷️ᴜsᴇ: prefix fack
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: dog
│ 🏷️ᴜsᴇ: prefix dog
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: awoo
│ 🏷️ᴜsᴇ: prefix awoo
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: garl
│ 🏷️ᴜsᴇ: prefix garl
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: waifu
│ 🏷️ᴜsᴇ: prefix waifu
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: neko
│ 🏷️ᴜsᴇ: prefix neko
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: megnumin
│ 🏷️ᴜsᴇ: prefix megnumin
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: maid
│ 🏷️ᴜsᴇ: prefix maid
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: loli
│ 🏷️ᴜsᴇ: prefix loli
╰────────────────────✵✵

🎭 *Characters*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: animegirl
│ 🏷️ᴜsᴇ: prefix animegirl
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: animegirl1-5
│ 🏷️ᴜsᴇ: prefix animegirl1
│ 🏷️ᴜsᴇ: prefix animegirl2
│ 🏷️ᴜsᴇ: prefix animegirl3
│ 🏷️ᴜsᴇ: prefix animegirl4
│ 🏷️ᴜsᴇ: prefix animegirl5
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: anime1-5
│ 🏷️ᴜsᴇ: prefix anime1
│ 🏷️ᴜsᴇ: prefix anime2
│ 🏷️ᴜsᴇ: prefix anime3
│ 🏷️ᴜsᴇ: prefix anime4
│ 🏷️ᴜsᴇ: prefix anime5
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: malaysia
│ 🏷️ᴜsᴇ: prefix vietnam
│ 🏷️ᴜsᴇ: prefix korea
│ 🏷️ᴜsᴇ: prefix indonesia
│ 🏷️ᴜsᴇ: prefix japan
│ 🏷️ᴜsᴇ: prefix china
│ 🏷️ᴜsᴇ: prefix asupan
│ 🏷️ᴜsᴇ: prefix thailand
│ 🏷️ᴜsᴇ: prefix gore
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: foxgirl
│ 🏷️ᴜsᴇ: prefix foxgirl
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: naruto
│ 🏷️ᴜsᴇ: prefix naruto
╰────────────────────✵✵

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ
`;

        const menu7 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒ ⛩️ 𝗖𝗢𝗡𝗩𝗘𝗥𝗧 𝗠𝗘𝗡𝗨 🛠️ ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*
🖼️ *Media*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: sticker
│ 🏷️ᴜsᴇ: prefix sticker [img]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: sticker2
│ 🏷️ᴜsᴇ: prefix sticker2 [img]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: emojimix
│ 🏷️ᴜsᴇ: prefix emojimix 😎+😂
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: take
│ 🏷️ᴜsᴇ: prefix take [name,text]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: tomp3
│ 🏷️ᴜsᴇ: prefix tomp3 [video]
╰────────────────────✵✵

📝 *Text*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: fancy
│ 🏷️ᴜsᴇ: prefix fancy [text]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: tts
│ 🏷️ᴜsᴇ: prefix tts [text]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: trt
│ 🏷️ᴜsᴇ: prefix trt [text]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: base64
│ 🏷️ᴜsᴇ: prefix base64 [text]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: unbase64
│ 🏷️ᴜsᴇ: prefix unbase64 [text]
╰────────────────────✵✵

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ
`;

        const menu8 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=;;⛩️ 𝗢𝗧𝗛𝗘𝗥 𝗠𝗘𝗡𝗨 🫗 =*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*

🕒 *Utilities*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: timenow
│ 🏷️ᴜsᴇ: prefix timenow
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: date
│ 🏷️ᴜsᴇ: prefix date
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: count
│ 🏷️ᴜsᴇ: prefix count [num]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: calculate
│ 🏷️ᴜsᴇ: prefix calculate [expr]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: countx
│ 🏷️ᴜsᴇ: prefix countx
╰────────────────────✵✵

🎲 *Random*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: flip
│ 🏷️ᴜsᴇ: prefix flip
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: coinflip
│ 🏷️ᴜsᴇ: prefix coinflip
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: rcolor
│ 🏷️ᴜsᴇ: prefix rcolor
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: roll
│ 🏷️ᴜsᴇ: prefix roll
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: fact
│ 🏷️ᴜsᴇ: prefix fact
╰────────────────────✵✵

🔍 *Search*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: define
│ 🏷️ᴜsᴇ: prefix define [word]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: news
│ 🏷️ᴜsᴇ: prefix news [query]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: movie
│ 🏷️ᴜsᴇ: prefix movie [name]
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: weather
│ 🏷️ᴜsᴇ: prefix weather [loc]
╰────────────────────✵✵

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ
`;

             const menu9 = `
❢◥ ▬▬▬▬▬▬▬ ◆ ▬▬▬▬▬▬▬ ◤❢
*=❒ ⛩️ 𝐑𝐄𝐀𝐂𝐓𝐈𝐎𝐍𝐒 𝐌𝐄𝐍𝐔 😑 ❒=*
❢◥ ▬▬▬▬▬▬▬ ◆ ▬▬▬▬▬▬▬ ◤❢
*╭─「🐉𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*

❤️‍🩹 *Affection*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: cuddle
│ 🏷️ᴜsᴇ: prefix cuddle @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: hug
│ 🏷️ᴜsᴇ: prefix hug @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: kiss
│ 🏷️ᴜsᴇ: prefix kiss @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: lick
│ 🏷️ᴜsᴇ: prefix lick @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: pat
│ 🏷️ᴜsᴇ: prefix pat @user
╰────────────────────✵✵

😂 *Funny*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: bully
│ 🏷️ᴜsᴇ: prefix bully @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: bonk
│ 🏷️ᴜsᴇ: prefix bonk @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: yeet
│ 🏷️ᴜsᴇ: prefix yeet @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: slap
│ 🏷️ᴜsᴇ: prefix slap @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: kill
│ 🏷️ᴜsᴇ: prefix kill @user
╰────────────────────✵✵

😊 *Expressions*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: blush
│ 🏷️ᴜsᴇ: prefix blush @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: smile
│ 🏷️ᴜsᴇ: prefix smile @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: happy
│ 🏷️ᴜsᴇ: prefix happy @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: wink
│ 🏷️ᴜsᴇ: prefix wink @user
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: poke
│ 🏷️ᴜsᴇ: prefix poke @user
╰────────────────────✵✵

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ
`;

        const menu10 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒ ⛩️ 𝐌𝐈𝐍𝐄 𝐌𝐄𝐍𝐔 🗿  ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉𝐐𝐔𝐄𝐄𝐍 𝐃𝐈𝐍𝐔 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ᴄʏʙᴇʀ ᴅɪɴᴜ ɪᴅ*
*╰──────────●●*
ℹ️ *Bot Info*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: ping
│ 🏷️ᴜsᴇ: prefix ping
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: live
│ 🏷️ᴜsᴇ: prefix live
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: alive
│ 🏷️ᴜsᴇ: prefix alive
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: runtime
│ 🏷️ᴜsᴇ: prefix runtime
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: uptime
│ 🏷️ᴜsᴇ: prefix uptime
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: repo
│ 🏷️ᴜsᴇ: prefix repo
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: system
│ 🏷️ᴜsᴇ: prefix system
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: menu
│ 🏷️ᴜsᴇ: prefix menu
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: owner
│ 🏷️ᴜsᴇ: prefix owner
╰────────────────────✵✵

🛠️ *Controls*

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: menu2
│ 🏷️ᴜsᴇ: prefix menu2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: menu3
│ 🏷️ᴜsᴇ: prefix menu3
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: alive2
│ 🏷️ᴜsᴇ: prefix alive2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: alive3
│ 🏷️ᴜsᴇ: prefix alive3
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: repo2
│ 🏷️ᴜsᴇ: prefix repo2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: dinu
│ 🏷️ᴜsᴇ: prefix dinu
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: help
│ 🏷️ᴜsᴇ: prefix help
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: about
│ 🏷️ᴜsᴇ: prefix about
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: info
│ 🏷️ᴜsᴇ: prefix info
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: ping2
│ 🏷️ᴜsᴇ: prefix ping2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: system2
│ 🏷️ᴜsᴇ: prefix system2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: restart
│ 🏷️ᴜsᴇ: prefix restart
╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: rukshan
 │ 🏷️ᴜsᴇ: prefix rukshan
 ╰────────────────────✵✵
> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ʀᴜᴋꜱʜᴀɴ
`;

        const menu11 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒ 🐉 𝐒𝐎𝐋𝐎 𝐋𝐄𝐕𝐄𝐋𝐈𝐍𝐆 𝐀𝐍𝐈𝐌𝐄 𝐌𝐄𝐍𝐔𝐁🐉 ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉SOLO-LEVELING 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ʀᴜᴋꜱʜᴀɴ*
*╰──────────●●*

🐉 *Solo Leveling Command Menu*

╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: sololeveling
│ 🏷️ᴜsᴇ: prefix sololeveling
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: shedowarmy
│ 🏷️ᴜsᴇ: prefix shedowarmy
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: sunjinhu
│ 🏷️ᴜsᴇ: prefix sunjinhu
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: beru
│ 🏷️ᴜsᴇ: prefix beru
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: igris
│ 🏷️ᴜsᴇ: prefix igris
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: monak
│ 🏷️ᴜsᴇ: prefix monak
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: slall
│ 🏷️ᴜsᴇ: prefix slall
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: kamish
│ 🏷️ᴜsᴇ: prefix kamish
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: kaishel
│ 🏷️ᴜsᴇ: prefix kaishel
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: tusk
│ 🏷️ᴜsᴇ: prefix tusk
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: tank
│ 🏷️ᴜsᴇ: prefix tank
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: iron
│ 🏷️ᴜsᴇ: prefix iron
╰────────────────────✵✵
╭────────✵✵
│ 🎌 ᴄᴏᴍᴍᴀɴᴅ: srank
│ 🏷️ᴜsᴇ: prefix srank
╰────────────────────✵✵
╭────────✵✵
│ 🐉 ᴄᴏᴍᴍᴀɴᴅ: sololevelingabout
│ 🏷️ᴜsᴇ: prefix sololevelingabout
╰────────────────────✵✵
╭────────✵✵
│ 🐉 ᴄᴏᴍᴍᴀɴᴅ: ruras&monakabout
│ 🏷️ᴜsᴇ: prefix ruras&monakabout
╰────────────────────✵✵


❰▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬❱
┃★│ • shedow monak command soon
┃★│ • video command soon
┃★│ • ANIME FOUNDR & CORRECT ABOUT & DETAILS :- animedetails
┃★│
┃★│ • *ඇනිමෙ එක ගැන සම්පූර්ණ විස්තරය ඔනෙ නම් මෙම විදානය :- fullanimedetails*
┃★│ 
┃★│ • *ඇනිමෙ එක ගැන සරල විස්තරක් ඔනෙ නම් :- .shortdetails*
┃★│ 
┃★│ 
┃★│ ⛩️ *Anime channel fallow :- https://whatsapp.com/channel/0029VbAjwpWAojYrZOdaVO0i*
┃★╭──────────────------------>
┃◈│ ⛩️ *මෙම කමාන්ඩ් මෙලෙසම type කර අවශ්‍ය දේ ලබා ගන්න*
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

 ⛩️ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ʀᴜᴋꜱʜᴀɴ
`;
        const menu12 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒ ⛩️ 𝐋𝐎𝐆𝐎 𝐌𝐄𝐍𝐔 🎗️ ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉SOLO-LEVELING 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ʀᴜᴋꜱʜᴀɴ*
*╰──────────●●*
🎗️ 𝐌𝐈𝐍𝐄 𝐋𝐎𝐆𝐎 𝐂𝐎𝐌𝐌𝐀𝐍𝐃

╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: logo
│ 🏷️ᴜsᴇ: prefix logo
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: logo2
│ 🏷️ᴜsᴇ: prefix logo2
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: logo3
│ 🏷️ᴜsᴇ: prefix logo3
╰────────────────────✵✵

🐉 *MINI LOGO MENU*
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: neonlight
│ 🏷️ᴜsᴇ: prefix neonlight
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: blackpink
│ 🏷️ᴜsᴇ: prefix blackpink
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: dragonball
│ 🏷️ᴜsᴇ: prefix dragonball
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: 3dcomic
│ 🏷️ᴜsᴇ: prefix 3dcomic
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: america
│ 🏷️ᴜsᴇ: prefix america
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: naruto
│ 🏷️ᴜsᴇ: prefix naruto
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: sadgirl
│ 🏷️ᴜsᴇ: prefix sadgirl
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: clouds
│ 🏷️ᴜsᴇ: prefix clouds
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: futuristic
│ 🏷️ᴜsᴇ: prefix futuristic
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: 3dpaper
│ 🏷️ᴜsᴇ: prefix 3dpaper
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: eraser
│ 🏷️ᴜsᴇ: prefix eraser
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: sunset
│ 🏷️ᴜsᴇ: prefix sunset
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: leaf
│ 🏷️ᴜsᴇ: prefix leaf
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: galaxy
│ 🏷️ᴜsᴇ: prefix galaxy
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: sans
│ 🏷️ᴜsᴇ: prefix sans
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: boom
│ 🏷️ᴜsᴇ: prefix boom
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: hacker
│ 🏷️ᴜsᴇ: prefix hacker
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: devilwings
│ 🏷️ᴜsᴇ: prefix devilwings
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: nigeria
│ 🏷️ᴜsᴇ: prefix nigeria
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: bulb
│ 🏷️ᴜsᴇ: prefix bulb
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: angelwings
│ 🏷️ᴜsᴇ: prefix angelwings
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: zodiac
│ 🏷️ᴜsᴇ: prefix zodiac
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: luxury
│ 🏷️ᴜsᴇ: prefix luxury
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: paint
│ 🏷️ᴜsᴇ: prefix paint
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: frozen
│ 🏷️ᴜsᴇ: prefix frozen
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: castle
│ 🏷️ᴜsᴇ: prefix castle
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: tatoo
│ 🏷️ᴜsᴇ: prefix tatoo
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: valorant
│ 🏷️ᴜsᴇ: prefix valorant
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: bear
│ 🏷️ᴜsᴇ: prefix bear
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: typography
│ 🏷️ᴜsᴇ: prefix typography
╰────────────────────✵✵
╭────────✵✵
│ 📚ᴄᴏᴍᴍᴀɴᴅ: birthday
│ 🏷️ᴜsᴇ: prefix birthday
╰────────────────────✵✵
> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ʀᴜᴋꜱʜᴀɴ
`;

        const menu13 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒  ⛩️ 𝐌𝐈𝐍𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐔𝐏𝐃𝐀𝐓𝐄 📥 ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*╭─「🐉SOLO-LEVELING 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ʀᴜᴋꜱʜᴀɴ*
*╰──────────●●*
┃ 🎧  *මෙම කමාන්ඩ් දිනෙන් දින වෙනස් වන අතර අලුත් කමාන්ඩ් ඇතුලත් වෙනවා*
┗━━━━━━━━━━━━━━━
┏━━━━❮📝 COMMAND DETAILS 📝❯━━━
┃🗣️  *alive2*
┃🤖  *alive3  [ mine command ]*
┃📜  *System*
┃📚  *aiimgs*
┃📝  *rukshan*
┃📟  *repo2*
┃⚙️  *commanding*
┃✨  *system2*
┃🎗️  *botabout*
┃⛩️ *botinfo*
┃🐉 *rukshan*
┃🛠️ *Dinu*
┗━━━━━━━━━━━━━━━

*🎧 BOT WEBSITE COMING SOON📥*

┏━━━━❮ 🐉 SOLO LEVELING MINE COMMAND 🐉 ❯━━━━
┃ 
┃ ⛩️  *මෙම කමාන්ඩ් ලිස්ටෙක දිනෙන් දින අලුත් වෙන බැවින් චැනල්     එකත් සමග සම්බන්ධව සිටින්න⚠*
┃
┃  ⛩️ _Fallow Channel :- https://whatsapp.com/channel/0029VbAWWH9BFLgRMCXVlU38_
┃  ⛩️ _Telegram  :- https://t.me/legionofdoom999_
┃ 
┃  ⛩️ 𝐒𝐎𝐋𝐎 𝐋𝐄𝐕𝐄𝐋𝐈𝐍𝐆 𝐁𝐎𝐓 𝐋𝐎𝐃💦
┃  
┃ 🐉 *_OWNER RUKSHAN 🇯🇵💦_*
┃ 🐉 _COD & MENAGERIE DINU ID 🎗️_
┗━━━━━━━━━━━━━━

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ʀᴜᴋꜱʜᴀɴ
`;

        const menu14 = `
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢
*=❒ ⛩️ 𝗡𝗘𝗪𝗦 𝗠𝗘𝗡𝗨 🛠️ ❒=*
❢◥ ▬▬▬▬▬ ◆ ▬▬▬▬▬ ◤❢

*╭─「🐉SOLO-LEVELING 𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓🐉」*
*│ 🔥 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}*
*│ 🔥 ʀᴀᴍ ᴜꜱᴀɢᴇ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 ᴘʟᴀᴛꜰᴏʀᴍ : ${os.hostname()}*
*│ 🔥 ᴠᴇʀꜱɪᴏɴ : 1.0*
*│ 🔥 ᴏᴡɴᴇʀ : ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ʀᴜᴋꜱʜᴀɴ*
*╰──────────●●*
┏━━━━❮ 🐉 SOLO LEVELING NEWS COMMAND 🐉 ❯━━━━
┃
┃ 🛠️  *මෙම News කමාන්ඩ් සමහර අවස්ථාව වලදි කියා නොකරයි. එවන් අවස්ථා වලදි news command off කර නැවත on කර බාවිතා කරන්න 😑
┗━━━━━━━━━━━━━━━
┏━━━━❮📝 NEWS COMMAND DETAILS 📝❯━━━
┃
┃    ⛩️ *AUTO NEWS සදහා = .startnews (chennel jid)*
┃    ⛩️ *AUTO NEWS OFF සදහා = .stopnews (chennel jid)*
┃
┃📚 *.HIRUNEWS
┃📝  *.sirasanews*
┃📝  *.lankadeepanews*
┃📝  *.siyathanews*
┃📝  *todayhiru*
┃📝  *itinnews*
┃📝 *derananews
┃
┗━━━━━━━━━━━━━━━

┏━━━━❮ 🐉 SOLO LEVELING MINE COMMAND 🐉 ❯━━━━
┃
┃  ⛩️ _Fallow Channel :- https://whatsapp.com/channel/0029VbAWWH9BFLgRMCXVlU38_
┃  ⛩️ _Telegram  :- https://t.me/legionofdoom999_
┃ 
┃  ⛩️ 𝐒𝐎𝐋𝐎 𝐋𝐄𝐕𝐄𝐋𝐈𝐍𝐆 𝐁𝐎𝐓 𝐋𝐎𝐃💦
┃  
┃ 🐉 *_OWNER RUKSHAN 🇯🇵💦_*
┃ 🐉 _COD & MENAGERIE DINU ID 🎗️_
┗━━━━━━━━━━━━━━

> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ʙʏ ʀᴜᴋꜱʜᴀɴ
`;

        // Event listener for replies
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;
            const messageType = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const from = mek.key.remoteJid;

            // Check if the message is a reply to the alive message
            const isReplyToAliveMsg = mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo.stanzaId === aliveMessageID;
            if (isReplyToAliveMsg) {
                if (messageType === '1') {
                    // Ping command
                    const startTime = Date.now();
                    const pongMessage = await conn.sendMessage(from, { text: '*pong...*' });
                    const endTime = Date.now();
                    const ping = endTime - startTime;
                    await conn.sendMessage(from, { 
                        text: `*ꜱᴘᴇᴇᴅ : ${ping}ms*`,
                        contextInfo: {
                            mentionedJid: ['94774589636@s.whatsapp.net'],
                            groupMentions: [],
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401755639074@newsletter',
                                newsletterName: "",
                                serverMessageId: 999
                            },
                            externalAdReply: {
                                title: 'SOLO-LEVELING-MD',
                                body: '®ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ᴊɪɴʜᴜᴡᴀ',
                                mediaType: 1,
                                sourceUrl: "https://wa.me/+94774589636?text=i-am-bot-erro",
                                thumbnailUrl: 'https://files.catbox.moe/8h21es.jpeg',
                                renderLargerThumbnail: false,
                                showAdAttribution: true
                            }
                        }
                    }, { quoted: mek });
                } else if (messageType === '2') {
                    // Menu command
                    const menuCap = `
*🍓🍟  හායි ${pushname} කොහමද ඔයාට😝♦*

*┏〔${new Date().getHours() < 12 ? '🌄 සුබ උදෑසනක්  🌄*' : '🌛 සුබ රාත්‍රියක් 🌛*'}〕
*┃🤖 ʙᴏᴛ ɴᴀᴍᴇ : 𝐒𝐎𝐋𝐎-𝐋𝐄𝐕𝐄𝐋𝐈𝐍𝐆-𝐌𝐃*
*┃🔖 ᴠᴇʀsɪᴏɴ : 1.0*
*┃📟 ᴘʟᴀᴛғᴏʀᴍ : Linux*
*┃👨‍💻 ᴏᴡɴᴇʀ: ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ᴊɪɴʜᴜᴡᴀ*
*┃📆 ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}* 
*┃📈 ʀᴀᴍ ᴜsᴀɢᴇ: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*┗━━━━━━━━━━━━━━𖣔𖣔*


┏━━━━❮SOLO LEVELING MINE COMMAND ❯━━━━
┃
┃ 🎧  *මෙම කමාන්ඩ් දිනෙන් දින වෙනස් වන අතර අලුත් කමාන්ඩ් ඇතුලත් වෙනවා*
┗━━━━━━━━━━━━━━━
┏━━━━❮📝 LOD TEM DETAILS 📝❯━━━
┃
┃🗣️ *BOT OWNER = RUKSHAN*
┃📝 *CODER & TEM OWNER DINU ID*
┗━━━━━━━━━━━━━━━


┏━━━━❮ 🎗️ SOLO LEVELING MINE COMMAND 💦 ❯━━━━
┃ 
┃ ⛩️  *මෙම කමාන්ඩ් ලිස්ටෙක දිනෙන් දින අලුත් වෙන බැවින් චැනල් එකත් සමග සම්බන්ධව සිටින්න*
┃
┃  ⛩️ _Fallow Channel :- https://whatsapp.com/channel/0029VbAWWH9BFLgRMCXVlU38_
┃
┗━━━━━━━━━━━━━━━

╭━━〔 ⛩️ *SOLO LEVELING MENU* 💨 〕━━┈⊷
┃◈╭─────────────·๏
┃◈│1️⃣  ⛩️ *DOWNLOAD MENU* ⚡
┃◈│2️⃣  ⛩️ *GROUP MENU* ⚡
┃◈│3️⃣  ⛩️ *FUN MENU* ⚡
┃◈│4️⃣  ⛩️ *OWNER MENU* ⚡
┃◈│5️⃣  ⛩️ *AI MENU⚡
┃◈│6️⃣  ⛩️ *ANIME MENU* ⚡
┃◈│7️⃣  ⛩️ *CONVERT MENU* ⚡
┃◈│8️⃣  ⛩️ *OTHER MENU* ⚡
┃◈│9️⃣  ⛩️ *REACTIONS MENU* ⚡
┃◈│🔟  ⛩️  *MINE MENU* ⚡
┃◈│1️⃣1️⃣  ⛩️ *SOLO LEVELING ANIME COMMAND 🇯🇵*
┃◈│1️⃣2️⃣  ⛩️ *LOGO MENU* ⚡
┃◈│1️⃣3️⃣ ⛩️ *MINE COMMAND NEW ✂️*
┃◈│1️⃣4️⃣ ⛩️ *NEWS MENU*
┃◈╰───────────┈⊷
╰──────────────┈⊷

> *🐉 POWERED BY SOLO LEVELING BY RUKSHAN*

`;
                    await conn.sendMessage(from, { 
                        audio: { url: `https://files.catbox.moe/iyn9so.mp3` }, 
                        mimetype: "audio/mpeg",
                        ptt: "true",
                        contextInfo: {
                            externalAdReply: {
                                title: "SOLO-LEVELING-MD",
                                body: "®ꜱᴏʟᴏ ʟᴇᴠᴇʟɪɴɢ ᴊɪɴʜᴜᴡᴀ",
                                mediaType: 1,
                                sourceUrl: "https://whatsapp.com/channel/0029VbAWWH9BFLgRMCXVlU38",
                                thumbnailUrl: "https://files.catbox.moe/vuifao.jpeg",
                                renderLargerThumbnail: true,
                                showAdAttribution: true
                            }
                        }
                    }, { quoted: mek });

                    const menuMsg = await conn.sendMessage(from, {
                        image: { url: `https://files.catbox.moe/vuifao.jpeg` },
                        caption: menuCap,
                        contextInfo: {
                            mentionedJid: ['94774589636@s.whatsapp.net'],
                            groupMentions: [],
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401755639074@newsletter',
                                newsletterName: "SOLO-LEVELING MD FORWARD",
                                serverMessageId: 999
                            }
                        }
                    }, { quoted: mek });

                    const menuMessageID = menuMsg.key.id; // Save the menu message ID

                    // Check for replies to the menu message
                    conn.ev.on('messages.upsert', async (menuUpdate) => {
                        const menuMek = menuUpdate.messages[0];
                        if (!menuMek.message) return;
                        const menuMessageType = menuMek.message.conversation || menuMek.message.extendedTextMessage?.text;
                        const menuFrom = menuMek.key.remoteJid;

                        const isReplyToMenuMsg = menuMek.message.extendedTextMessage && menuMek.message.extendedTextMessage.contextInfo.stanzaId === menuMessageID;
                        if (isReplyToMenuMsg) {
                            switch (menuMessageType) {
                                case '1':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/9gnp53.jpeg` }, caption: menu1 }, { quoted: menuMek });
                                    break;
                                case '2':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/f19lw7.jpeg` }, caption: menu2 }, { quoted: menuMek });
                                    break;
                                case '3':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/hgtqet.jpeg` }, caption: menu3 }, { quoted: menuMek });
                                    break;
                                case '4':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/iw3a4n.jpeg` }, caption: menu4 }, { quoted: menuMek });
                                    break;
                                case '5':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/imj9c7.jpeg` }, caption: menu5 }, { quoted: menuMek });
                                    break;
                                case '6':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/e69l3v.jpeg` }, caption: menu6 }, { quoted: menuMek });
                                    break;
                                case '7':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/e69l3v.jpeg` }, caption: menu7 }, { quoted: menuMek });
                                    break;
                                case '8':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/ly6nb0.jpeg` }, caption: menu8 }, { quoted: menuMek });
                                    break;
                                case '9':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/yced27.jpeg` }, caption: menu9 }, { quoted: menuMek });
                                    break;
                                case '10':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/iw3a4n.jpeg` }, caption: menu10 }, { quoted: menuMek });
                                    break;
                                case '11':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/vuifao.jpeg` }, caption: menu11 }, { quoted: menuMek });
                                    break;
                                case '12':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/iw3a4n.jpeg` }, caption: menu12 }, { quoted: menuMek });
                                    break;
                                case '13':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/9gnp53.jpeg` }, caption: menu13 }, { quoted: menuMek });
                                    break;
                                case '14':
                                    await conn.sendMessage(menuFrom, { image: { url: `https://files.catbox.moe/hgtqet.jpeg` }, caption: menu14 }, { quoted: menuMek });
                                    break;
                                default:
                                    await conn.sendMessage(menuFrom, { text: 'කරුණාකර 1-14 අතර අංකයක් තෝරන්න!' }, { quoted: menuMek });
                                    break;
                            }
                        }
                    });
                }
            }
        });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});


cmd({
    pattern: "deploy",
    react: "🔖",
    desc: "Contact to bot owner",
    category: "main",
    use: '.rsquest2',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{       
if (!q) return mek.reply(`Usage: 

.deploy 

1 ( your_session_id )

2 ( your_app_name)

> කරුනාවෙන් සලකන්න...

> Treat with kindness...

> تعامل بلطف



ඔබගේ නම ඉංග්‍රිසියෙන් එවන්න...

සහ හිස් තැන් නොතබන්න... 

සිම්පල් අකුරු බාවිත කර නම එවන්න 

උදාහරනය :- 

1 ( your_session_id )

2 ( suranga-chamith)



Send your name in English... 

And do not leave spaces...

Send your name using simple letters

 Example :- 

1 ( your_session_id ) 

2 ( suranga-chamith)


أرسل اسمك بالإنجليزية... ولا تترك فراغات... أرسل اسمك بأحرف بسيطة مثال: 1 (معرف الجلسة) 2 (سورانغا-شاميث)`)

var izumilod = [
"《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
"《 ████▒▒▒▒▒▒▒▒》30%",
"《 ███████▒▒▒▒▒》50%",
"《 ██████████▒▒》80%",
"《 ████████████》100%",
"🧙‍♂️ 𝐙𝐀𝐍𝐓𝐀 × 𝐌𝐃 𝐎𝐅𝐂 🧙‍♂️"
]
let { key } = await conn.sendMessage(from, {text: 'ꜱᴇɴᴅɪɴɢ...'})

for (let i = 0; i < izumilod.length; i++) {
await conn.sendMessage(from, {text: izumilod[i], edit: key })
}


    const messageId = mek.key.id

    if (reportedMessages[messageId]) {
        return mek.reply("This report has already been forwarded to the owner. Please wait for a response.")
    }

    reportedMessages[messageId] = true

    const textt = `*| zanta-xmd deploy |*`
    const teks1 = `\n\n*zanta-xmd new user*: @${m.sender.split("@")[0]}\n*ඔබගේ session id owner වෙත යවා ඇත...!!*

*කරුනාකර මදක් රැදී සිටින්න...*

*Your session id has been sent to the owner...!!*

 *Please wait a moment...*

*تم إرسال معرف جلستك إلى المالك...!!* *يرجى الانتظار قليلاً...*: 

session id ${q}`
    const teks2 = `\n\n*Hi ${pushname}, your session id has been forwarded to my Owners.*\n*Please wait...*`

    // Send the message to the first owner in the `owner` array
    conn.sendMessage(devlopernumber + "@s.whatsapp.net", {
        text: textt + teks1,
        mentions: [mek.sender],
    }, {
        quoted: mek,
    });

    // Send a reply to the user
    mek.reply("Tʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ Iᴛ ʜᴀs ʙᴇᴇɴ ꜰᴏʀᴡᴀʀᴅᴇᴅ ᴛᴏ ᴛʜᴇ ᴏᴡɴᴇʀ. Pʟᴇᴀsᴇ ᴡᴀɪᴛ ꜰᴏʀ ᴀ ʀᴇsᴘᴏɴsᴇ.")
  await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "broadcast",
    desc: "Broadcast a message to all groups.",
    category: "main",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (args.length === 0) return reply("📢 Please provide a message to broadcast.");
    const message = args.join(' ');
    const groups = Object.keys(await conn.groupFetchAllParticipating());
    for (const groupId of groups) {
        await conn.sendMessage(groupId, { text: message }, { quoted: mek });
    }
    reply("📢 Message broadcasted to all groups.");
});



cmd({
    pattern: "ping",
    alias: ["speed","pong"],use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        // Ensure reaction and text emojis are different
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Send reaction using conn.sendMessage()
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        const text = `> *🎀 𝐙𝐀𝐍𝐓𝐀-𝐗𝐌𝐃 𝐔𝐋𝐓𝐑𝐀 𝐒𝐏𝐄𝐄𝐃: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363412075023554@newsletter',
                    newsletterName: "🧙‍♂️ 𝐙𝐀𝐍𝐓𝐀 × 𝐌𝐃 𝐎𝐅𝐂 🧙‍♂️",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});


cmd({
    pattern: "device",
    react: "🔖",
    desc: "To see device type",
    category: "main",
    use: '.device',
    filename: __filename
},    
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if ( !isMe ) return reply('ℹ️ *Sorry ! This is Owner only Command..*') 
if ( !m.quoted ) return reply('ℹ️ *Please reply a Message...*')
if (m.quoted.id.startsWith("3A")) {
  var ss= '```'
 conn.sendMessage(from, { 
      text : `@${m.quoted.sender.split('@')[0]}  *Is Using:* ${ss}Ios WhatsApp(i Phone)${ss}`, 
      mentions : [m.quoted.sender]
    });
} else if (m.quoted.id.startsWith("3EB")) {
  var ss= '```'
 conn.sendMessage(from, { 
      text : `@${m.quoted.sender.split('@')[0]}  *Is Using:* ${ss}Web WhatsApp${ss}`, 
      mentions : [m.quoted.sender]
    });
} else if (m.quoted.id.startsWith("BAE")) {
  var ss= '```'
 conn.sendMessage(from, { 
      text : `@${m.quoted.sender.split('@')[0]}  *Is Using:* ${ss}Web WhatsApp(Wiskeysockets/Baileys-WA-Web-Api)${ss}`, 
      mentions : [m.quoted.sender]
    });
} else if (m.quoted.id.startsWith("QUEENAMDI")) {
  var ss= '```'
 conn.sendMessage(from, { 
      text : `@${m.quoted.sender.split('@')[0]}  *Is Using:* ${ss}Web WhatsApp(QueenAmdi-Wa-Bot)${ss}`, 
      mentions : [m.quoted.sender]
    });
  } else if (m.quoted.id.startsWith("CYBER2")) {
  var ss= '```'
 conn.sendMessage(from, { 
      text : `@${m.quoted.sender.split('@')[0]}  *Is Using:* ${ss}Web WhatsApp(Cyber-X-Wa-Bot)${ss}`, 
      mentions : [m.quoted.sender]
    });
} else if (m.quoted.id.startsWith("ZEROTWO")) {
  var ss= '```'
 conn.sendMessage(from, { 
      text : `@${m.quoted.sender.split('@')[0]}  *Is Using:* ${ss}Web WhatsApp(ZeroTwo-Md-Wa-Bot)${ss}`, 
      mentions : [m.quoted.sender]
    });
} else {
  var ss= '```'
 conn.sendMessage(from, { 
      text : `@${m.quoted.sender.split('@')[0]}  *Is Using:* ${ss}Android WhatsApp ${ss}`, 
      mentions : [m.quoted.sender]
    });
}
} catch (e) {
reply('⛔ *Error accurated !!*\n\n'+ e )
l(e)
}
})


cmd({
    pattern: "system",
    react: "🖥️",
    alias: ["s_info"],
    desc: "To Check bot\'s System information",
    category: "main",
    use: '.system',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const ccp = await si.cpu()
const cinfo = await si.version()
let timee = await si.time()
const plat = os.hostname()
let data = await fetchJson('https://gist.github.com/VajiraTech/c4f2ac834de5c45b3a8de8e2d165f973/raw')

const infomsg = `╭━━〔 *🧙‍♂️ 𝐙𝐀𝐍𝐓𝐀 × 𝐌𝐃 𝐎𝐅𝐂 🧙‍♂️* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• _Runtime -: ${runtime(process.uptime())}_
┃◈┃• _Ram Usage -: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB_
┃◈┃• _Bot Version -: ${data.version} Stable_
┃◈┃• *👨‍💻 Owner*: Mr Suranga Mod-z
┃◈└───────────┈⊷
╰──────────────┈⊷


📌  *_Server System informations_*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┣⛊  _Platform : ${plat}_
┣⛊  _Running OS : ${os.platform()}_
┣⛊  _CPU Manufacture  -: ${ccp.manufacturer}_
┣⛊  _CPU Brand -: ${ccp.brand}_
┣⛊  _CPU Speed -: ${ccp.speed}_
┣⛊ _Engine Version -: ${cinfo}_
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

await conn.sendMessage(from , { text: infomsg  }, { quoted: mek } )
	
}catch (e) {
reply('*Error !!*')
l(e)
}
})


cmd({
    pattern: "id",
    react: "🔖",
    desc: "To take Device id",
    category: "main",
    use: '.sv',
    filename: __filename
},    
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if ( !isMe ) return reply('ℹ️ *Sorry ! This is Owner only Command..*') 
if ( !m.quoted ) return reply('ℹ️ *Please reply a Message...*')
reply(m.quoted.id)
} catch (e) {
reply('⛔ *Error accurated !!*\n\n'+ e )
l(e)
}
})



cmd({
    pattern: "forward",
    desc: "forward msgs",
    alias: ["fo"],
    category: "main",
    use: '.forward < Jid address >',
    filename: __filename
},

async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {

if (!isOwner) {
	return reply("*Owner Only ❌*")}
	
if ( !mek.quoted) {
reply("*give me message ❌*")
}

if(!q) return reply('please give me jids')

const data = q.split(",")



	
let p;
let message = {}

            message.key = mek.quoted?.fakeObj?.key;

            if (mek.quoted?.documentWithCaptionMessage?.message?.documentMessage) {
            
		let mime = mek.quoted.documentWithCaptionMessage.message.documentMessage.mimetype

const mimeType = require('mime-types');
let ext = mimeType.extension(mime);		    

                mek.quoted.documentWithCaptionMessage.message.documentMessage.fileName = (p ? p : mek.quoted.documentWithCaptionMessage.message.documentMessage.fileName) + "." + ext;
            }

            message.message = mek.quoted;
	
for(let i=0; i<data.length;i++){
const mass =  await conn.forwardMessage(data[i], message, false)
}
return reply(`*Message forwarded to:*\n\n ${data}`)
            
})






cmd({
    pattern: "sv",
    react: "🔖",
    desc: "To take owner number",
    category: "main",
    use: '.sv',
    filename: __filename
},    
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
      
        mek.reply_message && mek.reply_message.status
          ? mek.reply_message
          : false;
      
        mek.bot.forwardOrBroadCast(from, {
          quoted: { key: mek.key },
        });
       
reply("*reply to whatsapp status*");
    await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*Error !!*')
l(e)
}
}) /*
const regexSend = new RegExp(
  `\\b(?:${["send", "share", "snd", "give", "save", "sendme", "forward"].join(
    "|"
  )})\\b`,
  "i"
)*/






	
cmd({ on: "body" }, 
     async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
     if (config.AUTO_REACT === 'true') {
         const emojis = ['❤', '💕', '😻', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥', '💌', '🙂', '🤗', '😌', '😉', '🤗', '😊', '🎊', '🎉', '🎁', '🎈', '👋']
         const emokis = emojis[Math.floor(Math.random() * (emojis.length))]
         conn.sendMessage(from, {
             react: {
                 text: emokis,
                 key: mek.key
             }
         })
     }
}) 




cmd({ on: "text" }, 
    async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
    const randomXp = 8;
    let usrname = mek.pushName
    const hasLeveledUp = await Levels.appendXp(mek.sender, "RandomXP", randomXp);
    if (hasLeveledUp) {
        const sck1 = await Levels.fetch(mek.sender, "RandomXP");
        const lvpoints = sck1.level;
        var role = "GOD";
        if (lvpoints <= 2) {
            var role = "🏳Citizen";
        } else if (lvpoints <= 4) {
            var role = "👼Baby Wizard";
        } else if (lvpoints <= 6) {
            var role = "🧙‍♀️Wizard";
        } else if (lvpoints <= 8) {
            var role = "🧙‍♂️Wizard Lord";
        } else if (lvpoints <= 10) {
            var role = "🧚🏻Baby Mage";
        } else if (lvpoints <= 12) {
            var role = "🧜Mage";
        } else if (lvpoints <= 14) {
            var role = "🧜‍♂️Master of Mage";
        } else if (lvpoints <= 16) {
            var role = "🌬Child of Nobel";
        } else if (lvpoints <= 18) {
            var role = "❄Nobel";
        } else if (lvpoints <= 20) {
            var role = "⚡Speed of Elite";
        } else if (lvpoints <= 22) {
            var role = "🎭Elite";
        } else if (lvpoints <= 24) {
            var role = "🥇Ace I";
        } else if (lvpoints <= 26) {
            var role = "🥈Ace II";
        } else if (lvpoints <= 28) {
            var role = "🥉Ace Master";
        } else if (lvpoints <= 30) {
            var role = "🎖Ace Dominator";
        } else if (lvpoints <= 32) {
            var role = "🏅Ace Elite";
        } else if (lvpoints <= 34) {
            var role = "🏆Ace Supreme";
        } else if (lvpoints <= 36) {
            var role = "💍Supreme I";
        } else if (lvpoints <= 38) {
            var role = "💎Supreme Ii";
        } else if (lvpoints <= 40) {
            var role = "🔮Supreme Master";
        } else if (lvpoints <= 42) {
            var role = "🛡Legend III";
        } else if (lvpoints <= 44) {
            var role = "🏹Legend II";
        } else if (lvpoints <= 46) {
            var role = "⚔Legend";
        } else if (lvpoints <= 55) {
            var role = "🐉Immortal";
        } else {
            var role = "Kiddo";
        }
        if (config.LEVEL_UP_MESSAGE === 'false') {
            await conn.sendMessage(from, {
                image: {
                    url: `https://files.catbox.moe/r86oac.jpg`,
                },
                caption: `
━━━━━༺❃༻━━━━━◇
☱ *look at that! Someone just leveled up! ✨*
☱ *👤 Name*: ${mek.pushName}
☱ *🎚 Level*: ${sck1.level}
☱ *🛑 Exp*: ${sck1.xp} / ${Levels.xpFor(sck1.level + 1)}
☱ *📍 Role*: *${role}*
☱ *Enjoy! 😁*━━━━━༺❃༻━━━━
`,
            }, {
                quoted: mek,
            });
        }
    }

})	
	
cmd({
    pattern: "owner",
    react: "🔖",
    desc: "To take owner number",
    category: "owner",
    use: '.ban',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{                   
const config = require('../settings')
        const vcard = 'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:' + 'zanta' + '\n' +
            'ORG:;\n' +
            'TEL;type=CELL;type=VOICE;waid=' + owner[0] + ':+' + owner[0] + '\n' +
            'END:VCARD'
        let buttonMessaged = {
            contacts: { displayName: 'Vajira', contacts: [{ vcard }] },
            contextInfo: {
                externalAdReply: {
                    title: '🧙‍♂️ 𝐂𝐄𝐑𝐑𝐘 𝐙𝐀𝐍𝐓𝐀 𝐁𝐁𝐇 🧙‍♂️',
                    body: 'Touch here.',
                    renderLargerThumbnail: true,
                    thumbnailUrl: ``,
                    thumbnail: `https://files.catbox.moe/n5w10w.jpg`,
                    mediaType: 2,
                    mediaUrl: '',
                    sourceUrl: `https://wa.me/+` + owner[0] + '?text=Hii bro,I am ' + mek.pushName,
                },
            },
        }
  return await conn.sendMessage(from, buttonMessaged, {quoted: mek,
							    })
await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*Error !!*')
l(e)
}
}) 







cmd({
    pattern: "getsession",
    react: "🔖",
    desc: "To get bot session",
    category: "main",
    use: '.getsession',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{                   
if (!isMe) return await reply(BOTOW)
                                  
         	reply('Wait a moment, currently retrieving your session file')
                let sesi = fs.readFileSync('./session/creds.json')
                conn.sendMessage(mek.chat, {
                    document: sesi,
                    mimetype: 'application/json',
                    fileName: 'creds.json'
                }, {
                    quoted: mek
                })
await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*🛑 This is an owner command...*')
l(e)
}
}) 		    	

cmd({
    pattern: "delsession",
    react: "🔖",
    desc: "To delete bot session",
    category: "main",
    use: '.delsession',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{                   
if (!isMe) return await reply(BOTOW)
                                  
         	                fs.readdir("./session", async function(err, files) {
                    if (err) {
                        console.log('Unable to scan directory: ' + err);
                        return reply('Unable to scan directory: ' + err);
                    }
                    let filteredArray = await files.filter(item => item.startsWith("pre-key") ||
                        item.startsWith("sender-key") || item.startsWith("session-") || item.startsWith("app-state")
                    )
                    console.log(filteredArray.length);
                    let teks = `Detected ${filteredArray.length} junk files\n\n`
                    if (filteredArray.length == 0) return reply()
                    filteredArray.map(function(e, i) {
                        teks += (i + 1) + `. ${e}\n`
                    })
                    reply()
                    await sleep(2000)
                    reply("Deleting junk files...")
                    await filteredArray.forEach(function(file) {
                        fs.unlinkSync(`./session/${file}`)
                    });
                    await sleep(2000)
                    reply("Successfully deleted all the trash in the session folder")
                });
await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*🛑 This is an owner command...*')
l(e)
}
}) 

cmd({
    pattern: "block",
    react: "🔖",
    desc: "To block a member",
    category: "main",
    use: '.block',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{                   
if (!isMe) return await reply(BOTOW)
                                  
         	let users = mek.mentionedJid ? mek.mentionedJid : mek.quoted ? mek.quoted.sender : q.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
		await conn.updateBlockStatus(users, 'block').then((res) => reply(jsonformat(res))).catch((err) => reply(jsonformat(err)))
await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*Error !!*')
l(e)
}
}) 		    	



cmd({
    pattern: "unblock",
    react: "🔖",
    desc: "To unblock a member",
    category: "main",
    use: '.unblock',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{                   
if (!isMe) return await reply(BOTOW)
                                  
         	let users = mek.mentionedJid ? mek.mentionedJid : mek.quoted ? mek.quoted.sender : q.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
		await conn.updateBlockStatus(users, 'unblock').then((res) => reply(jsonformat(res))).catch((err) => reply(jsonformat(err)))
await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*🛑 This is an owner command...*')
l(e)
}
}) 		    	




cmd({
    pattern: "shutdown",
    react: "⚙️",
    desc: "To shutdown the bot",
    category: "",
    use: '.shutdown',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{                   
   
  if (!isMe) return await reply(BOTOW)
                reply(`Bot shutdown few 10 seconds...`)
                await sleep(10000)
                process.exit()
		
  await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*🛑 This is an owner command...*')
l(e)
}
}) 			


cmd({
    pattern: "request2",
    react: "⚙️",
    desc: "Contact to bot owner",
    category: "",
    use: '.request',
    filename: __filename
},
async(conn, mek, m,{from, l, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{      
   let teks =  `Enter The Bug Example\n\n${command} < YOUR REPORT MASSAGE > `
	          
var xeonlod = [
"《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
"《 ████▒▒▒▒▒▒▒▒》30%",
"《 ███████▒▒▒▒▒》50%",
"《 ██████████▒▒》80%",
"《 ████████████》100%",
"𝚁𝙴𝙿𝙾𝚁𝚃 𝚂𝙴𝙽𝙳 𝚃𝙾 𝚃𝙷𝙴 𝙾𝚆𝙽𝙴𝚁 🖥️..."
]
let { key } = await conn.sendMessage(from, {text: 'ꜱᴇɴᴅɪɴɢ...'})

for (let i = 0; i < xeonlod.length; i++) {
await conn.sendMessage(from, {text: xeonlod[i], edit: key })
}

                  await conn.sendMessage(`94760264995@s.whatsapp.net`, {text: `*Bug Report From:* wa.me/${mek.sender.split("@")[0]}\n\n*Bug Report*\n${q ? q : 'blank'}` })
                  const repo = await conn.sendMessage(`*『 𝙱𝚄𝙶 𝚁𝙴𝙿𝙾𝚁𝚃 』*`)
                  await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('🛑 This is an owner command...')
l(e)
}
})

cmd({
    pattern: "setbotbio",
    react: "⚙️",
    desc: "To change bot number bio",
    category: "",
    use: '.setbotbio',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{                   
   
  if (!isMe) return await reply(BOTOW)
                if (!q) return reply(`Where is the text?\nExample: ${prefix + command} zanta-xmd Bot`)
    await conn.updateProfileStatus(q)
    reply(`Success in changing the bio of bot's number`)
            await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*🛑 This is an owner command...*')
l(e)
}
})


cmd({
    pattern: "alive",
    react: "👨‍💻",
    alias: ["online","test","bot"],
    desc: "Check bot online or no.",
    category: "main",
    use: '.alive',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
	var msg = mek
		
if(os.hostname().length == 12 ) hostname = 'replit'
else if(os.hostname().length == 36) hostname = 'heroku'
else if(os.hostname().length == 8) hostname = 'koyeb'
else hostname = os.hostname()
let monspace ='```'
let monspacenew ='`'
const cap = `${monspace}😚 කොහොමද ${pushname} I'm alive now${monspace}

*🧙‍♂️ 𝐙𝐀𝐍𝐓𝐀 × 𝐌𝐃 𝐎𝐅𝐂 🧙‍♂️*

*🚀Version:* ${require("../package.json").version}

*⌛Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB

*🕒Runtime:* ${runtime(process.uptime())}

*📍Platform:* ${hostname}

*🤖sᴛᴀᴛᴜs*: ᴢᴀɴᴛᴀ-xᴍᴅ ᴀʟɪᴠᴇ ᴀɴᴅ ʀᴇᴀᴅʏ


🖇️ *CHANEL :- https://whatsapp.com/channel/0029Vb4F314CMY0OBErLlV2M*

👤 *OWNER :- MR SURANGA MOD-Z*`

var vajiralod = [
"LOADING ●●○○○○",
"LOADING ●●●●○○",
"LOADING ●●●●●●",
"`🧙‍♂️ 𝐙𝐀𝐍𝐓𝐀 × 𝐌𝐃 𝐎𝐅𝐂 🧙‍♂️`"	
]
let { key } = await conn.sendMessage(from, {text: ''})

for (let i = 0; i < vajiralod.length; i++) {
await conn.sendMessage(from, {text: vajiralod[i], edit: key })
}	



if (config.MODE === 'nonbutton') {
  const sections = [
    {
	title: "",
	rows: [
	    {title: "1", rowId: prefix + 'menu' , description: 'COMMANDS MENU'},
	    {title: "2", rowId: prefix + 'ping' , description: 'ZANTA-XMD SPEED'} ,

	]
    } 
]
const listMessage = {
caption: cap,
image : { url: config.LOGO },	
footer: config.FOOTER,
title: '',
buttonText: '*🔢 Reply below number*',
sections
}
	
return await conn.replyList(from, listMessage ,{ quoted : mek })

} if (config.MODE === 'button') {


                  
        conn.sendMessage(from, {
            image: { url: config.LOGO },
    caption: cap,
    footer: config.FOOTER,
                buttons: [
			{
                    buttonId: `${prefix}menu`,
                    buttonText: {
                        displayText: 'MENU'
                    },
                },
		{
                    buttonId: `${prefix}ping`,
                    buttonText: {
                        displayText: 'PING'
                    },
                },	
            ],
            headerType: 1,
            viewOnce: true
        }, {
            quoted: m
        });
        

}


	
} catch (e) {
  reply('*ERROR !!*')
  l(e)
}
})


 
//============================================================================

cmd({
    pattern: "sc",
    react: "👨‍💻",
    alias: ["script","repo"],
    desc: "Check bot online or no.",
    category: "main",
    use: '.alive',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
	var msg = mek
if(os.hostname().length == 12 ) hostname = 'replit'
else if(os.hostname().length == 36) hostname = 'heroku'
else if(os.hostname().length == 8) hostname = 'koyeb'
else hostname = os.hostname()
let monspace ='```'
let monspacenew ='`'
var vajiralod = [
"LOADING ●●○○○○",
"LOADING ●●●●○○",
"LOADING ●●●●●●",
"`COMPLETED ✅`"	
]
let { key } = await conn.sendMessage(from, {text: ''})

for (let i = 0; i < vajiralod.length; i++) {
await conn.sendMessage(from, {text: vajiralod[i], edit: key })
}	

const cap = `🧙‍♂️ 𝐙𝐀𝐍𝐓𝐀 × 𝐌𝐃 𝐎𝐅𝐂 🧙‍♂️

> Follow WhatsApp Channel :- ⤵️
 
🖇️ https://whatsapp.com/channel/0029Vb4F314CMY0OBErLlV2M

> Joine Whatsapp Group :- ⤵️

🖇️ https://chat.whatsapp.com/DXQOFlfOnOt5AQsWSaGZqT?mode=ems_copy_c

> Follow Tiktok Page :- ⤵️

🖇️ tiktok.com/@_zanta_vibe_

> owner :- ⤵️

🖇️ https://wa.me/+94760264995?text=hi-zanta-xmd-owner-save-me-🐼🪄💖 
`
	
if (config.MODE === 'nonbutton') {


	
  const sections = [
    {
	title: "",
	rows: [
	    {title: "1", rowId: prefix + 'menu' , description: 'COMMANDS MENU'},
	    {title: "2", rowId: prefix + 'ping' , description: 'ZANTA-XMD SPEED'} ,

	]
    } 
]
const listMessage = {
caption: cap,
image : { url: config.LOGO },	
footer: config.FOOTER,
title: '',
buttonText: '*🔢 Reply below number*',
sections
}
return await conn.replyList(from, listMessage ,{ quoted : mek })

} if (config.MODE === 'button') {


                  
        conn.sendMessage(from, {
            image: { url: config.LOGO },
    caption: cap,
    footer: config.FOOTER,
                buttons: [
			{
                    buttonId: `${prefix}menu`,
                    buttonText: {
                        displayText: 'MENU'
                    },
                },
		{
                    buttonId: `${prefix}ping`,
                    buttonText: {
                        displayText: 'PING'
                    },
                },	
            ],
            headerType: 1,
            viewOnce: true
        }, {
            quoted: m
        });
        

}

	
} catch (e) {
  reply('*ERROR !!*')
  l(e)
}
})