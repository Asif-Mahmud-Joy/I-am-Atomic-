const moment = require("moment-timezone");

// ============================== ☣ 𝐀𝐓𝐎𝐌𝐈𝐂⚛ DESIGN SYSTEM ============================== //
const ATOMIC = {
  HEADER: "☣ 𝐀𝐓𝐎𝐌𝐈𝐂 𝗕𝗔𝗡 𝗟𝗜𝗦𝗧 ⚛",
  FOOTER: "⚡ 𝗔𝗦𝗜𝗙 𝗠𝗔𝗛𝗠𝗨𝗗 𝗧𝗘𝗖𝗛 💥",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    BANNED: "🔨",
    USER: "👤",
    GROUP: "👥",
    INFO: "ℹ️",
    ERROR: "❌",
    SUCCESS: "✅",
    TIME: "⏰",
    REASON: "📝",
    PROCESSING: "⚡",
    SECURITY: "🛡️",
    ATOM: "⚛️"
  }
};

const formatAtomicMessage = (content) => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${ATOMIC.EMOJI.ATOM} ${ATOMIC.HEADER} ${ATOMIC.EMOJI.ATOM} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${content}

${ATOMIC.SEPARATOR}
${ATOMIC.FOOTER}`;
};

const simulateTyping = async (api, threadID, duration = 1000) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};
// ====================================================================================== //

module.exports.config = {
  name: "atomicbanlist",
  version: "3.0.0",
  aliases: ["abanned", "atomicbanned"],
  author: "Asif Mahmud | Atomic Systems",
  cooldowns: 5,
  role: 1,
  shortDescription: "View atomic banned entities",
  longDescription: "See quantum-banned users/groups with atomic precision",
  category: "security",
  guide: {
    en: `{p}atomicbanlist [user|group]`,
    bn: `{p}atomicbanlist [user|group] - কোয়ান্টাম ব্যান তালিকা দেখুন`
  }
};

module.exports.onStart = async function ({ api, event, args, usersData, threadsData }) {
  const threadID = event.threadID;
  
  // Initial security animation
  await simulateTyping(api, threadID);
  
  const sendAtomicResponse = async (content) => {
    await simulateTyping(api, threadID);
    return api.sendMessage(formatAtomicMessage(content), threadID);
  };

  let targetType, data, entityType;
  const command = args[0]?.toLowerCase();

  if (["group", "thread", "-g", "-t"].includes(command)) {
    data = await threadsData.getAll();
    targetType = "Group";
    entityType = ATOMIC.EMOJI.GROUP;
  } 
  else if (["user", "-u"].includes(command)) {
    data = await usersData.getAll();
    targetType = "User";
    entityType = ATOMIC.EMOJI.USER;
  } 
  else {
    return sendAtomicResponse(
      `${ATOMIC.EMOJI.ERROR} 𝗤𝗨𝗔𝗡𝗧𝗨𝗠 𝗦𝗬𝗡𝗧𝗔𝗫 𝗘𝗥𝗥𝗢𝗥\n` +
      `${ATOMIC.EMOJI.INFO} Use: ${global.GoatBot.config.prefix}atomicbanlist [user|group]\n` +
      `📌 Example: ${global.GoatBot.config.prefix}atomicbanlist user`
    );
  }

  // Filter banned entities
  const bannedItems = data.filter(item => item.banned?.status);
  
  if (bannedItems.length === 0) {
    return sendAtomicResponse(
      `${ATOMIC.EMOJI.SUCCESS} 𝗡𝗢 𝗤𝗨𝗔𝗡𝗧𝗨𝗠 𝗕𝗔𝗡𝗦\n` +
      `☢️ Zero ${targetType.toLowerCase()}s are currently under atomic ban`
    );
  }

  // Format banned list
  const listText = bannedItems.map((item, index) => {
    const banDate = item.banned.date 
      ? moment(item.banned.date).format("HH:mm:ss DD/MM/YYYY") 
      : "Unknown time-space";
    
    return `${entityType} ${index + 1}:\n` +
           `${ATOMIC.EMOJI.BANNED} ID: ${item.id}\n` +
           `${ATOMIC.EMOJI.INFO} Name: ${item.name || "Quantum Entity"}\n` +
           `${ATOMIC.EMOJI.REASON} Reason: ${item.banned.reason || "Security protocol violation"}\n` +
           `${ATOMIC.EMOJI.TIME} Time: ${banDate}\n` +
           `${ATOMIC.SEPARATOR}`;
  }).join("\n\n");

  return sendAtomicResponse(
    `☣️ 𝗤𝗨𝗔𝗡𝗧𝗨𝗠 𝗕𝗔𝗡 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘\n\n` +
    `⚛️ Total banned ${targetType.toLowerCase()}s: ${bannedItems.length}\n\n` +
    `${listText}`
  );
};
