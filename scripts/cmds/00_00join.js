const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "join",
    version: "2.1.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 2,
    shortDescription: "Join a group from bot's inbox",
    longDescription: "Lets user join a group chat the bot is already part of.",
    category: "user",
    guide: {
      en: "{p}{n}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const groupList = await api.getThreadList(20, null, ["INBOX"]);

      const filteredList = groupList.filter(
        group => group.isGroup && group.threadName && group.threadID !== event.threadID
      );

      if (filteredList.length === 0) {
        return api.sendMessage("❌ No available group chats found.", event.threadID);
      }

      const formattedList = filteredList.map((group, index) =>
        `│${index + 1}. ${group.threadName}\n│🆔 ${group.threadID}`
      );

      const message = `╭───[ 📋 𝐁𝐨𝐭 𝐆𝐫𝐨𝐮𝐩 𝐋𝐢𝐬𝐭 ]───╮\n${formattedList.join("\n")}\n╰───────────────ꔪ`;

      const sentMessage = await api.sendMessage(message, event.threadID);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        messageID: sentMessage.messageID,
        author: event.senderID,
        groupList: filteredList
      });
    } catch (err) {
      console.error("❌ Group listing error:", err);
      api.sendMessage("❌ Could not retrieve group list.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const input = parseInt(event.body);
    if (isNaN(input) || input < 1 || input > Reply.groupList.length) {
      return api.sendMessage(`❌ Invalid input. Please reply with a number between 1 and ${Reply.groupList.length}.`, event.threadID);
    }

    const selectedGroup = Reply.groupList[input - 1];

    try {
      await api.addUserToGroup(event.senderID, selectedGroup.threadID);
      api.sendMessage(`✅ You’ve been added to: ${selectedGroup.threadName}`, event.threadID);
    } catch (err) {
      console.error("❌ Join error:", err);
      api.sendMessage("❌ Could not join group. Check bot admin status or try again later.", event.threadID);
    }
  }
};
