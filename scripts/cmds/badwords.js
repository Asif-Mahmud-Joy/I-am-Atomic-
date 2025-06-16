const axios = require("axios");

module.exports = {
  config: {
    name: "badwords",
    aliases: ["badword"],
    version: "2.0-UltraPro",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 1,
    description: "Warn and kick members using banned words.",
    category: "box chat",
    guide: {
      en: `
{pn} add <word1, word2|word3>: Add banned words
{pn} delete <words>: Delete banned words
{pn} list [hide]: Show banned word list
{pn} on/off: Enable or disable detection
{pn} unwarn <@tag|UID|reply>: Remove 1 warning`,
    }
  },

  onStart: async function ({ message, event, args, threadsData, usersData, role }) {
    const lang = this.langs.en;
    const tID = event.threadID;
    const dPath = "data.badWords";

    if (!await threadsData.get(tID, dPath))
      await threadsData.set(tID, { words: [], violationUsers: {} }, dPath);

    const data = await threadsData.get(tID, dPath);
    const words = data.words || [];
    const violations = data.violationUsers || {};

    const input = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim().toLowerCase()).filter(Boolean);
    const cmd = args[0]?.toLowerCase();

    if (["add"].includes(cmd)) {
      if (role < 1) return message.reply(lang.onlyAdmin);
      if (!input.length) return message.reply(lang.missingWords);

      const added = [], exist = [], tooShort = [];
      for (const w of input) {
        if (w.length < 2) tooShort.push(w);
        else if (!words.includes(w)) added.push(w), words.push(w);
        else exist.push(w);
      }
      await threadsData.set(tID, words, `${dPath}.words`);
      return message.reply(
        (added.length ? lang.addedSuccess.replace("%1", added.length) + "\n" : "") +
        (exist.length ? lang.alreadyExist.replace("%1", exist.length).replace("%2", exist.map(hideWord).join(", ")) + "\n" : "") +
        (tooShort.length ? lang.tooShort.replace("%1", tooShort.length).replace("%2", tooShort.join(", ")) : "")
      );
    }

    if (["delete", "del", "-d"].includes(cmd)) {
      if (role < 1) return message.reply(lang.onlyAdmin2);
      if (!input.length) return message.reply(lang.missingWords2);

      const deleted = [], notFound = [];
      for (const w of input) {
        const i = words.indexOf(w);
        if (i !== -1) words.splice(i, 1), deleted.push(w);
        else notFound.push(w);
      }
      await threadsData.set(tID, words, `${dPath}.words`);
      return message.reply(
        (deleted.length ? lang.deletedSuccess.replace("%1", deleted.length) + "\n" : "") +
        (notFound.length ? lang.notExist.replace("%1", notFound.length).replace("%2", notFound.join(", ")) : "")
      );
    }

    if (["list", "all", "-a"].includes(cmd)) {
      if (!words.length) return message.reply(lang.emptyList);
      const list = args[1] === "hide" ? words.map(hideWord).join(", ") : words.join(", ");
      return message.reply(lang.badWordsList.replace("%1", list));
    }

    if (cmd === "on" || cmd === "off") {
      if (role < 1) return message.reply(lang.onlyAdmin3.replace("%1", lang[cmd + "Text"]));
      await threadsData.set(tID, cmd === "on", "settings.badWords");
      return message.reply(lang.turnedOnOrOff.replace("%1", lang[cmd + "Text"]));
    }

    if (cmd === "unwarn") {
      if (role < 1) return message.reply(lang.onlyAdmin4);
      const userID = Object.keys(event.mentions)?.[0] || args[1] || event.messageReply?.senderID;
      if (!userID || isNaN(userID)) return message.reply(lang.missingTarget);
      if (!violations[userID]) return message.reply(lang.notWarned.replace("%1", userID));
      violations[userID]--;
      await threadsData.set(tID, violations, `${dPath}.violationUsers`);
      const userName = await usersData.getName(userID);
      return message.reply(lang.unwarned.replace("%1", userID).replace("%2", userName));
    }
  },

  onChat: async function ({ message, event, api, threadsData }) {
    const tID = event.threadID;
    const senderID = event.senderID;
    const msg = event.body?.toLowerCase();
    if (!msg) return;

    const threadData = await threadsData.get(tID);
    if (!threadData?.settings?.badWords) return;

    const words = threadData.data.badWords?.words || [];
    const violations = threadData.data.badWords?.violationUsers || {};

    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(msg)) {
        if (!violations[senderID]) {
          violations[senderID] = 1;
          await threadsData.set(tID, violations, "data.badWords.violationUsers");
          return message.reply(this.langs.en.warned.replace("%1", word));
        } else {
          await message.reply(this.langs.en.warned2.replace("%1", word));
          try {
            await api.removeUserFromGroup(senderID, tID);
          } catch (e) {
            return message.reply(this.langs.en.needAdmin);
          }
        }
        break;
      }
    }
  },

  langs: {
    en: {
      onText: "enabled",
      offText: "disabled",
      onlyAdmin: "⚠️ Only admins can add words",
      missingWords: "⚠️ Enter words to add",
      addedSuccess: "✅ %1 word(s) added",
      alreadyExist: "❌ %1 already in list: %2",
      tooShort: "⚠️ %1 word(s) too short: %2",
      onlyAdmin2: "⚠️ Only admins can delete words",
      missingWords2: "⚠️ Enter words to delete",
      deletedSuccess: "✅ %1 word(s) removed",
      notExist: "❌ %1 not in list: %2",
      emptyList: "⚠️ Word list is empty",
      badWordsList: "📑 Banned words: %1",
      onlyAdmin3: "⚠️ Only admins can %1 detection",
      turnedOnOrOff: "✅ Bad word detection %1",
      onlyAdmin4: "⚠️ Only admins can unwarn",
      missingTarget: "⚠️ Enter user ID, tag or reply",
      notWarned: "⚠️ %1 is not warned",
      unwarned: "✅ Warning removed from %1 | %2",
      warned: "⚠️ Banned word \"%1\" detected. One more strike = kick!",
      warned2: "❌ Banned word \"%1\" detected again! You are being removed.",
      needAdmin: "❌ Bot needs admin to kick user"
    }
  }
};

function hideWord(word) {
  return word.length <= 2 ? word[0] + "*" : word[0] + "*".repeat(word.length - 2) + word[word.length - 1];
}
