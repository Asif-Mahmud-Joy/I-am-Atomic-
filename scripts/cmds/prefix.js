const fs = require("fs-extra");
const { utils } = global;

const ADMIN_UID = "61571630409265";
const PREFIX_IMAGE = "https://files.catbox.moe/e7bozl.jpg";

module.exports = {
  config: {
    name: "prefix",
    aliases: ["botprefix", "setprefix"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "Manage bot prefix settings",
    longDescription: "Change or view bot prefix for current chat or globally",
    category: "⚙️ Configuration",
    guide: {
      en: `
✦ Usage:
  {pn} - Show current prefixes
  {pn} <new> - Set chat prefix
  {pn} <new> -g - Set global prefix (Owner Only)
  {pn} reset - Reset to default prefix
  {pn} admin - Admin interface (Admins only)
✦ Examples:
  {pn} $
  {pn} ! -g
  {pn} reset
  {pn} admin
      `
    }
  },

  langs: {
    en: {
      reset: "✨ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙧𝙚𝙨𝙚𝙩 𝙥𝙧𝙚𝙛𝙞𝙭 𝙩𝙤 𝙙𝙚𝙛𝙖𝙪𝙡𝙩: %1 ✨",
      onlyAdmin: "⚠️ 𝗢𝗻𝗹𝘆 𝗯𝗼𝘁 𝗮𝗱𝗺𝗶𝗻𝘀 𝗰𝗮𝗻 𝗰𝗵𝗮𝗻𝗴𝗲 𝗴𝗹𝗼𝗯𝗮𝗹 𝗽𝗿𝗲𝗳𝗶𝘅! ⚠️",
      onlyOwner: "⛔ 𝗢𝗻𝗹𝘆 𝘁𝗵𝗲 𝗯𝗼𝘁 𝗼𝘄𝗻𝗲𝗿 𝗰𝗮𝗻 𝗰𝗵𝗮𝗻𝗴𝗲 𝘁𝗵𝗲 𝗴𝗹𝗼𝗯𝗮𝗹 𝗽𝗿𝗲𝗳𝗶𝘅! ⛔",
      confirmGlobal: "❓ 𝗥𝗲𝗮𝗰𝘁 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗿𝗺 𝗴𝗹𝗼𝗯𝗮𝗹 𝗽𝗿𝗲𝗳𝗶𝘅 𝗰𝗵𝗮𝗻𝗴𝗲 𝘁𝗼: %1 ❓",
      confirmThisThread: "❓ 𝗥𝗲𝗮𝗰𝘁 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗿𝗺 𝗰𝗵𝗮𝘁 𝗽𝗿𝗲𝗳𝗶𝘅 𝗰𝗵𝗮𝗻𝗴𝗲 𝘁𝗼: %1 ❓",
      successGlobal: "✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙪𝙥𝙙𝙖𝙩𝙚𝙙 𝙜𝙡𝙤𝙗𝙖𝙡 𝙥𝙧𝙚𝙛𝙞𝙭 𝙩𝙤: %1 ✅",
      successThisThread: "✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙪𝙥𝙙𝙖𝙩𝙚𝙙 𝙘𝙝𝙖𝙩 𝙥𝙧𝙚𝙛𝙞𝙭 𝙩𝙤: %1 ✅",
      adminOnly: "⛔ 𝗢𝗻𝗹𝘆 𝗮𝗱𝗺𝗶𝗻𝘀 𝗰𝗮𝗻 𝗮𝗰𝗰𝗲𝘀𝘀 𝘁𝗵𝗶𝘀 𝗶𝗻𝘁𝗲𝗿𝗳𝗮𝗰𝗲 ⛔",
      invalidPrefix: "⚠️ Prefix must be 1-5 characters!",
      error: "❌ An error occurred. Please try again later.",
      myPrefix: `
✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
🦋 𝐴𝑆𝑆𝐴𝐿𝐴𝑀𝑈 𝐴𝐿𝐴𝐼𝐾𝑈𝑀 ✨
✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
                       
 𝑴𝑦 𝑛𝑎𝑚𝑒 𝑖𝑠 🎭𝑨𝒕𝒐𝒎𝒊𝒄 𝑩𝒐𝒕☣
 𝑯𝒆𝒓𝒆 𝒊𝒔 𝒎𝒚 𖤍 𝙋𝙍𝙀𝙁𝙄𝙓 𖤍
                         
 ❄ 𝘚𝘠𝘚𝘛𝘌𝘔 𝘗𝘙𝘌𝘍𝘐𝘟: 【%1】
 ♻ 𝘎𝘙𝘖𝘜𝘗 𝘗𝘙𝘌𝘍𝘐𝘟: 【%2】
                         
 ♔ 𝙊𝙒𝙉𝙀𝙍 ♔ :♡ 𝑨𝒔𝒊𝒇 ♡
      `,
      adminInterface: `
✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
🦋 𝐴𝑆𝑆𝐴𝐿𝐴𝑀𝑈 𝐴𝐿𝐴𝐼𝐾𝑈𝑀 ✨ 𝘈𝘥𝘮𝘪𝘯 ✨
✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦

🎭 𝑨𝒕𝒐𝒎𝒊𝒄 𝑩𝒐𝒕 𝑨𝒅𝒎𝒊𝒏 𝑰𝒏𝒕𝒆𝒓𝒇𝒂𝒄𝒆 ☣

❄️ 𝙋𝙍𝙀𝙁𝙄𝙓 𝘼𝘿𝙈𝙄𝙉 𝙄𝙉𝙁𝙊:

🌐 𝙂𝙇𝙊𝘽𝘼𝙇 𝙋𝙍𝙀𝙁𝙄𝙓: 【%1】
💬 𝙂𝙍𝙊𝙐𝙋 𝙋𝙍𝙀𝙁𝙄𝙓: 【%2】
👑 𝙊𝙒𝙉𝙀𝙍 𝙐𝙄𝘿: ${ADMIN_UID}

🔐 𝙋𝙍𝙄𝙑𝙄𝙇𝙀𝙂𝙀𝘿 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎:
  ✦ /prefix <new> -g » Set global prefix (Owner only)
  ✦ /prefix <new>    » Set group prefix
  ✦ /prefix reset   » Reset group prefix
  ✦ /prefix admin   » Show this interface

✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦

♔ 𝙊𝙒𝙉𝙀𝙍 » ♡ 𝑨𝒔𝒊𝒇 ♡
      `
    }
  },

  onStart: async function ({ 
    message, 
    role, 
    args, 
    commandName, 
    event, 
    threadsData, 
    getLang 
  }) {
    try {
      const action = args[0]?.toLowerCase();

      // Admin Interface
      if (action === "admin") {
        if (role < 1) {
          return message.reply(getLang("adminOnly"));
        }
        
        const globalPrefix = global.GoatBot.config.prefix;
        const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;
        
        return message.reply({
          body: getLang("adminInterface")
            .replace("%1", globalPrefix)
            .replace("%2", threadPrefix),
          attachment: await utils.getStreamFromURL(PREFIX_IMAGE)
        });
      }

      // Show prefix info if no arguments
      if (!action) {
        return this.showPrefixInfo(message, threadsData, event, getLang);
      }

      // Reset prefix
      if (action === "reset") {
        await threadsData.set(event.threadID, null, "data.prefix");
        return message.reply(getLang("reset", global.GoatBot.config.prefix));
      }

      // Set new prefix
      const newPrefix = action;
      
      // Validate prefix length
      if (newPrefix.length > 5 || newPrefix.length < 1) {
        return message.reply(getLang("invalidPrefix"));
      }

      const setGlobal = args[1] === "-g";
      
      // Owner verification for global changes
      if (setGlobal) {
        if (role < 2) {
          return message.reply(getLang("onlyAdmin"));
        }
        if (event.senderID !== ADMIN_UID) {
          return message.reply(getLang("onlyOwner"));
        }
      }

      // Confirmation message
      const confirmMessage = setGlobal 
        ? getLang("confirmGlobal", newPrefix) 
        : getLang("confirmThisThread", newPrefix);
      
      const msg = await message.reply(confirmMessage);
      
      // Set reaction handler
      global.GoatBot.onReaction.set(msg.messageID, {
        commandName,
        author: event.senderID,
        newPrefix,
        setGlobal
      });
    } catch (error) {
      console.error("Prefix Command Error:", error);
      message.reply(getLang("error"));
    }
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    try {
      // Verify reaction author
      if (event.userID !== Reaction.author) return;
      
      const { newPrefix, setGlobal } = Reaction;
      
      if (setGlobal) {
        // Update global prefix
        global.GoatBot.config.prefix = newPrefix;
        fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
        return message.reply(getLang("successGlobal", newPrefix));
      }
      
      // Update thread prefix
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    } catch (error) {
      console.error("Prefix Reaction Error:", error);
      message.reply(getLang("error"));
    }
  },

  onChat: async function ({ event, message, threadsData, role }) {
    const body = event.body?.toLowerCase() || "";
    
    // Respond to "prefix" keyword
    if (body === "prefix") {
      this.showPrefixInfo(message, threadsData, event);
    }
    // Auto-show admin interface for admins
    else if (body === "prefix admin" && role >= 1) {
      const globalPrefix = global.GoatBot.config.prefix;
      const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;
      
      message.reply({
        body: this.langs.en.adminInterface
          .replace("%1", globalPrefix)
          .replace("%2", threadPrefix),
        attachment: await utils.getStreamFromURL(PREFIX_IMAGE)
      });
    }
  },

  showPrefixInfo: async function (message, threadsData, event, getLang) {
    try {
      const globalPrefix = global.GoatBot.config.prefix;
      const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;
      const lang = getLang || this.langs.en;
      
      message.reply({
        body: lang.myPrefix
          .replace("%1", globalPrefix)
          .replace("%2", threadPrefix),
        attachment: await utils.getStreamFromURL(PREFIX_IMAGE)
      });
    } catch (error) {
      console.error("Prefix Info Error:", error);
      message.reply(this.langs.en.error);
    }
  }
};
