module.exports.config = {
    name: "son",
    category: "automation",
    author: "Mr.Smokey [Asif Mahmud]",
    role: 2,
};

const userResponses = {};

module.exports.onStart = async function({ api, event, usersData }) {
    const mention = Object.keys(event.mentions)[0]; 
    if (!mention) return api.sendMessage("❌ দয়া করে একজনকে মেনশন করুন!", event.threadID);

    api.getUserInfo(mention, async (err, userInfo) => {
        if (err) {
            console.error("⚠️ Failed to retrieve user information:", err);
            return api.sendMessage("❌ ইউজারের তথ্য আনতে ব্যর্থ!", event.threadID);
        }

        let genderText;
        switch (userInfo[mention].gender) {
            case 1:
                genderText = "মাইয়া";
                break;
            case 2:
                genderText = "পোলা";
                break;
            default:
                genderText = "হিজড়া";
        }

        const insults = [
            `খাংকির ${genderText}, তোর মার ভোদা তে গাধার মাল ফালাবো! 😈`,
            `তোর মা কে চুদে চুদে পল্টি মারবো, গাধার ${genderText}! 😡`,
            `বাড়ির পাশে মাল ফেলে দিয়ে তোর মা কে চুদতে চাই! 🔥`,
            `তোর মার গুদে ফুল ট্যাবলেট পুশ করে, গাধার ${genderText}! 😛`,
            `তোর বোনের মুখে মাল ফালানোর কথা ভাবি, মাগী ${genderText}!`,
            `তোর মার ভোদায় TNT ঢুকাইয়া ব্লাস্ট করবো! 💥`,
            `তোর মা কে চুদে তারে গর্ভবতী বানাই দিমু, তুই হবি বাচ্চা! 👶`,
            `তোর মার গুদে লঞ্চ চলাই, তুই হবি নাবিক! 🛳️`,
            `তোর গার্লফ্রেন্ডরে চুদে তোর প্রেম শেষ করে দিমু! 💔`,
            `তোর মায়েরে চুদে WiFi কানেকশন নেবো, তুই হবি router! 📶`,
            `তোর বোনের পাছায় চকলেট মাখাই, চাটতেছি! 🍫`,
            `তোর মার ভোদায় মাছ চাষ করতেছি, জাল তুই দিস! 🐟`,
            `তোর মার দুধে দই বানাই, চাটতেছি বাটি সহ! 🥛`,
            `তোর হিজড়া জাতের ${genderText} রে আমি দুইবার চুদি একবার পেছনে! 🌀`,
            `তোর মার গুদে হেলিকপ্টার নামাই, ঘুরপাক খাচ্ছে! 🚁`,
            `তোর মা তো আমার পেটের নিচে হাউমাউ করছে, কি তোর খবর? 🤠`,
            `তোর মার মুখে মাল ফেলে পেইন্টিং করতেছি, তুই রঙ তুলির নাম রাখ! 🎨`,
            `তোর পোলামানুস্ক ${genderText}, তোর গুদে আঙ্গুল দিয়া বাজি জ্বালাই! 🧨`,
            `তোর মার গুদে সাপ ঢুকাই দিছি, হ্যাঁসিল করবি কেমনে? 🐍`,
            `তোর বোনরে টিভিতে লাইভে চুদি, তুই হবি ক্যামেরাম্যান! 📸`,
            `তোর মার পাছায় হাতুড়ি দিয়া ঠোক্কর মারতেছি, তুই হাত ধইরা ধরিস! 🔨`,
            `তোর গালির ভাষা শেষ, আমার চোদনের ভাষা শুরু! 💯`,

            // Fresh, unique, non-repetitive insults:
            `তোর মায়ের ভোদায় ফ্যান লাগাইছি, ঠান্ডা হইয়া গেছে! 🌀`,
            `তোর বাপের সামনে তোর মা'রে চুদি, বাপ তালি বাজায়! 👏`,
            `তোর বোনের গালে চুমু দেই, তুই হিংসে করিস! 😏`,
            `তোর মার পাছায় পেট্রোল ঢেলে আগুন লাগাই, তুই দৌড়াস! 🏃‍♂️🔥`,
            `তোর হিজড়া ${genderText} দেহে বেলুন ফাটাই, আওয়াজে তুই ভয় পাইস! 🎈`,
            `তোর মার গুদে চিপস খাই, তুই ডিপ আনিস! 🍟`,
            `তোর মায়ের দুধে চা বানাই, তুই চিনি দিস! 🍵`,
            `তোর বোনরে ফেসবুকে ব্লক দিছি, কারণ চুদা খেতে চায়! 🚫`,
            `তোর মার ভোদায় পিঁপড়া ঢুকাই, কামড় খেয়ে নাচে! 🐜`,
            `তোর গার্লফ্রেন্ডরে আমার বিছানায় রাখছি, তুই দরজায় পাহারা দিস! 🚪`
        ];

        userResponses[mention] = { index: 0 };
        api.sendMessage(`😆 কিরে ${event.mentions[mention]}! কেমন আছিস..?`, event.threadID);

        const listener = async function(msg) {
            if (msg.senderID === mention && msg.threadID === event.threadID && msg.body) {
                const idx = userResponses[mention].index;
                api.sendMessage(insults[idx % insults.length], msg.threadID, msg.messageID);
                userResponses[mention].index++;
            }
        };

        // Prevent duplicate listeners in the same thread
        if (!global._sonListeners) global._sonListeners = {};
        if (global._sonListeners[event.threadID]) {
            try { global._sonListeners[event.threadID].stop(); } catch(e) {}
        }
        global._sonListeners[event.threadID] = api.listenMqtt(listener);
    });
};
