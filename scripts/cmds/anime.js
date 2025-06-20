const axios = require('axios');

module.exports = {
    config: {
        name: "anime",
        version: "3.1",
        author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & KSHITIZ",
        countDown: 5,
        role: 0,
        shortDescription: { 
            en: "✨ AI-Powered Anime Recommendation System" 
        },
        longDescription: { 
            en: "⚡ Get personalized anime suggestions with rich metadata using Jikan API + fallback database" 
        },
        category: "⏳ Entertainment",
        guide: {
            en: "{p}anime [genre] [1-5]\n✦ Genres: shonen | seinen | isekai | scifi"
        }
    },

    lastRecommendations: {},

    onStart: async function ({ api, args, message, event }) {
        // ========== ☣️ ATOMIC DESIGN SYSTEM ========== //
        const atomic = {
            loading: "🔄 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐑𝐞𝐜𝐨𝐦𝐦𝐞𝐧𝐝𝐚𝐭𝐢𝐨𝐧𝐬...",
            error: "⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐆𝐞𝐧𝐫𝐞!",
            limit: "⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐜𝐡𝐨𝐨𝐬𝐞 𝟏-𝟓 𝐫𝐞𝐜𝐨𝐦𝐦𝐞𝐧𝐝𝐚𝐭𝐢𝐨𝐧𝐬 𝐨𝐧𝐥𝐲!",
            header: "✨ 𝗔𝗡𝗜𝗠𝗘 𝗥𝗘𝗖𝗢𝗠𝗠𝗘𝗡𝗗𝗔𝗧𝗜𝗢𝗡 𝗦𝗬𝗦𝗧𝗘𝗠 ✨",
            footer: "\n⚡ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐉𝐢𝐤𝐚𝐧 𝐀𝐏𝐈 | ☣️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐕𝟑.𝟏",
            apiFail: "🌐 𝐀𝐏𝐈 𝐔𝐧𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞! 𝐔𝐬𝐢𝐧𝐠 𝐅𝐚𝐥𝐥𝐛𝐚𝐜𝐤 𝐃𝐚𝐭𝐚...",
            divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬"
        };

        // ========== 🗃️ ATOMIC ANIME DATABASE (WITH DRIVE LINKS) ========== //
        const animeDB = {
            shonen: [
                { animeName: "Naruto", imageUrl: "https://drive.google.com/uc?export=download&id=1OP2zmycLmFihRISVLzFwrw__LRBsF9GN" },
                { animeName: "One Piece", imageUrl: "https://drive.google.com/uc?export=download&id=1QaK3EfNmbwAgpJm4czY8n8QRau9MXoaR" },
                { animeName: "Dragon Ball Z", imageUrl: "https://drive.google.com/uc?export=download&id=1q-8lFZD5uPmhRySvT75Bgsr2lp9UQ4Mi" },
                { animeName: "Bleach", imageUrl: "https://drive.google.com/uc?export=download&id=1bds-i6swtqi2k4YCoglPKTV7kL7f-SF7" },
                { animeName: "My Hero Academia", imageUrl: "https://drive.google.com/uc?export=download&id=1uOcTZ8r1zDGmqF9Nyg1vupuWHKEg1eVf" },
                { animeName: "Attack on Titan", imageUrl: "https://drive.google.com/uc?export=download&id=1DrBwp7irJrW_DVmIXHbNvFjofHCTmZ0a" },
                { animeName: "Hunter x Hunter", imageUrl: "https://drive.google.com/uc?export=download&id=1W4RHPv1zWtFUGFVUJ0uiCxvP5ovpURHG" },
                { animeName: "Fullmetal Alchemist: Brotherhood", imageUrl: "https://drive.google.com/uc?export=download&id=1C-pRqtjpCFFPSZf8xAsNLgn9VgZBUgu6" },
                { animeName: "Demon Slayer: Kimetsu no Yaiba", imageUrl: "https://drive.google.com/uc?export=download&id=1vU5XMLgKwBPfsiheUF4SK79LfKbzU6NX" },
                { animeName: "Death Note", imageUrl: "https://drive.google.com/uc?export=download&id=1tUJEum_tf79gj9420mHx-_q7f0QP27DC" },
                { animeName: "Yu Yu Hakusho", imageUrl: "https://drive.google.com/uc?export=download&id=1JL07gw2S4f6T_d9ufWDnNkDme3zqOuLU" },
                { animeName: "Fairy Tail", imageUrl: "https://drive.google.com/uc?export=download&id=13WKaqx8rdmwZE7VDWRK0fFkk8zkA7AOi" },
                { animeName: "One Punch Man", imageUrl: "https://drive.google.com/uc?export=download&id=10KOnQyrli8HPaeThalyN3KA2yX0T28Uj" },
                { animeName: "Sword Art Online", imageUrl: "https://drive.google.com/uc?export=download&id=1JxczwxBgreEc4tZdLTdFHh6klsvlCYkM" },
                { animeName: "JoJo's Bizarre Adventure", imageUrl: "https://drive.google.com/uc?export=download&id=1aKzkrSAYAPXNIPhazTT6pkQxJpdQOD2p" },
                { animeName: "Dragon Ball", imageUrl: "https://drive.google.com/uc?export=download&id=1oonrlOFBjdYLV2zv9V-oB0AenGH4HNr2" },
                { animeName: "Haikyuu!!", imageUrl: "https://drive.google.com/uc?export=download&id=1tFHwCTNgoLHi34YL6fdXq2taZINZERHR" },
                { animeName: "Black Clover", imageUrl: "https://drive.google.com/uc?export=download&id=1ecenM1HVzgPtwaN8eISfxwBB-uKqdZoj" },
                { animeName: "The Seven Deadly Sins", imageUrl: "https://drive.google.com/uc?export=download&id=1FzV9FwXri9xxwAy-xrlA8zA6dyO70tkf" },
                { animeName: "Mob Psycho 100", imageUrl: "https://drive.google.com/uc?export=download&id=1qBXCvbhENmyC05vLHQLFJR-xlf5HhZzF" },
                { animeName: "Assassination Classroom", imageUrl: "https://drive.google.com/uc?export=download&id=13IP6cwdimzHv3nUJi-kODbGKIAHpJEAy" },
                { animeName: "Toriko", imageUrl: "https://drive.google.com/uc?export=download&id=1Gu6us6Ue5530ynkpFu-vsGOCynq_o6EI" },
                { animeName: "Blue Exorcist", imageUrl: "https://drive.google.com/uc?export=download&id=1f8CGrENwaHOgy11yeNdPwDI_nzpcESky" },
                { animeName: "Noragami", imageUrl: "https://drive.google.com/uc?export=download&id=1PxUiu6ZhJT5btIAWNubNPD3cQPNWnvYp" },
                { animeName: "Gurren Lagann", imageUrl: "https://drive.google.com/uc?export=download&id=1o57c1C7yXr_RDHz0lAH9lWJUgpMzQn1x" },
                { animeName: "Magi: The Labyrinth of Magic", imageUrl: "https://drive.google.com/uc?export=download&id=1hQEdeO3F8v1sZQvZ6uh5n_YTwuizYt0v" },
                { animeName: "Beelzebub", imageUrl: "https://drive.google.com/uc?export=download&id=1Lz3PNL1X4ygv1U7xcFgILYODtGiwaGn9" },
                { animeName: "Fire Force", imageUrl: "https://drive.google.com/uc?export=download&id=11vryRMTkLuFvhlWjVZkuAaS0QoesIlwo" },
                { animeName: "The Rising of the Shield Hero", imageUrl: "https://drive.google.com/uc?export=download&id=1oRD7AAH_VD73o8kUlUaJQC1dFTrV1nDz" },
                { animeName: "Dr. Stone", imageUrl: "https://drive.google.com/uc?export=download&id=1jpb7fFDZpdHjACghQWUQopI0nzzvzrxY" },
                { animeName: "The Promised Neverland", imageUrl: "https://drive.google.com/uc?export=download&id=1AREnLG7w6VSdKuTi-gtnb39aoV8XdUXV" },
                { animeName: "World Trigger", imageUrl: "https://drive.google.com/uc?export=download&id=1yo-18brlycFf_ieBoWrUXXpAoUP3aUUX" },
                { animeName: "Kuroko's Basketball", imageUrl: "https://drive.google.com/uc?export=download&id=10DLx4o4V_aC9IoQyJmhd5as6bbyYzUFD" },
                { animeName: "K-On!", imageUrl: "https://drive.google.com/uc?export=download&id=1lR87igFhcRilVCky_0dzRT7TwQwd0ROt" },
                { animeName: "Durarara!!", imageUrl: "https://drive.google.com/uc?export=download&id=1OPE1Iva4JcoZkBUM8A2RokUuNwmAFXVu" },
                { animeName: "D.Gray-man", imageUrl: "https://drive.google.com/uc?export=download&id=1A6GOPhwuUZONyQvNjXtd8v5uhVuJ4a9N" },
                { animeName: "Seraph of the End", imageUrl: "https://drive.google.com/uc?export=download&id=1w77GthKwlhZlyPWHzg3adtiqRJ9znLeR" },
                { animeName: "Gintama", imageUrl: "https://drive.google.com/uc?export=download&id=1UCaRajoK2ZprPAWNWK7aRQhHDirY3-Hs" },
                { animeName: "Air Gear", imageUrl: "https://drive.google.com/uc?export=download&id=1dfTNijY40l_CZHhP__yd-v_RozKtwHw_" },
                { animeName: "Hajime no Ippo", imageUrl: "https://drive.google.com/uc?export=download&id=1cASzbVsNR-YXv02ZLdVvL-6Fsoc2B1FJ" },
                { animeName: "Rurouni Kenshin", imageUrl: "https://drive.google.com/uc?export=download&id=1MA1_270eyhBkMRF001wE2QWoq0_6EjpK" },
                { animeName: "Yu-Gi-Oh!", imageUrl: "https://drive.google.com/uc?export=download&id=19g-LMWLAhWPNbbjXrzk22ai3qFen9QXt" },
                { animeName: "Katekyo Hitman Reborn!", imageUrl: "https://drive.google.com/uc?export=download&id=1Qq-AGdBalodBDmQcY6iPC4kUUS0z7A73" },
                { animeName: "Shaman King", imageUrl: "https://drive.google.com/uc?export=download&id=1mW49sTK7YwyLE1MY-6z64mYbPE7iDlsl" },
                { animeName: "Neon Genesis Evangelion", imageUrl: "https://drive.google.com/uc?export=download&id=1dp3Pe3Ckbu6MsnlAEj5QsbQrp6chTe-p" },
                { animeName: "Blue Dragon", imageUrl: "https://drive.google.com/uc?export=download&id=1dKXAveL6LyBgClgscDrAa-doaavwXtdq" },
                { animeName: "Zatch Bell!", imageUrl: "https://drive.google.com/uc?export=download&id=1RTRPU9yF3tIfzG-rNWljdfzzLgxgxEVk" },
                { animeName: "Eyeshield 21", imageUrl: "https://drive.google.com/uc?export=download&id=1e0XOffNUQtfQDwOLZ0e7IwlBOneZdOZo" },
                { animeName: "Kenichi: The Mightiest Disciple", imageUrl: "https://drive.google.com/uc?export=download&id=1DysZxKEN_QSfMjB3DDOR-iWHFshmae_Y" },
                { animeName: "Beyblade", imageUrl: "https://drive.google.com/uc?export=download&id=14UrkjjLC2595N5yUClXRxsjq3x81unHU" }
            ],
            seinen: [
                { animeName: "Berserk", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Cowboy Bebop", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Hellsing", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Black Lagoon", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Ghost in the Shell: Stand Alone Complex", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Psycho-Pass", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Monster", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Death Parade", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Vinland Saga", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Paranoia Agent", imageUrl: "https://example.com/placeholder.jpg" }
            ],
            isekai: [
                { animeName: "Re:Zero - Starting Life in Another World", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Sword Art Online", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "No Game No Life", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Overlord", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Log Horizon", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "The Rising of the Shield Hero", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "That Time I Got Reincarnated as a Slime", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "KonoSuba: God's Blessing on This Wonderful World!", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "The Devil Is a Part-Timer!", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Grimgar, Ashes and Illusions", imageUrl: "https://example.com/placeholder.jpg" }
            ],
            scifi: [
                { animeName: "Cowboy Bebop", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Ghost in the Shell: Stand Alone Complex", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Neon Genesis Evangelion", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Steins;Gate", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Psycho-Pass", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Serial Experiments Lain", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Ergo Proxy", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Space Dandy", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Planetes", imageUrl: "https://example.com/placeholder.jpg" },
                { animeName: "Aldnoah.Zero", imageUrl: "https://example.com/placeholder.jpg" }
            ]
        };

        // ========== ⚙️ MAIN EXECUTION ========== //
        try {
            // Initial loading message with typing indicator simulation
            const loadingMsg = await message.reply(`✍️ ${atomic.loading}`);
            
            // Handle empty arguments
            if (args.length === 0) {
                await api.unsendMessage(loadingMsg.messageID);
                return message.reply(
                    `${atomic.header}\n\n` +
                    "📝 𝗨𝗦𝗔𝗚𝗘 𝗚𝗨𝗜𝗗𝗘:\n`anime [genre] [1-5]`\n\n" +
                    "🎭 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗚𝗘𝗡𝗥𝗘𝗦:\n" +
                    "• Shonen 🔥\n• Seinen 🧠\n• Isekai 🌌\n• Scifi 🤖\n\n" +
                    `${atomic.divider}\n` +
                    `𝗘𝘅𝗮𝗺𝗽𝗹𝗲: 𝖺𝗇𝗂𝗆𝖾 𝗌𝖼𝗂𝖿𝗂 𝟥\n${atomic.footer}`
                );
            }

            const genre = args[0].toLowerCase();
            let recCount = 1;

            // Validate genre input
            if (!animeDB[genre]) {
                await api.unsendMessage(loadingMsg.messageID);
                return message.reply(
                    `❌ ${atomic.error}\n` +
                    `📌 𝗩𝗮𝗹𝗶𝗱 𝗴𝗲𝗻𝗿𝗲𝘀: ${Object.keys(animeDB).join(", ")}\n` +
                    `${atomic.divider}\n` +
                    `𝗧𝗶𝗽: 𝖳𝗒𝗉𝖾 "𝖺𝗇𝗂𝗆𝖾" 𝖺𝗅𝗈𝗇𝖾 𝖿𝗈𝗋 𝗎𝗌𝖺𝗀𝖾 𝗀𝗎𝗂𝖽𝖾`
                );
            }

            // Validate recommendation count
            if (args[1] && !isNaN(args[1])) {
                recCount = parseInt(args[1]);
                if (recCount < 1 || recCount > 5) {
                    await api.unsendMessage(loadingMsg.messageID);
                    return message.reply(`⛔ ${atomic.limit}`);
                }
            }

            // Genre to API ID mapping
            const genreMap = { 
                shonen: 1, 
                seinen: 42, 
                isekai: 62, 
                scifi: 24 
            };

            let recommendations = [];
            let apiFailed = false;

            try {
                // Fetch from Jikan API
                const { data } = await axios.get(
                    `https://api.jikan.moe/v4/anime?genres=${genreMap[genre]}&limit=20`,
                    { timeout: 8000 }
                );
                
                recommendations = data.data.map(anime => ({
                    title: anime.title,
                    image: anime.images?.jpg?.large_image_url || "",
                    score: anime.score,
                    episodes: anime.episodes,
                    year: anime.year,
                    synopsis: anime.synopsis?.substring(0, 150) + '...' || "No description available"
                })).filter(item => item.image !== "");
                
                // Add fallback if API returns empty
                if (recommendations.length === 0) throw new Error("Empty API response");
            } catch (apiError) {
                apiFailed = true;
                // Fallback to local database
                recommendations = animeDB[genre].map(entry => ({
                    title: entry.animeName,
                    image: entry.imageUrl,
                    score: null
                }));
            }

            // Deduplication system
            this.lastRecommendations[event.threadID] = this.lastRecommendations[event.threadID] || {};
            this.lastRecommendations[event.threadID][genre] = this.lastRecommendations[event.threadID][genre] || [];
            
            const availableRecs = recommendations.filter(
                (_, index) => !this.lastRecommendations[event.threadID][genre].includes(index)
            );

            // Select random recommendations
            const selected = [];
            while (selected.length < recCount && availableRecs.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableRecs.length);
                selected.push(availableRecs[randomIndex]);
                availableRecs.splice(randomIndex, 1);
                this.lastRecommendations[event.threadID][genre].push(randomIndex);
                
                // Maintain history buffer
                if (this.lastRecommendations[event.threadID][genre].length > 10) {
                    this.lastRecommendations[event.threadID][genre].shift();
                }
            }

            // Send results
            await api.unsendMessage(loadingMsg.messageID);
            
            if (selected.length === 0) {
                return message.reply(
                    `⚠️ 𝗡𝗼 𝗻𝗲𝘄 𝗿𝗲𝗰𝗼𝗺𝗺𝗲𝗻𝗱𝗮𝘁𝗶𝗼𝗻𝘀 𝗳𝗼𝘂𝗻𝗱!\n` +
                    `𝗧𝗿𝘆 𝗮 𝗱𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝘁 𝗴𝗲𝗻𝗿𝗲 𝗼𝗿 𝗰𝗵𝗲𝗰𝗸 𝗯𝗮𝗰𝗸 𝗹𝗮𝘁𝗲𝗿.`
                );
            }

            for (const anime of selected) {
                try {
                    let stream = null;
                    
                    // Only try to get stream if image URL is valid
                    if (anime.image && !anime.image.includes("example.com")) {
                        stream = await global.utils.getStreamFromURL(anime.image);
                    }
                    
                    const rating = anime.score ? `⭐ ${anime.score}/10 | ` : "";
                    const yearInfo = anime.year ? `🗓️ ${anime.year} | ` : "";
                    const episodeInfo = anime.episodes ? `📀 ${anime.episodes} eps` : "";
                    
                    const messageBody = `${atomic.header}\n` +
                              `${atomic.divider}\n` +
                              `🎌 𝗚𝗲𝗻𝗿𝗲: #${genre.toUpperCase()}\n` +
                              `🎬 𝗧𝗶𝘁𝗹𝗲: 《${anime.title}》\n` +
                              `${atomic.divider}\n` +
                              `${rating}${yearInfo}${episodeInfo}\n` +
                              `📝 𝗦𝘆𝗻𝗼𝗽𝘀𝗶𝘀: ${anime.synopsis || "Not available"}\n` +
                              `${atomic.divider}\n` +
                              `${apiFailed ? atomic.apiFail + '\n' : ''}${atomic.footer}`;
                    
                    if (stream) {
                        await message.reply({
                            body: messageBody,
                            attachment: stream
                        });
                    } else {
                        await message.reply(messageBody);
                    }
                } catch (attachmentError) {
                    await message.reply(
                        `🎌 𝗚𝗲𝗻𝗿𝗲: #${genre.toUpperCase()}\n` +
                        `🎬 𝗧𝗶𝘁𝗹𝗲: 《${anime.title}》\n` +
                        `${atomic.divider}\n` +
                        `⚠️ 𝗜𝗺𝗮𝗴𝗲 𝗹𝗼𝗮𝗱 𝗳𝗮𝗶𝗹𝗲𝗱 | ${atomic.footer}`
                    );
                }
            }

        } catch (finalError) {
            console.error("☢️ System Failure:", finalError);
            await message.reply(
                "❌ 𝗖𝗿𝗶𝘁𝗶𝗰𝗮𝗹 𝗦𝘆𝘀𝘁𝗲𝗺 𝗘𝗿𝗿𝗼𝗿\n" +
                "𝗧𝗵𝗲 𝗿𝗲𝗰𝗼𝗺𝗺𝗲𝗻𝗱𝗮𝘁𝗶𝗼𝗻 𝗲𝗻𝗴𝗶𝗻𝗲 𝗳𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗿𝗲𝘀𝗽𝗼𝗻𝗱.\n" +
                "𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿."
            );
        }
    }
};
