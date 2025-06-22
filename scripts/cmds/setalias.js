module.exports = {
  config: {
    name: "setalias",
    version: "3.0.0",
    author: "NTKhang & Upgraded by ✨Asif✨",
    countDown: 3,
    role: 0,
    description: {
      en: "Advanced command alias management system",
      vi: "Hệ thống quản lý bí danh lệnh nâng cao",
      bn: "কমান্ড এলিয়াস ব্যবস্থাপনা সিস্টেম"
    },
    category: "administration",
    guide: {
      en: `📌 Available Commands:
• {pn} add <alias> <command> [-g] - Add new alias
• {pn} remove <alias> <command> [-g] - Remove alias
• {pn} list [-g] - View aliases
• {pn} help - Show this help menu`,
      bn: `📌 ব্যবহারযোগ্য কমান্ড:
• {pn} add <alias> <command> [-g] - নতুন এলিয়াস যোগ করুন
• {pn} remove <alias> <command> [-g] - এলিয়াস মুছুন
• {pn} list [-g] - এলিয়াস দেখুন
• {pn} help - সাহায্য মেনু দেখুন`
    }
  },

  langs: {
    en: {
      commandNotExist: "❌ Command \"%1\" doesn't exist",
      aliasExist: "❌ Alias \"%1\" already exists for command \"%2\"",
      addSuccess: "✅ Added alias \"%1\" for command \"%2\"",
      noPermission: "⛔ You don't have permission for this action",
      aliasConflict: "❌ Alias \"%1\" conflicts with existing command",
      removeSuccess: "✅ Removed alias \"%1\" for command \"%2\"",
      aliasNotExist: "❌ Alias \"%1\" doesn't exist for command \"%2\"",
      noAliases: "ℹ️ No aliases found",
      systemAliases: "📜 System Aliases:\n%1",
      groupAliases: "📜 Group Aliases:\n%1",
      help: `📚 Command Help:
• {pn} add <alias> <command> [-g] - Add new alias
• {pn} remove <alias> <command> [-g] - Remove alias
• {pn} list [-g] - View aliases
• {pn} help - Show this help menu`
    },
    bn: {
      commandNotExist: "❌ \"%1\" কমান্ডটি পাওয়া যায়নি",
      aliasExist: "❌ \"%1\" এলিয়াসটি ইতিমধ্যেই \"%2\" কমান্ডের জন্য রয়েছে",
      addSuccess: "✅ \"%1\" এলিয়াসটি \"%2\" কমান্ডের জন্য যোগ করা হয়েছে",
      noPermission: "⛔ আপনার এই কাজ করার অনুমতি নেই",
      aliasConflict: "❌ \"%1\" এলিয়াসটি অন্য কমান্ডের সাথে মিলে যাচ্ছে",
      removeSuccess: "✅ \"%1\" এলিয়াসটি \"%2\" কমান্ড থেকে মুছে ফেলা হয়েছে",
      aliasNotExist: "❌ \"%1\" এলিয়াসটি \"%2\" কমান্ডের জন্য নেই",
      noAliases: "ℹ️ কোনো এলিয়াস পাওয়া যায়নি",
      systemAliases: "📜 সিস্টেম এলিয়াস:\n%1",
      groupAliases: "📜 গ্রুপ এলিয়াস:\n%1",
      help: `📚 কমান্ড সাহায্য:
• {pn} add <alias> <command> [-g] - নতুন এলিয়াস যোগ করুন
• {pn} remove <alias> <command> [-g] - এলিয়াস মুছুন
• {pn} list [-g] - এলিয়াস দেখুন
• {pn} help - সাহায্য মেনু দেখুন`
    }
  },

  onStart: async function({ 
    message, 
    event, 
    args, 
    threadsData, 
    globalData, 
    role, 
    getLang,
    prefix
  }) {
    try {
      const [action, alias, commandName, flag] = args;
      const isGlobal = flag === "-g";
      const lang = getLang;

      // Show help if no action specified
      if (!action || action === "help") {
        return message.reply(lang("help").replace(/{pn}/g, prefix + this.config.name));
      }

      // Get alias data
      const groupAliases = await threadsData.get(event.threadID, "data.aliases", {});
      const systemAliases = await globalData.get('setalias', 'data', []);

      switch (action.toLowerCase()) {
        case "add": {
          if (!alias || !commandName) return message.SyntaxError();
          
          // Validate command exists
          if (!global.GoatBot.commands.has(commandName.toLowerCase())) {
            return message.reply(lang("commandNotExist", commandName));
          }

          // Check for conflicts
          if (global.GoatBot.commands.has(alias.toLowerCase())) {
            return message.reply(lang("aliasConflict", alias));
          }

          if (isGlobal) {
            // Handle global alias
            if (role <= 1) return message.reply(lang("noPermission"));
            
            // Check if alias exists in system
            const existingSystemAlias = systemAliases.find(a => 
              a.aliases.includes(alias.toLowerCase())
            );
            if (existingSystemAlias) {
              return message.reply(lang("aliasExist", alias, existingSystemAlias.commandName));
            }

            // Add to system aliases
            const targetCommand = systemAliases.find(a => a.commandName === commandName.toLowerCase());
            if (targetCommand) {
              targetCommand.aliases.push(alias.toLowerCase());
            } else {
              systemAliases.push({
                commandName: commandName.toLowerCase(),
                aliases: [alias.toLowerCase()]
              });
            }

            await globalData.set('setalias', systemAliases, 'data');
            global.GoatBot.aliases.set(alias.toLowerCase(), commandName.toLowerCase());
            return message.reply(lang("addSuccess", alias, commandName));
          } else {
            // Handle group alias
            // Check if alias exists in group
            for (const cmd in groupAliases) {
              if (groupAliases[cmd].includes(alias.toLowerCase())) {
                return message.reply(lang("aliasExist", alias, cmd));
              }
            }

            // Check if alias exists in system
            if (global.GoatBot.aliases.has(alias.toLowerCase())) {
              return message.reply(lang("aliasExist", alias, global.GoatBot.aliases.get(alias.toLowerCase())));
            }

            // Add to group aliases
            if (!groupAliases[commandName.toLowerCase()]) {
              groupAliases[commandName.toLowerCase()] = [];
            }
            groupAliases[commandName.toLowerCase()].push(alias.toLowerCase());
            await threadsData.set(event.threadID, groupAliases, "data.aliases");
            return message.reply(lang("addSuccess", alias, commandName));
          }
        }

        case "remove":
        case "rm": {
          if (!alias || !commandName) return message.SyntaxError();

          if (isGlobal) {
            // Handle global alias removal
            if (role <= 1) return message.reply(lang("noPermission"));
            
            const targetCommand = systemAliases.find(a => a.commandName === commandName.toLowerCase());
            if (!targetCommand || !targetCommand.aliases.includes(alias.toLowerCase())) {
              return message.reply(lang("aliasNotExist", alias, commandName));
            }

            targetCommand.aliases = targetCommand.aliases.filter(a => a !== alias.toLowerCase());
            await globalData.set('setalias', systemAliases, 'data');
            global.GoatBot.aliases.delete(alias.toLowerCase());
            return message.reply(lang("removeSuccess", alias, commandName));
          } else {
            // Handle group alias removal
            if (!groupAliases[commandName.toLowerCase()] || 
                !groupAliases[commandName.toLowerCase()].includes(alias.toLowerCase())) {
              return message.reply(lang("aliasNotExist", alias, commandName));
            }

            groupAliases[commandName.toLowerCase()] = 
              groupAliases[commandName.toLowerCase()].filter(a => a !== alias.toLowerCase());
            await threadsData.set(event.threadID, groupAliases, "data.aliases");
            return message.reply(lang("removeSuccess", alias, commandName));
          }
        }

        case "list": {
          if (args[1] === "-g") {
            // List system aliases
            if (systemAliases.length === 0) {
              return message.reply(lang("noAliases"));
            }
            const systemAliasList = systemAliases.map(a => 
              `• ${a.commandName}: ${a.aliases.join(", ")}`
            ).join("\n");
            return message.reply(lang("systemAliases", systemAliasList));
          } else {
            // List group aliases
            if (Object.keys(groupAliases).length === 0) {
              return message.reply(lang("noAliases"));
            }
            const groupAliasList = Object.entries(groupAliases).map(([cmd, aliases]) => 
              `• ${cmd}: ${aliases.join(", ")}`
            ).join("\n");
            return message.reply(lang("groupAliases", groupAliasList));
          }
        }

        default: {
          return message.SyntaxError();
        }
      }
    } catch (error) {
      console.error("Error in setalias command:", error);
      return message.reply("❌ An error occurred. Please try again later.");
    }
  }
};
