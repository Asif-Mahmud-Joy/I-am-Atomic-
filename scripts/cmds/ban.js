const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ban",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 1,
    shortDescription: "Ban/unban members from group",
    longDescription: "Ban/unban, check or list banned members in the current group",
    category: "group",
    guide: {
      en: `
        {p}ban [@tag|uid|fb link|reply] [reason] - Ban a user
        {p}ban unban [@tag|uid|fb link|reply] - Unban a user
        {p}ban list [page] - List banned users
        {p}ban check - Kick out banned users if still in group`
    }
  },

  onStart: async function ({ message, event, args, threadsData, usersData, api }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const bannedList = await threadsData.get(threadID, 'data.banned_ban', []);
    const { adminIDs, members } = await threadsData.get(threadID);
    let target, reason = args.slice(1).join(" ");

    // 🔄 Unban
    if (args[0] === 'unban') {
      target = await getTargetID(args[1], event);
      if (!target) return message.reply("⚠️ Tag, reply or provide UID/FB link to unban.");

      const index = bannedList.findIndex(x => x.id === target);
      if (index === -1) return message.reply(`❌ UID ${target} is not banned.`);
      bannedList.splice(index, 1);
      await threadsData.set(threadID, bannedList, 'data.banned_ban');
      const name = members[target]?.name || await usersData.getName(target) || "Unknown";
      return message.reply(`✅ Unbanned ${name}`);
    }

    // 📃 List
    if (args[0] === 'list') {
      if (bannedList.length === 0) return message.reply("📃 No users are banned.");
      const page = parseInt(args[1] || 1);
      const limit = 10;
      const start = (page - 1) * limit;
      const data = bannedList.slice(start, start + limit);
      const msg = data.map((u, i) => `${start + i + 1}. ${await usersData.getName(u.id) || "Unknown"} | UID: ${u.id}\nReason: ${u.reason} | Time: ${u.time}`).join("\n\n");
      return message.reply(`📋 Banned Users (Page ${page}/${Math.ceil(bannedList.length / limit)}):\n\n${msg}`);
    }

    // 🧹 Check & Kick
    if (args[0] === 'check') {
      const kicked = [];
      for (const user of bannedList) {
        if (event.participantIDs.includes(user.id)) {
          try {
            await api.removeUserFromGroup(user.id, threadID);
            kicked.push(user.id);
          } catch {}
        }
      }
      return message.reply(kicked.length ? `✅ Kicked ${kicked.length} banned users.` : "🚫 No banned members found in group.");
    }

    // 🚫 Ban
    target = await getTargetID(args[0], event);
    if (!target) return message.reply("⚠️ Please tag, reply or provide UID/FB link to ban.");
    if (target == senderID) return message.reply("⚠️ You can't ban yourself!");
    if (adminIDs.includes(target)) return message.reply("⚠️ You can't ban an admin!");
    if (bannedList.some(x => x.id === target)) return message.reply("⚠️ This user is already banned.");

    const name = members[target]?.name || await usersData.getName(target) || "Unknown";
    const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
    bannedList.push({ id: target, reason: reason || "No reason", time });
    await threadsData.set(threadID, bannedList, 'data.banned_ban');

    message.reply(`✅ Banned ${name} (${target})\nReason: ${reason || "No reason"}`);

    // Try to kick immediately
    try {
      if (event.participantIDs.includes(target)) {
        await api.removeUserFromGroup(target, threadID);
      }
    } catch (err) {
      return message.send("⚠️ Bot needs admin to kick this user.");
    }
  },

  onEvent: async function ({ event, api, threadsData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const threadID = event.threadID;
    const bannedList = await threadsData.get(threadID, 'data.banned_ban', []);
    const joined = event.logMessageData.addedParticipants || [];

    for (const user of joined) {
      const banned = bannedList.find(x => x.id === user.userFbId);
      if (banned) {
        try {
          await api.removeUserFromGroup(user.userFbId, threadID);
        } catch (err) {
          api.sendMessage(`⚠️ ${user.fullName} (UID: ${user.userFbId}) is banned, but I can't kick. Please make me admin.`, threadID);
        }
      }
    }
  }
};

// 🔍 Utility to find target UID from tag, reply, UID, or FB link
async function getTargetID(input, event) {
  if (!input && event.messageReply?.senderID) return event.messageReply.senderID;
  if (Object.keys(event.mentions || {}).length > 0) return Object.keys(event.mentions)[0];
  if (!isNaN(input)) return input;
  if (input?.startsWith("https")) return await findUid(input);
  return null;
}
