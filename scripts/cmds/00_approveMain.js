const fs = require('fs-extra');
const path = require('path');
const lockfile = require('proper-lockfile');

const LOG_PATH = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_PATH, 'nsfw.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB

async function rotateLogIfNeeded() {
  try {
    await fs.ensureDir(LOG_PATH);
    const stats = await fs.stat(LOG_FILE).catch(() => null);
    if (stats && stats.size >= MAX_LOG_SIZE) {
      const oldLog = path.join(LOG_PATH, `nsfw_${Date.now()}.log`);
      await fs.rename(LOG_FILE, oldLog);
    }
  } catch (err) {
    console.error('🛑 লগ রোটেশন এরর:', err);
  }
}

async function logMessage(text) {
  try {
    await rotateLogIfNeeded();
    await fs.appendFile(LOG_FILE, `[${new Date().toISOString()}] ${text}\n`);
  } catch (err) {
    console.error('🛑 লগিং এরর:', err);
  }
}

function isValidID(id) {
  return typeof id === 'string' && /^\d{5,15}$/.test(id);
}

async function safeWriteJSON(filePath, data) {
  try {
    const release = await lockfile.lock(filePath);
    await fs.writeJson(filePath, data, { spaces: 2 });
    await release();
  } catch (err) {
    console.error('🛑 ফাইল লকিং এরর:', err);
  }
}

module.exports = {
  config: {
    name: "nsfwmanage",
    version: "2.2",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    category: "🔞 NSFW",
    role: 2,
    shortDescription: {
      en: "🔐 Secure NSFW Access Management"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const assistPath = path.join(__dirname, 'assist_json');
    const approvedIDsPath = path.join(assistPath, 'approved_ids.json');
    const pendingIDsPath = path.join(assistPath, 'pending_ids.json');

    // ✅ রোল চেক: শুধুমাত্র role 2+ ইউজাররা ব্যবহার করতে পারবে
    if (event.author && event.author.role < 2 && senderID !== threadID) {
      return message.reply("⚠️ আপনার পর্যাপ্ত অনুমতি নেই এই কমান্ড ব্যবহার করার জন্য।");
    }

    await fs.ensureDir(assistPath);
    if (!await fs.pathExists(approvedIDsPath)) await fs.writeJson(approvedIDsPath, []);
    if (!await fs.pathExists(pendingIDsPath)) await fs.writeJson(pendingIDsPath, []);

    let approvedIDs = [], pendingIDs = [];
    try {
      approvedIDs = await fs.readJson(approvedIDsPath);
      pendingIDs = await fs.readJson(pendingIDsPath);
    } catch {
      return message.reply("❌ ডেটা ফাইল লোড করতে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।");
    }

    const subCommand = args[0];
    const idArg = args[1];
    const textArg = args.slice(2).join(" ") || "কোনো বার্তা নেই।";

    // 🛑 ইনপুট ভ্যালিডেশন: ID ফরম্যাট চেক
    if (idArg && !isValidID(idArg)) {
      return message.reply("⚠️ ❗ অনুগ্রহ করে সঠিক ফরম্যাটে ID দিন (৫-১৫ সংখ্যার মধ্যে)।");
    }

    // ⏳ টাইপিং অ্যানিমেশন চালু
    api.sendTyping(threadID);

    try {
      switch (subCommand) {
        case "approved": {
          if (!idArg) return message.reply("❗ অনুমোদনের জন্য ID দিন:\n\nUsage: nsfw approved <ID> [মেসেজ]");
          if (approvedIDs.includes(idArg)) return message.reply("⛔ এই থ্রেডটি আগেই অনুমোদিত।");

          approvedIDs.push(idArg);
          await safeWriteJSON(approvedIDsPath, approvedIDs);

          // পেন্ডিং থেকে ID মুছে ফেলুন
          const idx = pendingIDs.indexOf(idArg);
          if (idx !== -1) {
            pendingIDs.splice(idx, 1);
            await safeWriteJSON(pendingIDsPath, pendingIDs);
          }

          await api.sendMessage(`✅ আপনার অনুরোধ অনুমোদিত হয়েছে!\n\n🔞 NSFW কমান্ডগুলি এখন থেকে ব্যবহার করতে পারবেন।\n\n📩 মেসেজ: ${textArg}`, idArg);
          await logMessage(`✅ Approved ID: ${idArg} by ${senderID} | Message: ${textArg}`);
          return message.reply(`✅ সফলভাবে ${idArg} অনুমোদিত হয়েছে।`);
        }

        case "remove": {
          if (!idArg) return message.reply("❗ অপসারণের জন্য ID দিন:\n\nUsage: nsfw remove <ID> [কারণ]");
          if (!approvedIDs.includes(idArg)) return message.reply("❌ এই থ্রেডটি অনুমোদিত নয়।");

          approvedIDs = approvedIDs.filter(id => id !== idArg);
          await safeWriteJSON(approvedIDsPath, approvedIDs);

          await api.sendMessage(`⚠️ আপনার NSFW অ্যাক্সেস বাতিল করা হয়েছে।\n\nকারণ: ${textArg}`, idArg);
          await logMessage(`❌ Removed NSFW Access from ID: ${idArg} by ${senderID} | Reason: ${textArg}`);
          return message.reply(`❌ সফলভাবে ${idArg} থেকে NSFW অ্যাক্সেস অপসারণ করা হয়েছে।`);
        }

        case "disapproved": {
          if (!idArg) return message.reply("❗ প্রত্যাখ্যানের জন্য ID দিন:\n\nUsage: nsfw disapproved <ID> [কারণ]");
          if (!pendingIDs.includes(idArg)) return message.reply("⚠️ এই ID পেন্ডিং তালিকায় নেই।");

          pendingIDs = pendingIDs.filter(id => id !== idArg);
          await safeWriteJSON(pendingIDsPath, pendingIDs);

          await api.sendMessage(`❌ আপনার NSFW অনুরোধ প্রত্যাখ্যাত হয়েছে।\n\nকারণ: ${textArg}`, idArg);
          await logMessage(`❌ Disapproved NSFW request from ID: ${idArg} by ${senderID} | Reason: ${textArg}`);
          return message.reply("✅ NSFW অনুরোধ সফলভাবে প্রত্যাখ্যাত হয়েছে।");
        }

        case "check": {
          return message.reply(
            approvedIDs.includes(threadID)
              ? "✅ এই থ্রেডে NSFW চালু আছে। 🔞"
              : "❌ এই থ্রেডে NSFW চালু নেই। 🚫"
          );
        }

        case "list-approved": {
          if (approvedIDs.length === 0) return message.reply("❌ কোন অনুমোদিত থ্রেড নেই।");

          let replyMsg = "✅ অনুমোদিত থ্রেডসমূহ:\n\n";
          approvedIDs.forEach((id, i) => {
            replyMsg += `🔹 ${i + 1}. ID: ${id}\n`;
          });
          return message.reply(replyMsg);
        }

        case "list-pending": {
          if (pendingIDs.length === 0) return message.reply("❌ কোন পেন্ডিং থ্রেড নেই।");

          let replyMsg = "⏳ পেন্ডিং থ্রেডসমূহ:\n\n";
          pendingIDs.forEach((id, i) => {
            replyMsg += `🔸 ${i + 1}. ID: ${id}\n`;
          });
          return message.reply(replyMsg);
        }

        default:
          return message.reply(
            `⚠️ অবৈধ কমান্ড! সঠিক কমান্ডগুলো:\n\n` +
            `🔹 nsfw approved <ID> [মেসেজ]\n` +
            `🔹 nsfw remove <ID> [কারণ]\n` +
            `🔹 nsfw disapproved <ID> [কারণ]\n` +
            `🔹 nsfw check\n` +
            `🔹 nsfw list-approved\n` +
            `🔹 nsfw list-pending`
          );
      }
    } catch (error) {
      console.error("🛑 অনাকাঙ্ক্ষিত ত্রুটি:", error);
      return message.reply("❌ অপ্রত্যাশিত ত্রুটি ঘটেছে, দয়া করে পরে আবার চেষ্টা করুন।");
    }
  }
};
