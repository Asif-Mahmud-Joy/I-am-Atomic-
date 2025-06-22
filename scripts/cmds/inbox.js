module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 0,
    role: 0,
    shortDescription: "Send special message to inbox",
    longDescription: "Sends a public notification and romantic private message",
    category: "romantic",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function({ api, event, message }) {
    try {
      // Send public notification in the group
      message.reply("𝐛𝐚𝐛𝐲 𝐜𝐡𝐞𝐜𝐤 𝐲𝐨𝐮𝐫 𝐢𝐧𝐛𝐨𝐱 😉", event.threadID);
      
      // Send private message to the user
      api.sendMessage("𝐡𝐢 𝐛𝐚𝐛𝐲😘", event.senderID);
    } catch (error) {
      // Simple error logging
      console.error("Inbox command error:", error);
    }
  }
};
