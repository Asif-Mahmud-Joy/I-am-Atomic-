const fs = require("fs-extra");
const path = require("path");

// Simple file lock to avoid race conditions
class FileLock {
  constructor() {
    this.locked = false;
    this.queue = [];
  }
  async acquire() {
    if (this.locked) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.locked = true;
  }
  release() {
    this.locked = false;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    }
  }
}
const fileLock = new FileLock();

function getLogFilePath() {
  const logDir = path.join(__dirname, "logs");
  fs.ensureDirSync(logDir);
  const today = new Date().toISOString().slice(0, 10);
  return path.join(logDir, `approval-${today}.log`);
}

async function logAction(text) {
  const logFile = getLogFilePath();
  const time = new Date().toISOString();
  await fs.appendFile(logFile, `[${time}] ${text}\n`);
}

module.exports = {
  config: {
    name: "approveThreads",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "owner",
    shortDescription: {
      en: "Manage approved & pending thread IDs with search, pagination & locking"
    },
  },

  onLoad: async function () {
    try {
      const dirPath = path.join(__dirname, "cache");
      const approvedPath = path.join(dirPath, "approvedThreads.json");
      const pendingPath = path.join(dirPath, "pendingThreads.json");

      await fs.ensureDir(dirPath);
      await fs.ensureFile(approvedPath);
      await fs.ensureFile(pendingPath);

      if ((await fs.readFile(approvedPath, "utf8")).trim() === "")
        await fs.writeFile(approvedPath, JSON.stringify([]));
      if ((await fs.readFile(pendingPath, "utf8")).trim() === "")
        await fs.writeFile(pendingPath, JSON.stringify([]));
    } catch (e) {
      console.error("❌ onLoad Error:", e);
    }
  },

  onStart: async function ({ event, api, args, senderID }) {
    const { threadID, messageID } = event;
    const approvedPath = path.join(__dirname, "cache", "approvedThreads.json");
    const pendingPath = path.join(__dirname, "cache", "pendingThreads.json");

    try {
      // Permission check
      if (this.config.role === 0 && senderID !== api.getCurrentUserID()) {
        return api.sendMessage("❌ দুঃখিত, আপনার অনুমতি নেই এই কমান্ড চালানোর জন্য।", threadID, messageID);
      }

      await api.sendTyping(threadID);

      await fileLock.acquire();

      let approved = await fs.readJson(approvedPath);
      let pending = await fs.readJson(pendingPath);

      const command = args[0] ? args[0].toLowerCase() : "";
      const pageArg = args.find(arg => !isNaN(parseInt(arg)));
      const page = pageArg ? parseInt(pageArg) : 1;
      const idBox = args.find(arg => /^\d+$/.test(arg)) || threadID;

      function paginate(array, size, pageNum) {
        return array.slice((pageNum - 1) * size, pageNum * size);
      }

      const helpMsg = `📜 *ApproveThreads কমান্ড ব্যবহার:*\n
- {pn} list [search] [page]: অনুমোদিত তালিকা দেখাও (প্রতি পেজ ১০)\n
- {pn} pending [search] [page]: পেন্ডিং তালিকা দেখাও (প্রতি পেজ ১০)\n
- {pn} del <ID>: অনুমোদিত তালিকা থেকে আইডি মুছে দাও\n
- {pn} <ID>: নির্দিষ্ট থ্রেড অনুমোদন করো\n\n
🌟 উদাহরণ: {pn} list group 2 (group নাম বা আইডি অনুসারে সার্চ + ২য় পেজ)\n
🌟 মনে রাখবে: ID অবশ্যই সংখ্যার মতো হতে হবে।`;

      if (command === "list") {
        let searchTerm = args[1] && isNaN(parseInt(args[1])) ? args[1].toLowerCase() : "";
        let filtered = approved;

        if (searchTerm) {
          filtered = approved.filter(id => id.toLowerCase().includes(searchTerm));
          if (filtered.length === 0) {
            fileLock.release();
            return api.sendMessage(`❌ "${searchTerm}" নাম বা আইডি দিয়ে কিছু পাওয়া যায়নি।`, threadID, messageID);
          }
        }

        if (filtered.length === 0) {
          fileLock.release();
          return api.sendMessage("❌ এখনো কোনো অনুমোদিত থ্রেড নেই।", threadID, messageID);
        }

        let paged = paginate(filtered, 10, page);
        if (paged.length === 0) {
          fileLock.release();
          return api.sendMessage(`❌ পেজ ${page} খালি!`, threadID, messageID);
        }

        let msg = `✅ অনুমোদিত থ্রেডসমূহ (পৃষ্ঠা ${page}):\n`;
        paged.forEach((id, i) => {
          msg += `\n📌 ${(page - 1) * 10 + i + 1}. থ্রেড আইডি: ${id}`;
        });
        fileLock.release();
        return api.sendMessage(msg, threadID, messageID);
      }

      if (command === "pending") {
        let searchTerm = args[1] && isNaN(parseInt(args[1])) ? args[1].toLowerCase() : "";
        let filtered = pending;

        if (searchTerm) {
          filtered = pending.filter(id => id.toLowerCase().includes(searchTerm));
          if (filtered.length === 0) {
            fileLock.release();
            return api.sendMessage(`❌ "${searchTerm}" নাম বা আইডি দিয়ে কিছু পাওয়া যায়নি।`, threadID, messageID);
          }
        }

        if (filtered.length === 0) {
          fileLock.release();
          return api.sendMessage("⏳ অনুমোদনের জন্য অপেক্ষমান থ্রেড নেই।", threadID, messageID);
        }

        let paged = paginate(filtered, 10, page);
        if (paged.length === 0) {
          fileLock.release();
          return api.sendMessage(`❌ পেজ ${page} খালি!`, threadID, messageID);
        }

        let msg = `⏳ অনুমোদনের অপেক্ষমান থ্রেডসমূহ (পৃষ্ঠা ${page}):\n`;
        let count = (page - 1) * 10 + 1;

        for (const id of paged) {
          try {
            const info = await api.getThreadInfo(id);
            msg += `\n📍 ${count++}. ${info.name || "Unnamed Group"}\n    আইডি: ${id}`;
          } catch {
            msg += `\n📍 ${count++}. Unknown Group\n    আইডি: ${id}`;
          }
        }
        fileLock.release();
        return api.sendMessage(msg, threadID, messageID);
      }

      if (command === "del") {
        if (!approved.includes(idBox)) {
          fileLock.release();
          return api.sendMessage("❌ এই আইডি অনুমোদিত তালিকায় নেই।", threadID, messageID);
        }
        approved = approved.filter(id => id !== idBox);
        if (!pending.includes(idBox)) pending.push(idBox);

        await fs.writeJson(approvedPath, approved, { spaces: 2 });
        await fs.writeJson(pendingPath, pending, { spaces: 2 });
        await logAction(`Deleted approved thread ID: ${idBox} by user ${senderID}`);

        fileLock.release();
        return api.sendMessage(`✅ সফলভাবে অনুমোদিত তালিকা থেকে মুছে দেওয়া হলো: ${idBox}`, threadID, messageID);
      }

      if (/^\d+$/.test(command) || command === "approve") {
        if (approved.includes(idBox)) {
          fileLock.release();
          return api.sendMessage(`✅ আইডি ${idBox} ইতিমধ্যে অনুমোদিত আছে।`, threadID, messageID);
        }

        await api.sendTyping(idBox);
        api.sendMessage(
          "✅ আপনার থ্রেড অনুমোদিত হয়েছে! এখন থেকে বটের সব কমান্ড ব্যবহার করতে পারবেন।",
          idBox,
          async (error) => {
            if (error) {
              fileLock.release();
              return api.sendMessage(
                "❌ অনুমোদনের মেসেজ পাঠানো যায়নি। বট কি ঐ গ্রুপে আছে তো?",
                threadID,
                messageID
              );
            }

            approved.push(idBox);
            pending = pending.filter(id => id !== idBox);

            await fs.writeJson(approvedPath, approved, { spaces: 2 });
            await fs.writeJson(pendingPath, pending, { spaces: 2 });
            await logAction(`Approved thread ID: ${idBox} by user ${senderID}`);

            fileLock.release();
            api.sendMessage(`✅ সফলভাবে অনুমোদন হয়েছে: ${idBox}`, threadID, messageID);
          }
        );
        return;
      }

      fileLock.release();
      return api.sendMessage(helpMsg.replace(/{pn}/g, this.config.name), threadID, messageID);
    } catch (err) {
      if (fileLock.locked) fileLock.release();
      console.error("❌ Error in approveThreads command:", err);
      const logFile = getLogFilePath();
      await fs.appendFile(logFile, `[${new Date().toISOString()}] ERROR: ${err.stack || err}\n`);
      await api.sendMessage("❌ কোনো সমস্যা হয়েছে, আবার চেষ্টা করুন।", threadID, messageID);
    }
  },
};
