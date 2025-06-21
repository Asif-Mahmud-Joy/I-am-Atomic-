const destination = "61571630409265"; // 🔧 YOUR ADMIN UID

module.exports = {
  config: {
    name: "catchpastebin",
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "☢️ Detect Pastebin Content"
    },
    longDescription: {
      en: "⚛️ Monitor chats for Pastebin links with atomic-level precision"
    },
    category: "💎 Premium Security",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, message, event }) {
    // Configuration guide with typing simulation
    const configSteps = [
      "☣️ ATOMIC PASTEBIN DETECTOR ⚛️",
      "━━━━━━━━━━━━━━━━━━━━━━━━",
      "⚙️ System Configuration:",
      "",
      `🔸 Destination UID: ${destination}`,
      "🔸 Status: Active and Monitoring",
      "🔸 Detection: pastebin.com | paste.ee",
      "",
      "💎 System will detect Pastebin links in all chats",
      "━━━━━━━━━━━━━━━━━━━━━━━━",
      "⚡ Real-time alerts will be sent to your inbox"
    ];

    // Simulate typing animation
    let typingMessage = "";
    for (const line of configSteps) {
      typingMessage += line + "\n";
      await new Promise(resolve => setTimeout(resolve, 350));
      await message.reply({
        body: typingMessage,
        mentions: []
      });
    }
  },

  onChat: async function ({ api, event, usersData, threadsData }) {
    const messageText = event.body || "";
    if (!/(pastebin\.com|paste\.ee)/i.test(messageText)) return;

    try {
      // Send typing indicator to admin
      api.sendTypingIndicator(destination);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get sender and thread information
      const [sender, thread] = await Promise.all([
        usersData.get(event.senderID),
        threadsData.get(event.threadID)
      ]);

      // Prepare alert message
      const alertMessage = 
        `☢️ PASTEBIN DETECTION ALERT ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━
👤 SENDER INFORMATION
▸ Name: ${sender?.name || "Unknown User"}
▸ UID: ${event.senderID}

🧵 CONVERSATION CONTEXT
▸ ${event.isGroup ? "Group: " + (thread?.threadName || "Unknown") : "Private Chat"}
▸ Thread ID: ${event.threadID}

📄 CONTENT SNIPPET
${this.truncateText(messageText, 200)}
━━━━━━━━━━━━━━━━━━━━━━━━
⚡ ATOMIC SECURITY SYSTEM • REAL-TIME MONITORING`;

      // Send alert with message snippet
      await api.sendMessage({
        body: alertMessage,
        mentions: []
      }, destination);

      // Send full message content as attachment
      const path = __dirname + `/cache/pastebin_${Date.now()}.txt`;
      require('fs-extra').writeFileSync(path, `Full Message Content:\n\n${messageText}`);
      
      await api.sendMessage({
        body: "📁 Full message content attached:",
        attachment: require('fs').createReadStream(path)
      }, destination, () => require('fs').unlinkSync(path));

    } catch (error) {
      console.error("☢️ PASTEBIN ALERT ERROR:", error);
      await api.sendMessage(
        `☣️ ATOMIC ALERT SYSTEM\n━━━━━━━━━━━━━━\n❌ Detection failure\n🔸 ${error.message}`,
        destination
      );
    }
  },

  truncateText: function(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }
};
