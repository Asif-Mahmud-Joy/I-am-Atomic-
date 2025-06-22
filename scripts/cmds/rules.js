const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "rules",
    version: "3.0.0",
    author: "NTKhang & Upgraded by ✨Asif✨",
    countDown: 3,
    role: 0,
    description: {
      en: "Comprehensive group rules management system",
      vi: "Hệ thống quản lý nội quy nhóm toàn diện",
      bn: "গ্রুপের নিয়ম ব্যবস্থাপনা সিস্টেম"
    },
    category: "administration",
    guide: {
      en: "{pn} [action] [args] - Manage group rules",
      vi: "{pn} [hành động] [đối số] - Quản lý nội quy nhóm",
      bn: "{pn} [কর্ম] [আর্গুমেন্ট] - গ্রুপের নিয়ম ব্যবস্থাপনা"
    }
  },

  langs: {
    en: {
      rulesList: "📜 GROUP RULES 📜\n\n%1\n\nTotal: %2 rules",
      noRules: "ℹ️ This group has no rules yet.\nUse `%1rules add [rule]` to add one.",
      ruleAdded: "✅ Rule added successfully!",
      ruleEdited: "✏️ Rule #%1 updated:\nBefore: %2\nAfter: %3",
      ruleDeleted: "🗑️ Rule #%1 deleted:\n%2",
      allRulesCleared: "🧹 All rules have been cleared!",
      confirmClear: "⚠️ Are you sure you want to clear ALL rules?\nReact with any emoji to confirm.",
      invalidNumber: "❌ Invalid rule number. Please use a number between 1 and %1",
      missingContent: "❌ Please provide rule content",
      adminOnly: "⛔ Only admins can perform this action",
      moveSuccess: "🔄 Rules #%1 and #%2 swapped successfully",
      viewSingleRule: "🔍 Rule #%1:\n%2",
      help: `📝 RULES COMMAND HELP:
• {pn} - View all rules
• {pn} add [rule] - Add new rule
• {pn} edit [num] [new rule] - Edit existing rule
• {pn} delete [num] - Delete specific rule
• {pn} move [num1] [num2] - Swap rule positions
• {pn} clear - Remove all rules
• {pn} view [num] - View specific rule`
    },
    vi: {
      rulesList: "📜 NỘI QUY NHÓM 📜\n\n%1\n\nTổng: %2 quy định",
      noRules: "ℹ️ Nhóm chưa có nội quy nào.\nDùng `%1rules add [nội quy]` để thêm.",
      ruleAdded: "✅ Đã thêm nội quy thành công!",
      ruleEdited: "✏️ Đã sửa nội quy #%1:\nTrước: %2\nSau: %3",
      ruleDeleted: "🗑️ Đã xóa nội quy #%1:\n%2",
      allRulesCleared: "🧹 Đã xóa toàn bộ nội quy!",
      confirmClear: "⚠️ Bạn chắc chắn muốn xóa TẤT CẢ nội quy?\nThả cảm xúc để xác nhận.",
      invalidNumber: "❌ Số thứ tự không hợp lệ. Vui lòng chọn từ 1 đến %1",
      missingContent: "❌ Vui lòng nhập nội dung nội quy",
      adminOnly: "⛔ Chỉ quản trị viên được thực hiện hành động này",
      moveSuccess: "🔄 Đã đổi vị trí nội quy #%1 và #%2",
      viewSingleRule: "🔍 Nội quy #%1:\n%2",
      help: `📝 TRỢ GIÚP LỆNH RULES:
• {pn} - Xem tất cả nội quy
• {pn} add [nội quy] - Thêm nội quy mới
• {pn} edit [số] [nội quy mới] - Sửa nội quy
• {pn} delete [số] - Xóa nội quy
• {pn} move [số1] [số2] - Đổi vị trí nội quy
• {pn} clear - Xóa tất cả nội quy
• {pn} view [số] - Xem nội quy cụ thể`
    },
    bn: {
      rulesList: "📜 গ্রুপের নিয়মাবলী 📜\n\n%1\n\nমোট: %2 টি নিয়ম",
      noRules: "ℹ️ এই গ্রুপে এখনো কোনো নিয়ম নেই।\nনতুন নিয়ম যোগ করতে `%1rules add [নিয়ম]` ব্যবহার করুন।",
      ruleAdded: "✅ নিয়ম সফলভাবে যোগ করা হয়েছে!",
      ruleEdited: "✏️ নিয়ম #%1 আপডেট করা হয়েছে:\nপূর্বে: %2\nবর্তমানে: %3",
      ruleDeleted: "🗑️ নিয়ম #%1 মুছে ফেলা হয়েছে:\n%2",
      allRulesCleared: "🧹 সব নিয়ম মুছে ফেলা হয়েছে!",
      confirmClear: "⚠️ আপনি কি নিশ্চিত সব নিয়ম মুছে ফেলতে চান?\nনিশ্চিত করতে কোনো ইমোজি দিয়ে রিঅ্যাক্ট করুন।",
      invalidNumber: "❌ ভুল নিয়ম নম্বর। 1 থেকে %1 এর মধ্যে একটি নম্বর দিন",
      missingContent: "❌ দয়া করে নিয়মের বিষয়বস্তু প্রদান করুন",
      adminOnly: "⛔ শুধুমাত্র অ্যাডমিনরা এই কাজটি করতে পারেন",
      moveSuccess: "🔄 নিয়ম #%1 এবং #%2 সফলভাবে অদলবদল করা হয়েছে",
      viewSingleRule: "🔍 নিয়ম #%1:\n%2",
      help: `📝 RULES কমান্ড সহায়তা:
• {pn} - সব নিয়ম দেখুন
• {pn} add [নিয়ম] - নতুন নিয়ম যোগ করুন
• {pn} edit [নম্বর] [নতুন নিয়ম] - নিয়ম সম্পাদনা করুন
• {pn} delete [নম্বর] - নির্দিষ্ট নিয়ম মুছুন
• {pn} move [নম্বর1] [নম্বর2] - নিয়মের অবস্থান পরিবর্তন করুন
• {pn} clear - সব নিয়ম মুছুন
• {pn} view [নম্বর] - নির্দিষ্ট নিয়ম দেখুন`
    }
  },

  onStart: async function ({ 
    message, 
    event, 
    args, 
    threadsData, 
    getLang,
    role,
    prefix
  }) {
    const threadID = event.threadID;
    const rules = await threadsData.get(threadID, "data.rules", []);
    const action = args[0]?.toLowerCase();
    const lang = getLang;

    // Show help if no action or invalid action
    if (!action || action === "help") {
      return message.reply(lang("help").replace(/{pn}/g, prefix + this.config.name));
    }

    // View all rules
    if (["list", "all", "view"].includes(action) && !args[1]) {
      if (rules.length === 0) {
        return message.reply(lang("noRules", prefix));
      }
      const formattedRules = rules.map((rule, i) => `${i+1}. ${rule}`).join("\n");
      return message.reply(lang("rulesList", formattedRules, rules.length));
    }

    // View single rule
    if (action === "view" && args[1]) {
      const ruleNum = parseInt(args[1]);
      if (isNaN(ruleNum) return message.reply(lang("invalidNumber", rules.length));
      if (ruleNum < 1 || ruleNum > rules.length) {
        return message.reply(lang("invalidNumber", rules.length));
      }
      return message.reply(lang("viewSingleRule", ruleNum, rules[ruleNum-1]));
    }

    // Add new rule
    if (["add", "+", "new"].includes(action)) {
      if (role < 1) return message.reply(lang("adminOnly"));
      const content = args.slice(1).join(" ");
      if (!content) return message.reply(lang("missingContent"));
      rules.push(content);
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(lang("ruleAdded"));
    }

    // Edit existing rule
    if (["edit", "update", "modify"].includes(action)) {
      if (role < 1) return message.reply(lang("adminOnly"));
      const ruleNum = parseInt(args[1]);
      if (isNaN(ruleNum)) return message.reply(lang("invalidNumber", rules.length));
      if (ruleNum < 1 || ruleNum > rules.length) {
        return message.reply(lang("invalidNumber", rules.length));
      }
      const newContent = args.slice(2).join(" ");
      if (!newContent) return message.reply(lang("missingContent"));
      const oldContent = rules[ruleNum-1];
      rules[ruleNum-1] = newContent;
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(lang("ruleEdited", ruleNum, oldContent, newContent));
    }

    // Delete rule
    if (["delete", "del", "remove", "-"].includes(action)) {
      if (role < 1) return message.reply(lang("adminOnly"));
      const ruleNum = parseInt(args[1]);
      if (isNaN(ruleNum)) return message.reply(lang("invalidNumber", rules.length));
      if (ruleNum < 1 || ruleNum > rules.length) {
        return message.reply(lang("invalidNumber", rules.length));
      }
      const deletedRule = rules.splice(ruleNum-1, 1)[0];
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(lang("ruleDeleted", ruleNum, deletedRule));
    }

    // Move/swap rules
    if (["move", "swap", "exchange"].includes(action)) {
      if (role < 1) return message.reply(lang("adminOnly"));
      const num1 = parseInt(args[1]);
      const num2 = parseInt(args[2]);
      if (isNaN(num1) || isNaN(num2)) {
        return message.reply(lang("invalidNumber", rules.length));
      }
      if (num1 < 1 || num1 > rules.length || num2 < 1 || num2 > rules.length) {
        return message.reply(lang("invalidNumber", rules.length));
      }
      if (num1 === num2) {
        return message.reply("⚠️ Cannot swap the same rule positions");
      }
      [rules[num1-1], rules[num2-1]] = [rules[num2-1], rules[num1-1]];
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(lang("moveSuccess", num1, num2));
    }

    // Clear all rules
    if (["clear", "reset", "clean"].includes(action)) {
      if (role < 1) return message.reply(lang("adminOnly"));
      return message.reply(lang("confirmClear"), (err, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          threadID
        });
      });
    }

    // Invalid command
    return message.reply(lang("help").replace(/{pn}/g, prefix + this.config.name));
  },

  onReaction: async function ({ threadsData, message, Reaction, event, getLang }) {
    if (event.userID !== Reaction.author) return;
    await threadsData.set(Reaction.threadID, [], "data.rules");
    message.reply(getLang("allRulesCleared"));
  }
};
