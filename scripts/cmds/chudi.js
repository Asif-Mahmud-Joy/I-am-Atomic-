module.exports.config = {
    name: "chudi",
    version: "2.0",
    role: 1,
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    description: "Mention করা বন্ধুকে ক্রমাগত ১০ বার ট্যাগ করে মজার গালি দেয়, আত্মা কলিং স্টাইলে!",
    category: "fun",
    guide: "Please @mention someone",
    coolDown: 10
};

module.exports.onStart = async function ({ api, args, Users, event }) {
    // Check if a user is mentioned
    const mention = Object.keys(event.mentions)[0];
    if (!mention) {
        return api.sendMessage("Bhai, @mention ekta khanki magir pola de na, ke chudbo?! 🫂", event.threadID);
    }

    // Get the mentioned user's name
    const name = event.mentions[mention];
    const tag = { id: mention, tag: name };

    // Array of Banglish messages (expanded with new messages)
    const messages = [
        "Tor ma-re chudi BOSS BAYJID, khanki magi! 🥰",
        "Tor kchi boner bhoda fak kore thutu dimu, madarchod! 😍",
        "Khankir pola, tor ammu-re Atlantic Ocean-e chude masik change kormu! 🙈",
        "Tor boner pjom khule chudi, bastir pola! 🤣",
        "DNA test kor, dekhbi amar chuda tei tor jonmo, jaroj! 💉",
        "Tor ammu-re achar er lobh dekhiye chudi, magir pola! 🤬",
        "Tor boner bhoda-te magur mach chash kormu, khankir put! 😎",
        "Tor ma-re Padma Setu niche 365 din chudi, bastir pola! 🥵",
        "Khankir pola, tor ammu-re gamcha pechiye chudi! 🐰",
        "Tor boner bhoda-te bombai morich diye ghisha dimu! 💔",
        "ভোদাই জানে চোদার মজা তোর মাকে জিজ্ঞেস কর কেমন দিছিলাম চোদা 🥰। নিশি রাতে তোর মাকে চুদে পেয়েছিলাম অনেক আনন্দ।🤩✊🏻",
        "খাংকির পোলা তর কচি বোন রে চুদি 😍..",
        "মাদারচোদ তর আম্মু পম পম খাংকির পো 🐰",
        "খাংকির পোলা তর কচি ভুদায় ভুদায় কামর দিমু 💔! তুর মারে আটলান্টিক মহাসাগরের মাঝামাঝি গলা টিপে ধরে চুদতে চুদতে ভুদার মাসিক চেন্জ করমো 🙈",
        "খাংকি মাগির পোলা কথা ক কম কম তর আম্মু রে চুদে বানামু আইটেম বোম",
        "depression থেকেও তর মাইরে চু*** দি 🤬",
        "তর আম্মু রে আচার এর লোভ দেখিয়ে আমি চুদি মাগির পোলা🤬",
        "বান্দির পোলা তর কচি বোনের ভুদা ফাক কর থুতু দিয়ে ভুদায় দন ডুকামু 🤟",
        "বান্দি মাগির পোলা তর আম্মু রে চুদি তর দুলা ভাই এর কান্দে ফেলে 🤝",
        "উফফফ খাদ্দামা মাগির পোলা তর আম্মুর কালা ভুদায় আমার মাল আউট তর কচি বোন রে উপ্তা করে এবার চুদবো 💉।",
        "অনলাইনে গালি বাজ হয়ে গেছত মাগির পোলা এমন চুদা দিমু লাইফ টাইম মনে রাখভি ʀᴜᴘᴏᴋ তর বাপ মাগির ছেলে 😘।",
        "বাতিজা শুন তর আম্মু রে চুদলে রাগ করবি না তো আচ্ছা জা রাগ করিস না তর আম্মুর কালা ভুদায় আর চুদলাম না তো বোন এর জামা টা খুলে দে ✋",
        "হাই মাদারচোদ তর তর ব্যাশা জাতের আম্মু টা রে আদর করে করে চুদি",
        "মাদারচোদ😍.. এত কথা বাদ চল ২ জন মিলে তর মারে ধষন করি কালা মাগীর পুত ︵❛❛༎ 🦋🖇️🌈🍒-!!",
        "ব্যাশ্যা মাগির পোলা 💔! তর মার কচি ভুদায় ৭০ মণ বাগুন চাষ করমু নডির পুত পাগল ছাগল 💦👄💚🌻💯",
        "পতিতা মাগির পোলা তোর মারে শেখ হাসিনা এর জামাই নরেন্দ্র মোদি কে দিয়ে পুটকি মারি😝🤨🤨",
        "তর মারে চুদি আপনার মারে ভুতের গল্প সুনিয়ে আসতে আসতে শির শির ভাবে চুদতে জায় 👍🥀😂🥀💋",
        "নাট বল্টু মাগির পোলা🤟 তোর মারে পাকিস্তান রাজধানী লাহোর এ নিয়ে উচ্চ শিহ্মায় শিহ্মিত করে চুদবো-))!!🥱🌻🫦💦💯",
        "তর বোন রে পায়জামা খুলে চুদি 🤣",
        "উম্মম্মা তর বোন এরকচি ভুদায়💉।",
        "কামলা মাগির পোলা ✋",
        "বাস্ট্রাড এর বাচ্ছা বস্তির পোলা তোর মাকে গ্রীন লাইন গাড়ির ছাদের উপর ফালিয়ে ভোদার উপর পাড়া দিয়া চুদবো-))!!💦👄🐰💚🌻💯",
        "Welcome মাগির পোলা 🥰। ভোদা জানে চোদার মজা তোর মাকে এখন চুদা হবে",
        "তর কচি বোন এর পম পম😍.. তোর মারে সালমার বিচ্ছেদি গান শুনে মিয়া খলিফার স্টাইলে চুদবো))-!!🌻💙👄",
        "ʜɪ জারজ মাগির পোলা 💔! যৌবনের চেয়ে গরমের জ্বালা বেশি তাই ভক্তের মারে চুদতে এসে ভোদা দিয়ে পারি পরেহহহ্___!!🙂🥵💦",
        "২০ টাকা এ পতিতা মাগির পোলা তোর মাকে ৩৬৫ দিন পদ্মা সেতুন নিচে নিয়ে চুদি 🥵🥰",
        "বস্তির ছেলে অনলাইনের কিং তোর মার ভোদায় উম্মাহ",
        "টুকাই মাগির পোলা🤟 কিরে খানকির ছেলে",
        "উম্মম্মা তর বোন এরকচি ভুদায়💉। আহ আহ তোর মাকে দিচ্ছি ঠাপ",
        "হিজলা মাগির পোলা ✋ 😞😂",
        "Welcome শুয়োরের বাচ্চা 🥰।",
        "কুত্তার বাচ্ছা তর কচি বোন এর পম পম😍..",
        "খাঙ্কিরপোলা পোলা কথা শুন তর আম্মু রে চুদি গামছা পেচিয়ে🐰",
        "খান্কি মাগির পোলা ᴛᴏʀ",
        "তোর বাপে তোর নানা। 🤬",
        "বস্তির ছেলে তোর বইনরে মুসলমানি দিমু।",
        "টুকাই মাগির পোলা মোবাইল ভাইব্রেশন কইরা তুর কচি বোন এর পুকটিতে ভরবো।🤟",
        "তোর মুখে হাইগ্যা দিমু। 🤣",
        "কুত্তার পুকটি চাটামু💉।",
        "তর আম্মুর হোগা দিয়া ট্রেন ভইরা দিমু।।",
        "হিজলা মাগির পোলা হাতির ল্যাওড়া দিয়া তর মায়েরে চুদুম। ✋",
        "তর বোন ভোদা ছিল্লা লবণ লাগায় দিমু।"
    ];

    // Function to send messages
    const sendMsg = (body) => {
        api.sendMessage({ body, mentions: [tag] }, event.threadID, (err) => {
            if (err) console.log("API Error:", err);
        });
    };

    // Send initial message
    sendMsg("তোরে চুদলো BOSS 𝐀𝐬𝐢𝐟, shuru hoilo!");

    // Loop to send 10 messages with increasing delay
    let delay = 3000; // Start with 3 seconds
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const randomMsg = messages[Math.floor(Math.random() * messages.length)]; // Randomize messages
            sendMsg(randomMsg);
        }, delay);
        delay += 2000; // Increase delay by 2 seconds each time
    }

    // Final message after loop
    setTimeout(() => {
        sendMsg("Chuda shesh, khankir pola! Ar chash? 🤖");
    }, delay + 2000);
};
