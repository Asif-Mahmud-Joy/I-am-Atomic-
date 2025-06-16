const fs = require("fs-extra");

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
