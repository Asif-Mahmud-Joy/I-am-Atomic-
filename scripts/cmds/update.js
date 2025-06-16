const axios = require("axios");
const fs = require("fs-extra");
const execSync = require("child_process").execSync;
const dirBootLogTemp = `${__dirname}/tmp/rebootUpdated.txt`;

module.exports = {
  config: {
    name: "update",
    version: "2.0",
    author: "Mr.Smokey[Asif Mahmud]",
    role: 2,
    description: {
      en: "Check and install bot updates.",
      bn: "বট আপডেট চেক এবং ইনস্টল করুন।"
    },
    category: "owner",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  langs: {
    en: {
      noUpdates: "✅ | You are already using the latest version (v%1).",
      updatePrompt: "💫 | New update available (v%2). You are on (v%1).\n⬆️ | Files to update:\n%3%4\n\nℹ️ | Details: https://github.com/ntkhang03/Goat-Bot-V2/commits/main\n💡 | React to this message to confirm update.",
      fileWillDelete: "\n🗑️ | These files/folders will be deleted:\n%1",
      andMore: "...and %1 more files",
      updateConfirmed: "🚀 | Update confirmed, processing...",
      updateComplete: "✅ | Update done. Reply 'yes' or 'y' to restart the bot now.",
      updateTooFast: "⭕ | Last update was just %1m %2s ago. Try again in %3m %4s.",
      botWillRestart: "🔄 | Bot is restarting..."
    },
    bn: {
      noUpdates: "✅ | আপনি ইতিমধ্যে সর্বশেষ সংস্করণ (v%1) ব্যবহার করছেন।",
      updatePrompt: "💫 | নতুন আপডেট এসেছে (v%2)। আপনি এখন আছেন (v%1)।\n⬆️ | আপডেট হবে এই ফাইলগুলো:\n%3%4\n\nℹ️ | বিস্তারিত: https://github.com/ntkhang03/Goat-Bot-V2/commits/main\n💡 | নিশ্চিত করতে এই মেসেজে রিয়্যাক্ট দিন।",
      fileWillDelete: "\n🗑️ | এই ফাইল/ফোল্ডারগুলো ডিলিট হবে:\n%1",
      andMore: "...এবং আরও %1টি ফাইল",
      updateConfirmed: "🚀 | আপডেট নিশ্চিত হয়েছে, প্রক্রিয়া চলছে...",
      updateComplete: "✅ | আপডেট সম্পন্ন। বট এখনই রিস্টার্ট করতে চাইলে 'yes' বা 'y' রিপ্লাই দিন।",
      updateTooFast: "⭕ | শেষ আপডেট %1 মিনিট %2 সেকেন্ড আগে হয়েছে। %3 মিনিট %4 সেকেন্ড পর আবার চেষ্টা করুন।",
      botWillRestart: "🔄 | বট রিস্টার্ট হচ্ছে..."
    }
  },

  onLoad: async function ({ api }) {
    if (fs.existsSync(dirBootLogTemp)) {
      const threadID = fs.readFileSync(dirBootLogTemp, "utf-8");
      fs.removeSync(dirBootLogTemp);
      api.sendMessage("✅ | বট সফলভাবে রিস্টার্ট হয়েছে।", threadID);
    }
  },

  onStart: async function ({ message, getLang, event, commandName }) {
    const lang = getLang();
    const { data: { version } } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
    const { data: versions } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/versions.json");

    const currentVersion = require("../../package.json").version;
    if (compareVersion(version, currentVersion) < 1)
      return message.reply(lang("noUpdates", currentVersion));

    const newVersions = versions.slice(versions.findIndex(v => v.version == currentVersion) + 1);
    let fileWillUpdate = [...new Set(newVersions.map(v => Object.keys(v.files || {})).flat())].sort().filter(f => f?.length);
    const totalUpdate = fileWillUpdate.length;
    fileWillUpdate = fileWillUpdate.slice(0, 10).map(file => ` - ${file}`).join("\n");

    let fileWillDelete = [...new Set(newVersions.map(v => Object.keys(v.deleteFiles || {}).flat()))].sort().filter(f => f?.length);
    const totalDelete = fileWillDelete.length;
    fileWillDelete = fileWillDelete.slice(0, 10).map(file => ` - ${file}`).join("\n");

    message.reply(
      lang(
        "updatePrompt",
        currentVersion,
        version,
        fileWillUpdate + (totalUpdate > 10 ? `\n${lang("andMore", totalUpdate - 10)}` : ""),
        totalDelete > 0 ? `\n${lang("fileWillDelete", fileWillDelete + (totalDelete > 10 ? `\n${lang("andMore", totalDelete - 10)}` : ""))}` : ""
      ), (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReaction.set(info.messageID, {
          messageID: info.messageID,
          threadID: info.threadID,
          authorID: event.senderID,
          commandName
        });
      });
  },

  onReaction: async function ({ message, getLang, Reaction, event, commandName }) {
    if (event.userID != Reaction.authorID) return;

    const { data: lastCommit } = await axios.get('https://api.github.com/repos/ntkhang03/Goat-Bot-V2/commits/main');
    const lastCommitDate = new Date(lastCommit.commit.committer.date);
    const now = new Date();
    const diff = now - lastCommitDate;

    if (diff < 5 * 60 * 1000) {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const minutesCooldown = Math.floor((5 * 60 * 1000 - diff) / 60000);
      const secondsCooldown = Math.floor(((5 * 60 * 1000 - diff) % 60000) / 1000);
      return message.reply(getLang("updateTooFast", minutes, seconds, minutesCooldown, secondsCooldown));
    }

    await message.reply(getLang("updateConfirmed"));
    execSync("node update", { stdio: "inherit" });
    fs.writeFileSync(dirBootLogTemp, event.threadID);

    message.reply(getLang("updateComplete"), (err, info) => {
      if (err) return console.error(err);
      global.GoatBot.onReply.set(info.messageID, {
        messageID: info.messageID,
        threadID: info.threadID,
        authorID: event.senderID,
        commandName
      });
    });
  },

  onReply: async function ({ message, getLang, event }) {
    if (["yes", "y"].includes(event.body?.toLowerCase())) {
      await message.reply(getLang("botWillRestart"));
      process.exit(2);
    }
  }
};

function compareVersion(v1, v2) {
  const a = v1.split(".").map(n => +n);
  const b = v2.split(".").map(n => +n);
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }
  return 0;
}
