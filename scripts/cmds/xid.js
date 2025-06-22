const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "uid",
    aliases: ["xid", "userinfo"],
    version: "2.0.0",
    permission: 0,
    author: "MaHu upgrade by Asif",
    prefix: "awto",
    description: "✨ Get detailed user information with style",
    category: "utility",
    cooldowns: 3
  },

  onStart: async function({ api, event, usersData }) {
    return handleUID({ api, event, usersData });
  },

  onChat: async function({ event, api, usersData }) {
    const body = event.body?.toLowerCase().trim();
    const triggers = [this.config.name, ...(this.config.aliases || [])].map(x => x.toLowerCase());
    
    if (!triggers.includes(body)) return;
    return handleUID({ api, event, usersData });
  }
};

async function handleUID({ api, event, usersData }) {
  const startTime = Date.now();

  let uid;
  if (event.type === "message_reply") {
    uid = event.messageReply.senderID;
  } else if (Object.keys(event.mentions || {}).length > 0) {
    uid = Object.keys(event.mentions)[0];
  } else {
    uid = event.senderID;
  }

  try {
    const [userData, avatarUrl] = await Promise.all([
      usersData.get(uid),
      usersData.getAvatarUrl(uid)
    ]);

    if (!avatarUrl) throw new Error("Failed to get avatar");
    const stream = await global.utils.getStreamFromURL(avatarUrl);
    
    const endTime = Date.now();
    const speed = ((endTime - startTime) / 1000).toFixed(2);
    const joinDate = moment(userData.createdAt).format("MMMM Do YYYY");
    const lastActive = moment(userData.lastUpdated).fromNow();

    const body = `
╭─── 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 ───⭓
│  𝗡𝗮𝗺𝗲: ${userData.name}
│  𝗨𝗜𝗗: ${uid}
│  𝗚𝗲𝗻𝗱𝗲𝗿: ${userData.gender || "Unknown"}
│  𝗝𝗼𝗶𝗻𝗲𝗱: ${joinDate}
│  𝗟𝗮𝘀𝘁 𝗔𝗰𝘁𝗶𝘃𝗲: ${lastActive}
│
│  ⚡ 𝗦𝗽𝗲𝗲𝗱: ${speed}s
╰─────────────────⭓
`.trim();

    await api.sendMessage({ 
      body,
      attachment: stream,
      mentions: [{
        tag: userData.name,
        id: uid
      }]
    }, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
  }
}
