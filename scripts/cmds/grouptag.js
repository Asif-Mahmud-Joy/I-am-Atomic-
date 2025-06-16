// ✅ GoatBot Grouptag Command (Fixed, Updated, Upgraded + Banglish Notes)

const { writeFileSync } = require("fs");

module.exports = {
  config: {
    name: "grouptag",
    aliases: ["grtag"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    description: {
      en: "Tag users by custom group",
      bn: "Group onujayi tag korar command"
    },
    category: "group",
    guide: {
      en: "",
      bn: `
{pn} add <groupName> <@tags> ➤ Notun group add ba puran group-e user add
{pn} del <groupName> <@tags> ➤ Specific user k group theke delete
{pn} remove <groupName> ➤ Shob user shoho pura group delete
{pn} tag <groupName> ➤ Shob member k tag korbe oi group theke
{pn} rename <oldName> | <newName> ➤ Group er naam change
{pn} list ➤ Shob group er list dekhabe
{pn} info <groupName> ➤ Group er full details dekhabe`
    }
  },

  langs: {
    en: {
      noGroup: "❌ Please enter group name.",
      noMention: "❌ You need to tag someone.",
      added: "✅ Added to group '%1':\n%2",
      alreadyExists: "⚠️ Already in '%2':\n%1",
      created: "✅ Created group '%1' with:\n%2",
      notFound: "❌ Group '%1' doesn't exist.",
      removed: "✅ Removed from group '%2':\n%1",
      notInGroup: "⚠️ These not in '%2':\n%1",
      groupDeleted: "🗑️ Deleted group: %1",
      renamed: "✏️ Renamed '%1' ➜ '%2'",
      tagMessage: "📢 Group '%1':\n%2",
      noNameRename: "❌ Use like: rename <old> | <new>",
      info: "📘 Group: %1\n👥 Members: %2\n📋 List:\n%3",
      noGroups: "⚠️ No groups found."
    },
    bn: {
      noGroup: "❌ Group er naam dao.",
      noMention: "❌ Kew k tag koro.",
      added: "✅ Group '%1' e add kora holo:\n%2",
      alreadyExists: "⚠️ Ager theke ache '%2' e:\n%1",
      created: "✅ Notun group '%1' toiri holo:\n%2",
      notFound: "❌ Group '%1' pawa jayna.",
      removed: "✅ Group '%2' theke remove kora holo:\n%1",
      notInGroup: "⚠️ Ei gular naam nai '%2' e:\n%1",
      groupDeleted: "🗑️ Group delete: %1",
      renamed: "✏️ '%1' ➜ '%2' nam bodol holo",
      tagMessage: "📢 Group '%1':\n%2",
      noNameRename: "❌ Format holo: rename <old> | <new>",
      info: "📘 Group: %1\n👥 Member: %2\n📋 List:\n%3",
      noGroups: "⚠️ Konogulo group nai."
    }
  },

  onStart: async function ({ api, event, args, threadsData, getLang }) {
    const { threadID, mentions } = event;
    const lang = getLang;
    const groups = await threadsData.get(threadID, "data.groupTags", []);
    const cmd = (args[0] || '').toLowerCase();

    const getGroup = name => groups.find(g => g.name.toLowerCase() === name.toLowerCase());

    const save = () => threadsData.set(threadID, groups, "data.groupTags");

    if (cmd === "add") {
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
        if (added.length) msg += lang("added", name, added.map(id => mentions[id]).join("\n")) + "\n";
        if (exist.length) msg += lang("alreadyExists", exist.map(id => mentions[id]).join("\n"), name);
        return api.sendMessage(msg, threadID);
      } else {
        const newGroup = { name, users: mentions };
        groups.push(newGroup);
        await save();
        return api.sendMessage(lang("created", name, Object.values(mentions).join("\n")), threadID);
      }
    }

    if (["list", "all"].includes(cmd)) {
      if (!groups.length) return api.sendMessage(lang("noGroups"), threadID);
      return api.sendMessage(groups.map(g => `📌 ${g.name}\n${Object.values(g.users).join("\n")}`).join("\n\n"), threadID);
    }

    if (cmd === "info") {
      const name = args.slice(1).join(" ").trim();
      if (!name) return api.sendMessage(lang("noGroup"), threadID);
      const group = getGroup(name);
      if (!group) return api.sendMessage(lang("notFound", name), threadID);
      return api.sendMessage(lang("info", group.name, Object.keys(group.users).length, Object.values(group.users).join("\n")), threadID);
    }

    if (cmd === "del") {
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
        } else notFound.push(id);
      });
      await save();
      let msg = "";
      if (removed.length) msg += lang("removed", removed.map(id => mentions[id]).join("\n"), name) + "\n";
      if (notFound.length) msg += lang("notInGroup", notFound.map(id => mentions[id]).join("\n"), name);
      return api.sendMessage(msg, threadID);
    }

    if (["remove", "rm"].includes(cmd)) {
      const name = args.slice(1).join(" ").trim();
      if (!name) return api.sendMessage(lang("noGroup"), threadID);
      const index = groups.findIndex(g => g.name.toLowerCase() === name.toLowerCase());
      if (index === -1) return api.sendMessage(lang("notFound", name), threadID);
      groups.splice(index, 1);
      await save();
      return api.sendMessage(lang("groupDeleted", name), threadID);
    }

    if (cmd === "rename") {
      const [oldName, newName] = args.slice(1).join(" ").split("|").map(x => x.trim());
      if (!oldName || !newName) return api.sendMessage(lang("noNameRename"), threadID);
      const group = getGroup(oldName);
      if (!group) return api.sendMessage(lang("notFound", oldName), threadID);
      group.name = newName;
      await save();
      return api.sendMessage(lang("renamed", oldName, newName), threadID);
    }

    const name = args.join(" ").trim();
    if (!name) return api.sendMessage(lang("noGroup"), threadID);
    const group = getGroup(name);
    if (!group) return api.sendMessage(lang("notFound", name), threadID);
    const mentionsList = Object.entries(group.users).map(([id, tag]) => ({ id, tag }));
    const msg = mentionsList.map(m => m.tag).join("\n");
    return api.sendMessage({ body: lang("tagMessage", name, msg), mentions: mentionsList }, threadID);
  }
};
