const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

// 𝗔𝘁𝗼𝗺𝗶𝗰 𝗗𝗲𝘀𝗶𝗴𝗻 𝗖𝗼𝗻𝘀𝘁𝗮𝗻𝘁𝘀
const ATOMIC = {
  BANNER: "☣️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗘𝗩𝗘𝗡𝗧 𝗠𝗔𝗡𝗔𝗚𝗘𝗥 ⚛️",
  DIVIDER: "▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄",
  FOOTER: "⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗦𝘆𝘀𝘁𝗲𝗺"
};

function getDomain(url) {
  return url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im)?.[1];
}

module.exports = {
  config: {
    name: "event",
    version: "3.0",
    author: "☣️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐒𝐈𝐅 ⚛️",
    countDown: 3,
    role: 2,
    description: {
      en: "⚡ 𝗔𝗱𝘃𝗮𝗻𝗰𝗲𝗱 𝗘𝘃𝗲𝗻𝘁 𝗖𝗼𝗻𝘁𝗿𝗼𝗹 𝗣𝗮𝗻𝗲𝗹",
      bn: "⚡ 𝗔𝗱𝘃𝗮𝗻𝗰𝗲𝗱 𝗘𝘃𝗲𝗻𝘁 𝗠𝗮𝗻𝗮𝗴𝗺𝗲𝗻𝘁 𝗦𝘆𝘀𝘁𝗲𝗺"
    },
    category: "👑 𝗢𝘄𝗻𝗲𝗿",
    guide: {
      en: `▸ {pn} load <filename> → 𝗟𝗼𝗮𝗱 𝗮 𝗲𝘃𝗲𝗻𝘁
▸ {pn} loadAll → 𝗟𝗼𝗮𝗱 𝗮𝗻𝗶𝗻𝘀𝘁𝗮𝗹𝗹𝗲𝗱 𝗲𝘃𝗲𝗻𝘁𝘀
▸ {pn} install <url/code> <file.js> → 𝗜𝗻𝘀𝘁𝗮𝗹𝗹 𝗻𝗲𝘄 𝗲𝘃𝗲𝗻𝘁
▸ {pn} unload <filename> → 𝗨𝗻𝗹𝗼𝗮𝗱 𝗲𝘃𝗲𝗻𝘁`
    }
  },

  langs: {
    en: {
      success: "✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 %1",
      error: "☢️ 𝗘𝗿𝗿𝗼𝗿: %1",
      warning: "⚠️ 𝗪𝗮𝗿𝗻𝗶𝗻𝗴: %1",
      info: "ℹ️ 𝗜𝗻𝗳𝗼: %1",
      loaded: "loaded event '%2'",
      unloaded: "unloaded event '%2'",
      installed: "installed event '%2' to %3",
      fileExist: "File exists! React with 🔄 to overwrite",
      invalidFile: "Invalid filename! Must end with .js",
      fileNotFound: "File '%2' not found in events folder",
      stats: "📊 𝗘𝘃𝗲𝗻𝘁 𝗦𝘁𝗮𝘁𝘀: %1 loaded | %2 failed"
    }
  },

  onStart: async function ({ args, message, event, api, getLang }) {
    const { configCommands } = global.GoatBot;
    const { log, loadScripts } = global.utils;

    const createMessage = (type, ...params) => {
      const template = {
        success: `✨ ${ATOMIC.BANNER}\n${ATOMIC.DIVIDER}\n✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀:\n» ${getLang(type, ...params)}\n${ATOMIC.DIVIDER}\n${ATOMIC.FOOTER}`,
        error: `💥 ${ATOMIC.BANNER}\n${ATOMIC.DIVIDER}\n☢️ 𝗘𝗿𝗿𝗼𝗿:\n» ${getLang(type, ...params)}\n${ATOMIC.DIVIDER}\n${ATOMIC.FOOTER}`,
        warning: `⚠️ ${ATOMIC.BANNER}\n${ATOMIC.DIVIDER}\n⚠️ 𝗪𝗮𝗿𝗻𝗶𝗻𝗴:\n» ${getLang(type, ...params)}\n${ATOMIC.DIVIDER}\n${ATOMIC.FOOTER}`,
        info: `ℹ️ ${ATOMIC.BANNER}\n${ATOMIC.DIVIDER}\nℹ️ 𝗜𝗻𝗳𝗼:\n» ${getLang(type, ...params)}\n${ATOMIC.DIVIDER}\n${ATOMIC.FOOTER}`
      };
      return template[type.split('_')[0]] || getLang(type, ...params);
    };

    // 𝗟𝗼𝗮𝗱 𝗖𝗼𝗺𝗺𝗮𝗻𝗱
    if (args[0] === "load" && args[1]) {
      const info = loadScripts("events", args[1], log, configCommands, api);
      return message.reply(
        info.status === "success" 
          ? createMessage("success_loaded", info.name)
          : createMessage("error", `Failed to load '${args[1]}'\n${info.error.name}: ${info.error.message}`)
      );
    }

    // 𝗟𝗼𝗮𝗱 𝗔𝗹𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀
    if (args[0] === "loadAll") {
      const eventFiles = fs.readdirSync(path.join(__dirname, "..", "events"))
        .filter(f => f.endsWith(".js") && !f.includes("example"));
      
      let loaded = 0, failed = 0;
      const results = [];

      for (const file of eventFiles) {
        const info = loadScripts("events", file, log, configCommands, api);
        if (info.status === "success") {
          loaded++;
          results.push(`✅ ${file}`);
        } else {
          failed++;
          results.push(`❌ ${file} → ${info.error.name}`);
        }
      }

      return message.reply(
        `☣️ ${ATOMIC.BANNER}\n${ATOMIC.DIVIDER}\n` +
        getLang("stats", loaded, failed) + "\n" +
        results.join("\n") + `\n${ATOMIC.DIVIDER}\n` +
        ATOMIC.FOOTER
      );
    }

    // 𝗨𝗻𝗹𝗼𝗮𝗱 𝗖𝗼𝗺𝗺𝗮𝗻𝗱
    if (args[0] === "unload" && args[1]) {
      const info = global.utils.unloadScripts("events", args[1], configCommands);
      return message.reply(
        info.status === "success"
          ? createMessage("success_unloaded", info.name)
          : createMessage("error", `Failed to unload '${args[1]}'\n${info.error.name}: ${info.error.message}`)
      );
    }

    // 𝗜𝗻𝘀𝘁𝗮𝗹𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱
    if (args[0] === "install") {
      if (!args[1] || !args[2]) 
        return message.reply(createMessage("warning", "Missing URL/code or filename"));

      const fileName = args[2].endsWith(".js") ? args[2] : args[2] + ".js";
      if (!fileName.endsWith(".js"))
        return message.reply(createMessage("error_invalidFile"));

      let rawCode;
      try {
        // Handle URL installation
        if (args[1].match(/https?:\/\//)) {
          let url = args[1];
          const domain = getDomain(url);

          // Special handling for common code sharing platforms
          if (domain === "pastebin.com") 
            url = url.replace(/pastebin\.com\/(?!raw\/)/, "pastebin.com/raw/");
          if (domain === "github.com")
            url = url.replace(/github\.com\/(.*)\/blob\//, "raw.githubusercontent.com/$1/");

          const response = await axios.get(url);
          rawCode = domain === "savetext.net" 
            ? cheerio.load(response.data)("#content").text() 
            : response.data;
        } 
        // Handle direct code input
        else {
          rawCode = event.body.slice(event.body.indexOf(args[1]), event.body.length);
        }

        if (!rawCode) throw new Error("No valid code found");
      } catch (e) {
        return message.reply(createMessage("error", "Invalid code/URL or connection failed"));
      }

      const filePath = path.join(__dirname, "..", "events", fileName);
      if (fs.existsSync(filePath)) {
        return message.reply(
          createMessage("warning_fileExist"), 
          (err, info) => {
            global.GoatBot.onReaction.set(info.messageID, {
              commandName: "event",
              messageID: info.messageID,
              author: event.senderID,
              data: { fileName, rawCode }
            });
          }
        );
      }

      const info = loadScripts("events", fileName, log, configCommands, api, null, null, null, null, null, null, null, getLang, rawCode);
      return message.reply(
        info.status === "success"
          ? createMessage("success_installed", info.name, filePath)
          : createMessage("error", `Install failed for '${fileName}'\n${info.error.name}: ${info.error.message}`)
      );
    }

    // 𝗗𝗲𝗳𝗮𝘂𝗹𝘁 𝗛𝗲𝗹𝗽
    message.reply(
      `☣️ ${ATOMIC.BANNER}\n${ATOMIC.DIVIDER}\n` +
      `⚡ 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:\n` +
      `▸ ${this.config.guide.en.replace(/\{pn\}/g, this.config.name)}\n` +
      `${ATOMIC.DIVIDER}\n${ATOMIC.FOOTER}`
    );
  },

  onReaction: async function ({ Reaction, event, message, getLang }) {
    if (event.userID !== Reaction.author) return;

    const { fileName, rawCode } = Reaction.data;
    const { configCommands } = global.GoatBot;
    const { log, loadScripts } = global.utils;

    const info = loadScripts("events", fileName, log, configCommands, null, null, null, null, null, null, null, getLang, rawCode);
    
    message.reply(
      info.status === "success"
        ? `♻️ ${ATOMIC.BANNER}\n${ATOMIC.DIVIDER}\n✅ Successfully overwrote '${fileName}'\n${ATOMIC.DIVIDER}\n${ATOMIC.FOOTER}`
        : createMessage("error", `Overwrite failed for '${fileName}'\n${info.error.name}: ${info.error.message}`),
      () => message.unsend(Reaction.messageID)
    );
  }
};
