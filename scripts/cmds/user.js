const { getTime } = global.utils;

module.exports = {
  config: {
    name: "user",
    version: "2.1",
    author: "Asif",
    countDown: 5,
    role: 2,
    description: {
      en: "⚡ Manage users in bot system with atomic precision"
    },
    category: "owner",
    guide: {
      en: "✦ Find users:\n  {pn} find <name>\n\n✦ Ban users:\n  {pn} ban <uid/@tag/reply> <reason>\n\n✦ Unban users:\n  {pn} unban <uid/@tag/reply>"
    }
  },

  langs: {
    en: {
      noUserFound: "❌ No users found matching \"%1\"",
      userFound: "⚡ 𝗨𝗦𝗘𝗥 𝗦𝗘𝗔𝗥𝗖𝗛 𝗥𝗘𝗦𝗨𝗟𝗧𝗦\n\n✦ 𝗧𝗼𝘁𝗮𝗹 𝗙𝗼𝘂𝗻𝗱: %1\n✦ 𝗞𝗲𝘆𝘄𝗼𝗿𝗱: \"%2\"\n\n%3",
      userEntry: "┌ 𝗡𝗮𝗺𝗲: %1\n└ 𝗜𝗗: %2\n▬▬▬▬▬▬▬▬▬▬▬▬▬",
      uidRequired: "⚠️ 𝗘𝗥𝗥𝗢𝗥\nPlease provide user ID, tag or reply to a message",
      reasonRequired: "⚠️ 𝗘𝗥𝗥𝗢𝗥\nBan reason is required",
      userHasBanned: "☢ 𝗨𝗦𝗘𝗥 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗕𝗔𝗡𝗡𝗘𝗗\n\n✦ 𝗜𝗗: %1\n✦ 𝗡𝗮𝗺𝗲: %2\n\n✦ 𝗥𝗲𝗮𝘀𝗼𝗻: %3\n✦ 𝗗𝗮𝘁𝗲: %4",
      userBanned: "☠ 𝗨𝗦𝗘𝗥 𝗕𝗔𝗡𝗡𝗘𝗗\n\n✦ 𝗜𝗗: %1\n✦ 𝗡𝗮𝗺𝗲: %2\n\n✦ 𝗥𝗲𝗮𝘀𝗼𝗻: %3\n✦ 𝗗𝗮𝘁𝗲: %4",
      userNotBanned: "✅ 𝗨𝗦𝗘𝗥 𝗡𝗢𝗧 𝗕𝗔𝗡𝗡𝗘𝗗\n\n✦ 𝗜𝗗: %1\n✦ 𝗡𝗮𝗺𝗲: %2",
      userUnbanned: "✨ 𝗨𝗦𝗘𝗥 𝗨𝗡𝗕𝗔𝗡𝗡𝗘𝗗\n\n✦ 𝗜𝗗: %1\n✦ 𝗡𝗮𝗺𝗲: %2"
    }
  },

  onStart: async function ({ args, usersData, message, event, getLang }) {
    const type = args[0]?.toLowerCase();
    
    // 𝗨𝗦𝗘𝗥 𝗦𝗘𝗔𝗥𝗖𝗛 𝗦𝗬𝗦𝗧𝗘𝗠
    if (["find", "-f", "search", "-s"].includes(type)) {
      const keyword = args.slice(1).join(" ");
      if (!keyword) return message.reply(getLang("uidRequired"));
      
      const allUsers = await usersData.getAll();
      const results = allUsers.filter(user => 
        (user.name || "").toLowerCase().includes(keyword.toLowerCase())
      );
      
      const formattedResults = results.map(user => 
        getLang("userEntry", user.name, user.userID)
      ).join("\n");
      
      return message.reply(
        results.length === 0 
          ? getLang("noUserFound", keyword)
          : getLang("userFound", results.length, keyword, formattedResults)
      );
    }
    
    // 𝗨𝗦𝗘𝗥 𝗕𝗔𝗡 𝗦𝗬𝗦𝗧𝗘𝗠
    if (["ban", "-b"].includes(type)) {
      let uid, reason;
      
      // Handle different input methods
      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
        reason = args.slice(1).join(" ");
      } 
      else if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
        reason = args.slice(1).join(" ").replace(event.mentions[uid], "");
      } 
      else if (args[1]) {
        uid = args[1];
        reason = args.slice(2).join(" ");
      }
      
      if (!uid) return message.reply(getLang("uidRequired"));
      if (!reason) return message.reply(getLang("reasonRequired"));
      
      const userData = await usersData.get(uid);
      const name = userData.name || "Unknown";
      
      if (userData.banned?.status) {
        return message.reply(getLang("userHasBanned", 
          uid, name, 
          userData.banned.reason, 
          userData.banned.date
        ));
      }
      
      const time = getTime("DD/MM/YYYY HH:mm:ss");
      await usersData.set(uid, {
        banned: {
          status: true,
          reason: reason.trim(),
          date: time
        }
      });
      
      return message.reply(getLang("userBanned", uid, name, reason, time));
    }
    
    // 𝗨𝗦𝗘𝗥 𝗨𝗡𝗕𝗔𝗡 𝗦𝗬𝗦𝗧𝗘𝗠
    if (["unban", "-u"].includes(type)) {
      let uid;
      
      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      } 
      else if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      } 
      else if (args[1]) {
        uid = args[1];
      }
      
      if (!uid) return message.reply(getLang("uidRequired"));
      
      const userData = await usersData.get(uid);
      const name = userData.name || "Unknown";
      
      if (!userData.banned?.status) {
        return message.reply(getLang("userNotBanned", uid, name));
      }
      
      await usersData.set(uid, { banned: {} });
      return message.reply(getLang("userUnbanned", uid, name));
    }
    
    // 𝗗𝗘𝗙𝗔𝗨𝗟𝗧 𝗛𝗘𝗟𝗣 𝗠𝗘𝗦𝗦𝗔𝗚𝗘
    return message.reply(getLang("uidRequired"));
  }
};
