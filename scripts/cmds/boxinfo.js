const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ['boxinfo'],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "See group (box) information",
    longDescription: "Get details like group name, admin list, gender count, and total messages",
    category: "box chat",
    guide: {
      en: "{p}groupinfo"
    }
  },

  onStart: async function ({ api, event }) {
    const threadInfo = await api.getThreadInfo(event.threadID);

    const totalMembers = threadInfo.participantIDs.length;
    const totalMessages = threadInfo.messageCount;
    const threadName = threadInfo.threadName || "Unnamed Group";
    const threadID = threadInfo.threadID;
    const emoji = threadInfo.emoji || "None";
    const approvalMode = threadInfo.approvalMode ? "🔒 On" : "🔓 Off";
    const adminIDs = threadInfo.adminIDs;

    let maleCount = 0, femaleCount = 0;
    for (const user of threadInfo.userInfo) {
      if (user.gender === 'MALE') maleCount++;
      else if (user.gender === 'FEMALE') femaleCount++;
    }

    let adminList = "";
    for (const admin of adminIDs) {
      const info = await api.getUserInfo(admin.id);
      adminList += `• ${info[admin.id].name}\n`;
    }

    const imagePath = __dirname + '/cache/boxImage.png';
    const callback = () => api.sendMessage({
      body: `📦 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨:

👥 𝐆𝐫𝐨𝐮𝐩 𝐍𝐚𝐦𝐞: ${threadName}
🆔 𝐆𝐫𝐨𝐮𝐩 𝐈𝐃: ${threadID}
💬 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${totalMessages}
📌 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥 𝐌𝐨𝐝𝐞: ${approvalMode}
😄 𝐄𝐦𝐨𝐣𝐢: ${emoji}
👨‍👩‍👧‍👦 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${totalMembers}
👨 𝐌𝐚𝐥𝐞: ${maleCount} | 👩 𝐅𝐞𝐦𝐚𝐥𝐞: ${femaleCount}

🔧 𝐀𝐝𝐦𝐢𝐧𝐬 (${adminIDs.length}):\n${adminList}

❤️ Made with love by Asif` ,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);

    // Image fetch from group imageSrc
    if (threadInfo.imageSrc) {
      request(threadInfo.imageSrc)
        .pipe(fs.createWriteStream(imagePath))
        .on('close', callback);
    } else {
      callback();
    }
  }
};
