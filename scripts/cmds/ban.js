// ============================== ⚡️ CONFIGURATION ⚡️ ============================== //
const ADMIN_IDS = ["61571630409265"]; // Replace with your admin IDs
// ================================================================================= //

// =============================== 🎨 DESIGN SYSTEM 🎨 ============================== //
const design = {
  header: "👑 𝗕𝗔𝗡 𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  separator: "✨══════════════════════════✨",
  emoji: {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    ban: "🔨",
    unban: "🔓",
    list: "📜",
    log: "📝",
    check: "🔍",
    admin: "👑",
    processing: "⏳",
    time: "⏰",
    user: "👤",
    reason: "📝",
    page: "📄"
  }
};

const formatMessage = (content) => {
  return `${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}`;
};

const royalStyle = {
  ban: "🔨 𝔹𝔸ℕℕ𝔼𝔻 🔨",
  unban: "🔓 𝕌ℕ𝔹𝔸ℕℕ𝔼𝔻 🔓",
  list: "📋 𝔹𝔸ℕ 𝕃𝕀𝕊𝕋 📋",
  log: "📜 𝕃𝕆𝔾 𝔼𝕍𝔼ℕ𝕋𝕊 📜",
  check: "🔍 𝕊ℂ𝔸ℕℕ𝕀ℕ𝔾 🔍"
};
// ================================================================================= //

const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ban",
    version: "4.0",
    author: "Mr.Smokey & Asif Mahmud | Enhanced by Grok",
    countDown: 5,
    role: 1,
    shortDescription: "Royal Ban Management System",
    longDescription: "Professional ban management with duration support and enhanced visuals",
    category: "group",
    guide: {
      en: `{pn} [@user] [reason] [hours] - Ban user\n{pn} unban [@user] - Unban user\n{pn} list [page] - View bans\n{pn} check - Scan for banned users\n{pn} log [page] - View ban history\nEx: {pn} @user Spamming 24`
    }
  },

  langs: {
    en: {
      notFoundTarget: "⛔ Please tag user or provide UID/FB link",
      notFoundTargetUnban: "⛔ Please tag user to unban",
      userNotBanned: "👤 User %1 is not banned",
      unbannedSuccess: "🔓 Successfully unbanned %1",
      cantSelfBan: "🚫 You cannot ban yourself",
      cantBanAdmin: "👑 Cannot ban administrators",
      existedBan: "⚠️ User is already banned",
      noReason: "📝 No reason specified",
      bannedSuccess: "🔨 Banned %1\n👤 UID: %2\n📝 Reason: %3\n⏰ Time: %4",
      banExpires: "⏳ Expires: %1",
      needAdmin: "👑 Bot requires admin privileges",
      noName: "👤 Facebook User",
      noData: "📭 No banned users found",
      listBanned: "📋 Banned Users (📄 %1/%2):\n\n%3",
      listContent: "👤 %2 (🔢 %3)\n📝 Reason: %4\n⏰ Time: %5%6\n━━━━━━━━━━━━━━━━",
      needAdminToKick: "⚠️ %1 (🔢 %2) is banned\n👑 Grant admin rights to remove",
      bannedKick: "🔨 Banned user detected:\n👤 Name: %1\n🔢 UID: %2\n📝 Reason: %3\n⏰ Time: %4\n\n🚫 User has been removed",
      logNoData: "📭 No ban logs available",
      logList: "📜 Ban History (📄 %1/%2):\n\n%3",
      logContent: "👤 %3 (🔢 %4)\n👑 By: %5\n⏰ Time: %6\n🔧 Action: %2\n━━━━━━━━━━━━━━━━",
      invalidDuration: "⏳ Duration must be 1-720 hours",
      invalidUID: "❌ Invalid UID provided",
      processing: "⏳ Processing royal command..."
    }
  },

  onStart: async function ({ message, event, args, threadsData, usersData, api, getLang, prefix }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const { adminIDs, members } = await threadsData.get(threadID);
    const bannedList = await threadsData.get(threadID, "data.banned_ban", []);
    const banLogs = await threadsData.get(threadID, "data.ban_logs", []);

    // Show typing animation
    api.setMessageReaction(design.emoji.processing, event.messageID, () => {}, true);
    
    const sendRoyalMessage = (content, emoji = design.emoji.info) => {
      setTimeout(() => {
        message.reply(formatMessage(`${emoji} ${content}`), () => {
          api.setMessageReaction("", event.messageID, () => {}, true);
        });
      }, 1500);
    };

    // Parse arguments
    let target, reason = args.slice(1).join(" "), duration = null;
    if (!isNaN(args[args.length - 1])) {
      duration = parseInt(args.pop());
      if (duration < 1 || duration > 720) {
        return sendRoyalMessage(getLang("invalidDuration"), design.emoji.error);
      }
      duration *= 3600 * 1000;
      reason = args.slice(1).join(" ");
    }

    // Unban command
    if (args[0] === "unban") {
      target = await getTargetID(args[1], event, getLang);
      if (!target) return sendRoyalMessage(getLang("notFoundTargetUnban"), design.emoji.error);
      
      const index = bannedList.findIndex(x => x.id === target);
      if (index === -1) return sendRoyalMessage(getLang("userNotBanned", target), design.emoji.warning);
      
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
      return sendRoyalMessage(getLang("unbannedSuccess", name), design.emoji.unban);
    }

    // List command
    if (args[0] === "list") {
      if (!bannedList.length) return sendRoyalMessage(getLang("noData"), design.emoji.info);
      
      const page = Math.max(1, parseInt(args[1] || 1));
      const limit = 5;
      const start = (page - 1) * limit;
      const totalPages = Math.ceil(bannedList.length / limit);
      
      if (start >= bannedList.length) {
        return sendRoyalMessage(`📄 Page ${page} not found. Total pages: ${totalPages}`, design.emoji.error);
      }

      const data = bannedList.slice(start, start + limit);
      const lines = await Promise.all(data.map(async (u, i) => {
        const name = members[u.id]?.name || (await usersData.getName(u.id)) || getLang("noName");
        const expires = u.expires ? `\n${getLang("banExpires", moment(u.expires).tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY"))}` : "";
        return getLang("listContent", start + i + 1, name, u.id, u.reason, u.time, expires);
      }));
      
      return sendRoyalMessage(
        royalStyle.list + "\n\n" + getLang("listBanned", page, totalPages, lines.join("\n")), 
        design.emoji.list
      );
    }

    // Log command
    if (args[0] === "log") {
      if (!banLogs.length) return sendRoyalMessage(getLang("logNoData"), design.emoji.info);
      
      const page = Math.max(1, parseInt(args[1] || 1));
      const limit = 5;
      const start = (page - 1) * limit;
      const totalPages = Math.ceil(banLogs.length / limit);
      
      if (start >= banLogs.length) {
        return sendRoyalMessage(`📄 Page ${page} not found. Total pages: ${totalPages}`, design.emoji.error);
      }

      const data = banLogs.slice(start, start + limit);
      const lines = await Promise.all(data.map(async (log, i) => {
        const byName = members[log.by]?.name || (await usersData.getName(log.by)) || getLang("noName");
        const action = log.action === "ban" ? royalStyle.ban : royalStyle.unban;
        return getLang("logContent", start + i + 1, action, log.name, log.userID, byName, log.time);
      }));
      
      return sendRoyalMessage(
        royalStyle.log + "\n\n" + getLang("logList", page, totalPages, lines.join("\n")), 
        design.emoji.log
      );
    }

    // Check command
    if (args[0] === "check") {
      const kicked = [];
      for (const user of bannedList) {
        if (event.participantIDs.includes(user.id) && (!user.expires || user.expires > Date.now())) {
          try {
            await api.removeUserFromGroup(user.id, threadID);
            kicked.push(user.id);
          } catch {
            const name = members[user.id]?.name || (await usersData.getName(user.id)) || getLang("noName");
            return sendRoyalMessage(getLang("needAdminToKick", name, user.id), design.emoji.warning);
          }
        }
      }
      
      return sendRoyalMessage(
        kicked.length 
          ? `🔍 Found & removed ${kicked.length} banned users` 
          : "✅ No banned users in group",
        design.emoji.check
      );
    }

    // Ban command
    target = await getTargetID(args[0], event, getLang);
    if (!target) return sendRoyalMessage(getLang("notFoundTarget"), design.emoji.error);
    if (!/^\d+$/.test(target)) return sendRoyalMessage(getLang("invalidUID"), design.emoji.error);
    if (target === senderID) return sendRoyalMessage(getLang("cantSelfBan"), design.emoji.error);
    if (adminIDs.includes(target)) return sendRoyalMessage(getLang("cantBanAdmin"), design.emoji.error);
    if (bannedList.some(x => x.id === target)) return sendRoyalMessage(getLang("existedBan"), design.emoji.warning);

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
    
    sendRoyalMessage(royalStyle.ban + "\n\n" + msg, design.emoji.ban);
    
    if (event.participantIDs.includes(target)) {
      if (adminIDs.includes(api.getCurrentUserID())) {
        api.removeUserFromGroup(target, threadID);
      } else {
        message.send(formatMessage(`${design.emoji.warning} ${getLang("needAdmin")}`));
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
        const sendKickMessage = () => {
          message.send(
            formatMessage(
              `${design.emoji.ban} ${royalStyle.ban}\n${design.separator}\n` +
              getLang("bannedKick", name, user.userFbId, banned.reason, banned.time)
            )
          );
        };

        try {
          await api.removeUserFromGroup(user.userFbId, threadID);
          sendKickMessage();
        } catch {
          message.send(
            formatMessage(`${design.emoji.warning} ${getLang("needAdminToKick", name, user.userFbId)}`)
          );
        }
      }
    }
  }
};

async function getTargetID(input, event, getLang) {
  if (!input && event.messageReply?.senderID) return event.messageReply.senderID;
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
}
