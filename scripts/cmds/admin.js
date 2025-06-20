const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    aliases: ["quantumadmin", "atomadmin", "admincore"],
    version: "3.0",
    author: "Asif Mahmud | Atomic Edition",
    countDown: 3,
    role: 2,
    category: "⚡ Box Management",
    onChat: true,
    shortDescription: {
      en: "⚛️ Quantum Admin Management"
    },
    longDescription: {
      en: "Control admin privileges using quantum protocols"
    },
    guide: {
      en: `   {pn} add <uid|@tag>: Quantum elevate user\n`
        + `   {pn} remove <uid|@tag>: Demote quantum access\n`
        + `   {pn} list: Display quantum admins`
    }
  },

  langs: {
    en: {
      added: "✅ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐄𝐋𝐄𝐕𝐀𝐓𝐈𝐎𝐍\nAdded %1 user(s) to quantum admin core:\n%2",
      alreadyAdmin: "☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐔𝐏𝐋𝐈𝐂𝐀𝐓𝐄\n%1 user(s) already in quantum admin core:\n%2",
      missingIdAdd: "⚠️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐈𝐃 𝐌𝐈𝐒𝐒𝐈𝐍𝐆\nPlease specify quantum signature (UID or tag)",
      removed: "🗑️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐄𝐌𝐎𝐓𝐈𝐎𝐍\nRemoved %1 user(s) from quantum admin core:\n%2",
      notAdmin: "⚠️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐍𝐎𝐍-𝐀𝐃𝐌𝐈𝐍\n%1 user(s) not in quantum admin core:\n%2",
      missingIdRemove: "⚠️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐈𝐃 𝐌𝐈𝐒𝐒𝐈𝐍𝐆\nPlease specify quantum signature to demote",
      listAdmin: "👑 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐃𝐌𝐈𝐍 𝐂𝐎𝐑𝐄\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    return await this.handle(message, args, usersData, event, getLang);
  },

  onChat: async function ({ message, event, usersData, getLang }) {
    const { body } = event;
    if (!body) return;

    const args = body.trim().split(/\s+/);
    if (args[0].toLowerCase() !== "admin") return;

    args.shift();
    return await this.handle(message, args, usersData, event, getLang);
  },

  handle: async function (message, args, usersData, event, getLang) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐃𝐌𝐈𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["⚡", "🔒", "🔓", "👑", "🔭"]
    };
    // ================================================================================== //

    const formatResponse = (content) => {
      return [
        design.header,
        design.separator,
        content,
        design.separator,
        design.footer
      ].join("\n");
    };

    // Show atomic processing animation
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      api.setMessageReaction(design.emojis[loadingIndex], event.messageID, () => {});
      loadingIndex = (loadingIndex + 1) % design.emojis.length;
    }, 500);

    try {
      const action = args[0]?.toLowerCase();
      const mentionIds = Object.keys(event.mentions || {});
      const uids = mentionIds.length 
        ? mentionIds 
        : event.messageReply
          ? [event.messageReply.senderID]
          : args.slice(1).filter(arg => !isNaN(arg));

      switch (action) {
        case "add":
        case "-a": {
          if (!uids.length) {
            return message.reply(formatResponse(getLang("missingIdAdd")));
          }

          const added = [];
          const alreadyAdmin = [];

          for (const uid of uids) {
            if (config.adminBot.includes(uid)) {
              alreadyAdmin.push(uid);
            } else {
              config.adminBot.push(uid);
              added.push(uid);
            }
          }

          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          
          const addedNames = await Promise.all(
            added.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)
          );
          
          const alreadyNames = await Promise.all(
            alreadyAdmin.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)
          );

          let response = "";
          if (added.length) {
            response += getLang("added", added.length, addedNames.join("\n"));
          }
          if (alreadyAdmin.length) {
            if (response) response += "\n\n";
            response += getLang("alreadyAdmin", alreadyAdmin.length, alreadyNames.join("\n"));
          }

          return message.reply(formatResponse(response));

        }

        case "remove":
        case "-r": {
          if (!uids.length) {
            return message.reply(formatResponse(getLang("missingIdRemove")));
          }

          const removed = [];
          const notAdmin = [];

          for (const uid of uids) {
            const index = config.adminBot.indexOf(uid);
            if (index !== -1) {
              config.adminBot.splice(index, 1);
              removed.push(uid);
            } else {
              notAdmin.push(uid);
            }
          }

          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          
          const removedNames = await Promise.all(
            removed.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)
          );
          
          const notAdminNames = await Promise.all(
            notAdmin.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)
          );

          let response = "";
          if (removed.length) {
            response += getLang("removed", removed.length, removedNames.join("\n"));
          }
          if (notAdmin.length) {
            if (response) response += "\n\n";
            response += getLang("notAdmin", notAdmin.length, notAdminNames.join("\n"));
          }

          return message.reply(formatResponse(response));
        }

        case "list":
        case "-l": {
          const adminNames = await Promise.all(
            config.adminBot.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)
          );
          
          return message.reply(formatResponse(
            getLang("listAdmin", adminNames.join("\n"))
          ));
        }

        default: {
          return message.SyntaxError?.();
        }
      }
    } catch (error) {
      console.error("Quantum Admin Error:", error);
      return message.reply(formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐑𝐄 𝐌𝐄𝐋𝐓𝐃𝐎𝐖𝐍\nSystem overload detected"));
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  }
};
