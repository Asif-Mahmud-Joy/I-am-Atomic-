
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "jsontomongodb",
    aliases: ["jsontomongo"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2,
    shortDescription: "Sync JSON to MongoDB",
    longDescription: "Synchronize all bot data from json to mongodb",
    category: "owner",
    guide: {
      en: "{pn} <thread | user | dashboard | global | all>"
    }
  },

  langs: {
    en: {
      invalidDatabase: "❌ Please switch database to mongodb in config then restart the bot to use this command",
      missingFile: "❌ You haven't copied the data file %1 into the database/data folder",
      formatInvalid: "❌ Data format is invalid",
      error: "❌ An error occurred:\n%1: %2",
      success: "✅ Successfully synchronized %1 data from json to MongoDB!"
    },
    bn: {
      invalidDatabase: "❌ এই কমান্ড ইউজ করতে হলে config ফাইলে database টাইপ 'mongodb' করতে হবে, তারপর বট রিস্টার্ট করুন।",
      missingFile: "❌ %1 নামের ফাইল database/data ফোল্ডারে পাওয়া যায়নি।",
      formatInvalid: "❌ ডাটা ফরম্যাট সঠিক না।",
      error: "❌ একটা সমস্যা হইছে:\n%1: %2",
      success: "✅ %1 ডাটা json থেকে MongoDB তে সফলভাবে সিংক করা হয়েছে!"
    }
  },

  onStart: async function ({ args, message, threadModel, userModel, dashBoardModel, globalModel, getLang }) {
    if (global.GoatBot.config.database.type !== "mongodb")
      return message.reply(getLang("invalidDatabase"));

    const typeMap = {
      thread: ["threadsData.json", threadModel, "threadID"],
      user: ["usersData.json", userModel, "userID"],
      dashboard: ["dashBoardData.json", dashBoardModel, "email"],
      global: ["globalData.json", globalModel, "key"]
    };

    const target = args[0];
    if (target === "all") {
      for (const [type] of Object.entries(typeMap)) {
        await syncData(type, ...typeMap[type], message, getLang);
      }
    } else if (typeMap[target]) {
      await syncData(target, ...typeMap[target], message, getLang);
    } else {
      return message.SyntaxError();
    }
  }
};

async function syncData(type, fileName, model, idField, message, getLang) {
  const filePath = `${process.cwd()}/database/data/${fileName}`;
  if (!fs.existsSync(filePath))
    return message.reply(getLang("missingFile", fileName));

  let jsonData;
  try {
    jsonData = require(filePath);
    delete require.cache[require.resolve(filePath)];
  } catch {
    return message.reply(getLang("formatInvalid"));
  }

  try {
    const bulkOps = jsonData.map(entry => {
      const exists = global.db[`all${capitalize(type)}Data`]?.find(item => item[idField] === entry[idField]);
      return exists
        ? {
            updateOne: {
              filter: { [idField]: entry[idField] },
              update: entry
            }
          }
        : {
            insertOne: {
              document: entry
            }
          };
    });

    if (bulkOps.length > 0) {
      await model.bulkWrite(bulkOps);
      global.db[`all${capitalize(type)}Data`] = await model.find({}).lean();
    }

    return message.reply(getLang("success", capitalize(type)));
  } catch (err) {
    return message.reply(getLang("error", err.name, err.message));
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
