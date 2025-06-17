module.exports = {
  config: {
    name: "ignoreonlyadbox",
    aliases: ["ignoreadboxonly", "ignoreadminboxonly"],
    version: "1.3",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    description: {
      vi: "Thêm lệnh ngoại lệnh adminonly để người dùng thường dùng được",
      en: "Allow users to use specific commands even when adminonly is enabled"
    },
    category: "owner",
    guide: {
      vi: "   {pn} add <commandName>: Thêm lệnh vào danh sách bỏ qua"
        + "\n   {pn} del <commandName>: Xóa lệnh khỏi danh sách bỏ qua"
        + "\n   {pn} list: Xem danh sách bỏ qua",
      en: "   {pn} add <commandName>: Add command to ignore list"
        + "\n   {pn} del <commandName>: Remove command from ignore list"
        + "\n   {pn} list: View ignore list"
    }
  },

  langs: {
    bn: {
      missingCommandNameToAdd: "⚠️ Kono command er naam dao jeita ignore list e add korte chau",
      missingCommandNameToDelete: "⚠️ Kono command er naam dao jeita ignore list theke delete korte chau",
      commandNotFound: "❌ Command '%1' khuje pawa jai nai bot command list e",
      commandAlreadyInList: "❌ Command '%1' already ase ignore list e",
      commandAdded: "✅ Command '%1' ke ignore list e add kora hoyeche",
      commandNotInList: "❌ Command '%1' ignore list e nai",
      commandDeleted: "✅ Command '%1' ke ignore list theke delete kora hoyeche",
      ignoreList: `📑 Ei group er ignore command list:
%1`
    },
    en: {
      missingCommandNameToAdd: "⚠️ Please enter the command name you want to add to the ignore list",
      missingCommandNameToDelete: "⚠️ Please enter the command name you want to delete from the ignore list",
      commandNotFound: "❌ Command \"%1\" not found in bot's command list",
      commandAlreadyInList: "❌ Command \"%1\" already in ignore list",
      commandAdded: "✅ Added command \"%1\" to ignore list",
      commandNotInList: "❌ Command \"%1\" not in ignore list",
      commandDeleted: "✅ Removed command \"%1\" from ignore list",
      ignoreList: `📑 Ignore list in your group:
%1`
    }
  },

  onStart: async function ({ args, message, threadsData, getLang, event }) {
    const ignoreList = await threadsData.get(event.threadID, "data.ignoreCommanToOnlyAdminBox", []);
    const lang = getLang;
    switch ((args[0] || '').toLowerCase()) {
      case "add": {
        if (!args[1]) return message.reply(lang("missingCommandNameToAdd"));
        const commandName = args[1].toLowerCase();
        const command = global.GoatBot.commands.get(commandName);
        if (!command) return message.reply(lang("commandNotFound", commandName));
        if (ignoreList.includes(commandName)) return message.reply(lang("commandAlreadyInList", commandName));
        ignoreList.push(commandName);
        await threadsData.set(event.threadID, ignoreList, "data.ignoreCommanToOnlyAdminBox");
        return message.reply(lang("commandAdded", commandName));
      }
      case "del":
      case "delete":
      case "remove":
      case "rm":
      case "-d": {
        if (!args[1]) return message.reply(lang("missingCommandNameToDelete"));
        const commandName = args[1].toLowerCase();
        if (!ignoreList.includes(commandName)) return message.reply(lang("commandNotInList", commandName));
        ignoreList.splice(ignoreList.indexOf(commandName), 1);
        await threadsData.set(event.threadID, ignoreList, "data.ignoreCommanToOnlyAdminBox");
        return message.reply(lang("commandDeleted", commandName));
      }
      case "list": {
        const list = ignoreList.length ? ignoreList.join(", ") : "(Empty)";
        return message.reply(lang("ignoreList", list));
      }
      default: return message.SyntaxError();
    }
  }
};
