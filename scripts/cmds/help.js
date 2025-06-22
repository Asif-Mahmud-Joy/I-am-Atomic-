const { commands } = global.GoatBot;

const ADMIN_UID = "61571630409265";
const BOT_NAME = "🎭 𝐀𝐓𝐎𝐌𝐈𝐂 ⭕";
const OWNER_INFO = "~𝙉𝘼𝙈𝙀:♡ 𝐀𝐬𝐢𝐟 ♡\n~𝙁𝘽:https://www.facebook.com/share/1YxWk8LwzY/";

module.exports = {
  config: {
    name: "help",
    version: "2.1",
    author: "mostakim//upgrade by Asif✨",
    role: 0,
    category: "info",
    priority: 1,
  },

  onChat: async function ({ event, message }) {
    const text = (message.body || "").trim().toLowerCase();
    if (!text.startsWith("help") && !text.startsWith("menu")) return;
    const args = text.split(/\s+/).slice(1);
    return this.onStart({ message, args, event, role: 2 });
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = global.GoatBot.config.prefix[0] || '-';
    const arg = args[0]?.toLowerCase();

    const categories = {};
    for (const [name, cmd] of commands.entries()) {
      if (cmd.config?.role <= role) {
        const cat = (cmd.config.category || "Uncategorized").trim().toUpperCase();
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }
    }

    // Sort categories alphabetically
    const sortedCategories = Object.keys(categories).sort();

    if (!arg || /^\d+$/.test(arg)) {
      // Main help menu with all categories
      let body = "╔══════════════╗\n🔹 𝑪𝑶𝑴𝑴𝑨𝑵𝑫 𝑳𝑰𝑺𝑻 🔹\n╚══════════════╝\n\n";
      
      // Add all categories and commands
      for (const cat of sortedCategories) {
        body += `╭────────────⭓\n│『 ${cat} 』\n`;
        categories[cat].sort().forEach(cmd => {
          body += `│𖤍 ${cmd}\n`;
        });
        body += `╰────────⭓\n`;
      }
      
      // Add footer information
      body += `\n𝗖𝘂𝗿𝗿𝗲𝗻𝘁𝗹𝘆, 𝘁𝗵𝗲 𝗯𝗼𝘁 𝗵𝗮𝘀 ${commands.size} 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝘁𝗵𝗮𝘁 𝗰𝗮𝗻 𝗯𝗲 𝘂𝘀𝗲𝗱\n\n`;
      body += `𝗧𝘆𝗽𝗲 ${prefix}𝗵𝗲𝗹𝗽 𝗰𝗺𝗱𝗡𝗮𝗺𝗲 𝘁𝗼 𝘃𝗶𝗲𝘄 𝘁𝗵𝗲 𝗱𝗲𝘁𝗮𝗶𝗹𝘀 𝗼𝗳 𝘁𝗵𝗮𝘁 𝗰𝗼𝗺𝗺𝗮𝗻𝗱\n\n`;
      body += `🫧𝑩𝑶𝑻 𝑵𝑨𝑴𝑬🫧: ${BOT_NAME}\n`;
      body += `𓀬 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𓀬\n${OWNER_INFO}`;

      return message.reply(body);
    }

    if (arg.startsWith("-")) {
      // Specific category view
      const catName = arg.slice(1).toUpperCase();
      if (!categories[catName]) {
        return message.reply(`❌ Category "${catName}" not found.`);
      }

      let body = `╔══════════════╗\n🔹 ${catName} 🔹\n╚══════════════╝\n\n`;
      body += `╭────────────⭓\n│『 ${catName} 』\n`;
      categories[catName].sort().forEach(cmd => {
        body += `│𖤍 ${cmd}\n`;
      });
      body += `╰────────⭓`;

      return message.reply(body);
    }

    // Command details view
    const cmdObj = commands.get(arg) || commands.get(global.GoatBot.aliases.get(arg));
    if (!cmdObj || cmdObj.config.role > role) {
      return message.reply(`❌ Command "${arg}" not found or you don't have permission.`);
    }

    const cfg = cmdObj.config;
    const shortDesc = cfg.shortDescription?.en || "No short description.";
    const longDesc = cfg.longDescription?.en || "No long description.";
    const usage = cfg.guide?.en || "No usage provided.";

    const details =
      "╔══════════════╗\n" +
      `🔹 COMMAND DETAILS 🔹\n` +
      "╚══════════════╝\n\n" +
      `╭────────────⭓\n` +
      `│ 🧾 ${cfg.name.toUpperCase()}\n` +
      `├─────────────────\n` +
      `│ ❖ Category: ${cfg.category || "Uncategorized"}\n` +
      `│ ❖ Description: ${longDesc}\n` +
      `│ ❖ Usage: ${usage.replace(/{p}/g, prefix).replace(/{n}/g, cfg.name)}\n` +
      `│ ❖ Author: ${cfg.author || "Unknown"}\n` +
      `╰────────⭓`;

    return message.reply(details);
  },
};
