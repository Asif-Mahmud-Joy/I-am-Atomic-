module.exports = {
  config: {
    name: "sorthelp",
    version: "2.0",
    author: "Asif",
    countDown: 5,
    role: 0,
    description: {
      en: "✨ Customize how help commands are sorted ✨"
    },
    category: "system",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  🎀  HELP SORTING OPTIONS  🎀
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ {pn} name - Sort commands alphabetically
❯ {pn} category - Sort by command categories

💎 Examples:
❯ {pn} name
❯ {pn} category
      `
    }
  },

  langs: {
    en: {
      savedName: "✅ Help commands will now display in A-Z order",
      savedCategory: "✅ Help commands will now group by category",
      invalidOption: "⚠️ Please specify 'name' or 'category'",
      currentSetting: "🔧 Current sorting: %1"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang }) {
    try {
      const option = args[0]?.toLowerCase();
      const currentSetting = await threadsData.get(event.threadID, "settings.sortHelp");

      // Show current setting if no option provided
      if (!option) {
        const current = currentSetting === "name" ? "by name (A-Z)" : 
                       currentSetting === "category" ? "by category" : "not set (default)";
        return message.reply(getLang("currentSetting", current));
      }

      // Process sorting option
      if (option === "name") {
        await threadsData.set(event.threadID, "name", "settings.sortHelp");
        return message.reply(getLang("savedName"));
      } 
      else if (option === "category") {
        await threadsData.set(event.threadID, "category", "settings.sortHelp");
        return message.reply(getLang("savedCategory"));
      }
      else {
        return message.reply(getLang("invalidOption"));
      }
    } catch (err) {
      console.error("[SORTHELP ERROR]", err);
      message.reply("⚠️ An error occurred while updating settings");
    }
  }
};
