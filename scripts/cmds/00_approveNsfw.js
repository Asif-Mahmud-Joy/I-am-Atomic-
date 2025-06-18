const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "nsfw_manage",
    version: "1.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    category: "NSFW",
    role: 2,
    shortDescription: "Manage NSFW access per thread",
    guide: {
      en: `
        {pn} approved [threadID] [optionalMessage] ✔ Approve a thread
        {pn} remove [threadID] [reason] ❌ Remove approval
        {pn} disapproved [threadID] [reason] ⚠ Disapprove request
        {pn} check 📊 Check current thread status
      `
    }
  },

  onStart: async function ({ api, args, message, event, Users }) {
    // টাইপিং অ্যানিমেশন
    api.sendTyping(event.threadID);

    // Role চেক
    let senderRole = 0;
    try {
      senderRole = await Users.getRoleFromID(event.senderID);
    } catch {
      // যদি না পাওয়া যায়, ডিফল্ট 0 ধরা হবে
      senderRole = 0;
    }
    if (senderRole < this.config.role) {
      return message.reply("❌ দুঃখিত, আপনার অনুমতি নেই এই কমান্ড চালানোর জন্য।");
    }

    const assistDir = path.join(__dirname, "assist_json");
    if (!fs.existsSync(assistDir)) fs.mkdirSync(assistDir);

    const approvedPath = path.join(assistDir, "approved_ids.json");
    const pendingPath = path.join(assistDir, "pending_ids.json");
    const logPath = path.join(assistDir, "nsfw_log.txt");

    // ফাইল না থাকলে খালি আরে দিয়ে তৈরি করো
    if (!fs.existsSync(approvedPath)) fs.writeFileSync(approvedPath, "[]");
    if (!fs.existsSync(pendingPath)) fs.writeFileSync(pendingPath, "[]");
    if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, "");

    // সিম্পল safe রিড
    function readJSON(file) {
      try {
        const data = fs.readFileSync(file, "utf8");
        return JSON.parse(data || "[]");
      } catch {
        return [];
      }
    }

    // সিম্পল safe রাইট
    function writeJSON(file, data) {
      try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
      } catch (err) {
        // এখানে এরর লগ করা যেতে পারে
      }
    }

    // লগ রোটেশন সহ লগ লেখা
    function appendLog(text) {
      try {
        let stats = null;
        try {
          stats = fs.statSync(logPath);
        } catch {}
        if (stats && stats.size > 1024 * 1024) {
          // 1MB হলে রোটেট করো
          const oldLog = path.join(assistDir, `nsfw_log_${Date.now()}.txt`);
          fs.renameSync(logPath, oldLog);
          fs.writeFileSync(logPath, "");
        }
        fs.appendFileSync(logPath, `${new Date().toISOString()} - ${text}\n`);
      } catch {}
    }

    // ইনপুট যাচাই: 16+ ডিজিট সংখ্যা
    function validateThreadID(id) {
      return /^\d{16,}$/.test(id);
    }

    let approvedIDs = readJSON(approvedPath);
    let pendingIDs = readJSON(pendingPath);

    function sendReply(text) {
      message.reply(text);
    }

    if (!args[0]) return sendReply("❓ ভুল কমান্ড! সাহায্যের জন্য: $help nsfw_manage");

    const cmd = args[0].toLowerCase();

    try {
      if (cmd === "approved" && args[1]) {
        const id = args[1];
        const adminMsg = args.slice(2).join(" ") || "কোনো বার্তা নেই";

        if (!validateThreadID(id)) return sendReply("⚠️ থ্রেড আইডি ফরম্যাট ভুল!");

        if (approvedIDs.includes(id)) return sendReply(`✅ থ্রেড আইডি ${id} ইতিমধ্যে অনুমোদিত।`);

        approvedIDs.push(id);
        writeJSON(approvedPath, approvedIDs);

        // পেন্ডিং থেকে মুছে ফেলো
        if (pendingIDs.includes(id)) {
          pendingIDs = pendingIDs.filter(e => e !== id);
          writeJSON(pendingPath, pendingIDs);
        }

        api.sendMessage(
          `📌 NSFW অনুমোদন হয়েছে!\nএখন থেকে এই থ্রেডে NSFW কমান্ড চালাতে পারবেন।\n\nঅ্যাডমিনের বার্তা: ${adminMsg}`,
          id
        );

        appendLog(`APPROVED: ThreadID=${id} by User=${event.senderID} Msg=${adminMsg}`);

        return sendReply(`✅ থ্রেড আইডি: ${id} সফলভাবে অনুমোদিত হয়েছে।`);
      }
      else if (cmd === "remove" && args[1]) {
        const id = args[1];
        const reason = args.slice(2).join(" ") || "কারণ দেয়া হয়নি";

        if (!validateThreadID(id)) return sendReply("⚠️ থ্রেড আইডি ফরম্যাট ভুল!");

        if (!approvedIDs.includes(id)) return sendReply(`❌ থ্রেড আইডি ${id} অনুমোদিত নয়।`);

        approvedIDs = approvedIDs.filter(e => e !== id);
        writeJSON(approvedPath, approvedIDs);

        api.sendMessage(
          `❌ আপনার NSFW অনুমতি বাতিল করা হয়েছে।\nকারণ: ${reason}`,
          id
        );

        appendLog(`REMOVED: ThreadID=${id} by User=${event.senderID} Reason=${reason}`);

        return sendReply(`✅ থ্রেড আইডি ${id} থেকে NSFW অনুমতি সরানো হয়েছে।`);
      }
      else if (cmd === "disapproved" && args[1]) {
        const id = args[1];
        const reason = args.slice(2).join(" ") || "কারণ দেয়া হয়নি";

        if (!validateThreadID(id)) return sendReply("⚠️ থ্রেড আইডি ফরম্যাট ভুল!");

        if (!pendingIDs.includes(id)) return sendReply(`⚠️ থ্রেড আইডি ${id} পেন্ডিং তালিকায় নেই।`);

        pendingIDs = pendingIDs.filter(e => e !== id);
        writeJSON(pendingPath, pendingIDs);

        api.sendMessage(
          `⚠️ আপনার NSFW অনুরোধ প্রত্যাখ্যাত হয়েছে।\nকারণ: ${reason}`,
          id
        );

        appendLog(`DISAPPROVED: ThreadID=${id} by User=${event.senderID} Reason=${reason}`);

        return sendReply(`✅ থ্রেড আইডি ${id} এর NSFW অনুরোধ প্রত্যাখ্যাত হয়েছে।`);
      }
      else if (cmd === "check") {
        if (approvedIDs.includes(event.threadID)) {
          return sendReply("✅ এই থ্রেডে NSFW অনুমোদিত আছে।");
        } else {
          return sendReply("❌ এই থ্রেডে NSFW অনুমোদিত নেই।");
        }
      }
      else {
        return sendReply("❓ ভুল কমান্ড! সাহায্যের জন্য: $help nsfw_manage");
      }
    } catch (err) {
      appendLog(`ERROR: User=${event.senderID} Cmd=${cmd} Error=${err.message}`);
      return sendReply("❌ কমান্ড সম্পাদনে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।");
    }
  }
};
