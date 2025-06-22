const fs = require("fs-extra");

module.exports = {
  config: {
    name: "ignoreonlyad",
    aliases: ["ignoreadonly", "ignoreonlyadmin", "ignoreadminonly", "adignore"],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    role: 2,
    description: {
      en: "Manage commands that bypass admin-only restrictions",
      bn: "AdminOnly মোডে উপেক্ষিত কমান্ড ব্যবস্থাপনা"
    },
    category: "owner",
    guide: {
      en: "{pn} add <command> - Add command to ignore list\n"
        + "{pn} del <command> - Remove command from ignore list\n"
        + "{pn} list - View current ignore list",
      bn: "{pn} add <command> - কমান্ডকে উপেক্ষা তালিকায় যোগ করুন\n"
        + "{pn} del <command> - কমান্ডকে উপেক্ষা তালিকা থেকে সরান\n"
        + "{pn} list - বর্তমান উপেক্ষা তালিকা দেখুন"
    }
  },

  langs: {
    en: {
      missingCommand: "⚠️ Please specify a command name",
      cmdNotFound: "❌ Command \"%1\" not found in command list",
      cmdInList: "❌ Command \"%1\" is already in ignore list",
      cmdAdded: "✅ Command \"%1\" added to ignore list successfully",
      cmdNotInList: "❌ Command \"%1\" is not in ignore list",
      cmdRemoved: "✅ Command \"%1\" removed from ignore list",
      ignoreList: "📑 Current AdminOnly Ignore List:\n%1",
      emptyList: "📭 Ignore list is currently empty",
      syntaxError: "🔄 Usage: {pn} [add|del|list] <command>",
      reloadNotice: "🔄 Reloading configuration...",
      reloadSuccess: "♻️ Configuration reloaded successfully"
    },
    bn: {
      missingCommand: "⚠️ অনুগ্রহ করে একটি কমান্ডের নাম উল্লেখ করুন",
      cmdNotFound: "❌ \"%1\" কমান্ডটি খুঁজে পাওয়া যায়নি",
      cmdInList: "❌ \"%1\" কমান্ডটি ইতিমধ্যেই উপেক্ষা তালিকায় রয়েছে",
      cmdAdded: "✅ \"%1\" কমান্ডটি সফলভাবে উপেক্ষা তালিকায় যোগ করা হয়েছে",
      cmdNotInList: "❌ \"%1\" কমান্ডটি উপেক্ষা তালিকায় নেই",
      cmdRemoved: "✅ \"%1\" কমান্ডটি উপেক্ষা তালিকা থেকে সরানো হয়েছে",
      ignoreList: "📑 বর্তমান AdminOnly উপেক্ষা তালিকা:\n%1",
      emptyList: "📭 উপেক্ষা তালিকা বর্তমানে খালি",
      syntaxError: "🔄 ব্যবহার: {pn} [add|del|list] <কমান্ড>",
      reloadNotice: "🔄 কনফিগারেশন পুনরায় লোড করা হচ্ছে...",
      reloadSuccess: "♻️ কনফিগারেশন সফলভাবে পুনরায় লোড করা হয়েছে"
    }
  },

  onStart: async function ({ args, message, getLang, usersData }) {
    const configPath = global.client.dirConfig;
    const config = JSON.parse(fs.readFileSync(configPath));
    const ignoreList = config.adminOnly.ignoreCommand || [];
    const command = args[1]?.toLowerCase();
    const action = args[0]?.toLowerCase();
    const lang = getLang;
    const adminUid = "61571630409265"; // Replace with your UID

    // Check if user is admin
    const senderID = message.senderID;
    if (senderID !== adminUid) {
      return message.reply("⚠️ You are not authorized to use this command");
    }

    try {
      switch (action) {
        case "add": {
          if (!command) return message.reply(lang("missingCommand"));
          if (!global.GoatBot.commands.has(command)) 
            return message.reply(lang("cmdNotFound", command));
          if (ignoreList.includes(command)) 
            return message.reply(lang("cmdInList", command));
          
          ignoreList.push(command);
          config.adminOnly.ignoreCommand = [...new Set(ignoreList)]; // Remove duplicates
          await this.saveConfig(config, configPath);
          return message.reply(lang("cmdAdded", command));
        }

        case "del":
        case "remove":
        case "delete": {
          if (!command) return message.reply(lang("missingCommand"));
          if (!ignoreList.includes(command)) 
            return message.reply(lang("cmdNotInList", command));
          
          config.adminOnly.ignoreCommand = ignoreList.filter(cmd => cmd !== command);
          await this.saveConfig(config, configPath);
          return message.reply(lang("cmdRemoved", command));
        }

        case "list": {
          if (ignoreList.length === 0) 
            return message.reply(lang("emptyList"));
          
          const listText = ignoreList.map(cmd => `⦿ ${cmd}`).join("\n");
          return message.reply(lang("ignoreList", listText));
        }

        case "reload": {
          await message.reply(lang("reloadNotice"));
          delete require.cache[require.resolve(configPath)];
          global.GoatBot.config = require(configPath);
          return message.reply(lang("reloadSuccess"));
        }

        default: {
          return message.reply(lang("syntaxError"));
        }
      }
    } catch (err) {
      console.error("[IgnoreOnlyAd Command Error]", err);
      return message.reply("⚠️ An error occurred: " + err.message);
    }
  },

  saveConfig: async function (config, path) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(config, null, 2), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};
