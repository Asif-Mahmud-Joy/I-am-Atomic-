const { getTime } = global.utils;

module.exports = {
  config: {
    name: "thread",
    version: "1.5",
    author: "Mr.Smokey {Asif Mahmud}",
    countDown: 5,
    role: 0,
    description: {
      vi: "Quản lý các nhóm chat trong hệ thống bot",
      en: "Manage group chat in bot system",
      bn: "Bot system-er moddhe group chat manage korun"
    },
    category: "owner",
    guide: {
      vi: "   {pn} [find | -f | search | -s] <tên cần tìm>: tìm kiếm nhóm chat trong dữ liệu bot bằng tên"
        + "\n   {pn} [ban | -b] [<tid> | để trống] <reason>: dùng để cấm nhóm mang id <tid> hoặc nhóm hiện tại sử dụng bot"
        + "\n   {pn} unban [<tid> | để trống] để bỏ cấm nhóm mang id <tid> hoặc nhóm hiện tại",
      en: "   {pn} [find | -f | search | -s] <name to find>: search group chat in bot data by name"
        + "\n   {pn} [ban | -b] [<tid> | leave blank] <reason>: use to ban group with id <tid> or current group"
        + "\n   {pn} unban [<tid> | leave blank] to unban group with id <tid> or current group",
      bn: "   {pn} [find | -f | search | -s] <nam khojen>: bot-er data-te group khojen"
        + "\n   {pn} [ban | -b] [<tid> | blank rakhun] <karon>: kono group ke ban korun"
        + "\n   {pn} unban [<tid> | blank] group-er ban tulun"
        + "\n   {pn} info [<tid>] group-er full info dekha"
    }
  },

  langs: {
    bn: {
      noPermission: "Apnar ei feature bebohar korar permission nai",
      found: "🔎 %1 group khuje paoa geche keyword: \"%2\" diye:\n%3",
      notFound: "❌ Kon group paoa jai nai keyword: \"%1\" diye",
      hasBanned: "Group [%1 | %2] ager thekei ban kora ache:\n» Karon: %3\n» Shomoy: %4",
      banned: "Group [%1 | %2] ke ban kora holo.\n» Karon: %3\n» Shomoy: %4",
      notBanned: "Group [%1 | %2] ban kora nai",
      unbanned: "Group [%1 | %2] er ban tulya holo",
      missingReason: "Ban-er karon deya lagbe",
      info: "» Box ID: %1\n» Nam: %2\n» Tori er din: %3\n» Mot member: %4\n» Chele: %5 jon\n» Meye: %6 jon\n» Mot message: %7%8"
    }
  },

  onStart: async function ({ args, threadsData, message, role, event, getLang }) {
    const type = args[0];
    if (role < 2 && ["find", "search", "-f", "-s", "ban", "-b", "unban", "-u"].includes(type)) {
      return message.reply(getLang("noPermission"));
    }

    switch (type) {
      case "find":
      case "search":
      case "-f":
      case "-s": {
        let allThread = await threadsData.getAll();
        let keyword = args.slice(1).join(" ");
        if (["-j", "-join"].includes(args[1])) {
          allThread = allThread.filter(thread => thread.members.some(m => m.userID == global.GoatBot.botID && m.inGroup));
          keyword = args.slice(2).join(" ");
        }
        const result = allThread.filter(t => t.threadID.length > 15 && (t.threadName || "").toLowerCase().includes(keyword.toLowerCase()));
        const resultText = result.reduce((i, t) => i += `\n├ Name: ${t.threadName}\n└ ID: ${t.threadID}`, "");
        const msg = result.length > 0 ? getLang("found", result.length, keyword, resultText) : getLang("notFound", keyword);
        return message.reply(msg);
      }

      case "ban":
      case "-b": {
        let tid, reason;
        if (!isNaN(args[1])) {
          tid = args[1];
          reason = args.slice(2).join(" ");
        } else {
          tid = event.threadID;
          reason = args.slice(1).join(" ");
        }
        if (!reason) return message.reply(getLang("missingReason"));
        reason = reason.replace(/\s+/g, ' ');
        const threadData = await threadsData.get(tid);
        const name = threadData.threadName || "Unknown";
        if (threadData?.banned?.status)
          return message.reply(getLang("hasBanned", tid, name, threadData.banned.reason, threadData.banned.date));
        const time = getTime("DD/MM/YYYY HH:mm:ss");
        await threadsData.set(tid, { banned: { status: true, reason, date: time } });
        return message.reply(getLang("banned", tid, name, reason, time));
      }

      case "unban":
      case "-u": {
        let tid = !isNaN(args[1]) ? args[1] : event.threadID;
        const threadData = await threadsData.get(tid);
        const name = threadData.threadName || "Unknown";
        if (!threadData?.banned?.status)
          return message.reply(getLang("notBanned", tid, name));
        await threadsData.set(tid, { banned: {} });
        return message.reply(getLang("unbanned", tid, name));
      }

      case "info":
      case "-i": {
        let tid = !isNaN(args[1]) ? args[1] : event.threadID;
        const threadData = await threadsData.get(tid);
        const createdDate = getTime(threadData.createdAt, "DD/MM/YYYY HH:mm:ss");
        const members = Object.values(threadData.members).filter(m => m.inGroup);
        const totalBoy = members.filter(m => m.gender === "MALE").length;
        const totalGirl = members.filter(m => m.gender === "FEMALE").length;
        const totalMessage = members.reduce((i, m) => i + m.count, 0);
        const infoBanned = threadData?.banned?.status ? `\n- Banned: true\n- Reason: ${threadData.banned.reason}\n- Time: ${threadData.banned.date}` : "";
        return message.reply(getLang("info", threadData.threadID, threadData.threadName, createdDate, members.length, totalBoy, totalGirl, totalMessage, infoBanned));
      }

      default:
        return message.SyntaxError();
    }
  }
};
