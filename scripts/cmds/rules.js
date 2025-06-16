// ✅ UPGRADED: Group Rules Command with Banenglish + Real-World Improvements
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "rules",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Quy tắc nhóm",
      en: "Group rules",
      bn: "গ্রুপের নিয়ম"
    },
    longDescription: {
      vi: "Xem/thêm/sửa/xóa nội quy nhóm",
      en: "View/add/edit/delete group rules",
      bn: "গ্রুপের নিয়মাবলী দেখুন বা পরিবর্তন করুন"
    },
    category: "box chat",
    guide: {
      en: "{pn} [add/edit/delete/view/remove]",
      bn: "{pn} [add/edit/delete/view/remove]"
    }
  },

  langs: {
    en: {
      yourRules: "📜 Group Rules:\n%1",
      noRules: "⚠️ No rules found! Use `%1rules add <your rule>` to add rules.",
      successAdd: "✅ Rule added!",
      successEdit: "✏️ Rule %1 updated to: %2",
      successDelete: "🗑️ Deleted rule %1: %2",
      successRemove: "🧹 All rules cleared!",
      confirmRemove: "⚠️ React with any emoji to confirm rule deletion.",
      invalidNum: "❌ Invalid rule number.",
      permission: "⛔ Only admins can use this command.",
      rulesNotFound: "❌ Rule number %1 does not exist.",
      listNumbered: "%1. %2"
    },
    bn: {
      yourRules: "📜 গ্রুপের নিয়মাবলী:\n%1",
      noRules: "⚠️ কোনো নিয়ম নেই! যোগ করতে `%1rules add <নিয়ম>` লিখুন।",
      successAdd: "✅ নিয়ম যুক্ত হয়েছে!",
      successEdit: "✏️ নিয়ম %1 আপডেট হয়েছে: %2",
      successDelete: "🗑️ মুছে ফেলা হয়েছে %1: %2",
      successRemove: "🧹 সব নিয়ম মুছে ফেলা হয়েছে!",
      confirmRemove: "⚠️ সব নিয়ম মুছে ফেলতে যেকোনো ইমোজি রিয়্যাক্ট করুন।",
      invalidNum: "❌ সঠিক নাম্বার দিন।",
      permission: "⛔ কেবল অ্যাডমিনরা এই কমান্ড ব্যবহার করতে পারবে।",
      rulesNotFound: "❌ নিয়ম %1 পাওয়া যায়নি।",
      listNumbered: "%1. %2"
    }
  },

  onStart: async function ({ role, args, message, event, threadsData, getLang }) {
    const lang = getLang();
    const { threadID } = event;
    const type = (args[0] || '').toLowerCase();
    const rules = await threadsData.get(threadID, "data.rules", []);

    // View rules
    if (!type || type === "view") {
      if (rules.length === 0)
        return message.reply(lang("noRules", getPrefix(threadID)));
      const text = rules.map((r, i) => lang("listNumbered", i + 1, r)).join("\n");
      return message.reply(lang("yourRules", text));
    }

    // Add rule
    if (["add", "+"].includes(type)) {
      if (role < 1) return message.reply(lang("permission"));
      const content = args.slice(1).join(" ");
      if (!content) return message.reply(lang("noRules", getPrefix(threadID)));
      rules.push(content);
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(lang("successAdd"));
    }

    // Edit rule
    if (["edit", "-e"].includes(type)) {
      if (role < 1) return message.reply(lang("permission"));
      const index = parseInt(args[1]);
      if (isNaN(index) || index < 1 || index > rules.length)
        return message.reply(lang("rulesNotFound", args[1]));
      const content = args.slice(2).join(" ");
      if (!content) return message.reply(lang("noRules"));
      rules[index - 1] = content;
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(lang("successEdit", index, content));
    }

    // Delete rule
    if (["delete", "del", "-d"].includes(type)) {
      if (role < 1) return message.reply(lang("permission"));
      const index = parseInt(args[1]);
      if (isNaN(index) || index < 1 || index > rules.length)
        return message.reply(lang("rulesNotFound", args[1]));
      const removed = rules.splice(index - 1, 1)[0];
      await threadsData.set(threadID, rules, "data.rules");
      return message.reply(lang("successDelete", index, removed));
    }

    // Remove all
    if (["remove", "reset", "-r"].includes(type)) {
      if (role < 1) return message.reply(lang("permission"));
      return message.reply(lang("confirmRemove"), (e, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          commandName: "rules",
          author: event.senderID,
          threadID
        });
      });
    }

    message.SyntaxError();
  },

  onReaction: async function ({ threadsData, message, Reaction, event, getLang }) {
    const lang = getLang();
    if (event.userID !== Reaction.author) return;
    await threadsData.set(Reaction.threadID, [], "data.rules");
    message.reply(lang("successRemove"));
  }
};
