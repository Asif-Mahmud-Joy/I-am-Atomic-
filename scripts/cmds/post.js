module.exports = {
  config: {
    name: "ping",
    aliases: ["ms"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    role: 0,
    shortDescription: {
      en: "Check bot ping",
      bn: "বটের পিং দেখান"
    },
    longDescription: {
      en: "Displays the current ping of the bot system.",
      bn: "বটের বর্তমান পিং কত মিলিসেকেন্ড তা দেখায়।"
    },
    category: "System",
    guide: {
      en: "Use {p}ping to check the current ping.",
      bn: "{p}ping ব্যবহার করে বটের পিং দেখুন।"
    }
  },

  onStart: async function ({ api, event }) {
    const timeStart = Date.now();

    // Initial message
    const initialMessage = await api.sendMessage("⏱️ Checking ping...", event.threadID);

    // Calculate ping
    const ping = Date.now() - timeStart;

    // Final reply
    return api.sendMessage(
      `✅ Bot Ping: ${ping}ms\n📅 Time: ${new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}`,
      event.threadID,
      initialMessage.messageID
    );
  }
};
