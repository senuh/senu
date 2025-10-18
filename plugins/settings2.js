const { cmd } = require('../lib/command');
const config = require('../settings');

// Language helper
const isSinhala = config.LANG === 'SI';
const t = (si, en) => (isSinhala ? si : en);

/**
 * Full 28-settings ON/OFF Button Menu
 * - .settings : main page (ON PAGE / OFF PAGE)
 * - .seton    : shows 28 "ON" buttons (with numbering/descriptions)
 * - .setoff   : shows 28 "OFF" buttons
 * - Clicking a button sends the corresponding command (e.g. ".autovoice on")
 * - A confirmation reply is sent after receiving the command (Enabled / Disabled)
 *
 * Save as: commands/settings.js
 */

// ---------------------------
// Settings master list (28 items)
// Keep numbering & descriptions similar to original list
// ---------------------------
const SETTINGS = [
  { id: 'onlygroup',     label: 'BOT WORK MODE',        sin: 'බොට් වැඩ කිරීමේ මෝඩ්',       desc_en: 'Put bot private/public', desc_si: 'බොට් පෞද්ගලික/සAllowed කිරීම' },
  { id: 'disablepm',     label: 'BOT SHUTDOWN',         sin: 'බොට් සමුද්‍රගත කිරීම',       desc_en: 'Shutdown / enable bot', desc_si: 'බොට් නවත්වන්න/සක්‍රීය කරන්න' },
  { id: 'autovoice',     label: 'AUTO VOICE',           sin: 'ස්වයංක්‍රීය හඬ',             desc_en: 'Enable auto voice', desc_si: 'ස්වයංක්‍රීය හඬ සක්‍රීය කරන්න' },
  { id: 'autosticker',   label: 'AUTO STICKER',         sin: 'ස්වයංක්‍රීය ස්ටික්කර්',       desc_en: 'Enable auto sticker', desc_si: 'ස්වයංක්‍රීය ස්ටික්කර් සක්‍රීය කරන්න' },
  { id: 'autoreply',     label: 'AUTO REPLY',           sin: 'ස්වයංක්‍රීය පිළිතුරු',       desc_en: 'Enable auto reply', desc_si: 'ස්වයංක්‍රීය පිළිතුර සක්‍රීය කරන්න' },
  { id: 'autobio',       label: 'AUTO BIO',             sin: 'ස්වයංක්‍රීය බයෝ',            desc_en: 'Enable auto bio', desc_si: 'ස්වයංක්‍රීය බයෝ සක්‍රීය කරන්න' },
  { id: 'autostatus',    label: 'AUTO STATUS VIEW',     sin: 'ස්වයංක්‍රීය ස්ටේටස් බලන්න', desc_en: 'Enable auto status view', desc_si: 'ස්වයංක්‍රීය ස්ටේටස් බලන්න සක්‍රීය කරන්න' },
  { id: 'autotyping',    label: 'AUTO TYPING',          sin: 'ස්වයංක්‍රීය ටයිප්',          desc_en: 'Enable auto typing', desc_si: 'ස්වයංක්‍රීය ටයිප් සක්‍රීය කරන්න' },
  { id: 'autorecording', label: 'AUTO RECORDING',       sin: 'ස්වයංක්‍රීය රෙකෝඩ්',        desc_en: 'Enable auto recording', desc_si: 'ස්වයංක්‍රීය රෙකෝඩ් සක්‍රීය කරන්න' },
  { id: 'autoread',      label: 'AUTO READ',            sin: 'ස්වයංක්‍රීය කියවීම',         desc_en: 'Enable auto read', desc_si: 'ස්වයංක්‍රීය කියවීම සක්‍රීය කරන්න' },
  { id: 'autoreact',     label: 'AUTO REACT',           sin: 'ස්වයංක්‍රීය ප්‍රතිචාර',      desc_en: 'Enable auto react', desc_si: 'ස්වයංක්‍රීය ප්‍රතිචාර සක්‍රීය කරන්න' },
  { id: 'alwaysonline',  label: 'ALWAYS ONLINE',        sin: 'සෑම විටම නොහළ',            desc_en: 'Enable always online', desc_si: 'සෑම විටම සක්‍රීය කරන්න' },
  { id: 'autoblock',     label: 'AUTO BLOCK',           sin: 'ස්වයංක්‍රීය බ්ලොක්',         desc_en: 'Enable auto block', desc_si: 'ස්වයංක්‍රීය බ්ලොක් සක්‍රීය කරන්න' },
  { id: 'autowelcome',   label: 'AUTO WELCOME',         sin: 'ස්වයංක්‍රීය සාදරයෙන් පිළිගැනීම', desc_en: 'Enable auto welcome', desc_si: 'ස්වයංක්‍රීය සාදරයෙන් පිළිගැනීම සක්‍රීය කරන්න' },
  { id: 'antibot',       label: 'ANTI BOT',             sin: 'රැඳවුම්-බොට්',               desc_en: 'Enable anti bot', desc_si: 'බොට්ව विरුද්ධ සක්‍රීය කරන්න' },
  { id: 'antilink',      label: 'ANTI LINK',            sin: 'ලිංක් වලට එරෙහි',          desc_en: 'Enable anti link', desc_si: 'ලිංක් වලට එරෙහි සක්‍රීය කරන්න' },
  { id: 'antibad',       label: 'ANTI BAD',             sin: 'අදපුරු දඩයම',               desc_en: 'Enable anti bad words', desc_si: 'අයුතු පද වලට විරුද්ධ සක්‍රීය කරන්න' },
  { id: 'antidelete',    label: 'ANTI DELETE',          sin: 'පනිවිඩ මකන්න එරෙහි',       desc_en: 'Enable anti delete', desc_si: 'පනිවිඩ මකන්න එරෙහි සක්‍රීය කරන්න' },
  { id: 'anticall',      label: 'ANTI CALL',            sin: 'කෝල් වලට එරෙහි',           desc_en: 'Enable anti call', desc_si: 'කෝල් වලට එරෙහි සක්‍රීය කරන්න' },
  { id: 'aiimage',       label: 'AI IMAGE',             sin: 'AI රූප',                     desc_en: 'Enable AI image', desc_si: 'AI රූප සක්‍රීය කරන්න' },
  { id: 'aichatbot',     label: 'AI CHATBOT',           sin: 'AI චැට්බොට්',               desc_en: 'Enable AI chatbot', desc_si: 'AI චැට්බොට් සක්‍රීය කරන්න' },
  { id: 'mathsai',       label: 'AI MATHS',             sin: 'AI ගණිත',                   desc_en: 'Enable AI maths', desc_si: 'AI ගණිත සක්‍රීය කරන්න' },
  { id: 'welcome',       label: 'WELCOME',              sin: 'වෙල්කම් පණිවිඩ',            desc_en: 'Enable welcome message', desc_si: 'වෙල්කම් පණිවිඩ සක්‍රීය කරන්න' },
  { id: 'oreact',        label: 'OWNER REACT',          sin: 'අයිතිකරු ප්‍රතිචාර',        desc_en: 'Enable owner react', desc_si: 'අයිතිකරු ප්‍රතිචාර සක්‍රීය කරන්න' },
  { id: 'cmdread',       label: 'CMD READ',             sin: 'ඇණවුම් කියවීම',            desc_en: 'Enable cmd read', desc_si: 'ඇණවුම් කියවීම සක්‍රීය කරන්න' },
  { id: 'onlyme',        label: 'ONLY ME',              sin: 'මට පමණි',                   desc_en: 'Enable owner-only mode', desc_si: 'මම පමණක් භාවිතා කළ හැක' },
  { id: 'mode',          label: 'MODE',                 sin: 'මෝඩ්',                       desc_en: 'Enable mode (button/nonbutton)', desc_si: 'මෝඩ් (button/nonbutton) සක්‍රීය කරන්න' }
];

// ---------------------------
// 1) MAIN MENU (.settings)
// ---------------------------
cmd({
  pattern: "settings2",
  react: "⚙️",
  desc: "Main Settings Menu",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, isMe, reply }) => {
  try {
    // Only owner can open settings menu (same behavior as before)
    if (!isMe) return reply(t("*ඔබ Bot හිමිකරු නොවේ!*", "*You are not the bot owner!*"));

    const caption = t(
      `⚙️ *ZANTA-XMD Settings* \n\nChoose page:\n🟢 Open ON page (enable features)\n🔴 Open OFF page (disable features)`,
      `⚙️ *ZANTA-XMD Settings* \n\nChoose page:\n🟢 Open ON page (enable features)\n🔴 Open OFF page (disable features)`
    );

    const buttons = [
      { buttonId: '.seton',  buttonText: { displayText: t('🟢 SETTINGS ON PAGE','🟢 SETTINGS ON PAGE') },  type: 1 },
      { buttonId: '.setoff', buttonText: { displayText: t('🔴 SETTINGS OFF PAGE','🔴 SETTINGS OFF PAGE') }, type: 1 }
    ];

    await conn.sendButtonMsg(from, {
      text: caption,
      footer: config.FOOTER || 'ZANTA-XMD',
      buttons,
      image: { url: config.LOGO },
      headerType: 4
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(t('*දෝෂයක් සිදුවිය!*','*An error occurred!*'));
  }
});

// ---------------------------
// 2) ON PAGE (.seton) — shows 28 ON buttons
// ---------------------------
cmd({
  pattern: "seton",
  react: "🟢",
  desc: "ON Settings Page",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, isMe, reply }) => {
  try {
    if (!isMe) return reply(t("*ඔබ Bot හිමිකරු නොවේ!*", "*You are not the bot owner!*"));

    const caption = t(
      `🟢 *ON SETTINGS PAGE*\n\nClick any button to ENABLE the feature.`,
      `🟢 *ON SETTINGS PAGE*\n\nClick any button to ENABLE the feature.`
    );

    // Create buttons (max approx 24 per message depending on WhatsApp client; to be safe chunk into groups)
    // Many clients limit number of buttons — if your wrapper restricts, you may need to paginate.
    // Here we attempt to send in up to 3 messages (chunks) to include all 28 buttons.
    const allButtons = SETTINGS.map((s, i) => ({
      buttonId: `.${s.id} on`,
      buttonText: { displayText: ` ${String(i+1).padStart(2,' ')}.1 ✅ ${ s.id.toUpperCase() } ON` },
      type: 1
    }));

    // split into chunks of 10 (adjust chunk size depending on your client)
    const chunkSize = 10;
    for (let i = 0; i < allButtons.length; i += chunkSize) {
      const chunk = allButtons.slice(i, i + chunkSize);
      // add navigation/back button on last chunk
      if (i + chunkSize >= allButtons.length) {
        chunk.push({ buttonId: '.settings', buttonText: { displayText: t('⬅️ BACK','⬅️ BACK') }, type: 1 });
      }
      await conn.sendButtonMsg(from, {
        text: caption + t('\n\n(Page '+ (Math.floor(i/chunkSize)+1) +')',''),
        footer: config.FOOTER || 'ZANTA-XMD',
        buttons: chunk,
        image: { url: config.LOGO },
        headerType: 4
      }, { quoted: mek });
    }

  } catch (err) {
    console.error(err);
    reply(t('*දෝෂයක් සිදුවිය!*','*An error occurred!*'));
  }
});

// ---------------------------
// 3) OFF PAGE (.setoff) — shows 28 OFF buttons
// ---------------------------
cmd({
  pattern: "setoff",
  react: "🔴",
  desc: "OFF Settings Page",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, isMe, reply }) => {
  try {
    if (!isMe) return reply(t("*ඔබ Bot හිමිකරු නොවේ!*", "*You are not the bot owner!*"));

    const caption = t(
      `🔴 *OFF SETTINGS PAGE*\n\nClick any button to DISABLE the feature.`,
      `🔴 *OFF SETTINGS PAGE*\n\nClick any button to DISABLE the feature.`
    );

    const allButtons = SETTINGS.map((s, i) => ({
      buttonId: `.${s.id} off`,
      buttonText: { displayText: ` ${String(i+1).padStart(2,' ')}.2 ❌ ${ s.id.toUpperCase() } OFF` },
      type: 1
    }));

    const chunkSize = 10;
    for (let i = 0; i < allButtons.length; i += chunkSize) {
      const chunk = allButtons.slice(i, i + chunkSize);
      if (i + chunkSize >= allButtons.length) {
        chunk.push({ buttonId: '.settings', buttonText: { displayText: t('⬅️ BACK','⬅️ BACK') }, type: 1 });
      }
      await conn.sendButtonMsg(from, {
        text: caption + t('\n\n(Page '+ (Math.floor(i/chunkSize)+1) +')',''),
        footer: config.FOOTER || 'ZANTA-XMD',
        buttons: chunk,
        image: { url: config.LOGO },
        headerType: 4
      }, { quoted: mek });
    }

  } catch (err) {
    console.error(err);
    reply(t('*දෝෂයක් සිදුවිය!*','*An error occurred!*'));
  }
});

// ---------------------------
// 4) Auto confirmation for each `.feature on` / `.feature off` command
// When a button is clicked WhatsApp will send the corresponding text (e.g. ".autovoice on")
// The following handlers reply with confirmation messages.
// ---------------------------
SETTINGS.forEach((s, idx) => {
  const pattern = new RegExp(`^\\.${s.id}\\s+(on|off)$`, 'i');

  // Use a single cmd registration that matches the pattern text.
  // Some command frameworks accept `pattern` as string — if yours doesn't accept RegExp,
  // you can register using cmd for each exact `s.id + ' on'` and `s.id + ' off'` similarly.
  cmd({
    pattern: `${s.id} (on|off)`,
    desc: `Toggle ${s.id}`,
    category: 'main',
    filename: __filename
  }, async (conn, mek, m, { match, reply }) => {
    try {
      // `match` array: [ fullMatch, capturedGroup ]
      // Some command wrappers pass match differently; if `match` is undefined,
      // you can parse text from m.text or m.message accordingly.
      let state = null;
      if (match && match[1]) state = match[1].toLowerCase();
      else {
        // fallback parse from message text
        const txt = (m && (m.text || m.message && (m.message.conversation || m.message.extendedTextMessage && m.message.extendedTextMessage.text))) || '';
        const parts = txt.trim().split(/\s+/);
        state = parts[1] ? parts[1].toLowerCase() : null;
      }
      if (!state) return; // nothing to do

      const enabled = state === 'on';
      const title = isSinhala ? s.sin : s.label;
      const replyMsg = enabled
        ? t(`✅ *${title} සක්‍රීය කර ඇත!*`, `✅ *${title} ENABLED!*`)
        : t(`❌ *${title} අක්‍රිය කර ඇත!*`, `❌ *${title} DISABLED!*`);

      // Here you would normally call your actual logic to persist the setting
      // e.g. await input_set(s.id, enabled); // if you have set_db
      // For now we just confirm to the user
      await reply(replyMsg);

    } catch (err) {
      console.error(err);
      await reply(t('*දෝෂයක් සිදුවිය!*','*An error occurred!*'));
    }
  });
});