const { resolve } = require("path");
const axios = require("axios");
const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const JavaScriptObfuscator = require("javascript-obfuscator");
const { PasteClient } = require("pastebin-api");

module.exports = {
  config: {
    name: "enc",
    aliases: ["encode", "encrypt", "obf", "obfuscate"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Encrypt javascript from directory or link",
    longDescription: "Encrypt (obfuscate) JS files or code from links and upload to pastebin",
    category: "owner",
    guide: {
      vi: "{pn} <filename>",
      en: "{pn} <filename>"
    }
  },

  onStart: async function ({ api, event, args, messageReply, type }) {
    const permission = global.GoatBot.config.GOD;
    const { senderID, threadID, messageID } = event;

    if (!permission.includes(senderID)) {
      return api.sendMessage("❌ Permission denied! Only bot owners can use this command.", threadID, messageID);
    }

    const filename = args[0];
    let text = (type === "message_reply" && messageReply.body) || "";

    if (!text && !filename) {
      return api.sendMessage("⚠️ Please reply to a code link or provide a filename.", threadID, messageID);
    }

    // ✅ WORKING Pastebin API client with a valid key
    const pasteClient = new PasteClient("aeGtA7rxefvTnR3AKmYwG-jxMo598whT");

    const obfuscateAndPaste = async (name, code) => {
      const obfuscated = JavaScriptObfuscator.obfuscate(code, {
        compact: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1
      }).getObfuscatedCode();

      const paste = await pasteClient.createPaste({
        code: obfuscated,
        expireDate: "N",
        format: "javascript",
        name,
        publicity: 1
      });

      return `✅ Paste created: https://pastebin.com/raw/${paste.split("/").pop()}`;
    };

    if (!text && filename) {
      try {
        const fileContent = fs.readFileSync(resolve(__dirname, `${filename}.js`), "utf-8");
        const result = await obfuscateAndPaste(args[1] || filename, fileContent);
        return api.sendMessage(result, threadID, messageID);
      } catch (err) {
        return api.sendMessage("❌ Could not read file or upload.", threadID, messageID);
      }
    }

    const urlMatch = text.match(/https?:\/\/[\w./?=&-]+/);
    if (!urlMatch) return api.sendMessage("❌ Invalid URL detected.", threadID, messageID);
    const url = urlMatch[0];

    try {
      if (url.includes("pastebin")) {
        const res = await axios.get(url);
        fs.writeFileSync(resolve(__dirname, `${filename}.js`), res.data, "utf-8");
        return api.sendMessage(`📥 Downloaded and saved as ${filename}.js`, threadID, messageID);
      }

      if (url.includes("buildtool") || url.includes("tinyurl")) {
        request({ method: "GET", url }, (err, res, body) => {
          if (err) return api.sendMessage("❌ Failed to fetch from the URL.", threadID, messageID);
          const $ = cheerio.load(body);
          const code = $(".language-js").first().text();
          if (!code) return api.sendMessage("❌ No JavaScript code found.", threadID, messageID);
          fs.writeFileSync(resolve(__dirname, `${filename}.js`), code, "utf-8");
          api.sendMessage(`📥 Code saved as ${filename}.js`, threadID, messageID);
        });
        return;
      }

      if (url.includes("drive.google")) {
        const id = url.match(/[-\w]{25,}/)?.[0];
        const downloadUrl = `https://drive.google.com/uc?id=${id}&export=download`;
        const path = resolve(__dirname, `${filename}.js`);
        await global.utils.downloadFile(downloadUrl, path);
        return api.sendMessage(`📥 Google Drive file saved as ${filename}.js`, threadID, messageID);
      }
    } catch (e) {
      return api.sendMessage("❌ An error occurred while processing the link.", threadID, messageID);
    }
  }
};
