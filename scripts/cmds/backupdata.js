const fs = require("fs-extra");

module.exports = {
  config: {
    name: "backupdata",
    version: "2.0", 
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    description: {
      vi: "Sao lưu dữ liệu của bot (threads, users, dashboard, globalData)",
      en: "Backup bot data (threads, users, dashboard, globalData)"
    },
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  langs: {
    vi: {
      backedUp: "\u0110\u00e3 sao l\u01b0u d\u1eef li\u1ec7u c\u1ee7a bot v\u00e0o th\u01b0 m\u1ee5c scripts/cmds/tmp"
    },
    en: {
      backedUp: "Bot data has been backed up to the scripts/cmds/tmp folder"
    },
    bn: {
      backedUp: "Bot er data backup kora hoyeche scripts/cmds/tmp folder e ✅"
    }
  },

  onStart: async function ({ message, getLang, threadsData, usersData, dashBoardData, globalData }) {
    const backupPath = `${__dirname}/tmp`;
    await fs.ensureDir(backupPath);

    const [globalDataBackup, threadsDataBackup, usersDataBackup, dashBoardDataBackup] = await Promise.all([
      globalData.getAll(),
      threadsData.getAll(),
      usersData.getAll(),
      dashBoardData.getAll()
    ]);

    const files = [
      { data: threadsDataBackup, path: `${backupPath}/threadsData.json` },
      { data: usersDataBackup, path: `${backupPath}/usersData.json` },
      { data: dashBoardDataBackup, path: `${backupPath}/dashBoardData.json` },
      { data: globalDataBackup, path: `${backupPath}/globalData.json` }
    ];

    try {
      await Promise.all(
        files.map(file => fs.writeFile(file.path, JSON.stringify(file.data, null, 2)))
      );

      const attachments = files.map(file => fs.createReadStream(file.path));

      message.reply({
        body: getLang("backedUp"),
        attachment: attachments
      });
    } catch (err) {
      console.error("Backup error:", err);
      return message.reply("❌ Backup fail koreche. Console check koro.");
    }
  }
};
