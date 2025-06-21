module.exports.config = {
    name: "chudi",
    version: "6.0",
    role: 1,
    author: "𝐀𝐬𝐢𝐟",
    description: "Realistic Chat-Style Interaction",
    category: "fun",
    guide: "Mention target user",
    coolDown: 300
};

module.exports.onStart = async function ({ api, args, event }) {
    const mention = Object.keys(event.mentions)[0];
    if (!mention) {
        // Simulate real typing before error message
        api.sendTypingIndicator(event.threadID);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return api.sendMessage("❌ টার্গেট স্পেসিফাই করেনি! কাকে চুদবো? @মেনশন করুন...", event.threadID);
    }

    const name = event.mentions[mention];
    const tag = { id: mention, tag: name };

    // Realistic typing patterns
    const simulateThinking = async (duration = 1500) => {
        api.sendTypingIndicator(event.threadID);
        await new Promise(resolve => setTimeout(resolve, duration));
    };

    // Authentic message timing variations
    const humanizedDelay = (base = 1000) => base + Math.random() * 2000;

    // Message list with realistic variations
    const messages = [
        {text: "তোরে চুদলো BOSS ASIF!", delay: 1200},
        {text: "ভোদাই জানে চোদার মজা তোর মাকে জিজ্ঞেস কর 🥰", delay: 1800},
        {text: "নিশি রাতে তোর মাকে চুদে পেয়েছিলাম অনেক আনন্দ 🤩✊🏻", delay: 2500},
        {text: "খাংকির পোলা তর কচি বোন রে চুদি 😍..", delay: 1100},
        {text: "মাদারচোদ তর আম্মু পম পম খাংকির পো 🐰", delay: 1600},
        {text: "তুর মারে আটলান্টিক মহাসাগরে চুদি 🙈", delay: 2200},
        {text: "খাংকি মাগির পোলা কথা ক কম কম...", delay: 900},
        {text: "তর আম্মু রে চুদে বানামু আইটেম বোম", delay: 1400},
        {text: "depression থেকেও তর মাইরে চু*** দি 🤬", delay: 1900},
        {text: "তর আম্মু রে আচার এর লোভ দেখিয়ে চুদি 🤬", delay: 1300},
        {text: "বান্দির পোলা তর কচি বোনের ভুদা ফাক কর 🤟", delay: 1700},
        {text: "থুতু দিয়ে ভুদায় দন ডুকামু 💦", delay: 800},
        {text: "উফফফ খাদ্দামা মাগির পোলা 💉", delay: 2100},
        {text: "তর আম্মুর কালা ভুদায় আমার মাল আউট", delay: 1500},
        {text: "তর কচি বোন রে উপ্তা করে এবার চুদবো 😈", delay: 2300},
        {text: "অনলাইনে গালি বাজ হয়ে গেছত মাগির পোলা", delay: 1800},
        {text: "এমন চুদা দিমু লাইফ টাইম মনে রাখবি 😘", delay: 1600},
        {text: "বাতিজা শুন...", delay: 1200},
        {text: "তর আম্মু রে চুদলে রাগ করবি না তো? 😏", delay: 2000},
        {text: "আচ্ছা জা রাগ করিস না...", delay: 1100},
        {text: "তর আম্মুর কালা ভুদায় আর চুদলাম না তো", delay: 1900},
        {text: "বোন এর জামা টা খুলে দে ✋", delay: 900},
        {text: "হাই মাদারচোদ 😒", delay: 700},
        {text: "তর ব্যাশা জাতের আম্মু টা রে আদর করে করে চুদি", delay: 2500},
        {text: "চুদা কি আরো খাবি মাগির পোল? 🤖", delay: 1600},
        {text: "ভাগলে তুর মারে তুর বাপ কাকায় সবাই এক লগে চুদে 🌸", delay: 2200},
        {text: "মাদারচোদ 😍..", delay: 600},
        {text: "এত কথা বাদ চল...", delay: 1000},
        {text: "২ জন মিলে তর মারে ধষন করি 🦋", delay: 1800},
        {text: "ব্যাশ্যা মাগির পোলা  💔!", delay: 800},
        {text: "তর মার কচি ভুদায় ৭০ মণ বাগুন চাষ করমু 💦", delay: 2100},
        {text: "পতিতা মাগির পোলা ____", delay: 1200},
        {text: "তোর মাকে শেখ হাসিনা এর জামাই নরেন্দ্র মোদি কে দিয়ে পুটকি মারি😝", delay: 2800},
        {text: "তর মারে চুদি__", delay: 700},
        {text: "আপনার মারে ভুতের গল্প সুনিয়ে আসতে আসতে...", delay: 1800},
        {text: "শির শির ভাবে চুদতে জায় 👍", delay: 900},
        {text: "তর বোন রে পায়জামা খুলে চুদি 🤣", delay: 1300},
        {text: "উম্মম্মা তর বোন এরকচি ভুদায়💉", delay: 1100},
        {text: "DNA টেষ্ট করা দেখবি আমার চুদা তেই তর জন্ম।", delay: 2200},
        {text: "কামলা মাগির পোলা  ✋", delay: 600},
        {text: "Welcome মাগির পোলা 🥰", delay: 800},
        {text: "ভোদা জানে চোদার মজা তোর মাকে এখন চুদা হবে", delay: 2000},
        {text: "তর কচি বোন এর পম পম😍..", delay: 1200},
        {text: "তোর মারে সালমার বিচ্ছেদি গান শুনে চুদবো))-!!", delay: 2400},
        {text: "২০ টাকা এ পতিতা মাগির পোলা __", delay: 1500},
        {text: "তোর মাকে ৩৬৫ দিন পদ্মা সেতুন নিচে নিয়ে চুদি 🥵", delay: 2300},
        {text: "বস্তির ছেলে অনলাইনের কিং__", delay: 1100},
        {text: "তোর মার ভোদায় উম্মাহ", delay: 900},
        {text: "তর আম্মু রে পায়জামা খুলে চুদি 🤣", delay: 1300},
        {text: "আহ আহ তোর মাকে দিচ্ছি ঠাপ 😂", delay: 800},
        {text: "হিজলা মাগির পোলা  ✋", delay: 700},
        {text: "তর মায়েরে হাতির ল্যাওড়া দিয়া চুদুম", delay: 1900},
        {text: "তর বোন ভোদা ছিল্লা লবণ লাগায় দিমু", delay: 1600},
        {text: "ফাটা কন্ডমের ফসল। জা ভাগ🤖", delay: 1000}
    ];

    // Start sequence
    await simulateThinking(3000);
    api.sendMessage({ 
        body: `💬 ${name} -কে চোদা সেশন শুরু...\n▰▰▰▱▱▱▱▱▱ 30% লোডিং`,
        mentions: [tag]
    }, event.threadID);

    // Realistic message delivery
    for (let i = 0; i < messages.length; i++) {
        await simulateThinking(messages[i].delay);
        
        // Simulate message composition errors
        let messageText = messages[i].text;
        if (Math.random() > 0.8) {
            messageText = messageText
                .replace(/\s+\S{0,3}$/, '') // Trim last word
                + '...';
            
            await simulateThinking(800);
            
            // Send correction
            api.sendMessage({
                body: `✏️ ${messageText.replace('...', '') + name}`,
                mentions: [tag]
            }, event.threadID);
            
            await simulateThinking(600);
            messageText = messages[i].text; // Original text
        }
        
        // Send main message
        api.sendMessage({
            body: `${messageText} ${name}`,
            mentions: [tag]
        }, event.threadID);

        // Simulate network delay
        if (Math.random() > 0.7) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            api.sendMessage({
                body: "📶 নেটওয়ার্ক কানেকশন সমস্যা... পুনরায় চেষ্টা করা হচ্ছে",
            }, event.threadID);
            await simulateThinking(2500);
        }

        // Show progress
        if ((i + 1) % 5 === 0) {
            const progress = Math.min(100, Math.floor((i + 1) / messages.length * 100));
            await simulateThinking(800);
            api.sendMessage({
                body: `🔄 প্রোগ্রেস: ${progress}% সম্পূর্ণ\n${'▰'.repeat(progress/10)}${'▱'.repeat(10 - progress/10)}`
            }, event.threadID);
        }
    }

    // Final sequence
    await simulateThinking(4000);
    api.sendMessage({
        body: `✅ চুদা সেশন সম্পূর্ণ! ${name}-এর অবস্থা:\n\n` +
              "┏━━━━━━━━━━━━━━━━━━━┓\n" +
              "☠️ Totally roasted!\n" +
              "💔 Status: Offline\n" +
              "┗━━━━━━━━━━━━━━━━━━━┛\n\n" +
              "⌚️ সময়: " + new Date().toLocaleTimeString() + "\n" +
              "🔢 টোটাল মেসেজ: " + messages.length + "\n" +
              "⚡️ এনার্জি কনজিউমড: 100%"
    }, event.threadID);

    // Simulate app notification
    await new Promise(resolve => setTimeout(resolve, 5000));
    api.sendMessage({
        body: "📲 নোটিফিকেশন: 'চুদা সেশন' সম্পূর্ণ হয়েছে!",
    }, event.threadID);
};
