const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "getfbstate",
    aliases: ["getstate", "atomkey", "nuclearcookie"],
    version: "3.0",
    author: "☢️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐒𝐈𝐅 ⚛️",
    countDown: 3,
    role: 2,
    shortDescription: "⚛️ Extract your atomic authentication keys",
    longDescription: "🔬 Retrieve and export your nuclear-grade Facebook authentication tokens",
    category: "👑 Owner",
    guide: {
      en: "▸ {pn} → Get standard appState\n▸ {pn} c → Get cookie format\n▸ {pn} s → Get string format"
    }
  },

  langs: {
    en: {
      success: "☢️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗨𝗧𝗛 𝗞𝗘𝗬𝗦 𝗘𝗫𝗧𝗥𝗔𝗖𝗧𝗘𝗗\n\n▸ Your nuclear authentication keys have been secured\n▸ Check your private messages for the payload",
      warning: "☣️ 𝗡𝗨𝗖𝗟𝗘𝗔𝗥 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗡𝗢𝗧𝗜𝗖𝗘\n\n▸ These keys grant FULL account access\n▸ NEVER share with untrusted parties\n▸ Treat like radioactive material",
      error: "☢️ 𝗙𝗜𝗦𝗦𝗜𝗢𝗡 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ Failed to extract authentication keys\n▸ System integrity compromised"
    }
  },

  onStart: async function ({ message, api, event, args, getLang }) {
    try {
      // Atomic-themed symbols
      const NUCLEAR = {
        HEADER: "☢️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗨𝗧𝗛𝗘𝗡𝗧𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗦𝗬𝗦𝗧𝗘𝗠 ⚛️",
        DIVIDER: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
        FOOTER: "⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝘂𝗰𝗹𝗲𝗮𝗿 𝗞𝗲𝘆 𝗘𝘅𝘁𝗿𝗮𝗰𝘁𝗶𝗼𝗻 𝗧𝗲𝗰𝗵"
      };

      const formatMessage = (content) => {
        return `${NUCLEAR.HEADER}\n${NUCLEAR.DIVIDER}\n${content}\n${NUCLEAR.DIVIDER}\n${NUCLEAR.FOOTER}`;
      };

      const appState = api.getAppState();
      let fbstate, fileName, fileType;

      // Determine output format using atomic-themed codes
      switch (args[0]?.toLowerCase()) {
        case "c": // Cookie format
        case "cookie":
        case "core":
          fbstate = JSON.stringify(appState.map(e => ({
            nucleus: "authentication_key",
            particle: e.key,
            charge: e.value
          })), null, 2);
          fileName = "nuclear_core.json";
          fileType = "Nuclear Core Configuration";
          break;

        case "s": // String format
        case "string":
        case "strand":
          fbstate = appState.map(e => `${e.key}⚡${e.value}`).join(" | ");
          fileName = "quantum_strand.txt";
          fileType = "Quantum Authentication Strand";
          break;

        default: // Standard JSON format
          fbstate = JSON.stringify(appState.map(e => ({
            particle: e.key,
            quantum_state: e.value
          })), null, 2);
          fileName = "atomic_matrix.json";
          fileType = "Atomic Authentication Matrix";
      }

      const filePath = path.join(__dirname, "tmp", fileName);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, fbstate);

      // Send success notification in thread
      if (event.senderID !== event.threadID) {
        await message.reply(formatMessage(getLang('success')));
      }

      // Send security warning with file
      await api.sendMessage({
        body: formatMessage(
          `☣️ 𝗡𝗨𝗖𝗟𝗘𝗔𝗥 𝗔𝗨𝗧𝗛𝗘𝗡𝗧𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗣𝗔𝗬𝗟𝗢𝗔𝗗\n\n` +
          `▸ Format: ${fileType}\n` +
          `▸ File: ${fileName}\n\n` +
          getLang('warning')
        ),
        attachment: fs.createReadStream(filePath)
      }, event.senderID);

      // Cleanup
      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("[NUCLEAR EXTRACTION ERROR]", err);
      await message.reply(getLang('error'));
    }
  }
};const fs = require("fs-extra");

module.exports = {
  config: {
    name: "getfbstate",
    aliases: ["getstate", "getcookie"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Get current Facebook appState (fbstate)"
    },
    longDescription: {
      en: "Retrieve and export your current Facebook appState in JSON, string, or cookies format."
    },
    category: "owner",
    guide: {
      en: "{pn} -> Get fbstate JSON\n{pn} c -> Get as cookies\n{pn} s -> Get as string"
    }
  },

  langs: {
    en: {
      success: "✅ Fbstate has been sent to your inbox. Check your message requests if not found."
    },
    bn: {
      success: "✅ Fbstate tumar inbox e pathano hoyeche. Jodi dekha na jae, message requests e check koro."
    }
  },

  onStart: async function ({ message, api, event, args, getLang }) {
    try {
      let fbstate;
      let fileName;
      const appState = api.getAppState();

      switch (args[0]) {
        case "cookie":
        case "cookies":
        case "c":
          fbstate = JSON.stringify(appState.map(e => ({ name: e.key, value: e.value })), null, 2);
          fileName = "cookies.json";
          break;

        case "string":
        case "str":
        case "s":
          fbstate = appState.map(e => `${e.key}=${e.value}`).join("; ");
          fileName = "cookiesString.txt";
          break;

        default:
          fbstate = JSON.stringify(appState, null, 2);
          fileName = "appState.json";
          break;
      }

      const path = `${__dirname}/tmp/${fileName}`;
      await fs.ensureDir(`${__dirname}/tmp`);
      await fs.writeFile(path, fbstate);

      if (event.senderID !== event.threadID) {
        await message.reply(getLang("success"));
      }

      api.sendMessage({
        body: `📤 Here is your fbstate file: ${fileName}`,
        attachment: fs.createReadStream(path)
      }, event.senderID, () => fs.unlinkSync(path));

    } catch (err) {
      console.error("[GETFBSTATE ERROR]", err);
      return message.reply("❌ Somossa hoise fbstate pathate. Try again.");
    }
  }
};
