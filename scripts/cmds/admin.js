const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    version: "2.0", // ✅ Updated
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    role: 2,
    category: "box chat",
    onChat: true,
    shortDescription: {
      en: "Add, remove, edit admin role"
    },
    longDescription: {
      en: "Add, remove, edit admin role of users dynamically"
    },
    guide: {
      en: `   {pn} add <uid | @tag>: Add admin
   {pn} remove <uid | @tag>: Remove admin
   {pn} list: Show all admins`
    }
  },

  langs: {
    en: {
      added: "✅ Added admin role for %1 user(s):\n%2",
      alreadyAdmin: "⚠️ Already admin: %1 user(s):\n%2",
      missingIdAdd: "❌ Please tag or provide UID to add as admin.",
      removed: "✅ Removed admin role from %1 user(s):\n%2",
      notAdmin: "⚠️ Not an admin: %1 user(s):\n%2",
      missingIdRemove: "❌ Please tag or provide UID to remove from admin.",
      listAdmin: "👑 Admins List:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    return await this.handle(message, args, usersData, event, getLang);
  },

  onChat: async function ({ message, event, usersData, getLang }) {
    const { body } = event;
    if (!body) return;
    const args = body.trim().split(/\s+/);
    if (args[0]?.toLowerCase() !== "admin") return;
    args.shift();
    return await this.handle(message, args, usersData, event, getLang);
  },

  handle: async function (message, args, usersData, event, getLang) {
    const action = args[0];
    const mentionIds = Object.keys(event.mentions || {});
    const uids = mentionIds.length
      ? mentionIds
      : event.messageReply
      ? [event.messageReply.senderID]
      : args.slice(1).filter(arg => !isNaN(arg));

    if (["add", "-a"].includes(action)) {
      if (!uids.length) return message.reply(getLang("missingIdAdd"));
      const added = [], already = [];

      for (const uid of uids) {
        if (config.adminBot.includes(uid)) already.push(uid);
        else {
          config.adminBot.push(uid);
          added.push(uid);
        }
      }

      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
      const names = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));
      return message.reply(
        `${added.length ? getLang("added", added.length, names.slice(0, added.length).join("\n")) : ""}
${already.length ? getLang("alreadyAdmin", already.length, already.map(uid => `• ${uid}`).join("\n")) : ""}`
      );
    }

    if (["remove", "-r"].includes(action)) {
      if (!uids.length) return message.reply(getLang("missingIdRemove"));
      const removed = [], notAdmin = [];

      for (const uid of uids) {
        const index = config.adminBot.indexOf(uid);
        if (index !== -1) {
          config.adminBot.splice(index, 1);
          removed.push(uid);
        } else notAdmin.push(uid);
      }

      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
      const names = await Promise.all(removed.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));
      return message.reply(
        `${removed.length ? getLang("removed", removed.length, names.join("\n")) : ""}
${notAdmin.length ? getLang("notAdmin", notAdmin.length, notAdmin.map(uid => `• ${uid}`).join("\n")) : ""}`
      );
    }

    if (["list", "-l"].includes(action)) {
      const names = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));
      return message.reply(getLang("listAdmin", names.join("\n")));
    }

    return message.SyntaxError?.();
  }
};
