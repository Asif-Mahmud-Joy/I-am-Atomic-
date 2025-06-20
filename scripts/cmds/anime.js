const axios = require('axios');

module.exports = {
    config: {
        name: "anime",
        version: "3.2",
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
            loading: "🔄 Generating recommendations...",
            error: "⚠️ Invalid genre!",
            limit: "⚠️ Please choose 1-5 recommendations only!",
            header: "✨ ANIME RECOMMENDATION SYSTEM ✨",
            footer: "⚡ Powered by Jikan API | ☣️ ATOMIC v3.2",
            apiFail: "🌐 API unavailable! Using fallback data...",
            divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬"
        };

        // ========== 🗃️ ANIME DATABASE WITH DRIVE LINKS ========== //
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
                { animeName: "Berserk", imageUrl: "https://drive.google.com/uc?export=download&id=1OP2zmycLmFihRISVLzFwrw__LRBsF9GN" },
                { animeName: "Cowboy Bebop", imageUrl: "https://drive.google.com/uc?export=download&id=1QaK3EfNmbwAgpJm4czY8n8QRau9MXoaR" },
                { animeName: "Hellsing", imageUrl: "https://drive.google.com/uc?export=download&id=1q-8lFZD5uPmhRySvT75Bgsr2lp9UQ4Mi" },
                { animeName: "Black Lagoon", imageUrl: "https://drive.google.com/uc?export=download&id=1bds-i6swtqi2k4YCoglPKTV7kL7f-SF7" },
                { animeName: "Ghost in the Shell: Stand Alone Complex", imageUrl: "https://drive.google.com/uc?export=download&id=1uOcTZ8r1zDGmqF9Nyg1vupuWHKEg1eVf" },
                { animeName: "Psycho-Pass", imageUrl: "https://drive.google.com/uc?export=download&id=1DrBwp7irJrW_DVmIXHbNvFjofHCTmZ0a" },
                { animeName: "Monster", imageUrl: "https://drive.google.com/uc?export=download&id=1W4RHPv1zWtFUGFVUJ0uiCxvP5ovpURHG" },
                { animeName: "Death Parade", imageUrl: "https://drive.google.com/uc?export=download&id=1C-pRqtjpCFFPSZf8xAsNLgn9VgZBUgu6" },
                { animeName: "Vinland Saga", imageUrl: "https://drive.google.com/uc?export=download&id=1vU5XMLgKwBPfsiheUF4SK79LfKbzU6NX" },
                { animeName: "Paranoia Agent", imageUrl: "https://drive.google.com/uc?export=download&id=1tUJEum_tf79gj9420mHx-_q7f0QP27DC" }
            ],
            isekai: [
                { animeName: "Re:Zero - Starting Life in Another World", imageUrl: "https://drive.google.com/uc?export=download&id=1JL07gw2S4f6T_d9ufWDnNkDme3zqOuLU" },
                { animeName: "Sword Art Online", imageUrl: "https://drive.google.com/uc?export=download&id=13WKaqx8rdmwZE7VDWRK0fFkk8zkA7AOi" },
                { animeName: "No Game No Life", imageUrl: "https://drive.google.com/uc?export=download&id=10KOnQyrli8HPaeThalyN3KA2yX0T28Uj" },
                { animeName: "Overlord", imageUrl: "https://drive.google.com/uc?export=download&id=1JxczwxBgreEc4tZdLTdFHh6klsvlCYkM" },
                { animeName: "Log Horizon", imageUrl: "https://drive.google.com/uc?export=download&id=1aKzkrSAYAPXNIPhazTT6pkQxJpdQOD2p" },
                { animeName: "The Rising of the Shield Hero", imageUrl: "https://drive.google.com/uc?export=download&id=1oonrlOFBjdYLV2zv9V-oB0AenGH4HNr2" },
                { animeName: "That Time I Got Reincarnated as a Slime", imageUrl: "https://drive.google.com/uc?export=download&id=1tFHwCTNgoLHi34YL6fdXq2taZINZERHR" },
                { animeName: "KonoSuba: God's Blessing on This Wonderful World!", imageUrl: "https://drive.google.com/uc?export=download&id=1ecenM1HVzgPtwaN8eISfxwBB-uKqdZoj" },
                { animeName: "The Devil Is a Part-Timer!", imageUrl: "https://drive.google.com/uc?export=download&id=1FzV9FwXri9xxwAy-xrlA8zA6dyO70tkf" },
                { animeName: "Grimgar, Ashes and Illusions", imageUrl: "https://drive.google.com/uc?export=download&id=1qBXCvbhENmyC05vLHQLFJR-xlf5HhZzF" }
            ],
            scifi: [
                { animeName: "Cowboy Bebop", imageUrl: "https://drive.google.com/uc?export=download&id=13IP6cwdimzHv3nUJi-kODbGKIAHpJEAy" },
                { animeName: "Ghost in the Shell: Stand Alone Complex", imageUrl: "https://drive.google.com/uc?export=download&id=1Gu6us6Ue5530ynkpFu-vsGOCynq_o6EI" },
                { animeName: "Neon Genesis Evangelion", imageUrl: "https://drive.google.com/uc?export=download&id=1f8CGrENwaHOgy11yeNdPwDI_nzpcESky" },
                { animeName: "Steins;Gate", imageUrl: "https://drive.google.com/uc?export=download&id=1PxUiu6ZhJT5btIAWNubNPD3cQPNWnvYp" },
                { animeName: "Psycho-Pass", imageUrl: "https://drive.google.com/uc?export=download&id=1o57c1C7yXr_RDHz0lAH9lWJUgpMzQn1x" },
                { animeName: "Serial Experiments Lain", imageUrl: "https://drive.google.com/uc?export=download&id=1hQEdeO3F8v1sZQvZ6uh5n_YTwuizYt0v" },
                { animeName: "Ergo Proxy", imageUrl: "https://drive.google.com/uc?export=download&id=1Lz3PNL1X4ygv1U7xcFgILYODtGiwaGn9" },
                { animeName: "Space Dandy", imageUrl: "https://drive.google.com/uc?export=download&id=11vryRMTkLuFvhlWjVZkuAaS0QoesIlwo" },
                { animeName: "Planetes", imageUrl: "https://drive.google.com/uc?export=download&id=1oRD7AAH_VD73o8kUlUaJQC1dFTrV1nDz" },
                { animeName: "Aldnoah.Zero", imageUrl: "https://drive.google.com/uc?export=download&id=1jpb7fFDZpdHjACghQWUQopI0nzzvzrxY" }
            ]
        };

        // ========== ⚙️ MAIN FUNCTIONALITY ========== //
        try {
            const loadingMsg = await message.reply(atomic.loading);
            
            // No arguments provided
            if (args.length === 0) {
                await api.unsendMessage(loadingMsg.messageID);
                return message.reply(
                    `${atomic.header}\n${atomic.divider}\n` +
                    "📝 **USAGE GUIDE**\n`anime [genre] [1-5]`\n\n" +
                    "🎭 **AVAILABLE GENRES**\n" +
                    "• Shonen 🔥\n• Seinen 🧠\n• Isekai 🌌\n• Scifi 🤖\n\n" +
                    `${atomic.divider}\n` +
                    `**Example:** anime scifi 3\n${atomic.footer}`
                );
            }

            const genre = args[0].toLowerCase();
            let recCount = 1;

            // Validate genre
            if (!animeDB[genre]) {
                await api.unsendMessage(loadingMsg.messageID);
                return message.reply(
                    `${atomic.error}\n` +
                    `📌 Valid genres: ${Object.keys(animeDB).join(", ")}\n` +
                    `${atomic.divider}\n` +
                    `Tip: Type "anime" alone for usage guide`
                );
            }

            // Validate recommendation count
            if (args[1] && !isNaN(args[1])) {
                recCount = parseInt(args[1]);
                if (recCount < 1 || recCount > 5) {
                    await api.unsendMessage(loadingMsg.messageID);
                    return message.reply(atomic.limit);
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
                    synopsis: anime.synopsis?.substring(0, 100) + '...' || "No description available"
                })).filter(item => item.image);
                
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
                return message.reply("⚠️ No new recommendations found! Try a different genre.");
            }

            for (const anime of selected) {
                try {
                    const stream = await global.utils.getStreamFromURL(anime.image);
                    const rating = anime.score ? `⭐ ${anime.score}/10 | ` : "";
                    const yearInfo = anime.year ? `🗓️ ${anime.year} | ` : "";
                    const episodeInfo = anime.episodes ? `📀 ${anime.episodes} eps` : "";
                    
                    await message.reply({
                        body: `${atomic.header}\n${atomic.divider}\n` +
                              `🎌 **Genre:** #${genre.toUpperCase()}\n` +
                              `🎬 **Title:** 《${anime.title}》\n` +
                              `${atomic.divider}\n` +
                              `${rating}${yearInfo}${episodeInfo}\n` +
                              `📝 **Synopsis:** ${anime.synopsis || "Not available"}\n` +
                              `${atomic.divider}\n` +
                              `${apiFailed ? atomic.apiFail + '\n' : ''}${atomic.footer}`,
                        attachment: stream
                    });
                } catch (error) {
                    await message.reply(
                        `🎌 **Genre:** #${genre.toUpperCase()}\n` +
                        `🎬 **Title:** 《${anime.title}》\n` +
                        `${atomic.divider}\n` +
                        `⚠️ Image load failed | ${atomic.footer}`
                    );
                }
            }

        } catch (finalError) {
            console.error("System Error:", finalError);
            await message.reply(
                "❌ Critical system error\n" +
                "Please try again later or contact developer"
            );
        }
    }
};
