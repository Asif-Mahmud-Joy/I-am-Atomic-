const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ Mr.Smokey ]";

module.exports = {
  config: {
    name: "help",
    version: "1.21",
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
    try {
      api.setMessageReaction("📘", messageID, () => {}, true);
    } catch {};

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

      // Attempt to fetch image, handle 429 or other errors
      try {
        const stream = await global.utils.getStreamFromURL(helpListImage);
        await message.reply({ body: msg, attachment: stream });
      } catch (error) {
        if (error.response?.status === 429) {
          // Rate limited, send text-only
          await message.reply(msg);
        } else {
          // Other errors, log and send text-only
          console.error('Help image fetch error:', error.message || error);
          await message.reply(msg);
        }
      }

    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply(`❌ Command "${commandName}" not found.`);
      }

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || "Unknown";
      const longDescription = typeof configCommand.longDescription === 'object' ? configCommand.longDescription.en : configCommand.longDescription || "No description";
      const guideBody = typeof configCommand.guide === 'object' ? configCommand.guide.en : configCommand.guide || "No guide available.";
      const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

      const response = `╭─────『 ℹ️ 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝘿𝙀𝙏𝘼𝙄𝙇𝙎 』─────╮\n\n🔹 Command: ${configCommand.name}\n📜 Description: ${longDescription}\n👑 Author: ${author}\n📖 Guide: ${usage}\n🛠 Version: ${configCommand.version || "1.0"}\n🔒 Required Role: ${roleText}\n\n╰────────────────────────╯`;

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
