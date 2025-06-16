const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "delete",
    aliases: ["del"],
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    version: "1.1",
    role: 2,
    shortDescription: "Delete a file from command folder",
    longDescription: "Securely deletes a specific command file by name.",
    category: "system",
    guide: "{pn} <filename.js>"
  },

  onStart: async function ({ api, event, args }) {
    const fileName = args[0];

    if (!fileName)
      return api.sendMessage("⚠️ | File name dao jeita delete korte chai.", event.threadID);

    if (!fileName.endsWith(".js"))
      return api.sendMessage("⚠️ | Only .js command file delete kora jabe.", event.threadID);

    const filePath = path.join(__dirname, `${fileName}`);

    try {
      if (!fs.existsSync(filePath))
        return api.sendMessage(`❎ | ${fileName} file pawa jay nai.`, event.threadID);

      await fs.remove(filePath);
      api.sendMessage(`✅ | (${fileName}) file successfully delete kora hoise.`, event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage(`❌ | (${fileName}) delete kora gele error hoise.`, event.threadID);
    }
  }
};
