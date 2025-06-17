const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ban",
    version: "3.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 • Ultra Pro Max 🌠",
    countDown: 5,
    role: 1,
    shortDescription: "Ban/unban members with advanced features",
    longDescription: "Ban/unban users, list bans, check and kick, with duration and logs",
    category: "group",
    guide: {
      en: `
        {p}ban [@tag|uid|fb link|reply] [reason] [hours] - Ban a user
        {p}ban unban [@tag|uid|fb link|reply] - Unban a user
        {p}ban list [page] - List banned users
        {p}ban check - Kick banned users in group
        {p}ban log - View ban/unban logs`
    }
  },

  onStart: async function ({ message, event, args, threadsData, usersData, api }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const bannedList = await threadsData.get(threadID, 'data.banned_ban', []);
    const banLogs = await threadsData.get(threadID, 'data.ban_logs', []);
    const { adminIDs, members } = await threadsData.get(threadID);
    let target, reason = args.slice(1).join(" "), duration = null;

    // Parse duration if last arg is a number
    if (!isNaN(args[args.length - 1])) {
      duration = parseInt(args.pop()) * 3600 * 1000; // Hours to ms
      reason = args.slice(1).join(" ");
    }

    // 🔄 Unban
    if (args[0] === 'unban') {
      target = await getTargetID(args[1], event);
      if (!target) return message.reply("⚠️ Bhai, tag, reply, UID, ba FB link de!");
      const index = bannedList.findIndex(x => x.id === target);
      if (index === -1) return message.reply(`❌ UID ${target} banned na, bhai!`);
      const name = members[target]?.name || await usersData.getName(target) || "Unknown";
      bannedList.splice(index, 1);
      await threadsData.set(threadID, bannedList, 'data.banned_ban');
      banLogs.push({
        action: "unban",
        userID: target,
        name,
        by: senderID,
        time: moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY")
      });
      await threadsData.set(threadID, banLogs.slice(-50), 'data.ban_logs');
      return message.reply(`✅ ${name} ke unban kora hoise!`);
    }

    // 📃 List
    if (args[0] === 'list') {
      if (bannedList.length === 0) return message.reply("📃 Kono user banned nai, bhai!");
      const page = Math.max(1, parseInt(args[1] || 1));
      const limit = 10;
      const start = (page - 1) * limit;
      const totalPages = Math.ceil(bannedList.length / limit);
      if (start >= bannedList.length) return message.reply(`⚠️ Page ${page} nai! Total: ${totalPages}`);

      const data = bannedList.slice(start, start + limit);
      const lines = [];
      for (let i = 0; i < data.length; i++) {
        const u = data[i];
        const name = members[u.id]?.name || await usersData.getName(u.id) || "Unknown";
        const expires = u.expires ? ` | Expires: ${moment(u.expires).tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY")}` : "";
        lines.push(`${start + i + 1}. ${name} | UID: ${u.id}\nReason: ${u.reason} | Time: ${u.time}${expires}`);
      }
      return message.reply(`📋 Banned Users (Page ${page}/${totalPages}):\n\n${lines.join("\n\n")}`);
    }

    // 📜 Log
    if (args[0] === 'log') {
      if (banLogs.length === 0) return message.reply("📜 Kono ban/unban log nai, bhai!");
      const page = Math.max(1, parseInt(args[1] || 1));
      const limit = 10;
      const start = (page - 1) * limit;
      const totalPages = Math.ceil(banLogs.length / limit);
      if (start >= banLogs.length) return message.reply(`⚠️ Page ${page} nai! Total: ${totalPages}`);

      const lines = [];
      for (let i = 0; i < Math.min(limit, banLogs.length - start); i++) {
        const log = banLogs[start + i];
        const byName = members[log.by]?.name || await usersData.getName(log.by) || "Unknown";
        lines.push(`${start + i + 1}. ${log.action === "ban" ? "Banned" : "Unbanned"} ${log.name} (UID: ${log.userID})\nBy: ${byName} | Time: ${log.time}`);
      }
      return message.reply(`📜 Ban/Unban Logs (Page ${page}/${totalPages}):\n\n${lines.join("\n\n")}`);
    }

    // 🧹 Check & Kick
    if (args[0] === 'check') {
      const kicked = [];
      for (const user of bannedList) {
        if (event.participantIDs.includes(user.id) && (!user.expires || user.expires > Date.now())) {
          try {
            await api.removeUserFromGroup(user.id, threadID);
            kicked.push(user.id);
          } catch {}
        }
      }
      return message.reply(kicked.length ? `✅ ${kicked.length} banned user ke kick kora hoise!` : "🚫 Group-e kono banned member nai.");
    }

    // 🚫 Ban
    target = await getTargetID(args[0], event);
    if (!target) return message.reply("⚠️ Bhai, tag, reply, UID, ba FB link de!");
    if (target === senderID) return message.reply("⚠️ Nije ke ban korbi? Pagol naki? 😜");
    if (adminIDs.includes(target)) return message.reply("⚠️ Admin ke ban kora jabe na, bhai!");
    if (bannedList.some(x => x.id === target)) return message.reply("⚠️ Ei user already banned, bhai!");

    const name = members[target]?.name || await usersData.getName(target) || "Unknown";
    const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
    const expires = duration ? Date.now() + duration : null;
    bannedList.push({ id: target, reason: reason || "Kono karon nai", time, expires });
    await threadsData.set(threadID, bannedList, 'data.banned_ban');
    banLogs.push({ action: "ban", userID: target, name, by: senderID, time });
    await threadsData.set(threadID, banLogs.slice(-50), 'data.ban_logs');

    let msg = `✅ ${name} ke ban kora hoise!\nUID: ${target}\nReason: ${reason || "Kono karon nai"}\nTime: ${time}`;
    if (expires) msg += `\nExpires: ${moment(expires).tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY")}`;
    message.reply(msg);

    try {
      if (event.participantIDs.includes(target)) await api.removeUserFromGroup(target, threadID);
    } catch {
      message.send("⚠️ Bot ke admin banate hobe to kick this user!");
    }
  },

  onEvent: async function ({ event, api, threadsData }) {
    if (event.logMessageType !== "log:subscribe") return;
    const threadID = event.threadID;
    const bannedList = await threadsData.get(threadID, 'data.banned_ban', []);
    const joined = event.logMessageData.addedParticipants || [];

    for (const user of joined) {
      const banned = bannedList.find(x => x.id === user.userFbId);
      if (banned && (!banned.expires || banned.expires > Date.now())) {
        try {
          await api.removeUserFromGroup(user.userFbId, threadID);
        } catch {
          api.sendMessage(`⚠️ ${user.fullName} (UID: ${user.userFbId}) banned, but I can't kick. Make me admin!`, threadID);
        }
      }
    }
  }
};

async function getTargetID(input, event) {
  if (!input && event.messageReply?.senderID) return event.messageReply.senderID;
  if (Object.keys(event.mentions || {}).length > 0) return Object.keys(event.mentions)[0];
  if (/^\d+$/.test(input)) return input; // Validate numeric UID
  if (input?.startsWith("https")) {
    try {
      return await findUid(input);
    } catch {
      return null;
    }
  }
  return null;
}
