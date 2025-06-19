const { commands } = global.GoatBot;

const ADMIN_UID = "61571630409265";
const IMAGE_URL = "https://files.catbox.moe/k8kwue.jpg";
const ITEMS_PER_PAGE = 10;

module.exports = {
  config: {
    name: "help",
    version: "2.1",
    author: "Mr.Smokey✨",
    role: 0,
    category: "info",
    priority: 1,
  },

  onChat: async function ({ event, message }) {
    const text = (message.body || "").trim().toLowerCase();
    if (!text.startsWith("help") && !text.startsWith("menu")) return;
    if (event.senderID !== ADMIN_UID) return;
    const args = text.split(/\s+/).slice(1);
    return this.onStart({ message, args, event, role: 2 });
  },

  onStart: async function ({ message, args, event, role }) {
    const deco = "❖";
    const top = `╭━━━━━━━ ${deco} HELP MENU ${deco} ━━━━━━━╮`;
    const mid = "┃";
    const sep = "┃━━━━━━━━━━━━━━━━━━━━━━";
    const bottom = "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯";

    const arg = args[0]?.toLowerCase();

    const categories = {};
    for (const [name, cmd] of commands.entries()) {
      if (cmd.config?.role <= role) {
        const cat = (cmd.config.category || "Uncategorized").trim().toUpperCase();
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }
    }

    if (!arg || /^\d+$/.test(arg)) {
      const page = arg ? Math.max(1, parseInt(arg)) : 1;
      const catNames = Object.keys(categories).sort();
      const totalPages = Math.ceil(catNames.length / ITEMS_PER_PAGE);

      if (page > totalPages)
        return message.reply(`❌ Page ${page} does not exist. Total pages: ${totalPages}`);

      const start = (page - 1) * ITEMS_PER_PAGE;
      const selected = catNames.slice(start, start + ITEMS_PER_PAGE);

      let body = `${top}\n${mid} ✦ Page: ${page}/${totalPages}\n${mid} ✦ Prefix: -\n${mid} ✦ Total Commands: ${commands.size}\n${sep}\n`;

      selected.forEach((cat) => {
        const cmds = categories[cat];
        body += `${mid} 🗂 ${cat} [${cmds.length}]\n`;
        cmds.forEach((n) => body += `${mid} ${deco} ${n}\n`);
        body += `${sep}\n`;
      });

      body += `${mid} 🤖 BOTNAME: Mr.Smokey 💠\n${bottom}`;

      return message.reply({ body, attachment: await global.utils.getStreamFromURL(IMAGE_URL) });
    }

    if (arg.startsWith("-")) {
      const catName = arg.slice(1).toUpperCase();
      const cmdsInCat = [];
      for (const [name, cmd] of commands.entries()) {
        const cat = (cmd.config.category || "Uncategorized").trim().toUpperCase();
        if (cat === catName && cmd.config.role <= role) cmdsInCat.push(`${mid} ${deco} ${name}`);
      }

      if (!cmdsInCat.length)
        return message.reply(`❌ Category "${catName}" not found.`);

      return message.reply(`${top}\n${mid} 📁 CATEGORY: ${catName}\n${sep}\n${cmdsInCat.join("\n")}\n${bottom}`);
    }

    const cmdObj = commands.get(arg) || commands.get(global.GoatBot.aliases.get(arg));
    if (!cmdObj || cmdObj.config.role > role)
      return message.reply(`❌ Command "${arg}" not found or you don't have permission.`);

    const cfg = cmdObj.config;
    const shortDesc = cfg.shortDescription?.en || "No short description.";
    const longDesc = cfg.longDescription?.en || "No long description.";
    const usage = cfg.guide?.en || "No usage provided.";

    const details =
      `${top}\n` +
      `${mid} 🧾 COMMAND DETAILS\n${sep}\n` +
      `${mid} ❖ Name: ${cfg.name}\n` +
      `${mid} ❖ Category: ${cfg.category || "Uncategorized"}\n` +
      `${mid} ❖ Short: ${shortDesc}\n` +
      `${mid} ❖ Description: ${longDesc.replace(/\n/g, `\n${mid} `)}\n` +
      `${mid} ❖ Usage: ${usage.replace(/{p}/g, "-").replace(/{n}/g, cfg.name)}\n` +
      `${mid} ❖ Author: ${cfg.author || "Unknown"}\n` +
      `${bottom}`;

    return message.reply(details);
  },
};
