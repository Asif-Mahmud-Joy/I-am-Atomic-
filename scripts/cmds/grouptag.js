module.exports = {
  config: {
    name: "grouptag",
    aliases: ["agtag", "atag", "nucleartag","grtag"],
    version: "3.0",
    author: "☣️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐒𝐈𝐅 ⚛️",
    countDown: 3,
    role: 0,
    shortDescription: "⚛️ Atomic group management system",
    longDescription: "☢️ Advanced group tagging with nuclear precision",
    category: "group",
    guide: {
      en: `▸ {pn} add <name> <@tags> ➤ Create atomic group
▸ {pn} del <name> <@tags> ➤ Remove particles from group
▸ {pn} remove <name> ➤ Detonate entire group
▸ {pn} tag <name> ➤ Activate group tag
▸ {pn} rename <old> | <new> ➤ Reconfigure group identity
▸ {pn} list ➤ Scan group registry
▸ {pn} info <name> ➤ Analyze group composition`
    }
  },

  langs: {
    en: {
      noGroup: "☢️ 𝗘𝗥𝗥𝗢𝗥: Quantum identifier required",
      noMention: "⚠️ 𝗔𝗧𝗧𝗘𝗡𝗧𝗜𝗢𝗡: No particles detected for bonding",
      added: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗢𝗡𝗗𝗜𝗡𝗚 𝗦𝗨𝗖𝗖𝗘𝗦𝗦\n\n▸ Group: %1\n▸ New particles:\n%2",
      alreadyExists: "⚠️ 𝗦𝗧𝗔𝗕𝗜𝗟𝗜𝗧𝗬 𝗪𝗔𝗥𝗡𝗜𝗡𝗚\n\n▸ Particles already bonded:\n%1",
      created: "⚡ 𝗤𝗨𝗔𝗡𝗧𝗨𝗠 𝗚𝗥𝗢𝗨𝗣 𝗦𝗬𝗡𝗧𝗛𝗘𝗦𝗜𝗦\n\n▸ New group: %1\n▸ Initial particles:\n%2",
      notFound: "❌ 𝗦𝗖𝗔𝗡 𝗙𝗔𝗜𝗟𝗘𝗗: No quantum signature '%1' detected",
      removed: "♻️ 𝗣𝗔𝗥𝗧𝗜𝗖𝗟𝗘 𝗥𝗘𝗠𝗢𝗩𝗔𝗟\n\n▸ Group: %2\n▸ Released particles:\n%1",
      notInGroup: "⚠️ 𝗢𝗥𝗕𝗜𝗧 𝗠𝗜𝗦𝗠𝗔𝗧𝗖𝗛\n\n▸ Particles not in '%2':\n%1",
      groupDeleted: "💥 𝗚𝗥𝗢𝗨𝗣 𝗗𝗘𝗧𝗢𝗡𝗔𝗧𝗜𝗢𝗡\n\n▸ Group '%1' disintegrated",
      renamed: "🌀 𝗥𝗘𝗖𝗢𝗡𝗙𝗜𝗚𝗨𝗥𝗔𝗧𝗜𝗢𝗡\n\n▸ '%1' ➜ '%2'",
      tagMessage: "☄️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗟𝗘𝗥𝗧: %1\n\n%2",
      noNameRename: "⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗦𝗜𝗚𝗡𝗔𝗧𝗨𝗥𝗘\n\n▸ Use: rename <old> | <new>",
      info: "🔬 𝗤𝗨𝗔𝗡𝗧𝗨𝗠 𝗔𝗡𝗔𝗟𝗬𝗦𝗜𝗦\n\n▸ Group: %1\n▸ Particles: %2\n▸ Composition:\n%3",
      noGroups: "🌌 𝗤𝗨𝗔𝗡𝗧𝗨𝗠 𝗩𝗢𝗜𝗗\n\n▸ No atomic groups detected"
    }
  },

  onStart: async function ({ api, event, args, threadsData, getLang }) {
    const ATOMIC = {
      HEADER: "☣️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗚𝗥𝗢𝗨𝗣 𝗦𝗬𝗦𝗧𝗘𝗠 ⚛️",
      DIVIDER: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
      FOOTER: "⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗤𝘂𝗮𝗻𝘁𝘂𝗺 𝗧𝗮𝗴𝗴𝗶𝗻𝗴 𝗧𝗲𝗰𝗵"
    };

    const formatMessage = (content) => {
      return `${ATOMIC.HEADER}\n${ATOMIC.DIVIDER}\n${content}\n${ATOMIC.DIVIDER}\n${ATOMIC.FOOTER}`;
    };

    const { threadID, mentions } = event;
    const groups = await threadsData.get(threadID, "data.groupTags", []);
    const cmd = (args[0] || '').toLowerCase();
    const lang = (key, ...params) => formatMessage(getLang(key, ...params));

    const getGroup = name => groups.find(g => g.name.toLowerCase() === name.toLowerCase());

    const save = () => threadsData.set(threadID, groups, "data.groupTags");

    switch (cmd) {
      case "add": {
        const ids = Object.keys(mentions);
        if (!ids.length) return api.sendMessage(lang("noMention"), threadID);
        
        const name = args.slice(1).join(" ").split(Object.values(mentions)[0])[0].trim();
        if (!name) return api.sendMessage(lang("noGroup"), threadID);
        
        const group = getGroup(name);
        if (group) {
          const exist = [], added = [];
          ids.forEach(id => {
            if (group.users[id]) exist.push(id);
            else {
              group.users[id] = mentions[id];
              added.push(id);
            }
          });
          await save();
          
          let msg = "";
          if (added.length) msg += getLang("added", group.name, added.map(id => mentions[id]).join("\n")) + "\n\n";
          if (exist.length) msg += getLang("alreadyExists", exist.map(id => mentions[id]).join("\n"), group.name);
          return api.sendMessage(lang(msg ? "added" : "alreadyExists", group.name, msg), threadID);
        } 
        else {
          const newGroup = { name, users: mentions };
          groups.push(newGroup);
          await save();
          return api.sendMessage(lang("created", name, Object.values(mentions).join("\n")), threadID);
        }
      }

      case "list":
      case "scan": {
        if (!groups.length) return api.sendMessage(lang("noGroups"), threadID);
        
        const groupList = groups.map(g => 
          `☢️ ${g.name}:\n${Object.values(g.users).join("\n")}`
        ).join("\n\n▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n");
        
        return api.sendMessage(
          formatMessage(`🔭 𝗤𝗨𝗔𝗡𝗧𝗨𝗠 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗬\n\n${groupList}`), 
          threadID
        );
      }

      case "info":
      case "analyze": {
        const name = args.slice(1).join(" ").trim();
        if (!name) return api.sendMessage(lang("noGroup"), threadID);
        
        const group = getGroup(name);
        if (!group) return api.sendMessage(lang("notFound", name), threadID);
        
        return api.sendMessage(
          lang("info", group.name, Object.keys(group.users).length, Object.values(group.users).join("\n")), 
          threadID
        );
      }

      case "del":
      case "removeparticle": {
        const ids = Object.keys(mentions);
        if (!ids.length) return api.sendMessage(lang("noMention"), threadID);
        
        const name = args.slice(1).join(" ").split(Object.values(mentions)[0])[0].trim();
        if (!name) return api.sendMessage(lang("noGroup"), threadID);
        
        const group = getGroup(name);
        if (!group) return api.sendMessage(lang("notFound", name), threadID);

        const removed = [], notFound = [];
        ids.forEach(id => {
          if (group.users[id]) {
            delete group.users[id];
            removed.push(id);
          } 
          else notFound.push(id);
        });
        
        await save();
        let msg = "";
        if (removed.length) msg += getLang("removed", removed.map(id => mentions[id]).join("\n"), name) + "\n\n";
        if (notFound.length) msg += getLang("notInGroup", notFound.map(id => mentions[id]).join("\n"), name);
        return api.sendMessage(lang(msg ? "removed" : "notInGroup", name, msg), threadID);
      }

      case "remove":
      case "detonate": {
        const name = args.slice(1).join(" ").trim();
        if (!name) return api.sendMessage(lang("noGroup"), threadID);
        
        const index = groups.findIndex(g => g.name.toLowerCase() === name.toLowerCase());
        if (index === -1) return api.sendMessage(lang("notFound", name), threadID);
        
        groups.splice(index, 1);
        await save();
        return api.sendMessage(lang("groupDeleted", name), threadID);
      }

      case "rename":
      case "reconfigure": {
        const [oldName, newName] = args.slice(1).join(" ").split("|").map(x => x.trim());
        if (!oldName || !newName) return api.sendMessage(lang("noNameRename"), threadID);
        
        const group = getGroup(oldName);
        if (!group) return api.sendMessage(lang("notFound", oldName), threadID);
        
        group.name = newName;
        await save();
        return api.sendMessage(lang("renamed", oldName, newName), threadID);
      }

      case "tag":
      case "activate": {
        const name = args.slice(1).join(" ").trim();
        if (!name) return api.sendMessage(lang("noGroup"), threadID);
        
        const group = getGroup(name);
        if (!group) return api.sendMessage(lang("notFound", name), threadID);
        
        const mentionsList = Object.entries(group.users).map(([id, tag]) => ({ id, tag }));
        const msg = mentionsList.map(m => m.tag).join("\n");
        
        return api.sendMessage({
          body: lang("tagMessage", name, msg),
          mentions: mentionsList
        }, threadID);
      }

      default: {
        return api.sendMessage(
          formatMessage(this.config.guide.en.replace(/\{pn\}/g, this.config.name)),
          threadID
        );
      }
    }
  }
};
