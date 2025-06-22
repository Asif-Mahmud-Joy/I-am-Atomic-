const { getTime } = global.utils;

module.exports = {
  config: {
    name: "warn",
    version: "2.0",
    author: "Mr. Smokey",
    countDown: 5,
    role: 1,
    description: {
      en: "⚡ Manage group warnings with atomic precision"
    },
    category: "𝗚𝗥𝗢𝗨𝗣",
    guide: {
      en: "▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗪𝗔𝗥𝗡 𝗦𝗬𝗦𝗧𝗘𝗠\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n» {pn} @user <reason> - Warn member\n» {pn} list - View warnings\n» {pn} info @user - Check warns\n» {pn} unwarn @user - Remove warn\n» {pn} unban @user - Unban member\n» {pn} reset - Clear all data\n▬▬▬▬▬▬▬▬▬▬▬▬"
    }
  },

  langs: {
    en: {
      list: "▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗪𝗔𝗥𝗡𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n%1\n\n🔍 Use `{pn} info @user` for details",
      listBan: "▬▬▬▬▬▬▬▬▬▬▬▬\n☠ 𝗕𝗔𝗡𝗡𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n%1",
      listEmpty: "▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗪𝗔𝗥𝗡 𝗦𝗬𝗦𝗧𝗘𝗠\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n✅ No warnings in this group",
      listBanEmpty: "▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗪𝗔𝗥𝗡 𝗦𝗬𝗦𝗧𝗘𝗠\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n✅ No banned members",
      warnSuccess: "▬▬▬▬▬▬▬▬▬▬▬▬\n⚠️ 𝗪𝗔𝗥𝗡 𝗜𝗦𝗦𝗨𝗘𝗗\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n👤 Member: %1\n🔢 Count: %2/%3\n📌 Reason: %4\n⏰ Time: %5",
      warnBan: "▬▬▬▬▬▬▬▬▬▬▬▬\n☠ 𝗠𝗘𝗠𝗕𝗘𝗥 𝗕𝗔𝗡𝗡𝗘𝗗\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n%s has reached 3 warnings!\n🚫 Automatically banned from group",
      unbanSuccess: "▬▬▬▬▬▬▬▬▬▬▬▬\n✅ 𝗨𝗡𝗕𝗔𝗡 𝗦𝗨𝗖𝗖𝗘𝗦𝗦\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n%s can now rejoin the group",
      noPermission: "▬▬▬▬▬▬▬▬▬▬▬▬\n❌ 𝗣𝗘𝗥𝗠𝗜𝗦𝗦𝗜𝗢𝗡 𝗗𝗘𝗡𝗜𝗘𝗗\n▬▬▬▬▬▬▬▬▬▬▬▬\n\nOnly admins can use this command",
      userInfo: "▬▬▬▬▬▬▬▬▬▬▬▬\n📝 𝗪𝗔𝗥𝗡 𝗜𝗡𝗙𝗢\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n👤 %s\n🔢 Warns: %s\n%s",
      noData: "No warning history found",
      resetSuccess: "▬▬▬▬▬▬▬▬▬▬▬▬\n🔄 𝗦𝗬𝗦𝗧𝗘𝗠 𝗥𝗘𝗦𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n\nAll warning data cleared"
    }
  },

  onStart: async function ({ message, event, args, usersData, threadsData, getLang, role }) {
    const { threadID, senderID } = event;
    const warnData = await threadsData.get(threadID, "data.warn", []);
    const action = args[0]?.toLowerCase();

    // 𝗔𝗧𝗢𝗠𝗜𝗖 𝗖𝗢𝗠𝗣𝗢𝗡𝗘𝗡𝗧𝗦
    const ACTIONS = {
      async list() {
        const list = await Promise.all(warnData.map(async ({ uid, list }) => {
          const name = await usersData.getName(uid);
          return `▸ ${name} (${uid}): ${list.length} warns`;
        }));
        message.reply(list.length ? getLang("list", list.join("\n")) : getLang("listEmpty"));
      },

      async listban() {
        const banned = warnData.filter(u => u.list.length >= 3);
        const list = await Promise.all(banned.map(async ({ uid }) => {
          const name = await usersData.getName(uid);
          return `▸ ${name} (${uid})`;
        }));
        message.reply(list.length ? getLang("listBan", list.join("\n")) : getLang("listBanEmpty"));
      },

      async info() {
        const target = this.getTarget();
        if (!target) return;

        const userWarns = warnData.find(u => u.uid == target) || { list: [] };
        const name = await usersData.getName(target);
        const warnList = userWarns.list.map((w, i) => 
          `${i+1}. ${w.reason} (${w.dateTime})`).join("\n");

        message.reply(getLang("userInfo", 
          name, 
          userWarns.list.length,
          warnList || getLang("noData")
        ));
      },

      async unwarn() {
        if (role < 1) return this.noPerms();
        const target = this.getTarget();
        if (!target) return;

        const userIndex = warnData.findIndex(u => u.uid == target);
        if (userIndex === -1) return message.reply(getLang("noData"));

        warnData[userIndex].list.pop(); // Remove last warn
        if (warnData[userIndex].list.length === 0) {
          warnData.splice(userIndex, 1);
        }

        await threadsData.set(threadID, warnData, "data.warn");
        const name = await usersData.getName(target);
        message.reply(`✅ Removed last warning from ${name}`);
      },

      async unban() {
        if (role < 1) return this.noPerms();
        const target = this.getTarget();
        if (!target) return;

        const userIndex = warnData.findIndex(u => u.uid == target && u.list.length >= 3);
        if (userIndex === -1) return message.reply("User not banned");

        warnData.splice(userIndex, 1);
        await threadsData.set(threadID, warnData, "data.warn");
        const name = await usersData.getName(target);
        message.reply(getLang("unbanSuccess", name));
      },

      async reset() {
        if (role < 1) return this.noPerms();
        await threadsData.set(threadID, [], "data.warn");
        message.reply(getLang("resetSuccess"));
      },

      async default() {
        if (role < 1) return this.noPerms();
        const target = this.getTarget();
        if (!target) return message.reply("Please tag a user");

        const reason = args.slice(Object.keys(event.mentions).length + 1).join(" ") || "No reason";
        const dateTime = getTime("DD/MM/YYYY HH:mm:ss");

        let userWarns = warnData.find(u => u.uid == target);
        if (!userWarns) {
          userWarns = { uid: target, list: [] };
          warnData.push(userWarns);
        }

        userWarns.list.push({ reason, dateTime, warnBy: senderID });
        await threadsData.set(threadID, warnData, "data.warn");

        const name = await usersData.getName(target);
        if (userWarns.list.length >= 3) {
          message.reply(getLang("warnBan", name), async () => {
            try {
              await global.utils.removeUserFromGroup(target, threadID);
            } catch {
              message.reply("Failed to auto-ban (check bot permissions)");
            }
          });
        } else {
          message.reply(getLang("warnSuccess", 
            name, 
            userWarns.list.length, 
            3,
            reason, 
            dateTime
          ));
        }
      },

      // 𝗨𝗧𝗜𝗟𝗜𝗧𝗬 𝗠𝗘𝗧𝗛𝗢𝗗𝗦
      getTarget() {
        if (Object.keys(event.mentions)[0]) 
          return Object.keys(event.mentions)[0];
        if (event.messageReply) 
          return event.messageReply.senderID;
        if (args[1] && !isNaN(args[1])) 
          return args[1];
        return null;
      },

      noPerms() {
        message.reply(getLang("noPermission"));
      }
    };

    // 𝗘𝗫𝗘𝗖𝗨𝗧𝗘 𝗔𝗖𝗧𝗜𝗢𝗡
    const execute = ACTIONS[action] || ACTIONS.default;
    await execute.call(ACTIONS);
  },

  onEvent: async ({ event, threadsData, usersData, api, getLang }) => {
    if (event.logMessageType === "log:subscribe") {
      const warnData = await threadsData.get(event.threadID, "data.warn", []);
      const bannedUsers = warnData.filter(u => u.list.length >= 3);

      for (const user of event.logMessageData.addedParticipants) {
        const uid = user.userFbId;
        if (bannedUsers.some(u => u.uid == uid)) {
          const name = await usersData.getName(uid);
          api.sendMessage(getLang("warnBan", name), event.threadID);
          try {
            await global.utils.removeUserFromGroup(uid, event.threadID);
          } catch {
            api.sendMessage(`Failed to remove ${name} (check bot admin)`, event.threadID);
          }
        }
      }
    }
  }
};
