const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "restart",
    version: "2.2.0",
    author: "NTKhang & Modified by ✨Asif✨",
    countDown: 3, // Reduced countdown
    role: 2, // Only admin can use
    description: {
      en: "Restart the bot system",
      vi: "Khởi động lại hệ thống bot",
      bn: "বট সিস্টেম পুনরায় চালু করুন"
    },
    category: "system",
    guide: {
      en: "{pn} [reason] - Restart with optional reason",
      vi: "{pn} [lý do] - Khởi động lại với lý do (nếu có)",
      bn: "{pn} [কারণ] - ঐচ্ছিক কারণ সহ পুনরায় চালু করুন"
    }
  },

  langs: {
    en: {
      restarting: "🔁 | System restart initiated...",
      restarted: "✅ | System restart completed\n⏱️ | Downtime: %1s\n📝 | Reason: %2",
      error: "❌ | Restart failed: %1",
      log: "📝 | Restart command used by %1 in thread %2"
    },
    vi: {
      restarting: "🔁 | Đang khởi động lại hệ thống...",
      restarted: "✅ | Khởi động lại hoàn tất\n⏱️ | Thời gian: %1s\n📝 | Lý do: %2",
      error: "❌ | Khởi động lại thất bại: %1",
      log: "📝 | Lệnh khởi động lại được sử dụng bởi %1 trong nhóm %2"
    },
    bn: {
      restarting: "🔁 | সিস্টেম পুনরায় আরম্ভ করা হচ্ছে...",
      restarted: "✅ | সিস্টেম পুনরায় আরম্ভ সম্পূর্ণ\n⏱️ | সময়: %1s\n📝 | কারণ: %2",
      error: "❌ | পুনরায় আরম্ভ ব্যর্থ: %1",
      log: "📝 | %1 দ্বারা থ্রেড %2 এ পুনরায় আরম্ভ কমান্ড ব্যবহৃত"
    }
  },

  onLoad: async function ({ api, getLang }) {
    const restartFile = path.join(__dirname, "tmp", "restart.json");
    
    if (fs.existsSync(restartFile)) {
      try {
        const { threadID, timestamp, reason } = await fs.readJson(restartFile);
        const downtime = ((Date.now() - timestamp) / 1000).toFixed(2);
        
        await api.sendMessage(
          getLang("restarted", downtime, reason || "No reason provided"), 
          threadID
        );
        
        await fs.remove(restartFile);
      } catch (err) {
        console.error("Restart completion error:", err);
      }
    }
  },

  onStart: async function ({ 
    message, 
    event, 
    args, 
    getLang, 
    api, 
    usersData 
  }) {
    try {
      const reason = args.join(" ") || "No reason specified";
      const restartFile = path.join(__dirname, "tmp", "restart.json");
      
      // Log the restart command usage
      const userInfo = await usersData.get(event.senderID);
      console.log(getLang("log", userInfo.name, event.threadID));
      
      // Ensure tmp directory exists
      await fs.ensureDir(path.join(__dirname, "tmp"));
      
      // Save restart information
      await fs.writeJson(restartFile, {
        threadID: event.threadID,
        timestamp: Date.now(),
        reason: reason,
        userID: event.senderID
      });
      
      // Notify before restart
      await message.reply(getLang("restarting"));
      
      // Add delay before exit to ensure message is sent
      setTimeout(() => process.exit(2), 1000);
      
    } catch (err) {
      console.error("Restart error:", err);
      await message.reply(getLang("error", err.message));
    }
  }
};
