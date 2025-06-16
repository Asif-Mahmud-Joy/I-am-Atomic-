module.exports = {
  config: {
    name: "refresh",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 60,
    role: 0,
    description: {
      vi: "Làm mới thông tin nhóm hoặc người dùng",
      en: "Refresh group chat or user info"
    },
    category: "box chat",
    guide: {
      vi:
        "{pn} [group | thread]: làm mới nhóm chat hiện tại\n" +
        "{pn} group <ID>: làm mới nhóm qua ID\n" +
        "{pn} user: làm mới người dùng của bạn\n" +
        "{pn} user <ID hoặc @tag>: làm mới người dùng khác",
      en:
        "{pn} [group | thread]: refresh current group\n" +
        "{pn} group <ID>: refresh group by ID\n" +
        "{pn} user: refresh yourself\n" +
        "{pn} user <ID or @tag>: refresh other user"
    }
  },

  langs: {
    vi: {
      refreshMyThreadSuccess: "✅ | Đã làm mới nhóm hiện tại!",
      refreshThreadTargetSuccess: "✅ | Đã làm mới nhóm %1!",
      errorRefreshMyThread: "❌ | Không thể làm mới nhóm hiện tại",
      errorRefreshThreadTarget: "❌ | Không thể làm mới nhóm %1",
      refreshMyUserSuccess: "✅ | Đã làm mới thông tin bạn!",
      refreshUserTargetSuccess: "✅ | Đã làm mới người dùng %1!",
      errorRefreshMyUser: "❌ | Không thể làm mới thông tin bạn",
      errorRefreshUserTarget: "❌ | Không thể làm mới người dùng %1"
    },
    en: {
      refreshMyThreadSuccess: "✅ | Refreshed your group info!",
      refreshThreadTargetSuccess: "✅ | Refreshed group %1 info!",
      errorRefreshMyThread: "❌ | Failed to refresh your group info",
      errorRefreshThreadTarget: "❌ | Failed to refresh group %1 info",
      refreshMyUserSuccess: "✅ | Refreshed your user info!",
      refreshUserTargetSuccess: "✅ | Refreshed user %1 info!",
      errorRefreshMyUser: "❌ | Failed to refresh your user info",
      errorRefreshUserTarget: "❌ | Failed to refresh user %1 info"
    },
    bn: {
      refreshMyThreadSuccess: "✅ | তোমার গ্রুপ তথ্য রিফ্রেশ করা হয়েছে!",
      refreshThreadTargetSuccess: "✅ | গ্রুপ %1 এর তথ্য রিফ্রেশ করা হয়েছে!",
      errorRefreshMyThread: "❌ | তোমার গ্রুপ তথ্য রিফ্রেশ করা যায়নি",
      errorRefreshThreadTarget: "❌ | গ্রুপ %1 রিফ্রেশ করা যায়নি",
      refreshMyUserSuccess: "✅ | তোমার তথ্য রিফ্রেশ করা হয়েছে!",
      refreshUserTargetSuccess: "✅ | ইউজার %1 এর তথ্য রিফ্রেশ করা হয়েছে!",
      errorRefreshMyUser: "❌ | তোমার তথ্য রিফ্রেশ করা যায়নি",
      errorRefreshUserTarget: "❌ | ইউজার %1 রিফ্রেশ করা যায়নি"
    }
  },

  onStart: async function ({ args, threadsData, message, event, usersData, getLang }) {
    const sendReply = (key, param) => message.reply(getLang(key, param));

    const isGroup = ["group", "thread"].includes(args[0]);
    const isUser = args[0] === "user";

    if (isGroup) {
      const targetID = args[1] || event.threadID;
      try {
        await threadsData.refreshInfo(targetID);
        sendReply(
          targetID === event.threadID ? "refreshMyThreadSuccess" : "refreshThreadTargetSuccess",
          targetID
        );
      } catch (e) {
        sendReply(
          targetID === event.threadID ? "errorRefreshMyThread" : "errorRefreshThreadTarget",
          targetID
        );
      }
      return;
    }

    if (isUser) {
      let targetID = event.senderID;
      if (args[1]) {
        targetID = Object.keys(event.mentions)[0] || args[1];
      }
      try {
        await usersData.refreshInfo(targetID);
        sendReply(
          targetID === event.senderID ? "refreshMyUserSuccess" : "refreshUserTargetSuccess",
          targetID
        );
      } catch (e) {
        sendReply(
          targetID === event.senderID ? "errorRefreshMyUser" : "errorRefreshUserTarget",
          targetID
        );
      }
      return;
    }

    message.SyntaxError();
  }
};
