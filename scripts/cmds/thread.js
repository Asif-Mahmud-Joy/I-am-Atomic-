const { getTime } = global.utils;

module.exports = {
  config: {
    name: "thread",
    aliases: ["group", "threadmgmt"],
    version: "2.0",
    author: "NTKhang & Asif",
    countDown: 5,
    role: 2, // Admin+ only
    description: {
      en: "✨ Advanced thread management system ✨"
    },
    category: "admin",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  🛡️ THREAD MANAGEMENT 🛡️
╚═══════❖•°♛°•❖═══════╝

⚡ Commands:
❯ {pn} find <name> - Search groups by name
❯ {pn} find -j <name> - Search joined groups
❯ {pn} ban [tid] <reason> - Ban a group
❯ {pn} unban [tid] - Unban a group
❯ {pn} info [tid] - View group info

💎 Examples:
❯ {pn} find Anime Lovers
❯ {pn} ban 123456789 Spam
❯ {pn} info
      `
    }
  },

  langs: {
    en: {
      noPermission: "⛔ You don't have permission to use this command",
      found: "🔍 Found %1 groups matching \"%2\":\n%3",
      notFound: "❌ No groups found for \"%1\"",
      hasBanned: "🚫 Group [%1 | %2] is already banned\n» Reason: %3\n» Date: %4",
      banned: "🔨 Banned group [%1 | %2]\n» Reason: %3\n» Date: %4",
      notBanned: "✅ Group [%1 | %2] is not banned",
      unbanned: "🔓 Unbanned group [%1 | %2]",
      missingReason: "⚠️ Please provide a ban reason",
      info: `📊 Group Info:
» ID: %1
» Name: %2
» Created: %3
» Members: %4
  👨 Male: %5
  👩 Female: %6
» Messages: %7%8`,
      error: "❌ An error occurred: %1"
    }
  },

  onStart: async function ({ args, threadsData, message, event, getLang }) {
    try {
      const type = args[0]?.toLowerCase();
      const subType = args[1]?.toLowerCase();

      switch (type) {
        case "find":
        case "search":
        case "-f":
        case "-s": {
          const isJoined = ['-j', '-join'].includes(subType);
          const keyword = isJoined ? args.slice(2).join(" ") : args.slice(1).join(" ");
          
          if (!keyword) return message.reply("🔍 Please provide a search keyword");
          
          let allThreads = await threadsData.getAll();
          if (isJoined) {
            allThreads = allThreads.filter(t => 
              t.members.some(m => m.userID == global.GoatBot.botID && m.inGroup)
            );
          }
          
          const results = allThreads.filter(t => 
            t.threadID.length > 15 && 
            t.threadName?.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (results.length === 0) {
            return message.reply(getLang("notFound", keyword));
          }
          
          const resultText = results.map(t => 
            `├ Name: ${t.threadName}\n└ ID: ${t.threadID}`
          ).join("\n\n");
          
          return message.reply(getLang("found", results.length, keyword, resultText));
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
          
          const thread = await threadsData.get(tid);
          if (thread.banned?.status) {
            return message.reply(getLang("hasBanned", tid, thread.threadName, 
              thread.banned.reason, thread.banned.date));
          }
          
          const time = getTime("DD/MM/YYYY HH:mm:ss");
          await threadsData.set(tid, {
            banned: { status: true, reason, date: time }
          });
          
          return message.reply(getLang("banned", tid, thread.threadName, reason, time));
        }

        case "unban":
        case "-u": {
          const tid = !isNaN(args[1]) ? args[1] : event.threadID;
          const thread = await threadsData.get(tid);
          
          if (!thread.banned?.status) {
            return message.reply(getLang("notBanned", tid, thread.threadName));
          }
          
          await threadsData.set(tid, { banned: {} });
          return message.reply(getLang("unbanned", tid, thread.threadName));
        }

        case "info":
        case "-i": {
          const tid = !isNaN(args[1]) ? args[1] : event.threadID;
          const thread = await threadsData.get(tid);
          
          const members = Object.values(thread.members).filter(m => m.inGroup);
          const stats = {
            total: members.length,
            male: members.filter(m => m.gender === "MALE").length,
            female: members.filter(m => m.gender === "FEMALE").length,
            messages: members.reduce((sum, m) => sum + m.count, 0)
          };
          
          const banInfo = thread.banned?.status ? 
            `\n» Ban Reason: ${thread.banned.reason}\n» Ban Date: ${thread.banned.date}` : "";
          
          return message.reply(getLang("info",
            thread.threadID,
            thread.threadName,
            getTime(thread.createdAt, "DD/MM/YYYY HH:mm:ss"),
            stats.total,
            stats.male,
            stats.female,
            stats.messages,
            banInfo
          ));
        }

        default:
          return message.SyntaxError();
      }
    } catch (err) {
      console.error("[THREAD CMD ERROR]", err);
      return message.reply(getLang("error", err.message));
    }
  }
};
