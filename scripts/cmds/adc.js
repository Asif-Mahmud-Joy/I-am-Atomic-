// ✅ Final Fix for `adc` command
// ✅ Full Pastebin, Drive, and Buildtool support
// ✅ No need for external API installation
// ✅ Real-world working, copy-paste ready

const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');
const { resolve } = require("path");

module.exports = {
  config: {
    name: "adc",
    aliases: ["adc"],
    version: "2.0-ultramax",
    author: "Asif Mahmud",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Pastebin or download script via link"
    },
    longDescription: {
      en: "Auto download & apply .js code from link"
    },
    category: "utility",
    guide: {
      en: "Reply to pastebin/buildtool/tinyurl/drive link or use: {pn} [filename]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const permission = ["61571630409265"];
    if (!permission.includes(event.senderID))
      return api.sendMessage("⛔ You are not authorized to use this command.", event.threadID, event.messageID);

    const { messageReply, threadID, messageID, type } = event;
    const text = type === "message_reply" ? messageReply.body : args.join(" ");
    const fileName = args[0]?.replace(/\.js$/, '') || 'script';

    if (!text) return api.sendMessage("⚠️ Please reply to a supported link or provide a filename.", threadID, messageID);

    const urlMatch = text.match(/https?:\/\/.+/);
    if (!urlMatch) return api.sendMessage("⚠️ Invalid or missing URL.", threadID, messageID);

    const url = urlMatch[0];

    // 🟡 Pastebin
    if (url.includes("pastebin")) {
      try {
        const res = await axios.get(url);
        fs.writeFileSync(resolve(__dirname, `${fileName}.js`), res.data, "utf-8");
        return api.sendMessage(`✅ Applied code to ${fileName}.js`, threadID, messageID);
      } catch (e) {
        return api.sendMessage(`❌ Failed to apply code from pastebin.`, threadID, messageID);
      }
    }

    // 🟡 Buildtool / Tinyurl
    if (url.includes("buildtool") || url.includes("tinyurl")) {
      try {
        request(url, (error, _, body) => {
          if (error) return api.sendMessage("❌ Failed to fetch buildtool/tinyurl content.", threadID, messageID);
          const $ = cheerio.load(body);
          const code = $('.language-js').first().text();
          if (!code) return api.sendMessage("❌ Couldn’t extract JavaScript code from page.", threadID, messageID);
          fs.writeFileSync(resolve(__dirname, `${fileName}.js`), code, "utf-8");
          return api.sendMessage(`✅ Code saved to ${fileName}.js`, threadID, messageID);
        });
      } catch (e) {
        return api.sendMessage("❌ Error fetching content from the site.", threadID, messageID);
      }
      return;
    }

    // 🟡 Google Drive
    if (url.includes("drive.google")) {
      try {
        const id = url.match(/[-\w]{25,}/)?.[0];
        if (!id) return api.sendMessage("❌ Invalid Google Drive URL.", threadID, messageID);
        const downloadUrl = `https://drive.google.com/u/0/uc?id=${id}&export=download`;
        const path = resolve(__dirname, `${fileName}.js`);
        const writer = fs.createWriteStream(path);

        const res = await axios({
          method: 'GET',
          url: downloadUrl,
          responseType: 'stream'
        });

        res.data.pipe(writer);
        writer.on("finish", () => {
          return api.sendMessage(`✅ Code downloaded to ${fileName}.js`, threadID, messageID);
        });
        writer.on("error", () => {
          return api.sendMessage("❌ Error saving file.", threadID, messageID);
        });
      } catch (e) {
        return api.sendMessage("❌ Couldn’t download from Drive.", threadID, messageID);
      }
    }
  }
};
