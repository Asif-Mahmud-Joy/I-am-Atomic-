const { getTime } = global.utils;

module.exports = {
  config: {
    name: "user",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2,
    description: {
      vi: "Quản lý người dùng trong hệ thống bot",
      en: "Manage users in bot system",
      bn: "বট সিস্টেমে ইউজার ম্যানেজ করুন"
    },
    category: "owner",
    guide: {
      vi: "   {pn} [find | -f | search | -s] <tên cần tìm>: tìm kiếm người dùng trong dữ liệu bot bằng tên\n"
        + "\n   {pn} [ban | -b] [<uid> | @tag | reply tin nhắn] <reason>: để cấm người dùng sử dụng bot"
        + "\n   {pn} unban [<uid> | @tag | reply tin nhắn]: để bỏ cấm",
      en: "   {pn} [find | -f | search | -s] <name>: find user\n"
        + "\n   {pn} [ban | -b] [<uid> | @tag | reply] <reason>: ban user\n"
        + "\n   {pn} unban [<uid> | @tag | reply]: unban user",
      bn: "   {pn} [find | -f | search | -s] <নাম>: ইউজার খুঁজুন\n"
        + "\n   {pn} [ban | -b] [<uid> | @tag | রিপ্লাই] <কারণ>: ইউজার ব্যান করুন\n"
        + "\n   {pn} unban [<uid> | @tag | রিপ্লাই]: ইউজার আনব্যান করুন"
    }
  },

  langs: {
    bn: {
      noUserFound: "❌ কোনো ইউজার পাওয়া যায়নি এই নামে: \"%1\"",
      userFound: "🔎 মোট %1 ইউজার পাওয়া গেছে \"%2\" এই নামে:\n%3",
      uidRequired: "❗ ইউজার আইডি দিন, অথবা কাউকে ট্যাগ/রিপ্লাই করুন।",
      reasonRequired: "❗ ব্যান করার কারণ লিখুন।",
      userHasBanned: "🚫 এই ইউজার [%1 | %2] আগেই ব্যান হয়েছে:\n» কারণ: %3\n» সময়: %4",
      userBanned: "✅ ইউজার [%1 | %2] ব্যান করা হয়েছে।\n» কারণ: %3\n» সময়: %4",
      uidRequiredUnban: "❗ আনব্যান করতে ইউজার আইডি দিন।",
      userNotBanned: "🙂 ইউজার [%1 | %2] ব্যান নয়।",
      userUnbanned: "🟢 ইউজার [%1 | %2] আনব্যান করা হয়েছে।"
    }
  },

  onStart: async function ({ args, usersData, message, event, getLang, prefix }) {
    const type = args[0];
    switch (type) {
      case "find":
      case "-f":
      case "search":
      case "-s": {
        const allUser = await usersData.getAll();
        const keyword = args.slice(1).join(" ");
        const result = allUser.filter(item => (item.name || "").toLowerCase().includes(keyword.toLowerCase()));
        const msg = result.reduce((text, user) => text + `\n👤 নাম: ${user.name}\n🆔 ID: ${user.userID}`, "");
        message.reply(result.length === 0 ? getLang("noUserFound", keyword) : getLang("userFound", result.length, keyword, msg));
        break;
      }

      case "ban":
      case "-b": {
        let uid, reason;

        if (event.type === "message_reply") {
          uid = event.messageReply.senderID;
          reason = args.slice(1).join(" ");
        } else if (Object.keys(event.mentions).length > 0) {
          uid = Object.keys(event.mentions)[0];
          reason = args.slice(1).join(" ").replace(event.mentions[uid], "");
        } else if (args[1]) {
          uid = args[1];
          reason = args.slice(2).join(" ");
        } else return message.reply(getLang("uidRequired"));

        if (!reason) return message.reply(getLang("reasonRequired"));

        const userData = await usersData.get(uid);
        const name = userData.name || "Unknown";

        if (userData.banned?.status)
          return message.reply(getLang("userHasBanned", uid, name, userData.banned.reason, userData.banned.date));

        const time = getTime("DD/MM/YYYY HH:mm:ss");
        await usersData.set(uid, {
          banned: {
            status: true,
            reason,
            date: time
          }
        });

        message.reply(getLang("userBanned", uid, name, reason, time));
        break;
      }

      case "unban":
      case "-u": {
        let uid;

        if (event.type === "message_reply") {
          uid = event.messageReply.senderID;
        } else if (Object.keys(event.mentions).length > 0) {
          uid = Object.keys(event.mentions)[0];
        } else if (args[1]) {
          uid = args[1];
        } else return message.reply(getLang("uidRequiredUnban"));

        const userData = await usersData.get(uid);
        const name = userData.name || "Unknown";

        if (!userData.banned?.status)
          return message.reply(getLang("userNotBanned", uid, name));

        await usersData.set(uid, { banned: {} });
        message.reply(getLang("userUnbanned", uid, name));
        break;
      }

      default:
        return message.reply(getLang("uidRequired"));
    }
  }
};
