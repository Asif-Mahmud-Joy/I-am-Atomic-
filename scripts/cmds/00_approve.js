const fs = require("fs-extra");
const path = require("path");

// 🔒 Enhanced File Lock with atomic operations
class AtomicLock {
  constructor() {
    this.locked = false;
    this.queue = [];
    this.operationId = 0;
  }
  
  async acquire() {
    const opId = ++this.operationId;
    if (this.locked) {
      await new Promise(resolve => {
        this.queue.push({resolve, opId});
      });
    }
    this.locked = opId;
  }
  
  release() {
    this.locked = false;
    if (this.queue.length > 0) {
      const {resolve} = this.queue.shift();
      resolve();
    }
  }
}

const atomicLock = new AtomicLock();

// ✨ Enhanced logging with atomic design
function getLogFilePath() {
  const logDir = path.join(__dirname, "logs");
  fs.ensureDirSync(logDir);
  const today = new Date().toISOString().slice(0, 10);
  return path.join(logDir, `approval-${today}.log`);
}

async function logAtomicAction(action, id, user) {
  const logFile = getLogFilePath();
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ⚡ ${action} by 👤 ${user} → ID: ${id}\n`;
  await fs.appendFile(logFile, entry);
}

module.exports = {
  config: {
    name: "approveThreads",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    role: 0,
    category: "owner",
    shortDescription: {
      en: "⚙️ Thread management system with atomic operations"
    },
  },

  onLoad: async function() {
    try {
      const dirPath = path.join(__dirname, "cache");
      const paths = [
        path.join(dirPath, "approvedThreads.json"),
        path.join(dirPath, "pendingThreads.json")
      ];

      await Promise.all(paths.map(async p => {
        await fs.ensureFile(p);
        const content = await fs.readFile(p, "utf8");
        if (!content.trim()) await fs.writeFile(p, "[]");
      }));
    } catch (e) {
      console.error("🔴 Initialization Error:", e);
    }
  },

  onStart: async function({ event, api, args, senderID }) {
    const { threadID, messageID } = event;
    const [approvedPath, pendingPath] = [
      path.join(__dirname, "cache", "approvedThreads.json"),
      path.join(__dirname, "cache", "pendingThreads.json")
    ];

    try {
      // 🔐 Permission verification
      if (this.config.role === 0 && senderID !== api.getCurrentUserID()) {
        return api.sendMessage(
          "⛔ অ্যাকসেস ডিনাইড! আপনার এই কমান্ড এক্সিকিউট করার অনুমতি নেই।",
          threadID,
          messageID
        );
      }

      await api.sendTyping(threadID);
      await atomicLock.acquire();

      // 📂 Atomic data loading
      const [approved, pending] = await Promise.all([
        fs.readJson(approvedPath),
        fs.readJson(pendingPath)
      ]);

      // 🧩 Command parsing
      const command = args[0]?.toLowerCase() || "";
      const page = parseInt(args.find(arg => !isNaN(arg))) || 1;
      const targetID = args.find(arg => /^\d+$/.test(arg)) || threadID;

      // 🔄 Utility functions
      const paginate = (arr, size, pg) => 
        arr.slice((pg - 1) * size, pg * size);
      
      const searchFilter = (arr, term) => 
        term ? arr.filter(id => id.includes(term)) : arr;

      // ✨ ATOMIC DESIGN: Enhanced help system
      const atomicHelp = () => {
        const border = "═".repeat(28);
        return [
          `╔${border}╗`,
          "║ 🌟 অ্যাপ্রুভ থ্রেড কমান্ড সিস্টেম ║",
          `╚${border}╝`,
          "",
          "📜 list [সার্চ] [পেজ] - অনুমোদিত লিস্ট (পেজ ১০ আইটেম)",
          "⏳ pending [সার্চ] [পেজ] - পেন্ডিং রিকুয়েস্ট",
          "🗑️ del <আইডি> - অনুমোদন প্রত্যাহার",
          "✅ <আইডি> - নতুন থ্রেড অনুমোদন",
          "",
          `📌 উদাহরণ: ${this.config.name} pending গ্রুপ 2`,
          `💡 টিপ: আইডি অবশ্যই সংখ্যায় হতে হবে`
        ].join("\n");
      };

      // Handle list command
      if (command === "list") {
        const searchTerm = args[1] && isNaN(args[1]) ? args[1] : "";
        const filtered = searchFilter(approved, searchTerm);
        
        if (!filtered.length) {
          atomicLock.release();
          return api.sendMessage(
            searchTerm ? 
            `🔍 "${searchTerm}" এর জন্য কোনো ফলাফল নেই!` : 
            "📭 অনুমোদিত থ্রেডের তালিকা খালি",
            threadID,
            messageID
          );
        }

        const paged = paginate(filtered, 10, page);
        if (!paged.length) {
          atomicLock.release();
          return api.sendMessage(
            `📭 পেজ ${page} এ কোনো ডাটা নেই!`,
            threadID,
            messageID
          );
        }

        const list = paged.map((id, i) => 
          `▸ ${(page-1)*10 + i+1}. ${id}`).join("\n");
        
        atomicLock.release();
        return api.sendMessage(
          `📜 অনুমোদিত থ্রেড (পেজ ${page}):\n${list}\n\n🔢 মোট: ${filtered.length} আইটেম`,
          threadID,
          messageID
        );
      }

      // Handle pending command
      if (command === "pending") {
        const searchTerm = args[1] && isNaN(args[1]) ? args[1] : "";
        const filtered = searchFilter(pending, searchTerm);
        
        if (!filtered.length) {
          atomicLock.release();
          return api.sendMessage(
            "✅ সকল পেন্ডিং রিকুয়েস্ট ক্লিয়ার!",
            threadID,
            messageID
          );
        }

        const paged = paginate(filtered, 5, page);
        if (!paged.length) {
          atomicLock.release();
          return api.sendMessage(
            `📭 পেজ ${page} এ কোনো পেন্ডিং রিকুয়েস্ট নেই!`,
            threadID,
            messageID
          );
        }

        let output = `⏳ পেন্ডিং রিকুয়েস্ট (পেজ ${page}):\n\n`;
        for (const id of paged) {
          try {
            const { name } = await api.getThreadInfo(id);
            output += `🔹 ${name || 'নামবিহীন গ্রুপ'}\n   🔢 আইডি: ${id}\n\n`;
          } catch {
            output += `🔹 অজানা গ্রুপ\n   🔢 আইডি: ${id}\n\n`;
          }
        }
        
        atomicLock.release();
        return api.sendMessage(
          `${output}📊 মোট পেন্ডিং: ${filtered.length} আইটেম`,
          threadID,
          messageID
        );
      }

      // Handle delete command
      if (command === "del") {
        if (!approved.includes(targetID)) {
          atomicLock.release();
          return api.sendMessage(
            `❌ ${targetID} আইডিটি অনুমোদিত তালিকায় নেই!`,
            threadID,
            messageID
          );
        }

        const newApproved = approved.filter(id => id !== targetID);
        const newPending = [...pending, targetID];
        
        await Promise.all([
          fs.writeJson(approvedPath, newApproved, { spaces: 2 }),
          fs.writeJson(pendingPath, newPending, { spaces: 2 })
        ]);
        
        await logAtomicAction("REMOVED_APPROVAL", targetID, senderID);
        atomicLock.release();
        
        return api.sendMessage(
          `🗑️ সফলভাবে অপসারণ করা হয়েছে!\n🔢 আইডি: ${targetID}`,
          threadID,
          messageID
        );
      }

      // Handle approval
      if (/^(approve|\d+)$/.test(command)) {
        if (approved.includes(targetID)) {
          atomicLock.release();
          return api.sendMessage(
            `✅ ${targetID} ইতিমধ্যেই অনুমোদিত!`,
            threadID,
            messageID
          );
        }

        await api.sendTyping(targetID);
        api.sendMessage(
          "🎉 আপনার গ্রুপ অনুমোদিত হয়েছে!\n\nএখন থেকে আপনি বটের সকল ফিচার ব্যবহার করতে পারবেন।",
          targetID,
          async (err) => {
            if (err) {
              atomicLock.release();
              return api.sendMessage(
                `❌ ${targetID} তে মেসেজ পাঠানো যায়নি!\n\nকারণ: ${err.errorDescription}`,
                threadID,
                messageID
              );
            }

            const newApproved = [...approved, targetID];
            const newPending = pending.filter(id => id !== targetID);
            
            await Promise.all([
              fs.writeJson(approvedPath, newApproved, { spaces: 2 }),
              fs.writeJson(pendingPath, newPending, { spaces: 2 })
            ]);
            
            await logAtomicAction("THREAD_APPROVED", targetID, senderID);
            atomicLock.release();
            
            api.sendMessage(
              `✨ সফলভাবে অনুমোদন দেওয়া হলো!\n\n🔢 আইডি: ${targetID}`,
              threadID,
              messageID
            );
          }
        );
        return;
      }

      // Default help response
      atomicLock.release();
      return api.sendMessage(atomicHelp(), threadID, messageID);
      
    } catch (error) {
      if (atomicLock.locked) atomicLock.release();
      console.error("🔴 Command Error:", error);
      
      const errorMsg = [
        "⚠️ সিস্টেমে সমস্যা!",
        "",
        `🔧 বিস্তারিত: ${error.message}`,
        "🔄 অনুগ্রহ করে আবার চেষ্টা করুন"
      ].join("\n");
      
      api.sendMessage(errorMsg, threadID, messageID);
    }
  }
};
