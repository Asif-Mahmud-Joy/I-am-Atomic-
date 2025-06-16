module.exports = {
  config: {
    name: "bio",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Change bot's bio",
      bn: "বট এর বায়ো পরিবর্তন করুন"
    },
    longDescription: {
      en: "Change the bio/status message of the bot's Facebook account.",
      bn: "বটের ফেসবুক অ্যাকাউন্টের বায়ো বা স্ট্যাটাস পরিবর্তন করুন।"
    },
    category: "owner",
    guide: {
      en: "{pn} your new bio",
      bn: "{pn} আপনার নতুন বায়ো"
    }
  },

  langs: {
    en: {
      missingInput: "❌ Please enter the new bio text.",
      success: "✅ Bot's bio changed to: %1",
      error: "❌ Failed to change bio."
    },
    bn: {
      missingInput: "❌ দয়া করে নতুন বায়ো লিখুন।",
      success: "✅ বটের বায়ো সফলভাবে পরিবর্তন করা হয়েছে: %1",
      error: "❌ বায়ো পরিবর্তন করা যায়নি।"
    }
  },

  onStart: async function ({ args, message, api, getLang }) {
    const newBio = args.join(" ");
    if (!newBio) return message.reply(getLang("missingInput"));

    try {
      await api.changeBio(newBio);
      message.reply(getLang("success", newBio));
    } catch (err) {
      console.error("Bio change error:", err);
      message.reply(getLang("error"));
    }
  }
};
