const { randomString, getTime, convertTime } = global.utils;

const rows = [
    { col: 4, row: 10, rewardPoint: 1 },
    { col: 5, row: 12, rewardPoint: 2 },
    { col: 6, row: 15, rewardPoint: 3 }
];

module.exports = {
    config: {
        name: "guessnumber",
        aliases: ["guessnum"],
        version: "1.3",
        author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
        countDown: 5,
        role: 0,
        description: {
            vi: "Trò chơi đoán số",
            en: "Guess number game",
            bn: "সংখ্যা অনুমান খেলা"
        },
        category: "game",
        guide: {
            vi: "  {pn} [4 | 5 | 6] [single | multi]: Tạo một trò chơi mới, với:\n    4 5 6 là số chữ số của số cần đoán, mặc định là 4.\n    single | multi là chế độ chơi, single là 1 người chơi, multi là nhiều người chơi, mặc định là single.\n   Ví dụ:\n    {pn}\n    {pn} 4 single\n\n   Cách chơi: Trả lời tin nhắn của bot với số bạn đoán.\n   Bạn có " + rows.map(item => `${item.row} lần (${item.col} số)`).join(", ") + ".\n   Sau mỗi lần đoán, bạn sẽ nhận được gợi ý: số lượng chữ số đúng và số chữ số đúng vị trí.\n   Lưu ý: Số được tạo từ các chữ số 0-9, mỗi chữ số chỉ xuất hiện một lần, có thể bắt đầu bằng 0.\n\n   {pn} rank <trang>: Xem bảng xếp hạng.\n   {pn} info [<uid> | <@tag> | <reply> | <không nhập>]: Xem thông tin xếp hạng của bạn hoặc người khác.\n   {pn} reset: Đặt lại bảng xếp hạng (chỉ admin bot).",
            en: "  {pn} [4 | 5 | 6] [single | multi]: Create a new game, with:\n    4 5 6 is the number of digits to guess, default is 4.\n    single | multi is the game mode, single is 1 player, multi is multi-player, default is single.\n   Example:\n    {pn}\n    {pn} 4 single\n\n   How to play: Reply to the bot's message with your guessed number.\n   You have " + rows.map(item => `${item.row} tries (${item.col} digits)`).join(", ") + ".\n   After each guess, you'll get hints: number of correct digits and correct digits in correct positions.\n   Note: The number uses digits 0-9, each appearing once, and can start with 0.\n\n   {pn} rank <page>: View the ranking.\n   {pn} info [<uid> | <@tag> | <reply> | <empty>]: View your or another's ranking info.\n   {pn} reset: Reset the ranking (admin only).",
            bn: "  {pn} [4 | 5 | 6] [single | multi]: একটি নতুন খেলা তৈরি করুন, সাথে:\n    4 5 6 হল অনুমান করার সংখ্যার অঙ্কের সংখ্যা, ডিফল্ট হল 4।\n    single | multi হল খেলার মোড, single হল 1 খেলোয়াড়, multi হল একাধিক খেলোয়াড়, ডিফল্ট হল single।\n   উদাহরণ:\n    {pn}\n    {pn} 4 single\n\n   কীভাবে খেলবেন: বটের বার্তার উত্তরে আপনার অনুমান করা সংখ্যা দিন।\n   আপনার আছে " + rows.map(item => `${item.row} বার (${item.col} অঙ্ক)`).join(", ") + "।\n   প্রতিটি অনুমানের পরে, আপনি ইঙ্গিত পাবেন: সঠিক অঙ্কের সংখ্যা এবং সঠিক অবস্থানে সঠিক অঙ্কের সংখ্যা।\n   নোট: সংখ্যাটি 0-9 অঙ্ক দিয়ে গঠিত, প্রতিটি অঙ্ক একবারই থাকে এবং 0 দিয়ে শুরু হতে পারে।\n\n   {pn} rank <পৃষ্ঠা>: র‌্যাঙ্কিং দেখুন।\n   {pn} info [<uid> | <@tag> | <reply> | <খালি>]: আপনার বা অন্যের র‌্যাঙ্কিং তথ্য দেখুন।\n   {pn} reset: র‌্যাঙ্কিং রিসেট করুন (শুধুমাত্র অ্যাডমিন)।"
        }
    },

    langs: {
        vi: {
            charts: "🏆 | Bảng xếp hạng:\n%1",
            pageInfo: "Trang %1/%2",
            noScore: "⭕ | Chưa có ai ghi điểm.",
            noPermissionReset: "⚠️ | Bạn không có quyền đặt lại bảng xếp hạng.",
            notFoundUser: "⚠️ | Không tìm thấy người dùng với id %1 trong bảng xếp hạng.",
            userRankInfo: "🏆 | Thông tin xếp hạng:\nTên: %1\nĐiểm: %2\nSố lần chơi: %3\nSố lần thắng: %4\n%5\nSố lần thua: %6\nTỷ lệ thắng: %7%\nTổng thời gian chơi: %8",
            digits: "%1 chữ số: %2",
            resetRankSuccess: "✅ | Đặt lại bảng xếp hạng thành công.",
            invalidCol: "⚠️ | Vui lòng nhập số chữ số cần đoán là 4, 5 hoặc 6.",
            invalidMode: "⚠️ | Vui lòng nhập chế độ chơi là single hoặc multi.",
            created: "✅ | Tạo trò chơi thành công!",
            gameName: "TRÒ CHƠI ĐOÁN SỐ",
            gameGuide: "⏳ | Hướng dẫn:\nBạn có %1 lần đoán số %2 chữ số.\nSau mỗi lần đoán, bạn sẽ nhận được gợi ý:\n- Số chữ số đúng: Tổng số chữ số có trong đáp án.\n- Số chữ số đúng vị trí: Số chữ số đúng và ở đúng vị trí.",
            gameNote: "📄 | Lưu ý: Số được tạo từ 0-9, mỗi chữ số chỉ xuất hiện một lần, có thể bắt đầu bằng 0.",
            replyToPlayGame: "🎮 | Trả lời tin nhắn này với %1 chữ số bạn đoán (ví dụ: 1234).",
            invalidNumbers: "⚠️ | Vui lòng nhập đúng %1 chữ số (0-9, không trùng lặp).",
            guessFeedback: "Lần đoán %1: %2\n- %3 chữ số đúng\n- %4 chữ số đúng vị trí\nCòn %5 lần đoán.",
            win: "🎉 | Chúc mừng bạn đoán đúng số %1 sau %2 lần đoán! Bạn nhận %3 điểm thưởng.",
            loss: "🤦‍♂️ | Bạn đã hết lượt đoán. Số đúng là %1."
        },
        en: {
            charts: "🏆 | Ranking:\n%1",
            pageInfo: "Page %1/%2",
            noScore: "⭕ | No one has scored yet.",
            noPermissionReset: "⚠️ | You don't have permission to reset the ranking.",
            notFoundUser: "⚠️ | User with id %1 not found in the ranking.",
            userRankInfo: "🏆 | Ranking info:\nName: %1\nPoints: %2\nGames played: %3\nWins: %4\n%5\nLosses: %6\nWin rate: %7%\nTotal play time: %8",
            digits: "%1 digits: %2",
            resetRankSuccess: "✅ | Ranking reset successfully.",
            invalidCol: "⚠️ | Please enter the number of digits to guess (4, 5, or 6).",
            invalidMode: "⚠️ | Please enter game mode as single or multi.",
            created: "✅ | Game created successfully!",
            gameName: "GUESS NUMBER GAME",
            gameGuide: "⏳ | How to play:\nYou have %1 tries to guess a %2-digit number.\nAfter each guess, you'll get hints:\n- Correct digits: Total digits present in the answer.\n- Correct positions: Digits that are correct and in the right position.",
            gameNote: "📄 | Note: The number is made of digits 0-9, each used once, and can start with 0.",
            replyToPlayGame: "🎮 | Reply to this message with your %1-digit guess (e.g., 1234).",
            invalidNumbers: "⚠️ | Please enter exactly %1 digits (0-9, no duplicates).",
            guessFeedback: "Guess %1: %2\n- %3 correct digits\n- %4 in correct positions\n%5 tries left.",
            win: "🎉 | Congratulations! You guessed %1 in %2 tries and earned %3 points!",
            loss: "🤦‍♂️ | You're out of tries. The correct number was %1."
        },
        bn: {
            charts: "🏆 | র‌্যাঙ্কিং:\n%1",
            pageInfo: "পৃষ্ঠা %1/%2",
            noScore: "⭕ | এখনও কেউ স্কোর করেনি।",
            noPermissionReset: "⚠️ | আপনার র‌্যাঙ্কিং রিসেট করার অনুমতি নেই।",
            notFoundUser: "⚠️ | %1 আইডি সহ ব্যবহারকারী র‌্যাঙ্কিংয়ে পাওয়া যায়নি।",
            userRankInfo: "🏆 | র‌্যাঙ্কিং তথ্য:\nনাম: %1\nপয়েন্ট: %2\nখেলার সংখ্যা: %3\nজয়: %4\n%5\nহার: %6\nজয়ের হার: %7%\nমোট খেলার সময়: %8",
            digits: "%1 অঙ্ক: %2",
            resetRankSuccess: "✅ | র‌্যাঙ্কিং সফলভাবে রিসেট করা হয়েছে।",
            invalidCol: "⚠️ | অনুগ্রহ করে অনুমান করার অঙ্কের সংখ্যা 4, 5 বা 6 লিখুন।",
            invalidMode: "⚠️ | অনুগ্রহ করে খেলার মোড single বা multi লিখুন।",
            created: "✅ | খেলা সফলভাবে তৈরি হয়েছে!",
            gameName: "সংখ্যা অনুমান খেলা",
            gameGuide: "⏳ | কীভাবে খেলবেন:\nআপনার আছে %1 বার একটি %2-অঙ্কের সংখ্যা অনুমান করার জন্য।\nপ্রতিটি অনুমানের পরে, আপনি ইঙ্গিত পাবেন:\n- সঠিক অঙ্ক: উত্তরে উপস্থিত মোট অঙ্ক।\n- সঠিক অবস্থান: সঠিক এবং সঠিক অবস্থানে থাকা অঙ্ক।",
            gameNote: "📄 | নোট: সংখ্যাটি 0-9 অঙ্ক দিয়ে তৈরি, প্রতিটি অঙ্ক একবার ব্যবহৃত, এবং 0 দিয়ে শুরু হতে পারে।",
            replyToPlayGame: "🎮 | এই বার্তার উত্তরে আপনার %1-অঙ্কের অনুমান দিন (যেমন, 1234)।",
            invalidNumbers: "⚠️ | অনুগ্রহ করে ঠিক %1 অঙ্ক লিখুন (0-9, কোনো পুনরাবৃত্তি নেই)।",
            guessFeedback: "অনুমান %1: %2\n- %3টি সঠিক অঙ্ক\n- %4টি সঠিক অবস্থানে\n%5 বার বাকি।",
            win: "🎉 | অভিনন্দন! আপনি %2 বারে %1 অনুমান করেছেন এবং %3 পয়েন্ট পেয়েছেন!",
            loss: "🤦‍♂️ | আপনার অনুমানের সুযোগ শেষ। সঠিক সংখ্যা ছিল %1।"
        }
    },

    onStart: async function ({ message, event, getLang, commandName, args, globalData, usersData, role }) {
        try {
            if (args[0] === "rank") {
                const rankGuessNumber = await globalData.get("rankGuessNumber", "data", []);
                if (!rankGuessNumber.length) {
                    return message.reply(getLang("noScore"));
                }

                const page = parseInt(args[1]) || 1;
                const maxUserOnePage = 30;

                let rankGuessNumberHandle = await Promise.all(
                    rankGuessNumber.slice((page - 1) * maxUserOnePage, page * maxUserOnePage).map(async (item) => {
                        const userName = await usersData.getName(item.id);
                        return {
                            ...item,
                            userName,
                            winNumber: item.wins?.length || 0,
                            lossNumber: item.losses?.length || 0
                        };
                    })
                );

                rankGuessNumberHandle = rankGuessNumberHandle.sort((a, b) => b.winNumber - a.winNumber);
                const medals = ["🥇", "🥈", "🥉"];
                const rankGuessNumberText = rankGuessNumberHandle
                    .map((item, index) => {
                        const medal = medals[index] || index + 1;
                        return `${medal} ${item.userName} - ${item.winNumber} wins - ${item.lossNumber} losses`;
                    })
                    .join("\n");

                return message.reply(
                    getLang("charts", rankGuessNumberText || getLang("noScore")) +
                    "\n" +
                    getLang("pageInfo", page, Math.ceil(rankGuessNumber.length / maxUserOnePage))
                );
            } else if (args[0] === "info") {
                const rankGuessNumber = await globalData.get("rankGuessNumber", "data", []);
                let targetID;
                if (Object.keys(event.mentions).length) {
                    targetID = Object.keys(event.mentions)[0];
                } else if (event.messageReply) {
                    targetID = event.messageReply.senderID;
                } else if (!isNaN(args[1])) {
                    targetID = args[1];
                } else {
                    targetID = event.senderID;
                }

                const userDataGuessNumber = rankGuessNumber.find((item) => item.id == targetID);
                if (!userDataGuessNumber) {
                    return message.reply(getLang("notFoundUser", targetID));
                }

                const userName = await usersData.getName(targetID);
                const pointsReceived = userDataGuessNumber.points || 0;
                const winNumber = userDataGuessNumber.wins?.length || 0;
                const playNumber = winNumber + (userDataGuessNumber.losses?.length || 0);
                const lossNumber = userDataGuessNumber.losses?.length || 0;
                const winRate = playNumber > 0 ? (winNumber / playNumber * 100).toFixed(2) : 0;
                const winInfo = {};
                for (const item of userDataGuessNumber.wins || []) {
                    winInfo[item.col] = (winInfo[item.col] || 0) + 1;
                }
                const playTime = convertTime(
                    (userDataGuessNumber.wins || []).reduce((a, b) => a + (b.timeSuccess || 0), 0) +
                    (userDataGuessNumber.losses || []).reduce((a, b) => a + (b.timeSuccess || 0), 0)
                );

                return message.reply(
                    getLang(
                        "userRankInfo",
                        userName,
                        pointsReceived,
                        playNumber,
                        winNumber,
                        Object.keys(winInfo)
                            .map((item) => `  + ${getLang("digits", item, winInfo[item])}`)
                            .join("\n"),
                        lossNumber,
                        winRate,
                        playTime
                    )
                );
            } else if (args[0] === "reset") {
                if (role < 2) {
                    return message.reply(getLang("noPermissionReset"));
                }
                await globalData.set("rankGuessNumber", [], "data");
                return message.reply(getLang("resetRankSuccess"));
            }

            const col = parseInt(args.join(" ").match(/(\d+)/)?.[1] || 4);
            const levelOfDifficult = rows.find((item) => item.col === col);
            if (!levelOfDifficult) {
                return message.reply(getLang("invalidCol"));
            }
            const mode = args.join(" ").match(/(single|multi|-s|-m)/)?.[1] || "single";
            const row = levelOfDifficult.row || 10;

            const options = {
                col,
                row,
                timeStart: parseInt(getTime("x")),
                numbers: [],
                tryNumber: 0,
                answer: randomString(col, true, "0123456789"),
                gameName: getLang("gameName"),
                gameGuide: getLang("gameGuide", row, col),
                gameNote: getLang("gameNote"),
                allGuesses: []
            };

            const gameData = {
                ...options,
                mode
            };

            const messageData = await message.reply(
                `${getLang("created")}\n\n${getLang("gameGuide", row, col)}\n\n${getLang("gameNote")}\n\n${getLang("replyToPlayGame", col)}`
            );
            gameData.messageData = messageData;

            global.GoatBot.onReply.set(messageData.messageID, {
                commandName,
                messageID: messageData.messageID,
                author: event.senderID,
                gameData
            });
        } catch (error) {
            console.error("Error in onStart:", error);
            return message.reply("⚠️ | An error occurred while starting the game. Please try again.");
        }
    },

    onReply: async ({ message, Reply, event, getLang, commandName, globalData }) => {
        try {
            const { gameData: oldGameData } = Reply;
            if (event.senderID != Reply.author && oldGameData.mode === "single") {
                return;
            }

            const numbers = (event.body || "")
                .split("")
                .map((item) => item.trim())
                .filter((item) => item !== "" && !isNaN(item));
            if (numbers.length !== oldGameData.col || new Set(numbers).size !== numbers.length) {
                return message.reply(getLang("invalidNumbers", oldGameData.col));
            }

            global.GoatBot.onReply.delete(Reply.messageID);

            oldGameData.numbers = numbers;
            oldGameData.tryNumber += 1;
            oldGameData.allGuesses.push(numbers.join(""));

            const { correctDigits, correctPositions } = calculateHints(numbers, oldGameData.answer.split(""));
            const isWin = correctPositions === oldGameData.col;
            const isGameOver = isWin || oldGameData.tryNumber >= oldGameData.row;

            let replyMessage;
            if (!isGameOver) {
                replyMessage = getLang(
                    "guessFeedback",
                    oldGameData.tryNumber,
                    numbers.join(""),
                    correctDigits,
                    correctPositions,
                    oldGameData.row - oldGameData.tryNumber
                ) + `\n\n${getLang("replyToPlayGame", oldGameData.col)}`;
            } else {
                const rewardPoint = rows.find((item) => item.col === oldGameData.col)?.rewardPoint || 0;
                replyMessage = isWin
                    ? getLang("win", oldGameData.answer, oldGameData.tryNumber, rewardPoint)
                    : getLang("loss", oldGameData.answer);
                replyMessage += `\n\nPrevious guesses:\n${oldGameData.allGuesses
                    .map((guess, i) => {
                        const { correctDigits, correctPositions } = calculateHints(guess.split(""), oldGameData.answer.split(""));
                        return `${i + 1}. ${guess} (${correctDigits} correct, ${correctPositions} in correct position)`;
                    })
                    .join("\n")}`;
            }

            const newMessage = await message.reply(replyMessage);

            if (isGameOver) {
                const rankGuessNumber = await globalData.get("rankGuessNumber", "data", []);
                const userIndex = rankGuessNumber.findIndex((item) => item.id == event.senderID);
                const data = {
                    timeSuccess: parseInt(getTime("x") - oldGameData.timeStart),
                    date: getTime(),
                    col: oldGameData.col
                };

                if (isWin) {
                    data.tryNumber = oldGameData.tryNumber;
                    if (userIndex === -1) {
                        rankGuessNumber.push({
                            id: event.senderID,
                            wins: [data],
                            losses: [],
                            points: rewardPoint
                        });
                    } else {
                        rankGuessNumber[userIndex].wins = rankGuessNumber[userIndex].wins || [];
                        rankGuessNumber[userIndex].wins.push(data);
                        rankGuessNumber[userIndex].points = (rankGuessNumber[userIndex].points || 0) + rewardPoint;
                    }
                } else {
                    if (userIndex === -1) {
                        rankGuessNumber.push({
                            id: event.senderID,
                            wins: [],
                            losses: [data],
                            points: 0
                        });
                    } else {
                        rankGuessNumber[userIndex].losses = rankGuessNumber[userIndex].losses || [];
                        rankGuessNumber[userIndex].losses.push(data);
                    }
                }

                await globalData.set("rankGuessNumber", rankGuessNumber, "data");
                message.unsend((await oldGameData.messageData).messageID);
                message.unsend(Reply.messageID);
            } else {
                global.GoatBot.onReply.set(newMessage.messageID, {
                    commandName,
                    messageID: newMessage.messageID,
                    author: event.senderID,
                    gameData: oldGameData
                });
                message.unsend(Reply.messageID);
            }
        } catch (error) {
            console.error("Error in onReply:", error);
            return message.reply("⚠️ | An error occurred while processing your guess. Please try again.");
        }
    }
};

function calculateHints(guess, answer) {
    let correctDigits = 0; // Total correct digits (bulls + cows)
    let correctPositions = 0; // Bulls: correct digit in correct position

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === answer[i]) {
            correctPositions++;
            correctDigits++;
        } else if (answer.includes(guess[i])) {
            correctDigits++;
        }
    }

    return { correctDigits, correctPositions };
}
