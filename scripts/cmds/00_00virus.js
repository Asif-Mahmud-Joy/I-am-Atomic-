const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "virus",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "2.0",
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
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, args }) {
    const commandsPath = path.join(__dirname, '..');

    const newCredits = args[0] || "";
    const newCategory = args[1] || "admin";
    const newVersion = args[2] || "2.0";
    const newLongDescription = args[3] || "";
    const newShortDescription = args[4] || "Mass update meta fields in all command files automatically";
    const newAuthor = args[5] || "Cliff | ChatGPT UltraPro Max";
    const newRole = parseInt(args[6]) || 0;
    const newHasPermission = args[7] || "";
    const newUsePrefix = args[8] === "true";

    fs.readdir(commandsPath, (err, files) => {
      if (err) return api.sendMessage("❌ Command folder read error!", event.threadID);

      const jsFiles = files.filter(file => file.endsWith('.js'));

      jsFiles.forEach(file => {
        const filePath = path.join(commandsPath, file);

        let content = fs.readFileSync(filePath, 'utf-8');

        try {
          let updated = content
            .replace(/version: \".*?\"/, `version: \"${newVersion}\"`)
            .replace(/author: \".*?\"/, `author: \"${newAuthor}\"`)
            .replace(/category: \".*?\"/, `category: \"${newCategory}\"`)
            .replace(/role: \d+/, `role: ${newRole}`)
            .replace(/shortDescription: \{[^}]*\}/, `shortDescription: { en: \"${newShortDescription}\" }`)
            .replace(/longDescription: \{[^}]*\}/, `longDescription: { en: \"${newLongDescription}\" }`)
            .replace(/credits: \".*?\"/, `credits: \"${newCredits}\"`)
            .replace(/hasPermission: \".*?\"/, `hasPermission: \"${newHasPermission}\"`)
            .replace(/usePrefix: (true|false)/, `usePrefix: ${newUsePrefix}`);

          fs.writeFileSync(filePath, updated);
        } catch (e) {
          console.error("❌ Error updating file:", filePath);
        }
      });

      api.sendMessage(`✅ All commands updated to:\n➤ Version: ${newVersion}\n➤ Author: ${newAuthor}\n➤ Category: ${newCategory}\n➤ Role: ${newRole}`, event.threadID);
    });
  },
};
