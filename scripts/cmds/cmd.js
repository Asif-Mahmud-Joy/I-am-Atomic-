const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const { client } = global;
const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function runCommand(cmd) {
  try {
    const output = execSync(cmd, { encoding: "utf-8" });
    return { success: true, output };
  } catch (error) {
    return { success: false, error };
  }
}

module.exports = {
  config: {
    name: "cmd",
    version: "2.0-UltraProMax",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Manage command files"
    },
    longDescription: {
      en: "Load, unload, update or upgrade command files easily"
    },
    category: "owner",
    guide: {
      en: "{pn} load <name> | loadall | unload <name> | update | upgrade"
    }
  },

  onStart: async function ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, getLang }) {
    const { loadScripts, unloadScripts } = global.utils;

    // ✅ Update packages (without needing user to type terminal commands)
    if (args[0] === "update" || args[0] === "upgrade") {
      const isUpgrade = args[0] === "upgrade";
      message.reply(`🔄 | ${isUpgrade ? "Upgrading" : "Updating"} packages...`);
      const cmd = isUpgrade ? "npm install -g npm && npm install" : "npm update";
      const result = runCommand(cmd);
      return message.reply(result.success
        ? `✅ | ${isUpgrade ? "Upgrade" : "Update"} successful:\n` + result.output
        : `❌ | ${isUpgrade ? "Upgrade" : "Update"} failed:\n` + result.error.message);
    }

    // ✅ Load a specific command
    if (args[0] === "load" && args[1]) {
      const info = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
      return message.reply(info.status === "success"
        ? `✅ | Command \"${info.name}\" loaded`
        : `❌ | Failed to load \"${info.name}\"\n${info.error.message}`);
    }

    // ✅ Load all commands
    if (args[0] === "loadall") {
      const files = fs.readdirSync(__dirname)
        .filter(f => f.endsWith(".js") && !configCommands.commandUnload?.includes(f));

      let success = [], fail = [];
      for (const file of files) {
        const info = loadScripts("cmds", file.split(".")[0], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
        if (info.status === "success") success.push(file);
        else fail.push(file);
      }

      return message.reply(`✅ Loaded: ${success.length}\n❌ Failed: ${fail.length}\n🟢 Success: ${success.join(", ")}\n🔴 Fail: ${fail.join(", ")}`);
    }

    // ✅ Unload a command
    if (args[0] === "unload" && args[1]) {
      const info = unloadScripts("cmds", args[1], configCommands, getLang);
      return message.reply(info.status === "success"
        ? `✅ | Command \"${info.name}\" unloaded`
        : `❌ | Failed to unload \"${info.name}\"\n${info.error.message}`);
    }

    // ⚠ Invalid usage
    return message.reply("⚠ | Invalid usage. Use load, loadall, unload, update, or upgrade.");
  }
};
