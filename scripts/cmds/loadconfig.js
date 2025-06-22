const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "loadconfig",
    aliases: ["loadcf", "reloadcfg", "refreshcfg"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    role: 2,
    shortDescription: {
      en: "Reload bot configuration files",
      bn: "বট কনফিগারেশন ফাইল পুনরায় লোড করুন"
    },
    longDescription: {
      en: "Reloads bot configuration files with detailed feedback and error handling",
      bn: "বট এবং কমান্ড কনফিগারেশন ফাইলগুলি পুনরায় লোড করে বিস্তারিত প্রতিক্রিয়া এবং ত্রুটি পরিচালনা প্রদান করে"
    },
    category: "owner",
    guide: {
      en: "{pn} [main | commands | all]",
      bn: "{pn} [main | commands | all]"
    }
  },

  langs: {
    en: {
      reloading: "🔄 Reloading configuration files...",
      success: "✅ Config reloaded successfully!\n\n• Main Config: {mainStatus}\n• Commands Config: {cmdStatus}",
      fileError: "❌ Error loading {file}: {error}",
      invalidArg: "⚠️ Invalid argument. Use: main, commands, or all",
      notExist: "❌ File does not exist: {file}"
    },
    bn: {
      reloading: "🔄 কনফিগারেশন ফাইল পুনরায় লোড করা হচ্ছে...",
      success: "✅ কনফিগ সফলভাবে পুনরায় লোড হয়েছে!\n\n• প্রধান কনফিগ: {mainStatus}\n• কমান্ড কনফিগ: {cmdStatus}",
      fileError: "❌ {file} লোড করতে সমস্যা: {error}",
      invalidArg: "⚠️ ভুল আর্গুমেন্ট। ব্যবহার করুন: main, commands, বা all",
      notExist: "❌ ফাইল নেই: {file}"
    }
  },

  onStart: async function ({ message, args, getLang }) {
    try {
      const configPath = global.client.dirConfig;
      const commandsConfigPath = global.client.dirConfigCommands;
      
      // Show reloading status
      message.reply(getLang("reloading"));
      
      // Determine which configs to reload
      const arg = args[0]?.toLowerCase();
      const reloadMain = !arg || arg === "main" || arg === "all";
      const reloadCommands = !arg || arg === "commands" || arg === "all";
      
      if (arg && !["main", "commands", "all"].includes(arg)) {
        return message.reply(getLang("invalidArg"));
      }
      
      const results = {
        main: { success: false, error: null },
        commands: { success: false, error: null }
      };
      
      // Reload main config
      if (reloadMain) {
        try {
          if (!fs.existsSync(configPath)) {
            throw new Error(getLang("notExist", { file: path.basename(configPath) }));
          }
          global.GoatBot.config = fs.readJsonSync(configPath);
          results.main.success = true;
        } catch (error) {
          results.main.error = error.message;
        }
      }
      
      // Reload commands config
      if (reloadCommands) {
        try {
          if (!fs.existsSync(commandsConfigPath)) {
            throw new Error(getLang("notExist", { file: path.basename(commandsConfigPath) }));
          }
          global.GoatBot.configCommands = fs.readJsonSync(commandsConfigPath);
          results.commands.success = true;
        } catch (error) {
          results.commands.error = error.message;
        }
      }
      
      // Prepare status messages
      const statusMessage = {
        main: results.main.success ? "✅ Success" : `❌ ${results.main.error}`,
        cmd: results.commands.success ? "✅ Success" : `❌ ${results.commands.error}`
      };
      
      // Send result
      return message.reply(getLang("success", {
        mainStatus: statusMessage.main,
        cmdStatus: statusMessage.cmd
      }));
    } catch (error) {
      console.error("[LoadConfig] System Error:", error);
      return message.reply(`❌ Critical error: ${error.message}`);
    }
  }
};
