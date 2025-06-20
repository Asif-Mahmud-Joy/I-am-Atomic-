const fs = require("fs");
const path = require("path");

// 🔐 Atomic Constants
const ATOMIC_DIR = path.join(__dirname, "assist_json");
const APPROVED_PATH = path.join(ATOMIC_DIR, "approved_ids.json");
const PENDING_PATH = path.join(ATOMIC_DIR, "pending_ids.json");
const LOG_PATH = path.join(ATOMIC_DIR, "nsfw_atomic.log");
const MAX_LOG_SIZE = 2 * 1024 * 1024; // 2MB

// ⚛️ Atomic Logger
class AtomicLogger {
  static rotate() {
    try {
      if (fs.existsSync(LOG_PATH)) {
        const stats = fs.statSync(LOG_PATH);
        if (stats.size > MAX_LOG_SIZE) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          fs.renameSync(LOG_PATH, path.join(ATOMIC_DIR, `nsfw_log_${timestamp}.txt`));
        }
      }
    } catch (err) {
      console.error("☢️ [ATOMIC LOG ROTATION ERROR]", err);
    }
  }

  static log(action, id, user, text = "") {
    try {
      this.rotate();
      const entry = `[${new Date().toISOString()}] ⚛️ ${action} » 👤 ${user} » 💬 ${text} » 🆔 ${id}\n`;
      fs.appendFileSync(LOG_PATH, entry);
    } catch (err) {
      console.error("☢️ [ATOMIC LOGGER ERROR]", err);
    }
  }
}

// 🔒 Atomic File Operations
class AtomicData {
  static init() {
    if (!fs.existsSync(ATOMIC_DIR)) fs.mkdirSync(ATOMIC_DIR);
    if (!fs.existsSync(APPROVED_PATH)) fs.writeFileSync(APPROVED_PATH, "[]");
    if (!fs.existsSync(PENDING_PATH)) fs.writeFileSync(PENDING_PATH, "[]");
    if (!fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, "");
  }

  static readJSON(file) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8") || "[]");
    } catch {
      return [];
    }
  }

  static writeJSON(file, data) {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      AtomicLogger.log("FILE_ERROR", "", "", err.message);
    }
  }
}

// ✨ UI Components
const AtomicUI = {
  header: "╔══════════════════════════════╗\n║   🔞 ATOMIC NSFW MANAGEMENT   ║\n╚══════════════════════════════╝",
  divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
  
  commandGuide: [
    "⚙️  Command Usage:",
    "  🔹 nsfw_manage approved <ID> [মেসেজ]  » থ্রেড অনুমোদন",
    "  🔹 nsfw_manage remove <ID> [কারণ]    » অনুমতি প্রত্যাহার",
    "  🔹 nsfw_manage disapproved <ID> [কারণ] » অনুরোধ প্রত্যাখ্যান",
    "  🔹 nsfw_manage check                » বর্তমান স্ট্যাটাস"
  ].join("\n"),
  
  formatReply(title, content, emoji = "⚛️") {
    return `${this.header}\n${this.divider}\n\n${emoji} ${title}\n${content}\n\n${this.divider}`;
  }
};

module.exports = {
  config: {
    name: "nsfw_manage",
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    category: "🔞 NSFW",
    role: 2,
    shortDescription: {
      en: "☢️ Atomic NSFW Access Control"
    },
    guide: {
      en: `
        ${AtomicUI.header}
        ${AtomicUI.commandGuide}
        ${AtomicUI.divider}
      `
    }
  },

  onStart: async function ({ api, args, message, event, Users }) {
    // ⏳ Typing Animation
    api.sendTyping(event.threadID);

    // 🔐 Authorization Check
    let senderRole = 0;
    try {
      senderRole = await Users.getRoleFromID(event.senderID);
    } catch {
      senderRole = 0;
    }
    
    if (senderRole < this.config.role) {
      return message.reply(
        AtomicUI.formatReply(
          "⛔ ACCESS DENIED", 
          "আপনার এই কমান্ড চালানোর অনুমতি নেই!",
          "🔒"
        )
      );
    }

    // Initialize Atomic System
    AtomicData.init();
    const approvedIDs = AtomicData.readJSON(APPROVED_PATH);
    const pendingIDs = AtomicData.readJSON(PENDING_PATH);

    // 🛡️ Input Validation
    function validateThreadID(id) {
      return /^\d{16,}$/.test(id);
    }

    const cmd = args[0]?.toLowerCase();
    const idArg = args[1];
    const textArg = args.slice(2).join(" ") || "কোনো বার্তা নেই";

    if (!cmd) {
      return message.reply(
        AtomicUI.formatReply(
          "⚠️ INVALID COMMAND", 
          this.guide.en,
          "❓"
        )
      );
    }

    // ⚡ Command Processing
    try {
      switch (cmd) {
        case "approved": {
          if (!idArg) {
            return message.reply(
              AtomicUI.formatReply(
                "❗ MISSING ID", 
                "অনুমোদনের জন্য থ্রেড আইডি দিন:\n\nUsage: nsfw_manage approved <ID> [মেসেজ]",
                "⚠️"
              )
            );
          }

          if (!validateThreadID(idArg)) {
            return message.reply(
              AtomicUI.formatReply(
                "⚠️ INVALID ID FORMAT", 
                "থ্রেড আইডি ১৬+ সংখ্যার হতে হবে!",
                "❌"
              )
            );
          }

          if (approvedIDs.includes(idArg)) {
            return message.reply(
              AtomicUI.formatReply(
                "ℹ️ ALREADY APPROVED", 
                `থ্রেড আইডি ${idArg} ইতিমধ্যে অনুমোদিত!`,
                "✅"
              )
            );
          }

          // Atomic Operation
          approvedIDs.push(idArg);
          AtomicData.writeJSON(APPROVED_PATH, approvedIDs);

          // Remove from pending
          if (pendingIDs.includes(idArg)) {
            const newPending = pendingIDs.filter(e => e !== idArg);
            AtomicData.writeJSON(PENDING_PATH, newPending);
          }

          // Notify thread
          api.sendMessage(
            `🎉 আপনার থ্রেড NSFW এর জন্য অনুমোদিত হয়েছে!\n\n` +
            `🔞 এখন থেকে সমস্ত NSFW কমান্ড ব্যবহার করতে পারবেন।\n\n` +
            `📩 অ্যাডমিনের বার্তা: ${textArg}\n\n` +
            `${AtomicUI.divider}`,
            idArg
          );

          // Log action
          AtomicLogger.log("APPROVED", idArg, event.senderID, textArg);

          return message.reply(
            AtomicUI.formatReply(
              "✅ APPROVAL SUCCESS", 
              `থ্রেড আইডি ${idArg} সফলভাবে অনুমোদিত হয়েছে!`,
              "✨"
            )
          );
        }

        case "remove": {
          if (!idArg) {
            return message.reply(
              AtomicUI.formatReply(
                "❗ MISSING ID", 
                "অপসারণের জন্য থ্রেড আইডি দিন:\n\nUsage: nsfw_manage remove <ID> [কারণ]",
                "⚠️"
              )
            );
          }

          if (!validateThreadID(idArg)) {
            return message.reply(
              AtomicUI.formatReply(
                "⚠️ INVALID ID FORMAT", 
                "থ্রেড আইডি ১৬+ সংখ্যার হতে হবে!",
                "❌"
              )
            );
          }

          if (!approvedIDs.includes(idArg)) {
            return message.reply(
              AtomicUI.formatReply(
                "❌ NOT APPROVED", 
                `থ্রেড আইডি ${idArg} অনুমোদিত নয়!`,
                "🔍"
              )
            );
          }

          // Atomic Operation
          const newApproved = approvedIDs.filter(e => e !== idArg);
          AtomicData.writeJSON(APPROVED_PATH, newApproved);

          // Notify thread
          api.sendMessage(
            `⚠️ আপনার NSFW অনুমতি বাতিল করা হয়েছে!\n\n` +
            `🔒 কারণ: ${textArg}\n\n` +
            `আপনার আবার অনুমতি প্রয়োজন হলে নতুন করে অনুরোধ করুন।\n\n` +
            `${AtomicUI.divider}`,
            idArg
          );

          // Log action
          AtomicLogger.log("REMOVED", idArg, event.senderID, textArg);

          return message.reply(
            AtomicUI.formatReply(
              "🗑️ ACCESS REMOVED", 
              `থ্রেড আইডি ${idArg} থেকে NSFW অনুমতি সরানো হয়েছে!`,
              "✅"
            )
          );
        }

        case "disapproved": {
          if (!idArg) {
            return message.reply(
              AtomicUI.formatReply(
                "❗ MISSING ID", 
                "প্রত্যাখ্যানের জন্য থ্রেড আইডি দিন:\n\nUsage: nsfw_manage disapproved <ID> [কারণ]",
                "⚠️"
              )
            );
          }

          if (!validateThreadID(idArg)) {
            return message.reply(
              AtomicUI.formatReply(
                "⚠️ INVALID ID FORMAT", 
                "থ্রেড আইডি ১৬+ সংখ্যার হতে হবে!",
                "❌"
              )
            );
          }

          if (!pendingIDs.includes(idArg)) {
            return message.reply(
              AtomicUI.formatReply(
                "ℹ️ NOT PENDING", 
                `থ্রেড আইডি ${idArg} পেন্ডিং তালিকায় নেই!`,
                "🔍"
              )
            );
          }

          // Atomic Operation
          const newPending = pendingIDs.filter(e => e !== idArg);
          AtomicData.writeJSON(PENDING_PATH, newPending);

          // Notify thread
          api.sendMessage(
            `❌ আপনার NSFW অনুরোধ প্রত্যাখ্যান করা হয়েছে!\n\n` +
            `📝 কারণ: ${textArg}\n\n` +
            `আপনি চাইলে পুনরায় আবেদন করতে পারেন।\n\n` +
            `${AtomicUI.divider}`,
            idArg
          );

          // Log action
          AtomicLogger.log("DISAPPROVED", idArg, event.senderID, textArg);

          return message.reply(
            AtomicUI.formatReply(
              "⛔ REQUEST REJECTED", 
              `থ্রেড আইডি ${idArg} এর অনুরোধ প্রত্যাখ্যান করা হয়েছে!`,
              "✅"
            )
          );
        }

        case "check": {
          const status = approvedIDs.includes(event.threadID) ?
            "✅ এই থ্রেডে NSFW অনুমোদিত আছে!" :
            "❌ এই থ্রেডে NSFW অনুমোদিত নেই!";
          
          return message.reply(
            AtomicUI.formatReply(
              "📊 CURRENT STATUS", 
              status,
              approvedIDs.includes(event.threadID) ? "🔞" : "🔒"
            )
          );
        }

        default: {
          return message.reply(
            AtomicUI.formatReply(
              "⚠️ INVALID COMMAND", 
              this.guide.en,
              "❓"
            )
          );
        }
      }
    } catch (err) {
      AtomicLogger.log("COMMAND_ERROR", event.threadID, event.senderID, err.message);
      return message.reply(
        AtomicUI.formatReply(
          "☢️ SYSTEM ERROR", 
          "কমান্ড সম্পাদনে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।",
          "🛑"
        )
      );
    }
  }
};
