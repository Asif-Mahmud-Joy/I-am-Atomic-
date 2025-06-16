const fs = require("fs-extra");
const { sequelize } = global.db;

module.exports = {
  config: {
    name: "jsontosqlite",
    version: "1.5",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2,
    description: {
      en: "Sync JSON data to SQLite database"
    },
    category: "owner",
    guide: {
      en: "{pn} <thread | user | dashboard | global | all>: Sync JSON in database/data to SQLite"
    }
  },

  langs: {
    en: {
      invalidDatabase: "❌ Please switch database to sqlite in config then restart bot",
      missingFile: "❌ Missing data file: %1",
      formatInvalid: "❌ Invalid JSON format",
      error: "❌ Error:
%1: %2",
      successThread: "✅ Thread data synced successfully!",
      successUser: "✅ User data synced successfully!",
      successDashboard: "✅ Dashboard data synced successfully!",
      successGlobal: "✅ Global data synced successfully!"
    }
  },

  onStart: async function ({ args, message, threadModel, userModel, dashBoardModel, globalModel, getLang }) {
    if (global.GoatBot.config.database.type !== "sqlite")
      return message.reply(getLang("invalidDatabase"));

    switch (args[0]) {
      case "thread": return await syncData("threadsData.json", threadModel, "threadID", "allThreadData", getLang, message, "successThread");
      case "user": return await syncData("usersData.json", userModel, "userID", "allUserData", getLang, message, "successUser");
      case "dashboard": return await syncData("dashBoardData.json", dashBoardModel, "email", "dashBoardData", getLang, message, "successDashboard");
      case "global": return await syncData("globalData.json", globalModel, "key", "allGlobalData", getLang, message, "successGlobal");
      case "all": {
        await syncData("threadsData.json", threadModel, "threadID", "allThreadData", getLang, message);
        await syncData("usersData.json", userModel, "userID", "allUserData", getLang, message);
        await syncData("dashBoardData.json", dashBoardModel, "email", "dashBoardData", getLang, message);
        await syncData("globalData.json", globalModel, "key", "allGlobalData", getLang, message);
        return message.reply("✅ All data synced successfully!");
      }
      default:
        return message.SyntaxError();
    }
  }
};

async function syncData(fileName, model, key, globalKey, getLang, message, successKey) {
  const filePath = `${process.cwd()}/database/data/${fileName}`;
  if (!fs.existsSync(filePath))
    return message.reply(getLang("missingFile", fileName));

  let jsonData;
  try {
    jsonData = require(filePath);
    delete require.cache[require.resolve(filePath)];
  } catch (err) {
    return message.reply(getLang("formatInvalid"));
  }

  try {
    await sequelize.transaction(async (transaction) => {
      for (const data of jsonData) {
        const index = global.db[globalKey]?.findIndex(item => item[key] == data[key]) ?? -1;
        if (index === -1) {
          await model.create(data, { transaction });
        } else {
          await model.update(data, { where: { [key]: data[key] }, transaction });
        }
      }
    });

    const allData = await model.findAll();
    global.db[globalKey] = allData.map(item => item.get({ plain: true }));

    if (successKey)
      return message.reply(getLang(successKey));
  } catch (err) {
    return message.reply(getLang("error", err.name, err.message));
  }
}
