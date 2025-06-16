const fs = require("fs-extra");

module.exports = {
  config: {
    name: "ignoreonlyad",
    aliases: ["ignoreadonly", "ignoreonlyadmin", "ignoreadminonly"],
    version: "1.3",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    description: {
      en: "Ignore specific commands in adminonly mode",
      bn: "AdminOnly চালু থাকা অবস্থায় যেই কমান্ডগুলো Add করা থাকবে, সেগুলো normal user ও use করতে পারবে"
    },
    category: "owner",
    guide: {
      en: "{pn} add <command>\n{pn} del <command>\n{pn} list",
      bn: "{pn} add <command>: কোন command কে ignore list এ add করতে\n{pn} del <command>: কোন command কে ignore list থেকে বাদ দিতে\n{pn} list: ignore করা command গুলোর list দেখতে"
    }
  },

  langs: {
    en: {
      missingCommandNameToAdd: "⚠️ Please provide a command to add to ignore list.",
      missingCommandNameToDelete: "⚠️ Please provide a command to remove from ignore list.",
      commandNotFound: "❌ Command \"%1\" not found.",
      commandAlreadyInList: "❌ \"%1\" already in ignore list.",
      commandAdded: "✅ \"%1\" added to ignore list.",
      commandNotInList: "❌ \"%1\" is not in ignore list.",
      commandDeleted: "✅ \"%1\" removed from ignore list.",
      ignoreList: "📑 Commands ignored in adminonly: %1"
    },
    bn: {
      missingCommandNameToAdd: "⚠️ Add করার জন্য একটি command দিন.",
      missingCommandNameToDelete: "⚠️ Remove করার জন্য একটি command দিন.",
      commandNotFound: "❌ \"%1\" নামের কোন command খুঁজে পাওয়া যায়নি.",
      commandAlreadyInList: "❌ \"%1\" ইতিমধ্যে ignore list এ আছে.",
      commandAdded: "✅ \"%1\" ignore list এ যুক্ত হয়েছে.",
      commandNotInList: "❌ \"%1\" ignore list এ নেই.",
      commandDeleted: "✅ \"%1\" ignore list থেকে মুছে ফেলা হয়েছে.",
      ignoreList: "📑 AdminOnly তে যেই command গুলো ignore হচ্ছে: %1"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    const configPath = global.client.dirConfig;
    const configData = global.GoatBot.config;
    const ignoreList = configData.adminOnly.ignoreCommand || [];

    const lang = getLang;
    const cmdName = args[1]?.toLowerCase();
    const send = (key, ...rest) => message.reply(lang(key, ...rest));

    switch (args[0]) {
      case "add": {
        if (!cmdName) return send("missingCommandNameToAdd");
        if (!global.GoatBot.commands.has(cmdName)) return send("commandNotFound", cmdName);
        if (ignoreList.includes(cmdName)) return send("commandAlreadyInList", cmdName);

        ignoreList.push(cmdName);
        configData.adminOnly.ignoreCommand = ignoreList;
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
        return send("commandAdded", cmdName);
      }
      case "del":
      case "remove":
      case "rm":
      case "delete": {
        if (!cmdName) return send("missingCommandNameToDelete");
        if (!global.GoatBot.commands.has(cmdName)) return send("commandNotFound", cmdName);
        if (!ignoreList.includes(cmdName)) return send("commandNotInList", cmdName);

        configData.adminOnly.ignoreCommand = ignoreList.filter(cmd => cmd !== cmdName);
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
        return send("commandDeleted", cmdName);
      }
      case "list": {
        const showList = ignoreList.length ? ignoreList.join(", ") : "(Empty)";
        return send("ignoreList", showList);
      }
      default:
        return message.SyntaxError();
    }
  }
};
