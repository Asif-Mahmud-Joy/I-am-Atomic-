module.exports = {
  config: {
    name: "setrole",
    aliases: ["cmdrole", "commandrole"],
    version: "3.0.0",
    author: "NTKhang & Upgraded by ✨Asif✨",
    countDown: 5,
    role: 1, // Requires admin privileges
    description: {
      en: "Advanced command role management system",
      vi: "Hệ thống quản lý role lệnh nâng cao",
      bn: "কমান্ড রোল ব্যবস্থাপনা সিস্টেম"
    },
    category: "administration",
    guide: {
      en: `📌 Command Guide:
• {pn} <command> <role> - Set role for command
  - 0: All members
  - 1: Admins only
  - default: Reset to default
• {pn} list - View modified commands
• {pn} help - Show this help menu

🔐 Note: Only works for commands with default role < 2`,
      bn: `📌 ব্যবহার নির্দেশিকা:
• {pn} <command> <role> - কমান্ডের জন্য রোল সেট করুন
  - 0: সব সদস্য
  - 1: শুধুমাত্র অ্যাডমিন
  - default: ডিফল্টে রিসেট করুন
• {pn} list - পরিবর্তিত কমান্ড দেখুন
• {pn} help - এই সাহায্য মেনু দেখুন

🔐 নোট: শুধুমাত্র ডিফল্ট রোল < 2 এর কমান্ডের জন্য কাজ করে`
    }
  },

  langs: {
    en: {
      noModified: "ℹ️ No commands have modified roles",
      modifiedList: "📜 Commands with modified roles:\n%1",
      noPermission: "⛔ Only admins can modify command roles",
      notFound: "❌ Command \"%1\" not found",
      cantModify: "❌ Can't modify role for command \"%1\"",
      reset: "🔄 Reset role for \"%1\" to default",
      updated: "✅ Updated role for \"%1\" to %2",
      invalidRole: "⚠️ Invalid role value. Use 0, 1 or 'default'",
      error: "❌ An error occurred: %1",
      help: `📚 Need help? Use '{pn} guide' for detailed instructions`
    },
    bn: {
      noModified: "ℹ️ কোনো কমান্ডের রোল পরিবর্তন করা হয়নি",
      modifiedList: "📜 পরিবর্তিত রোলসহ কমান্ডসমূহ:\n%1",
      noPermission: "⛔ শুধুমাত্র অ্যাডমিনরা কমান্ড রোল পরিবর্তন করতে পারে",
      notFound: "❌ \"%1\" কমান্ডটি পাওয়া যায়নি",
      cantModify: "❌ \"%1\" কমান্ডের রোল পরিবর্তন করা যাবে না",
      reset: "🔄 \"%1\" কমান্ডের রোল ডিফল্টে রিসেট করা হয়েছে",
      updated: "✅ \"%1\" কমান্ডের রোল %2 এ আপডেট করা হয়েছে",
      invalidRole: "⚠️ অবৈধ রোল মান। 0, 1 বা 'default' ব্যবহার করুন",
      error: "❌ একটি ত্রুটি ঘটেছে: %1",
      help: `📚 সাহায্য প্রয়োজন? '{pn} guide' ব্যবহার করুন বিস্তারিত নির্দেশনার জন্য`
    }
  },

  onStart: async function ({ 
    message, 
    event, 
    args, 
    role, 
    threadsData, 
    getLang,
    prefix
  }) {
    try {
      const { commands, aliases } = global.GoatBot;
      const action = args[0]?.toLowerCase();
      const lang = getLang;

      // Show help if no action specified
      if (!action || action === "help") {
        return message.reply(lang("help").replace(/{pn}/g, prefix + this.config.name));
      }

      // Get current role settings
      const customRoles = await threadsData.get(event.threadID, "data.commandRoles", {});

      // Handle list action
      if (["list", "view", "show"].includes(action)) {
        if (!Object.keys(customRoles).length) {
          return message.reply(lang("noModified"));
        }
        
        const list = Object.entries(customRoles)
          .map(([cmd, role]) => `• ${cmd}: ${role}`)
          .join("\n");
        
        return message.reply(lang("modifiedList", list));
      }

      // Handle role modification
      if (role < 1) {
        return message.reply(lang("noPermission"));
      }

      const [commandName, newRole] = args;
      if (!commandName || !newRole) {
        return message.SyntaxError();
      }

      // Validate new role
      if (!["0", "1", "default"].includes(newRole.toLowerCase())) {
        return message.reply(lang("invalidRole"));
      }

      // Find the command
      const command = commands.get(commandName.toLowerCase()) || 
                     commands.get(aliases.get(commandName.toLowerCase()));
      
      if (!command) {
        return message.reply(lang("notFound", commandName));
      }

      const actualCommandName = command.config.name;
      
      // Check if command can be modified
      if (command.config.role > 1) {
        return message.reply(lang("cantModify", actualCommandName));
      }

      // Process role change
      if (newRole.toLowerCase() === "default") {
        delete customRoles[actualCommandName];
        await threadsData.set(event.threadID, customRoles, "data.commandRoles");
        return message.reply(lang("reset", actualCommandName));
      }

      const numericRole = parseInt(newRole);
      customRoles[actualCommandName] = numericRole;
      await threadsData.set(event.threadID, customRoles, "data.commandRoles");
      return message.reply(lang("updated", actualCommandName, numericRole));

    } catch (error) {
      console.error("Error in setrole command:", error);
      return message.reply(lang("error", error.message));
    }
  }
};
