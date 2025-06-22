const axios = require('axios');
const fs = require('fs-extra');
const { getStreamFromURL } = global.utils;

const pathDir = __dirname + '/assets/hubble';
const pathData = pathDir + '/nasa.json';

if (!fs.existsSync(pathDir)) 
    fs.mkdirSync(pathDir, { recursive: true });

let hubbleData;

module.exports = {
    config: {
        name: "hubble",
        version: "2.0",
        author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
        countDown: 5,
        role: 0,
        description: {
            en: "View Hubble Space Telescope images",
            bn: "Hubble মহাকাশ টেলিস্কোপের ছবি দেখুন"
        },
        category: "owner",
        guide: {
            en: "{pn} <date (mm-dd)>",
            bn: "{pn} <তারিখ (মাস-দিন)>"
        }
    },

    langs: {
        en: {
            invalidDate: "The date you entered is invalid, please enter again in the mm-dd format",
            noImage: "No images were found on this day",
            error: "Sorry, an error occurred while processing your request"
        },
        bn: {
            invalidDate: "আপনার দেওয়া তারিখটি সঠিক নয়, অনুগ্রহ করে মাস-দিন ফরম্যাটে আবার লিখুন",
            noImage: "এই দিনে কোন ছবি পাওয়া যায়নি",
            error: "দুঃখিত, আপনার অনুরোধ প্রক্রিয়া করার সময় একটি ত্রুটি ঘটেছে"
        }
    },

    onLoad: async function () {
        try {
            if (!fs.existsSync(pathData)) {
                const res = await axios.get(
                    'https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/scripts/cmds/assets/hubble/nasa.json',
                    { timeout: 10000 }
                );
                fs.writeFileSync(pathData, JSON.stringify(res.data, null, 2));
            }
            hubbleData = JSON.parse(fs.readFileSync(pathData));
        }
        catch (err) {
            console.error("[Hubble Command] Initialization error:", err);
        }
    },

    onStart: async function ({ message, args, getLang }) {
        try {
            const date = args[0] || "";
            if (!date) {
                return message.reply(getLang('invalidDate'));
            }

            const dateText = checkValidDate(date);
            if (!dateText) {
                return message.reply(getLang('invalidDate'));
            }

            const data = hubbleData.find(e => e.date.startsWith(dateText));
            if (!data) {
                return message.reply(getLang('noImage'));
            }

            const { image, name, caption, url } = data;
            const imgUrl = 'https://imagine.gsfc.nasa.gov/hst_bday/images/' + image;
            
            message.reply({
                body: `📅 তারিখ: ${dateText}\n🌀 নাম: ${name}\n📖 বিবরণ: ${caption}\n🔗 সোর্স: ${url}`,
                attachment: await getStreamFromURL(imgUrl)
            });
        }
        catch (err) {
            console.error("[Hubble Command] Execution error:", err);
            message.reply(getLang('error'));
        }
    }
};

const monthText = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

function checkValidDate(date) {
    const dateArr = date.split(/[-/]/);
    if (dateArr.length !== 2) return null;

    let [a, b] = dateArr.map(x => parseInt(x));
    if (isNaN(a) || isNaN(b)) return null;

    let month, day;
    if (a <= 12 && b <= 31) {
        month = a;
        day = b;
    } 
    else if (b <= 12 && a <= 31) {
        month = b;
        day = a;
    }
    else {
        return null;
    }

    // Validate date ranges
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (month === 2 && day > 29) return null;
    if ([4, 6, 9, 11].includes(month) && day > 30) return null;

    return `${monthText[month - 1]} ${day}`;
}
