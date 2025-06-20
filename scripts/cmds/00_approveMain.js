const fs = require('fs-extra');
const path = require('path');
const lockfile = require('proper-lockfile');

// 🔐 Atomic Constants
const LOG_PATH = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_PATH, 'nsfw_atomic.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const DATA_DIR = path.join(__dirname, 'assist_json');
const APPROVED_PATH = path.join(DATA_DIR, 'approved_ids.json');
const PENDING_PATH = path.join(DATA_DIR, 'pending_ids.json');

// ⚛️ Atomic Logger
class AtomicLogger {
  static async rotate() {
    try {
      await fs.ensureDir(LOG_PATH);
      if (await fs.pathExists(LOG_FILE)) {
        const { size } = await fs.stat(LOG_FILE);
        if (size >= MAX_LOG_SIZE) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          await fs.rename(LOG_FILE, path.join(LOG_PATH, `nsfw-${timestamp}.log`));
        }
      }
    } catch (err) {
      console.error('🛑 [ATOMIC LOG ROTATION FAILURE]', err);
    }
  }

  static async log(action, id, user, text = '') {
    try {
      await this.rotate();
      const entry = `[${new Date().toISOString()}] ⚛️ ${action} » 👤 ${user} » 💬 ${text} » 🆔 ${id}\n`;
      await fs.appendFile(LOG_FILE, entry);
    } catch (err) {
      console.error('🛑 [ATOMIC LOGGER FAILURE]', err);
    }
  }
}

// 🔒 Atomic Operations
class NSFWManager {
  static isValidID(id) {
    return /^\d{5,15}$/.test(id);
  }

  static async atomicOperation(filePath, operation) {
    try {
      const release = await lockfile.lock(filePath, { retries: 3 });
      const data = await fs.readJson(filePath).catch(() => []);
      const result = await operation(data);
      await fs.writeJson(filePath, result, { spaces: 2 });
      await release();
      return result;
    } catch (err) {
      console.error('🔒 [ATOMIC OPERATION FAILURE]', err);
      throw new Error('Database operation failed');
    }
  }
}

// ✨ UI Components
const AtomicUI = {
  header: "╔════════════════════════╗\n║   🔞 NSFW ATOMIC SYSTEM   ║\n╚════════════════════════╝",
  divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
  
  commandList: [
    "⚙️  Command Syntax:",
    `${" ".repeat(4)}🔹 nsfw approved <ID> [মেসেজ]`,
    `${" ".repeat(4)}🔹 nsfw remove <ID> [কারণ]`,
    `${" ".repeat(4)}🔹 nsfw disapproved <ID> [কারণ]`,
    `${" ".repeat(4)}🔹 nsfw check`,
    `${" ".repeat(4)}🔹 nsfw list-approved`,
    `${" ".repeat(4)}🔹 nsfw list-pending`
  ].join("\n"),
  
  formatList(items, title, emoji) {
    let output = `${title}\n${this.divider}\n`;
    items.forEach((id, i) => {
      output += `\n${emoji} ${i + 1}. 🆔 ${id}`;
    });
    return `${output}\n\n🔢 মোট: ${items.length} আইটেম`;
  }
};

module.exports = {
  config: {
    name: "nsfwmanage",
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    category: "🔞 NSFW",
    role: 2,
    shortDescription: {
      en: "☢️ Atomic NSFW Access Control"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const { threadID, senderID } = event;
    
    // 🔐 Authorization Check
    if (event.author?.role < 2) {
      return message.reply("⛔ অ্যাক্সেস ডিনাইড! আপনার পর্যাপ্ত অনুমতি নেই।");
    }

    // ⏳ Typing Indicator
    api.sendTyping(threadID);

    try {
      // 🗂️ Initialize Data Directories
      await fs.ensureDir(DATA_DIR);
      if (!await fs.pathExists(APPROVED_PATH)) await fs.writeJson(APPROVED_PATH, []);
      if (!await fs.pathExists(PENDING_PATH)) await fs.writeJson(PENDING_PATH, []);

      // 📦 Load Atomic Data
      const [approvedIDs, pendingIDs] = await Promise.all([
        fs.readJson(APPROVED_PATH).catch(() => []),
        fs.readJson(PENDING_PATH).catch(() => [])
      ]);

      const [subCommand, idArg] = args;
      const textArg = args.slice(2).join(" ") || "কোনো বার্তা নেই।";

      // 🛡️ Input Validation
      if (idArg && !NSFWManager.isValidID(idArg)) {
        return message.reply("⚠️ অবৈধ আইডি ফরম্যাট! ৫-১৫ সংখ্যার মধ্যে দিন।");
      }

      // ⚛️ Command Processing
      switch (subCommand) {
        case "approved": {
          if (!idArg) return message.reply("❗ আইডি প্রয়োজন:\n\nUsage: nsfw approved <ID> [মেসেজ]");
          if (approvedIDs.includes(idArg)) {
            return message.reply("ℹ️ এই আইডি ইতিমধ্যেই অনুমোদিত!");
          }

          await NSFWManager.atomicOperation(APPROVED_PATH, data => [...data, idArg]);
          await NSFWManager.atomicOperation(PENDING_PATH, data => data.filter(id => id !== idArg));

          await api.sendMessage(
            `🎉 আপনার NSFW অনুরোধ অনুমোদিত হয়েছে!\n\n` +
            `🔞 এখন থেকে সমস্ত NSFW কমান্ড ব্যবহার করতে পারবেন।\n\n` +
            `📩 মেসেজ: ${textArg}`,
            idArg
          );
          
          await AtomicLogger.log("APPROVED", idArg, senderID, textArg);
          return message.reply(`✅ ${idArg} সফলভাবে অনুমোদিত হয়েছে!`);
        }

        case "remove": {
          if (!idArg) return message.reply("❗ আইডি প্রয়োজন:\n\nUsage: nsfw remove <ID> [কারণ]");
          if (!approvedIDs.includes(idArg)) {
            return message.reply("❌ এই আইডি অনুমোদিত নয়!");
          }

          await NSFWManager.atomicOperation(APPROVED_PATH, data => data.filter(id => id !== idArg));

          await api.sendMessage(
            `⚠️ আপনার NSFW অ্যাক্সেস বাতিল করা হয়েছে!\n\n` +
            `🔒 কারণ: ${textArg}\n\n` +
            `আপনার আবার অনুমোদন প্রয়োজন হলে নতুন করে আবেদন করুন।`,
            idArg
          );
          
          await AtomicLogger.log("REMOVED", idArg, senderID, textArg);
          return message.reply(`🗑️ ${idArg} থেকে অ্যাক্সেস সফলভাবে অপসারণ করা হয়েছে!`);
        }

        case "disapproved": {
          if (!idArg) return message.reply("❗ আইডি প্রয়োজন:\n\nUsage: nsfw disapproved <ID> [কারণ]");
          if (!pendingIDs.includes(idArg)) {
            return message.reply("ℹ️ এই আইডি পেন্ডিং তালিকায় নেই!");
          }

          await NSFWManager.atomicOperation(PENDING_PATH, data => data.filter(id => id !== idArg));

          await api.sendMessage(
            `❌ আপনার NSFW অনুরোধ প্রত্যাখ্যান করা হয়েছে!\n\n` +
            `📝 কারণ: ${textArg}\n\n` +
            `আপনি চাইলে সংশোধন করে পুনরায় আবেদন করতে পারেন।`,
            idArg
          );
          
          await AtomicLogger.log("DISAPPROVED", idArg, senderID, textArg);
          return message.reply("⛔ অনুরোধ সফলভাবে প্রত্যাখ্যান করা হয়েছে!");
        }

        case "check": {
          const status = approvedIDs.includes(threadID) ? 
            "✅ এই থ্রেডে NSFW চালু আছে! 🔞" : 
            "❌ এই থ্রেডে NSFW চালু নেই! 🔒";
          return message.reply(status);
        }

        case "list-approved": {
          if (approvedIDs.length === 0) {
            return message.reply("📭 কোন অনুমোদিত আইডি নেই!");
          }
          return message.reply(
            AtomicUI.formatList(approvedIDs, "📜 অনুমোদিত আইডি তালিকা:", "🟢")
          );
        }

        case "list-pending": {
          if (pendingIDs.length === 0) {
            return message.reply("📭 কোন পেন্ডিং আইডি নেই!");
          }
          return message.reply(
            AtomicUI.formatList(pendingIDs, "⏳ পেন্ডিং অনুরোধ তালিকা:", "🟡")
          );
        }

        default: {
          return message.reply(
            `${AtomicUI.header}\n\n` +
            `${AtomicUI.commandList}\n\n` +
            `${AtomicUI.divider}\n` +
            `⚡ Version: ${this.config.version} | ⏱️ Countdown: ${this.config.countDown}s`
          );
        }
      }
    } catch (error) {
      console.error("☢️ [ATOMIC SYSTEM FAILURE]", error);
      await AtomicLogger.log("ERROR", threadID, senderID, error.message);
      return message.reply(
        "⚠️ সিস্টেমে অপ্রত্যাশিত ত্রুটি!\n" +
        "🔧 বিস্তারিত লগে রেকর্ড করা হয়েছে।\n" +
        "দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।"
      );
    }
  }
};
