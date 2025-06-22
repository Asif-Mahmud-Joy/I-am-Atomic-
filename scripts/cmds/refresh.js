module.exports = {
  config: {
    name: "refresh",
    version: "2.1.0",
    author: "NTKhang & Modified by ✨Asif✨",
    countDown: 30, // Reduced cooldown
    role: 0,
    description: {
      vi: "Làm mới thông tin nhóm/người dùng",
      en: "Refresh group/user information",
      bn: "গ্রুপ/ব্যবহারকারীর তথ্য রিফ্রেশ করুন"
    },
    category: "utility",
    guide: {
      vi: `
        {pn} group [ID] - Làm mới nhóm (ID mặc định: nhóm hiện tại)
        {pn} user [ID/@tag] - Làm mới người dùng (mặc định: bạn)
      `,
      en: `
        {pn} group [ID] - Refresh group (default: current group)
        {pn} user [ID/@tag] - Refresh user (default: yourself)
      `,
      bn: `
        {pn} group [ID] - গ্রুপ রিফ্রেশ করুন (ডিফল্ট: বর্তমান গ্রুপ)
        {pn} user [ID/@tag] - ব্যবহারকারী রিফ্রেশ করুন (ডিফল্ট: আপনি)
      `
    }
  },

  langs: {
    vi: {
      success: "✅ | Đã làm mới thành công!",
      error: "❌ | Không thể làm mới",
      invalidTarget: "⚠️ | ID không hợp lệ",
      missingPermission: "🔒 | Bạn cần quyền admin để làm mới nhóm khác"
    },
    en: {
      success: "✅ | Successfully refreshed!",
      error: "❌ | Failed to refresh",
      invalidTarget: "⚠️ | Invalid ID",
      missingPermission: "🔒 | You need admin rights to refresh other groups"
    },
    bn: {
      success: "✅ | সফলভাবে রিফ্রেশ করা হয়েছে!",
      error: "❌ | রিফ্রেশ করতে ব্যর্থ",
      invalidTarget: "⚠️ | অবৈধ আইডি",
      missingPermission: "🔒 | অন্যান্য গ্রুপ রিফ্রেশ করতে আপনার অ্যাডমিন অধিকার প্রয়োজন"
    }
  },

  onStart: async function ({ 
    args, 
    message, 
    event, 
    usersData, 
    threadsData, 
    getLang,
    api,
    role
  }) {
    try {
      const [type, target] = args;
      
      // Validate input
      if (!["group", "user"].includes(type)) {
        return message.SyntaxError();
      }

      if (type === "group") {
        await this.handleGroupRefresh({
          target,
          event,
          threadsData,
          message,
          getLang,
          api,
          role
        });
      } 
      else if (type === "user") {
        await this.handleUserRefresh({
          target,
          event,
          usersData,
          message,
          getLang
        });
      }
    } catch (error) {
      console.error("Refresh command error:", error);
      message.reply(getLang("error"));
    }
  },

  handleGroupRefresh: async function ({
    target,
    event,
    threadsData,
    message,
    getLang,
    api,
    role
  }) {
    const targetID = target || event.threadID;
    
    // Validate thread ID
    if (isNaN(targetID)) {
      return message.reply(getLang("invalidTarget"));
    }

    // Check permissions if refreshing other groups
    if (targetID !== event.threadID && role < 1) {
      return message.reply(getLang("missingPermission"));
    }

    try {
      await threadsData.refreshInfo(targetID);
      
      // Additional API call to ensure fresh data
      if (targetID === event.threadID) {
        await api.getThreadInfo(targetID);
      }
      
      message.reply(getLang("success"));
    } catch (error) {
      console.error("Group refresh error:", error);
      message.reply(getLang("error"));
    }
  },

  handleUserRefresh: async function ({
    target,
    event,
    usersData,
    message,
    getLang
  }) {
    let targetID = event.senderID;
    
    if (target) {
      // Handle mentions
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } 
      // Handle direct ID input
      else if (!isNaN(target)) {
        targetID = target;
      } 
      else {
        return message.reply(getLang("invalidTarget"));
      }
    }

    try {
      await usersData.refreshInfo(targetID);
      message.reply(getLang("success"));
    } catch (error) {
      console.error("User refresh error:", error);
      message.reply(getLang("error"));
    }
  }
};
