const { findUid } = global.utils;
const moment = require("moment-timezone");

// ============================== ☣ 𝐀𝐓𝐎𝐌𝐈𝐂⚛ DESIGN SYSTEM ============================== //
const ATOMIC = {
  HEADER: "☣ 𝐀𝐓𝐎𝐌𝐈𝐂 𝗕𝗔𝗡 𝗦𝗬𝗦𝗧𝗘𝗠 ⚛",
  FOOTER: "⚡ 𝗔𝗦𝗜𝗙 𝗠𝗔𝗛𝗠𝗨𝗗 𝗧𝗘𝗖𝗛 💥",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    BAN: "🔨",
    UNBAN: "🔓",
    LIST: "📜",
    LOG: "📝",
    CHECK: "🔍",
    ADMIN: "👑",
    PROCESSING: "⚡",
    TIME: "⏰",
    USER: "👤",
    REASON: "📝",
    PAGE: "📄",
    SECURITY: "🛡️",
    ATOM: "⚛️"
  },
  COLORS: {
    SUCCESS: "#00FF7F",
    ERROR: "#FF4500",
    WARNING: "#FFD700",
    INFO: "#1E90FF"
  }
};

const ADMIN_IDS = ["61571630409265"]; // Your admin ID

const formatAtomicMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${ATOMIC.EMOJI.ATOM} ${ATOMIC.HEADER} ${ATOMIC.EMOJI.ATOM} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${ATOMIC.EMOJI[type.toUpperCase()]} ${content}

${ATOMIC.SEPARATOR}
${ATOMIC.FOOTER}`;
};

const simulateTyping = async (api, threadID, duration = 1000) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};

const getTargetID = async (input, event) => {
  if (event.messageReply?.senderID) return event.messageReply.senderID;
  if (Object.keys(event.mentions || {}).length > 0) return Object.keys(event.mentions)[0];
  if (/^\d+$/.test(input)) return input;
  if (input?.startsWith("https")) {
    try {
      return await findUid(input);
    } catch {
      return null;
    }
  }
  return null;
};
// ====================================================================================== //

module.exports = {
  config: {
    name: "atomicban",
    aliases: ["aban", "atomban"],
    version: "6.0",
    author: "Asif Mahmud | Atomic Systems",
    countDown: 5,
    role: 1,
    shortDescription: "Atomic ban management system",
    longDescription: "Professional ban management with quantum-level security",
    category: "moderation",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃  ${ATOMIC.EMOJI.ATOM} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗔𝗡 𝗚𝗨𝗜𝗗𝗘 ${ATOMIC.EMOJI.ATOM} ┃
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

        ${ATOMIC.EMOJI.BAN} {pn} @user [reason] [hours] - Ban user
        ${ATOMIC.EMOJI.UNBAN} {pn} unban @user - Unban user
        ${ATOMIC.EMOJI.LIST} {pn} list [page] - View bans
        ${ATOMIC.EMOJI.CHECK} {pn} check - Scan for banned users
        ${ATOMIC.EMOJI.LOG} {pn} log [page] - View ban history

        ${ATOMIC.EMOJI.INFO} Examples:
          ${ATOMIC.EMOJI.ATOM} !atomicban @user Spamming 24
          ${ATOMIC.EMOJI.ATOM} !atomicban unban @user
          ${ATOMIC.EMOJI.ATOM} !atomicban list 2
      `
    }
  },

  langs: {
    en: {
      notFoundTarget: "⚠️ Invalid target! Tag user or provide UID/FB link",
      notFoundTargetUnban: "⚠️ Invalid unban target! Tag user to unban",
      userNotBanned: "⚠️ User %1 is not banned",
      unbannedSuccess: "🔓 Successfully unbanned %1",
      cantSelfBan: "🚫 Quantum entanglement prevents self-ban!",
      cantBanAdmin: "👑 Cannot ban atomic administrators",
      existedBan: "⚠️ User is already banned",
      noReason: "📝 No reason specified",
      bannedSuccess: "🔨 Atomic Ban Executed!\n👤 User: %1\n🔢 UID: %2\n📝 Reason: %3\n⏰ Time: %4",
      banExpires: "⏳ Expires: %1",
      needAdmin: "👑 Bot requires quantum admin privileges",
      noName: "👤 Atomic User",
      noData: "📭 No banned users found",
      listBanned: "📜 Atomic Ban List (📄 %1/%2):\n\n%3",
      listContent: "👤 %2 (🔢 %3)\n📝 Reason: %4\n⏰ Time: %5%6\n${ATOMIC.SEPARATOR}",
      needAdminToKick: "⚠️ %1 (🔢 %2) is banned\n👑 Grant quantum admin rights to remove",
      bannedKick: "☢️ Banned user detected!\n👤 Name: %1\n🔢 UID: %2\n📝 Reason: %3\n⏰ Time: %4\n\n🚫 User has been quantum-purged",
      logNoData: "📭 No ban logs available",
      logList: "📜 Atomic Ban History (📄 %1/%2):\n\n%3",
      logContent: "👤 %3 (🔢 %4)\n👑 By: %5\n⏰ Time: %6\n🔧 Action: %2\n${ATOMIC.SEPARATOR}",
      invalidDuration: "⏳ Duration must be 1-720 hours",
      invalidUID: "❌ Invalid quantum UID",
      processing: "⚡ Processing atomic command...",
      securityCheck: "🛡️ Verifying quantum credentials...",
      atomicKick: "☢️ Quantum purge initiated!",
      banListHeader: "☣️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗔𝗡 𝗟𝗜𝗦𝗧"
    }
  },

  onStart: async function ({ message, event, args, threadsData, usersData, api, getLang, prefix }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    
    // Initial security animation
    await simulateTyping(api, threadID);
    await message.reply(
      formatAtomicMessage(getLang("securityCheck"), "info")
    );
    await simulateTyping(api, threadID, 1000, 1500);
    
    const sendAtomicResponse = async (content, type = "info") => {
      await simulateTyping(api, threadID);
      return message.reply(formatAtomicMessage(content, type));
    };

    const { adminIDs, members } = await threadsData.get(threadID);
    const bannedList = await threadsData.get(threadID, "data.banned_ban", []);
    const banLogs = await threadsData.get(threadID, "data.ban_logs", []);

    // Parse arguments
    let target, reason = args.slice(1).join(" "), duration = null;
    if (!isNaN(args[args.length - 1])) {
      duration = parseInt(args.pop());
      if (duration < 1 || duration > 720) {
        return sendAtomicResponse(getLang("invalidDuration"), "error");
      }
      duration *= 3600 * 1000;
      reason = args.slice(1).join(" ");
    }

    // Unban command
    if (args[0] === "unban") {
      target = await getTargetID(args[1], event);
      if (!target) return sendAtomicResponse(getLang("notFoundTargetUnban"), "error");
      
      const index = bannedList.findIndex(x => x.id === target);
      if (index === -1) return sendAtomicResponse(getLang("userNotBanned", target), "warning");
      
      const name = members[target]?.name || (await usersData.getName(target)) || getLang("noName");
      bannedList.splice(index, 1);
      await threadsData.set(threadID, bannedList, "data.banned_ban");
      
      banLogs.push({
        action: "unban",
        userID: target,
        name,
        by: senderID,
        time: moment().tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY")
      });
      
      await threadsData.set(threadID, banLogs, "data.ban_logs");
      return sendAtomicResponse(getLang("unbannedSuccess", name), "success");
    }

    // List command
    if (args[0] === "list") {
      if (!bannedList.length) return sendAtomicResponse(getLang("noData"), "info");
      
      const page = Math.max(1, parseInt(args[1] || 1));
      const limit = 5;
      const start = (page - 1) * limit;
      const totalPages = Math.ceil(bannedList.length / limit);
      
      if (start >= bannedList.length) {
        return sendAtomicResponse(`📄 Page ${page} not found. Total pages: ${totalPages}`, "error");
      }

      const data = bannedList.slice(start, start + limit);
      const lines = await Promise.all(data.map(async (u, i) => {
        const name = members[u.id]?.name || (await usersData.getName(u.id)) || getLang("noName");
        const expires = u.expires ? `\n⏳ Expires: ${moment(u.expires).tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY")}` : "";
        return getLang("listContent", start + i + 1, name, u.id, u.reason, u.time, expires);
      }));
      
      return sendAtomicResponse(
        `${getLang("banListHeader")}\n\n${getLang("listBanned", page, totalPages, lines.join("\n"))}`, 
        "info"
      );
    }

    // Log command
    if (args[0] === "log") {
      if (!banLogs.length) return sendAtomicResponse(getLang("logNoData"), "info");
      
      const page = Math.max(1, parseInt(args[1] || 1));
      const limit = 5;
      const start = (page - 1) * limit;
      const totalPages = Math.ceil(banLogs.length / limit);
      
      if (start >= banLogs.length) {
        return sendAtomicResponse(`📄 Page ${page} not found. Total pages: ${totalPages}`, "error");
      }

      const data = banLogs.slice(start, start + limit);
      const lines = await Promise.all(data.map(async (log, i) => {
        const byName = members[log.by]?.name || (await usersData.getName(log.by)) || getLang("noName");
        const action = log.action === "ban" ? "☢️ BAN" : "🔓 UNBAN";
        return getLang("logContent", start + i + 1, action, log.name, log.userID, byName, log.time);
      }));
      
      return sendAtomicResponse(
        getLang("logList", page, totalPages, lines.join("\n")), 
        "info"
      );
    }

    // Check command
    if (args[0] === "check") {
      if (!bannedList.length) return sendAtomicResponse(getLang("noData"), "info");
      
      const kicked = [];
      for (const user of bannedList) {
        if (event.participantIDs.includes(user.id) && (!user.expires || user.expires > Date.now())) {
          try {
            await api.removeUserFromGroup(user.id, threadID);
            kicked.push(user.id);
          } catch {
            const name = members[user.id]?.name || (await usersData.getName(user.id)) || getLang("noName");
            return sendAtomicResponse(getLang("needAdminToKick", name, user.id), "warning");
          }
        }
      }
      
      return sendAtomicResponse(
        kicked.length 
          ? `🔍 Found & removed ${kicked.length} banned users` 
          : "✅ No banned users in group",
        "info"
      );
    }

    // Ban command
    target = await getTargetID(args[0], event);
    if (!target) return sendAtomicResponse(getLang("notFoundTarget"), "error");
    if (!/^\d+$/.test(target)) return sendAtomicResponse(getLang("invalidUID"), "error");
    if (target === senderID) return sendAtomicResponse(getLang("cantSelfBan"), "error");
    if (adminIDs.includes(target)) return sendAtomicResponse(getLang("cantBanAdmin"), "error");
    if (bannedList.some(x => x.id === target)) return sendAtomicResponse(getLang("existedBan"), "warning");

    const name = members[target]?.name || (await usersData.getName(target)) || getLang("noName");
    const time = moment().tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY");
    const expires = duration ? Date.now() + duration : null;
    const banData = { id: target, reason: reason || getLang("noReason"), time, expires };
    
    bannedList.push(banData);
    await threadsData.set(threadID, bannedList, "data.banned_ban");
    
    banLogs.push({
      action: "ban",
      userID: target,
      name,
      by: senderID,
      time
    });
    
    await threadsData.set(threadID, banLogs, "data.ban_logs");

    let msg = getLang("bannedSuccess", name, target, banData.reason, time);
    if (expires) msg += `\n${getLang("banExpires", moment(expires).tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY"))}`;
    
    sendAtomicResponse(msg, "success");
    
    if (event.participantIDs.includes(target)) {
      if (adminIDs.includes(api.getCurrentUserID())) {
        await simulateTyping(api, threadID);
        api.removeUserFromGroup(target, threadID, () => {
          message.reply(getLang("atomicKick"), () => {}, event.messageID);
        });
      } else {
        sendAtomicResponse(getLang("needAdmin"), "warning");
      }
    }
  },

  onEvent: async function ({ event, api, threadsData, message, getLang }) {
    if (event.logMessageType !== "log:subscribe") return;
    
    const threadID = event.threadID;
    const bannedList = await threadsData.get(threadID, "data.banned_ban", []);
    const joined = event.logMessageData.addedParticipants || [];

    for (const user of joined) {
      const banned = bannedList.find(x => x.id === user.userFbId);
      if (banned && (!banned.expires || banned.expires > Date.now())) {
        const name = user.fullName || getLang("noName");
        
        try {
          await api.removeUserFromGroup(user.userFbId, threadID);
          message.reply(
            formatAtomicMessage(
              getLang("bannedKick", name, user.userFbId, banned.reason, banned.time),
              "warning"
            )
          );
        } catch {
          message.reply(
            formatAtomicMessage(
              getLang("needAdminToKick", name, user.userFbId),
              "error"
            )
          );
        }
      }
    }
  }
};
