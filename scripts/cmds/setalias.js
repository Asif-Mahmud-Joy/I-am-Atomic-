module.exports = {
  config: {
    name: "setalias",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    description: {
      vi: "Thêm tên gọi khác cho 1 lệnh bất kỳ trong nhóm của bạn",
      en: "Add an alias for any command in your group",
      bn: "Group-e kono command-er jonno alias add korun"
    },
    category: "config",
    guide: {
      vi: "{pn} add <tên gọi khác> <tên lệnh> [-g]",
      en: "{pn} add <alias> <command> [-g]",
      bn: "{pn} add <alias> <command> [-g]"
    }
  },

  langs: {
    bn: {
      commandNotExist: "❌ Command '%1' paoa jaini",
      aliasExist: "❌ Alias '%1' already ase '%2' command er jonno (system)",
      addAliasSuccess: "✅ Alias '%1' add kora holo command '%2' er jonno (system)",
      noPermissionAdd: "❌ Tumar system-e alias add korar permission nai",
      aliasIsCommand: "❌ Alias '%1' onno ekta command er namer motoi",
      aliasExistInGroup: "❌ Alias '%1' already ase '%2' command er jonno (group)",
      addAliasToGroupSuccess: "✅ Alias '%1' add kora holo command '%2' er jonno (group)",
      aliasNotExist: "❌ Alias '%1' nei command '%2' er modhye",
      removeAliasSuccess: "✅ Alias '%1' delete kora holo command '%2' theke (system)",
      noPermissionDelete: "❌ Tumake ei alias delete korar permission nai (system)",
      noAliasInGroup: "❌ Command '%1' er kono alias nei group e",
      removeAliasInGroupSuccess: "✅ Alias '%1' delete holo command '%2' er modhye (group)",
      aliasList: "📜 System-e thaka alias list:\n%1",
      noAliasInSystem: "⚠️ System-e kono alias nai",
      notExistAliasInGroup: "⚠️ Group-e kono alias nai",
      aliasListInGroup: "📜 Ei group-e alias list:\n%1"
    }
  },

  onStart: async function({ message, event, args, threadsData, globalData, role, getLang }) {
    const aliasesData = await threadsData.get(event.threadID, "data.aliases", {});
    const [action, aliasArg, cmdArg, flag] = args;
    const isGlobal = flag === "-g";
    const alias = aliasArg?.toLowerCase();
    const commandName = cmdArg?.toLowerCase();

    if (!action) return message.SyntaxError();

    switch (action) {
      case "add": {
        if (!alias || !commandName) return message.SyntaxError();
        if (!global.GoatBot.commands.has(commandName))
          return message.reply(getLang("commandNotExist", commandName));

        if (global.GoatBot.commands.has(alias))
          return message.reply(getLang("aliasIsCommand", alias));

        if (isGlobal) {
          if (role <= 1)
            return message.reply(getLang("noPermissionAdd", alias, commandName));
          const globalAliasesData = await globalData.get("setalias", "data", []);
          if (globalAliasesData.find(a => a.aliases.includes(alias)))
            return message.reply(getLang("aliasExist", alias, commandName));
          const target = globalAliasesData.find(a => a.commandName === commandName);
          if (target) target.aliases.push(alias);
          else globalAliasesData.push({ commandName, aliases: [alias] });
          await globalData.set("setalias", globalAliasesData, "data");
          global.GoatBot.aliases.set(alias, commandName);
          return message.reply(getLang("addAliasSuccess", alias, commandName));
        }

        if (Object.values(aliasesData).flat().includes(alias))
          return message.reply(getLang("aliasExistInGroup", alias, commandName));
        if (!aliasesData[commandName]) aliasesData[commandName] = [];
        aliasesData[commandName].push(alias);
        await threadsData.set(event.threadID, "data.aliases", aliasesData);
        return message.reply(getLang("addAliasToGroupSuccess", alias, commandName));
      }

      case "remove":
      case "rm": {
        if (!alias || !commandName) return message.SyntaxError();
        if (!global.GoatBot.commands.has(commandName))
          return message.reply(getLang("commandNotExist", commandName));

        if (isGlobal) {
          if (role <= 1)
            return message.reply(getLang("noPermissionDelete", alias, commandName));
          const globalAliasesData = await globalData.get("setalias", "data", []);
          const thisCmd = globalAliasesData.find(a => a.commandName === commandName);
          if (!thisCmd || !thisCmd.aliases.includes(alias))
            return message.reply(getLang("aliasNotExist", alias, commandName));
          thisCmd.aliases = thisCmd.aliases.filter(a => a !== alias);
          await globalData.set("setalias", globalAliasesData, "data");
          global.GoatBot.aliases.delete(alias);
          return message.reply(getLang("removeAliasSuccess", alias, commandName));
        }

        if (!aliasesData[commandName] || !aliasesData[commandName].includes(alias))
          return message.reply(getLang("aliasNotExist", alias, commandName));
        aliasesData[commandName] = aliasesData[commandName].filter(a => a !== alias);
        await threadsData.set(event.threadID, "data.aliases", aliasesData);
        return message.reply(getLang("removeAliasInGroupSuccess", alias, commandName));
      }

      case "list": {
        if (args[1] === "-g") {
          const globalAliasesData = await globalData.get("setalias", "data", []);
          if (!globalAliasesData.length) return message.reply(getLang("noAliasInSystem"));
          const text = globalAliasesData.map(a => `• ${a.commandName}: ${a.aliases.join(", ")}`).join("\n");
          return message.reply(getLang("aliasList", text));
        }
        if (!Object.keys(aliasesData).length)
          return message.reply(getLang("notExistAliasInGroup"));
        const text = Object.entries(aliasesData).map(([cmd, arr]) => `• ${cmd}: ${arr.join(", ")}`).join("\n");
        return message.reply(getLang("aliasListInGroup", text));
      }

      default:
        return message.SyntaxError();
    }
  }
};
