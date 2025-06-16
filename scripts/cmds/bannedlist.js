module.exports.config = {
  name: "bannedlist",
  version: "2.0.0",
  aliases: ["banned"],
  author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
  cooldowns: 5,
  role: 1,
  shortDescription: "See list of banned users/groups",
  longDescription: "Shows a list of users or groups that are banned from using the bot",
  category: "owner",
  guide: {
    en: "{p}{n} [thread|user]",
    bn: "{p}{n} [thread|user] - ব্যান করা ইউজার বা গ্রুপ এর লিস্ট দেখতে"
  }
};

module.exports.onStart = async function ({ api, event, args, usersData, threadsData, getLang }) {
  let targetType, data;

  if (["thread", "-t"].includes(args[0])) {
    data = await threadsData.getAll();
    targetType = "Group";
  } else if (["user", "-u"].includes(args[0])) {
    data = await usersData.getAll();
    targetType = "User";
  } else {
    return api.sendMessage(
      `❌ Syntax error!
✅ Use: ${global.GoatBot.config.prefix}bannedlist [thread|user]\n📌 উদাহরণ: ${global.GoatBot.config.prefix}bannedlist user`,
      event.threadID
    );
  }

  const bannedItems = data.filter(item => item.banned?.status);

  if (bannedItems.length === 0) {
    return api.sendMessage(`✅ No banned ${targetType.toLowerCase()}s found.`, event.threadID);
  }

  const listText = bannedItems.map((item, index) => (
    `🔹 ${targetType} ${index + 1}:
🆔 ID: ${item.id}
📛 Name: ${item.name || "Unknown"}
🚫 Reason: ${item.banned.reason || "Not specified"}
⏰ Time: ${item.banned.date || "Unknown"}`
  )).join("\n\n");

  api.sendMessage(`📋 Total banned ${targetType.toLowerCase()}s: ${bannedItems.length}\n\n${listText}`, event.threadID);
};
