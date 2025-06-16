const axios = require("axios");

module.exports = {
    config: {
        name: "bored",
        version: "2.0",
        author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
        countdown: 2,
        role: 0,
        category: "fun",
        shortDescription: {
            en: "Get a suggestion when you're bored",
            bn: "Boring lagle kichu korar suggestion paben"
        },
        longDescription: {
            en: "Bot will suggest you an activity to do when you're bored.",
            bn: "Bot apnake kichu moja korar suggestion debe jokhon apni boring feel korben."
        },
        guide: {
            en: "Type {pn} to get a suggestion.",
            bn: "Lekhun {pn} ekta moja idea pete."
        }
    },

    langs: {
        en: {
            suggestion: "How about: %1?",
            error: "Sorry, the API is not responding. Please try again later."
        },
        bn: {
            suggestion: "Apni eta korte paren: %1",
            error: "Maaf korun, API response dicchena. Poroborti te chesta korun."
        }
    },

    onStart: async function({ api, args, message, getLang, event }) {
        try {
            const res = await axios.get("https://www.boredapi.com/api/activity/");
            const activity = res.data.activity;
            const langCode = global.GoatBot?.language || "en";
            return message.reply(getLang("suggestion", activity));
        } catch (err) {
            console.error("[BORED API ERROR]", err.message);
            return message.reply(getLang("error"));
        }
    }
};
