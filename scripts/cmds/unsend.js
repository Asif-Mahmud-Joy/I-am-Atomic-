module.exports = {
  config: {
    name: "unsend",
    aliases: ["un", "uns", "delete", "remove"],
    version: "3.0",
    author: "NTKhang & Asif",
    countDown: 3,
    role: 0,
    description: {
      en: "✨ Delete bot's sent messages ✨"
    },
    category: "utility",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  🗑️ MESSAGE UNSEND COMMAND 🗑️
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ Reply to bot's message with: {pn}

💎 Features:
✦ Delete any message sent by the bot
✦ Quick and easy to use
✦ Confirmation feedback
      `
    }
  },

  langs: {
    en: {
      syntaxError: "⚠️ Please reply to a bot message you want to delete",
      success: "✅ Message deleted successfully",
      error: "❌ Failed to delete message. Please try again."
    }
  },

  onStart: async function ({ message, event, api, getLang }) {
    try {
      const botID = api.getCurrentUserID();
      
      // Check if user replied to bot's message
      if (!event.messageReply || event.messageReply.senderID !== botID) {
        return message.reply(getLang("syntaxError"));
      }

      // Delete the message
      await message.unsend(event.messageReply.messageID);
      
      // Send success confirmation
      return message.reply(getLang("success"), () => {
        // Auto-delete the success message after 2 seconds
        setTimeout(() => message.unsend(message.messageID), 2000);
      });

    } catch (err) {
      console.error("[UNSEND ERROR]", err);
      return message.reply(getLang("error"));
    }
  }
};
