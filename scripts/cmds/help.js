const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ Mr.Smokey ]";

module.exports = {
  config: {
    name: "help",
    version: "1.20",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "📜 View command usage and list all commands"
    },
    longDescription: {
      en: "📚 Display details for a specific command or list all available ones with categories"
    },
    category: "info",
    guide: {
      en: "{pn} [command name]"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role, api }) {
    const { threadID, messageID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    // Auto-react to command message
    api.setMessageReaction("📘", messageID, () => {}, true);

    if (args.length === 0) {
      const categories = {};
      let msg = "╭───『 🧾 𝙈𝙍.𝙎𝙈𝙊𝙆𝙀𝙔 𝘾𝙈𝘿 𝙇𝙄𝙎𝙏 』───╮";

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        msg += `\n\n🔹 *${category.toUpperCase()}*\n`;
        const names = categories[category].commands.sort();
        for (let i = 0; i < names.length; i += 3) {
          const cmds = names.slice(i, i + 3).map((item) => `🔸 ${item}`);
          msg += `🧩 ${cmds.join("   ")}\n`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n📦 Total Commands: ${totalCommands}`;
      msg += `\n📌 Type: ${prefix}help [command] to get usage`;
      msg += `\n\n🔰 Powered by ${doNotDelete}`;

      const helpListImages = ["https://i.imgur.com/a3JShJK.jpeg"];
      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage)
      });

    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply(`❌ Command "${commandName}" not found.`);
      }

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || "Unknown";
      const longDescription = configCommand.longDescription?.en || "No description";
      const guideBody = configCommand.guide?.en || "No guide available.";
      const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

      const response = `
╭─────『 ℹ️ 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝘿𝙀𝙏𝘼𝙄𝙇𝙎 』─────╮

🔹 Command: ${configCommand.name}
📜 Description: ${longDescription}
👑 Author: ${author}
📖 Guide: ${usage}
🛠 Version: ${configCommand.version || "1.0"}
🔒 Required Role: ${roleText}

╰────────────────────────╯`;

      await message.reply(response);
    }
  }
};

function roleTextToString(role) {
  switch (role) {
    case 0: return "0 - All Users 👥";
    case 1: return "1 - Group Admins 👮";
    case 2: return "2 - Bot Admins 🧑‍💻";
    default: return `${role} - Unknown Role`;
  }
}
