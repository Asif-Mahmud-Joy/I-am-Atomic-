const fs = require("fs-extra");

module.exports = {
  config: {
    name: "jsontomongodb",
    aliases: ["jsontomongo", "syncmongo"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 2,
    shortDescription: "Sync JSON data to MongoDB",
    longDescription: "Synchronizes bot data from JSON files to MongoDB collections",
    category: "owner",
    guide: {
      en: "{pn} <thread | user | dashboard | global | all>"
    }
  },

  langs: {
    en: {
      invalidDatabase: "❌ Please switch to MongoDB in config.json and restart bot",
      missingFile: "❌ Missing data file: %1",
      formatInvalid: "❌ Invalid data format in %1",
      error: "❌ Error: %1\n%2",
      success: "✅ %1 data synced to MongoDB (%2 documents)",
      progress: "⏳ Syncing %1 data to MongoDB...",
      complete: "✅ All data synchronization complete!",
      invalidType: "⚠️ Invalid data type. Use: thread, user, dashboard, global, or all"
    },
    bn: {
      invalidDatabase: "❌ config.json-এ MongoDB ব্যবহার করতে বট রিস্টার্ট করুন",
      missingFile: "❌ ফাইল খুঁজে পাওয়া যায়নি: %1",
      formatInvalid: "❌ %1 ফাইলে ভুল ডাটা ফরম্যাট",
      error: "❌ ত্রুটি: %1\n%2",
      success: "✅ %1 ডাটা MongoDB-তে সিংক করা হয়েছে (%2 ডকুমেন্ট)",
      progress: "⏳ %1 ডাটা MongoDB-তে সিংক করা হচ্ছে...",
      complete: "✅ সব ডাটা সফলভাবে সিংক করা হয়েছে!",
      invalidType: "⚠️ ভুল ডাটা টাইপ। ব্যবহার করুন: thread, user, dashboard, global, বা all"
    }
  },

  onStart: async function ({ args, message, threadModel, userModel, dashBoardModel, globalModel, getLang }) {
    try {
      // Database check
      if (global.GoatBot.config.database.type !== "mongodb") {
        return message.reply(getLang("invalidDatabase"));
      }

      const dataTypes = {
        thread: { 
          model: threadModel, 
          file: "threadsData.json", 
          idField: "threadID",
          dbKey: "allThreadData"
        },
        user: { 
          model: userModel, 
          file: "usersData.json", 
          idField: "userID",
          dbKey: "allUserData"
        },
        dashboard: { 
          model: dashBoardModel, 
          file: "dashBoardData.json", 
          idField: "email",
          dbKey: "allDashBoardData"
        },
        global: { 
          model: globalModel, 
          file: "globalData.json", 
          idField: "key",
          dbKey: "allGlobalData"
        }
      };

      const target = args[0]?.toLowerCase();

      // Sync all data types
      if (target === "all") {
        for (const [type, config] of Object.entries(dataTypes)) {
          message.reply(getLang("progress", type));
          const result = await this.syncDataType(config, getLang);
          message.reply(getLang("success", type, result.count));
        }
        return message.reply(getLang("complete"));
      }

      // Sync specific data type
      if (dataTypes[target]) {
        message.reply(getLang("progress", target));
        const result = await this.syncDataType(dataTypes[target], getLang);
        return message.reply(getLang("success", target, result.count));
      }

      // Invalid type
      return message.reply(getLang("invalidType"));
    } catch (err) {
      console.error("JSON to MongoDB Sync Error:", err);
      return message.reply(getLang("error", err.name, err.message));
    }
  },

  syncDataType: async function (config, getLang) {
    const { model, file, idField, dbKey } = config;
    const filePath = `${__dirname}/../../data/${file}`;

    // File existence check
    if (!fs.existsSync(filePath)) {
      throw new Error(getLang("missingFile", file));
    }

    // Read and parse JSON data
    let jsonData;
    try {
      jsonData = fs.readJsonSync(filePath);
    } catch (err) {
      throw new Error(getLang("formatInvalid", file));
    }

    // Prepare bulk operations
    const bulkOps = [];
    const existingData = global.db[dbKey] || [];

    for (const item of jsonData) {
      const exists = existingData.some(dbItem => dbItem[idField] === item[idField]);
      
      bulkOps.push({
        [exists ? "updateOne" : "insertOne"]: exists
          ? {
              filter: { [idField]: item[idField] },
              update: { $set: item }
            }
          : { document: item }
      });
    }

    // Execute bulk operations
    if (bulkOps.length > 0) {
      await model.bulkWrite(bulkOps);
    }

    // Refresh global data
    global.db[dbKey] = await model.find().lean();

    return {
      count: bulkOps.length,
      type: dbKey
    };
  }
};
