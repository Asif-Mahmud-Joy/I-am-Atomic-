const destination = "100056927749389"; // Change to your Facebook UID

module.exports = {
  config: {
    name: "catchpastebin",
    version: "2.0", // ✅ Updated
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    shortDescription: { en: "Catch Pastebin links" },
    longDescription: { en: "Detects Pastebin links in chat and alerts the admin UID." },
    category: "Info",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, message, event, usersData }) {
    const user = await usersData.get(event.senderID);
    const name = user?.name || "Unknown User";

    return message.reply(
      `⚠️ Pastebin Alert Command Active!

🔧 How to use:
1. Open the script file.
2. Change the 'destination' variable to your own Facebook UID.
3. The bot will now catch Pastebin links from any chat and send you an alert.`
    );
  },

  onChat: async function ({ api, event, usersData, threadsData }) {
    const messageText = event.body || "";
    if (!messageText.includes("pastebin.com")) return;

    try {
      const sender = await usersData.get(event.senderID);
      const thread = await threadsData.get(event.threadID);

      const alertMessage =
        `🚨 Pastebin Detected!

👤 Sender: ${sender?.name || "Unknown"}
🆔 UID: ${event.senderID}
🧵 Group: ${thread?.threadName || "Unknown Group"}
🆔 GCID: ${event.threadID}

📄 Message:
${messageText}`;

      await api.sendMessage(alertMessage, destination);
    } catch (err) {
      console.error("[Pastebin Alert Error]", err);
    }
  }
};
