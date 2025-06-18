const fs = require('fs').promises;
const path = require('path');

module.exports = {
  config: {
    name: "virusinfo",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "2.1",
    countDown: 5,
    role: 2,
    category: "admin",
    shortDescription: {
      en: "Mass update meta fields in all command files automatically"
    },
    longDescription: {
      en: "Set version, author, role, category, etc. to all bot command files easily."
    },
    guide: {
      en: "{pn} [credits] [category] [version] [longDesc] [shortDesc] [author] [role] [hasPermission] [usePrefix]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const commandsPath = path.join(__dirname, '..');
    const backupFolder = path.join(commandsPath, 'backup_' + Date.now());

    try {
      // ইনপুট ভ্যালিডেশন
      const newCredits = args[0] || "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝";
      const newCategory = args[1] || "admin";
      const newVersion = args[2] || "2.1";
      const newLongDescription = args[3] || "Set version, author, role, category, etc. to all bot command files easily.";
      const newShortDescription = args[4] || "Mass update meta fields in all command files automatically";
      const newAuthor = args[5] || "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝";
      const newRole = parseInt(args[6]) || 2;
      const newHasPermission = args[7] || "";
      const newUsePrefix = args[8] === "true";

      if (!/^\d+\.\d+$/.test(newVersion)) return api.sendMessage("❌ Version must be like 2.1", event.threadID);
      if (args[6] && isNaN(newRole)) return api.sendMessage("❌ Role must be a number", event.threadID);

      // ব্যাকআপ ফোল্ডার তৈরি
      await fs.mkdir(backupFolder, { recursive: true });

      // ফাইল গুলো নিয়ে আসা
      const files = await fs.readdir(commandsPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));

      // ব্যাকআপ নেয়া
      for (const file of jsFiles) {
        await fs.copyFile(path.join(commandsPath, file), path.join(backupFolder, file));
      }

      // প্রতিটা ফাইলে রেগুলার এক্সপ্রেশন দিয়ে পরিবর্তন
      for (const file of jsFiles) {
        const filePath = path.join(commandsPath, file);
        let content = await fs.readFile(filePath, 'utf8');

        content = content
          .replace(/version:\s*".*?"/g, `version: "${newVersion}"`)
          .replace(/author:\s*".*?"/g, `author: "${newAuthor}"`)
          .replace(/category:\s*".*?"/g, `category: "${newCategory}"`)
          .replace(/role:\s*\d+/g, `role: ${newRole}`)
          .replace(/shortDescription:\s*\{[^}]*\}/g, `shortDescription: { en: "${newShortDescription}" }`)
          .replace(/longDescription:\s*\{[^}]*\}/g, `longDescription: { en: "${newLongDescription}" }`);

        if (/credits:\s*".*?"/g.test(content)) {
          content = content.replace(/credits:\s*".*?"/g, `credits: "${newCredits}"`);
        } else {
          content = content.replace(/config:\s*\{/, `config: {\n    credits: "${newCredits}",`);
        }

        if (/hasPermission:\s*".*?"/g.test(content)) {
          content = content.replace(/hasPermission:\s*".*?"/g, `hasPermission: "${newHasPermission}"`);
        } else {
          content = content.replace(/config:\s*\{/, `config: {\n    hasPermission: "${newHasPermission}",`);
        }

        if (/usePrefix:\s*(true|false)/g.test(content)) {
          content = content.replace(/usePrefix:\s*(true|false)/g, `usePrefix: ${newUsePrefix}`);
        } else {
          content = content.replace(/config:\s*\{/, `config: {\n    usePrefix: ${newUsePrefix},`);
        }

        await fs.writeFile(filePath, content, 'utf8');
      }

      // mature tone + typing animation message
      const matureMessage = `
✨🖤 *VirusInfo আপডেট সম্পূর্ণ!* 🖤✨

📌 *Version:* ${newVersion}  
✍️ *Author:* ${newAuthor}  
📂 *Category:* ${newCategory}  
🔑 *Role:* ${newRole}  

✅ সব কমান্ড ফাইল সফলভাবে আপডেট হয়েছে।  
🔒 *সাবধান:* আপডেটের আগে ব্যাকআপ নেওয়া হয়েছে, প্রয়োজনে পুনরুদ্ধার সম্ভব।

🕊️ বট ধীরে ধীরে টাইপ করছে...  
⌛️ *সাবলীলতা বজায় রেখে কাজ চলছে...*

─────────────────────────────  
💡 *আপনার বটকে সর্বোচ্চ দক্ষতায় চালিয়ে যান!*  
🙏 ধন্যবাদ আপনার আস্থা রাখার জন্য।  
─────────────────────────────  

💬 *সাহায্যের জন্য* \`{pn} help\` *কমান্ড ব্যবহার করুন।*  
🌹 সুস্থ থাকুন, ভালো থাকুন।  
`;

      async function typeWrite(text, interval = 30) {
        await api.sendTyping(event.threadID);
        await new Promise(r => setTimeout(r, 1800));
        return api.sendMessage(text, event.threadID);
      }

      await typeWrite(matureMessage);

    } catch (error) {
      console.error("❌ Error during update:", error);
      api.sendMessage("❌ কমান্ড আপডেট করতে সমস্যা হয়েছে, কনসোল চেক করুন।", event.threadID);
    }
  }
};
