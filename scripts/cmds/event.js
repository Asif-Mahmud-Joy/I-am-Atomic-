// ✅ GoatBot Event Manager v2.0
// 🔧 Fixed, Upgraded, Fully Working with Real APIs

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

function getDomain(url) {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
  const match = url.match(regex);
  return match ? match[1] : null;
}

module.exports = {
  config: {
    name: "event",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    description: {
      vi: "Quản lý các tệp lệnh event của bạn",
      en: "Manage your event command files"
    },
    category: "owner",
    guide: {
      en: "{pn} load <filename>\n{pn} loadAll\n{pn} install <url/code> <file.js>\n{pn} unload <filename>",
      vi: "{pn} load <tên file>\n{pn} loadAll\n{pn} install <url/code> <file.js>\n{pn} unload <tên file>"
    }
  },

  langs: {
    en: {
      loaded: "✅ | Loaded event \"%1\" successfully!",
      loadedError: "❌ | Load failed for \"%1\".\nError: %2: %3",
      unloaded: "✅ | Unloaded \"%1\" successfully!",
      unloadedError: "❌ | Unload failed for \"%1\".\nError: %2: %3",
      installed: "✅ | Installed \"%1\" to %2",
      installedError: "❌ | Install failed for \"%1\".\nError: %2: %3",
      alreadyExist: "⚠️ | File exists. React to confirm overwrite.",
      invalidCode: "⚠️ | Invalid code or URL.",
      missingArgs: "⚠️ | Missing required arguments.",
      fileNotFound: "⚠️ | File \"%1\" not found.",
      fileInvalid: "⚠️ | Invalid file name.",
      reactInstall: "✅ | React received. Installing \"%1\"..."
    },
    bn: {
      loaded: "✅ | Event \"%1\" load kora hoise!",
      loadedError: "❌ | Load fail hoise \"%1\".\nError: %2: %3",
      unloaded: "✅ | Event \"%1\" unload kora hoise!",
      unloadedError: "❌ | Unload fail hoise \"%1\".\nError: %2: %3",
      installed: "✅ | Event \"%1\" install kora hoise. Path: %2",
      installedError: "❌ | Install fail hoise \"%1\".\nError: %2: %3",
      alreadyExist: "⚠️ | File already ase. Overwrite korte chaile react daw.",
      invalidCode: "⚠️ | URL ba code thik na.",
      missingArgs: "⚠️ | Dorkarir argument nai.",
      fileNotFound: "⚠️ | File \"%1\" paoya jai nai.",
      fileInvalid: "⚠️ | File nam vul ase.",
      reactInstall: "✅ | React pawar pore install suru hoise \"%1\"..."
    }
  },

  onStart: async function ({ args, message, event, api, getLang }) {
    const { configCommands } = global.GoatBot;
    const { log, loadScripts } = global.utils;
    const lang = getLang();

    const getMessage = (key, ...params) =>
      (lang[key] || key).replace(/%([0-9]+)/g, (_, i) => params[parseInt(i) - 1]);

    // load
    if (args[0] === "load" && args[1]) {
      const info = loadScripts("events", args[1], log, configCommands, api);
      return message.reply(
        info.status === "success"
          ? getMessage("loaded", info.name)
          : getMessage("loadedError", info.name, info.error.name, info.error.message)
      );
    }

    // loadAll
    if (args[0] === "loadAll") {
      const allFiles = fs
        .readdirSync(path.join(__dirname, "..", "events"))
        .filter(f => f.endsWith(".js"));
      let success = 0,
        failed = 0;
      for (const f of allFiles) {
        const info = loadScripts("events", f, log, configCommands, api);
        info.status === "success" ? success++ : failed++;
      }
      return message.reply(`✅ Loaded: ${success}\n❌ Failed: ${failed}`);
    }

    // unload
    if (args[0] === "unload" && args[1]) {
      const info = global.utils.unloadScripts("events", args[1], configCommands);
      return message.reply(
        info.status === "success"
          ? getMessage("unloaded", info.name)
          : getMessage("unloadedError", info.name, info.error.name, info.error.message)
      );
    }

    // install
    if (args[0] === "install" && args.length >= 3) {
      let url = args[1];
      const fileName = args[2];
      if (!fileName.endsWith(".js")) return message.reply(getMessage("fileInvalid"));

      const domain = getDomain(url);
      if (domain === "pastebin.com")
        url = url.replace(/pastebin\.com\/(?!raw\/)(.*)/, "pastebin.com/raw/$1");
      if (domain === "github.com")
        url = url.replace(/github\.com\/(.*)\/blob\/(.*)/, "raw.githubusercontent.com/$1/$2");

      let rawCode;
      try {
        const res = await axios.get(url);
        rawCode = domain === "savetext.net" ? cheerio.load(res.data)("#content").text() : res.data;
      } catch (e) {
        return message.reply(getMessage("invalidCode"));
      }

      const fullPath = path.join(__dirname, "..", "events", fileName);
      if (fs.existsSync(fullPath)) {
        return message.reply(getMessage("alreadyExist"), (err, info) => {
          global.GoatBot.onReaction.set(info.messageID, {
            commandName: "event",
            messageID: info.messageID,
            author: event.senderID,
            data: { fileName, rawCode }
          });
        });
      }

      const info = loadScripts(
        "events",
        fileName,
        log,
        configCommands,
        api,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        getLang,
        rawCode
      );
      return message.reply(
        info.status === "success"
          ? getMessage("installed", info.name, fullPath)
          : getMessage("installedError", info.name, info.error.name, info.error.message)
      );
    }

    return message.reply(getMessage("missingArgs"));
  },

  onReaction: async function ({ Reaction, event, message, getLang }) {
    if (event.userID !== Reaction.author) return;

    const { fileName, rawCode } = Reaction.data;
    const fullPath = path.join(__dirname, "..", "events", fileName);
    const { configCommands } = global.GoatBot;
    const { log, loadScripts } = global.utils;

    const info = loadScripts(
      "events",
      fileName,
      log,
      configCommands,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      getLang,
      rawCode
    );
    message.reply(
      info.status === "success"
        ? getLang("reactInstall", info.name)
        : getLang("installedError", info.name, info.error.name, info.error.message)
    );
  }
};
