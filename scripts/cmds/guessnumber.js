const { randomString, getTime, convertTime } = global.utils;
const { createCanvas, loadImage } = require('canvas');
const rows = [
    { col: 4, row: 10, rewardPoint: 1 },
    { col: 5, row: 12, rewardPoint: 2 },
    { col: 6, row: 15, rewardPoint: 3 }
];

// Atomic design elements
const ATOMIC_SYMBOLS = ["⚛", "☢", "☣", "⏚", "⎈", "⍟", "✦", "✧", "❖"];
const PARTICLE_COLORS = ["#FF5555", "#55FFFF", "#FFAA00", "#AA55FF", "#55FF55"];
const BACKGROUND_COLOR = "#0f172a";
const PRIMARY_COLOR = "#38bdf8";
const SECONDARY_COLOR = "#818cf8";
const ACCENT_COLOR = "#f472b6";
const SUCCESS_COLOR = "#34d399";
const ERROR_COLOR = "#f87171";

module.exports = {
    config: {
        name: "guessnumber",
        aliases: ["guessnum", "atomicguess", "nucleargame"],
        version: "2.0",
        author: "☣ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐒𝐈𝐅 ⚛",
        countDown: 3,
        role: 0,
        description: {
            en: "⚡ Atomic-themed number guessing game with leaderboards",
            bn: "⚡ পারমাণবিক থিমযুক্ত সংখ্যা অনুমান খেলা"
        },
        category: "atomic-games",
        guide: {
            en: "{pn} [4-6] [single/multi] - Start game\n{pn} rank - View leaderboard\n{pn} info - Your stats",
            bn: "{pn} [4-6] [single/multi] - খেলা শুরু করুন\n{pn} rank - র‌্যাঙ্কিং দেখুন\n{pn} info - আপনার পরিসংখ্যান"
        }
    },

    langs: {
        en: {
            charts: "🏆 𝗔𝗧𝗢𝗠𝗜𝗖 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗\n%1",
            pageInfo: "📄 Page %1/%2",
            noScore: "☢️ No scores recorded yet. Play a game to get on the board!",
            noPermissionReset: "⚠️ Nuclear codes required for reset! (Admin only)",
            notFoundUser: "🔍 User not found in atomic database",
            userRankInfo: `⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗣𝗟𝗔𝗬𝗘𝗥 𝗦𝗧𝗔𝗧𝗦
🔸 𝗡𝗮𝗺𝗲: %1
🎯 𝗦𝗰𝗼𝗿𝗲: %2
🎮 𝗚𝗮𝗺𝗲𝘀: %3
🏆 𝗪𝗶𝗻𝘀: %4
💥 𝗟𝗼𝘀𝘀𝗲𝘀: %6
📈 𝗪𝗶𝗻 𝗥𝗮𝘁𝗲: %7%
⏱️ 𝗧𝗼𝘁𝗮𝗹 𝗧𝗶𝗺𝗲: %8
%s`,
            digits: "  ➤ %1-digit games: %2 wins",
            resetRankSuccess: "♻️ Atomic leaderboard reset successfully!",
            invalidCol: "⚠️ Please enter 4, 5, or 6 for digit count",
            invalidMode: "⚠️ Choose 'single' or 'multi' mode",
            created: `⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗚𝗔𝗠𝗘 𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗘𝗗!
🔢 𝗗𝗶𝗴𝗶𝘁𝘀: %1
🎮 𝗠𝗼𝗱𝗲: %2
⏳ 𝗔𝘁𝘁𝗲𝗺𝗽𝘁𝘀: %3`,
            gameName: "⚛️ ATOMIC NUMBER GUESSER",
            gameGuide: `🌀 𝗛𝗢𝗪 𝗧𝗢 𝗣𝗟𝗔𝗬
• You have %1 attempts to guess a %2-digit number
• After each guess, you'll receive:
  🔹 Correct digits (any position)
  🔹 Correct positions`,
            gameNote: `📌 𝗡𝗢𝗧𝗘𝗦
• Digits 0-9, no duplicates
• Number can start with 0`,
            replyToPlayGame: `🎯 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛:
Your %1-digit guess (e.g., "1234")`,
            invalidNumbers: "⚠️ Please enter exactly %1 unique digits (0-9)",
            guessFeedback: `🔮 𝗚𝗨𝗘𝗦𝗦 𝗥𝗘𝗦𝗨𝗟𝗧 #%1
➤ Your guess: %2
✅ Correct digits: %3
🎯 Correct positions: %4
⏳ Attempts left: %5`,
            win: `🎉 𝗔𝗧𝗢𝗠𝗜𝗖 𝗩𝗜𝗖𝗧𝗢𝗥𝗬!
☢️ Correct number: %1
🎯 Guesses used: %2
⚡ Points earned: %3`,
            loss: `💥 𝗡𝗨𝗖𝗟𝗘𝗔𝗥 𝗠𝗘𝗟𝗧𝗗𝗢𝗪𝗡!
☠️ Correct number: %1
🔁 Try again with: ${global.GoatBot.config.prefix}guessnumber`
        },
        bn: {
            // Bengali translations would go here
        }
    },

    onStart: async function ({ message, event, getLang, args, globalData, usersData, role }) {
        try {
            // Atomic intro animation
            await message.reply("⚡ **Initializing atomic game matrix...**");
            
            if (args[0] === "rank") {
                return await this.showLeaderboard(message, event, getLang, globalData, usersData, args);
            } 
            else if (args[0] === "info") {
                return await this.showUserStats(message, event, getLang, globalData, usersData, args);
            } 
            else if (args[0] === "reset") {
                return await this.resetLeaderboard(message, getLang, role, globalData);
            }

            // Start new game
            const col = parseInt(args.join(" ").match(/(\d+)/)?.[1] || 4;
            const level = rows.find(item => item.col === col);
            if (!level) return message.reply(getLang("invalidCol"));
            
            const mode = args.join(" ").match(/(single|multi)/)?.[1] || "single";
            const row = level.row || 10;
            
            // Create atomic-themed game
            const gameData = {
                col,
                row,
                mode,
                timeStart: Date.now(),
                numbers: [],
                tryNumber: 0,
                answer: randomString(col, true, "0123456789"),
                gameName: getLang("gameName"),
                gameGuide: getLang("gameGuide", row, col),
                gameNote: getLang("gameNote"),
                allGuesses: [],
                atomicSymbol: ATOMIC_SYMBOLS[Math.floor(Math.random() * ATOMIC_SYMBOLS.length)],
                particles: this.generateParticles(15)
            };

            // Send game initialization message
            const gameInitMsg = await message.reply(
                getLang("created", col, mode, row) + 
                `\n\n${getLang("gameGuide", row, col)}` +
                `\n${getLang("gameNote")}` +
                `\n\n${getLang("replyToPlayGame", col)}`
            );
            
            // Create game board image
            const gameBoard = await this.createGameBoard(gameData);
            const boardMsg = await message.reply({
                attachment: gameBoard
            });

            // Set up reply handler
            global.GoatBot.onReply.set(boardMsg.messageID, {
                commandName: this.config.name,
                messageID: boardMsg.messageID,
                author: event.senderID,
                gameData
            });
            
            // Store message references
            gameData.initMessageID = gameInitMsg.messageID;
            gameData.boardMessageID = boardMsg.messageID;

        } catch (err) {
            console.error("Atomic Game Error:", err);
            message.reply("⚠️ Nuclear containment breach! Game malfunction detected.");
        }
    },

    onReply: async ({ message, Reply, event, getLang, globalData }) => {
        try {
            const { gameData } = Reply;
            if (event.senderID !== Reply.author && gameData.mode === "single") {
                return message.reply("⚠️ This is a single-player atomic session!");
            }

            // Validate input
            const input = event.body.trim();
            if (!/^\d+$/.test(input) || new Set(input).size !== input.length) {
                return message.reply(getLang("invalidNumbers", gameData.col));
            }
            
            const numbers = input.split("");
            gameData.numbers = numbers;
            gameData.tryNumber++;
            gameData.allGuesses.push(input);
            
            // Calculate hints
            const { correctDigits, correctPositions } = this.calculateHints(
                numbers, 
                gameData.answer.split("")
            );
            
            const isWin = correctPositions === gameData.col;
            const isGameOver = isWin || gameData.tryNumber >= gameData.row;
            
            // Create feedback message
            let feedbackMsg;
            if (!isGameOver) {
                feedbackMsg = getLang(
                    "guessFeedback",
                    gameData.tryNumber,
                    input,
                    correctDigits,
                    correctPositions,
                    gameData.row - gameData.tryNumber
                );
            } else {
                const rewardPoint = rows.find(i => i.col === gameData.col)?.rewardPoint || 0;
                feedbackMsg = isWin 
                    ? getLang("win", gameData.answer, gameData.tryNumber, rewardPoint)
                    : getLang("loss", gameData.answer);
                
                // Add guess history
                feedbackMsg += `\n\n🔮 𝗚𝗨𝗘𝗦𝗦 𝗛𝗜𝗦𝗧𝗢𝗥𝗬:\n` +
                    gameData.allGuesses.map((g, i) => 
                        `${i+1}. ${g} ${"★".repeat(i+1 === gameData.tryNumber && isWin ? 3 : 1)}`
                    ).join("\n");
            }
            
            // Update game board
            const updatedBoard = await this.createGameBoard(gameData);
            const boardMsg = await message.reply({
                body: feedbackMsg,
                attachment: updatedBoard
            });
            
            // Clean up previous messages
            message.unsend(Reply.messageID);
            if (gameData.initMessageID) message.unsend(gameData.initMessageID);
            
            // Handle game completion
            if (isGameOver) {
                await this.updateLeaderboard(
                    globalData, 
                    event.senderID, 
                    gameData, 
                    isWin, 
                    isWin ? rows.find(i => i.col === gameData.col)?.rewardPoint || 0 : 0
                );
            } else {
                // Set up next reply
                global.GoatBot.onReply.set(boardMsg.messageID, {
                    commandName: this.config.name,
                    messageID: boardMsg.messageID,
                    author: event.senderID,
                    gameData
                });
            }
            
        } catch (err) {
            console.error("Atomic Reply Error:", err);
            message.reply("⚠️ Quantum instability detected! Game malfunction.");
        }
    },

    // ===== ATOMIC HELPER FUNCTIONS =====
    generateParticles(count) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                radius: Math.random() * 3 + 1,
                color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
                speed: Math.random() * 2 + 0.5,
                angle: Math.random() * Math.PI * 2
            });
        }
        return particles;
    },

    calculateHints(guess, answer) {
        let correctDigits = 0;
        let correctPositions = 0;
        const digitCount = new Array(10).fill(0);
        
        // Count digit occurrences in answer
        for (const digit of answer) {
            digitCount[parseInt(digit)]++;
        }
        
        // Check correct positions
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === answer[i]) {
                correctPositions++;
                correctDigits++;
                digitCount[parseInt(guess[i])]--;
            }
        }
        
        // Check correct digits (wrong position)
        for (let i = 0; i < guess.length; i++) {
            const digit = parseInt(guess[i]);
            if (guess[i] !== answer[i] && digitCount[digit] > 0) {
                correctDigits++;
                digitCount[digit]--;
            }
        }
        
        return { correctDigits, correctPositions };
    },

    async createGameBoard(gameData) {
        const { col, row, numbers, tryNumber, particles, atomicSymbol } = gameData;
        const CELL_SIZE = 80;
        const BOARD_PADDING = 50;
        const HEADER_HEIGHT = 150;
        const FOOTER_HEIGHT = 100;
        
        // Calculate canvas size
        const width = col * CELL_SIZE + (col - 1) * 10 + BOARD_PADDING * 2;
        const height = HEADER_HEIGHT + row * CELL_SIZE + (row - 1) * 10 + BOARD_PADDING * 2 + FOOTER_HEIGHT;
        
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Draw atomic background
        this.drawAtomicBackground(ctx, width, height, particles);
        
        // Draw game header
        this.drawGameHeader(ctx, width, HEADER_HEIGHT, gameData);
        
        // Draw game grid
        this.drawGameGrid(ctx, width, height, HEADER_HEIGHT, col, row, CELL_SIZE, BOARD_PADDING);
        
        // Draw guesses
        this.drawGuesses(ctx, gameData, CELL_SIZE, BOARD_PADDING, HEADER_HEIGHT);
        
        // Draw atomic symbol
        ctx.font = 'bold 80px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.textAlign = 'center';
        ctx.fillText(atomicSymbol, width / 2, height / 2 + 30);
        
        // Draw footer
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, height - FOOTER_HEIGHT, width, FOOTER_HEIGHT);
        ctx.fillStyle = PRIMARY_COLOR;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`⚡ ATOMIC GUESSER v2.0 | ✨ Designed by Asif Mahmud`, width/2, height - FOOTER_HEIGHT/2 + 10);
        
        return canvas.toBuffer('image/png');
    },

    drawAtomicBackground(ctx, width, height, particles) {
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0c4a6e');
        gradient.addColorStop(1, BACKGROUND_COLOR);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw particles
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Update position
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            
            // Bounce off edges
            if (p.x < 0 || p.x > width) p.angle = Math.PI - p.angle;
            if (p.y < 0 || p.y > height) p.angle = -p.angle;
        });
        
        // Draw atomic orbits
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width/2, height/2, 150, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(width/2, height/2, 220, 0, Math.PI * 2);
        ctx.stroke();
    },

    drawGameHeader(ctx, width, height, gameData) {
        // Draw header background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw header border
        ctx.strokeStyle = PRIMARY_COLOR;
        ctx.lineWidth = 3;
        ctx.strokeRect(5, 5, width - 10, height - 10);
        
        // Draw game title
        ctx.fillStyle = PRIMARY_COLOR;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(gameData.gameName, width/2, 50);
        
        // Draw game info
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`🔢 Digits: ${gameData.col}`, 20, 90);
        ctx.fillText(`🎮 Mode: ${gameData.mode}`, 20, 120);
        ctx.fillText(`⏳ Attempts: ${gameData.tryNumber}/${gameData.row}`, width/2, 90);
        ctx.fillText(`⚡ Status: ${gameData.tryNumber ? 'Active' : 'Ready'}`, width/2, 120);
        
        // Draw atomic symbol
        ctx.fillStyle = ACCENT_COLOR;
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(gameData.atomicSymbol, width - 20, 90);
    },

    drawGameGrid(ctx, width, height, headerHeight, col, row, cellSize, padding) {
        const gridTop = headerHeight + padding;
        
        // Draw grid background
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.fillRect(
            padding, 
            gridTop, 
            width - padding * 2, 
            height - headerHeight - padding * 2 - 100
        );
        
        // Draw grid cells
        for (let r = 0; r < row; r++) {
            for (let c = 0; c < col; c++) {
                const x = padding + c * (cellSize + 10);
                const y = gridTop + r * (cellSize + 10);
                
                ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
                ctx.fillRect(x, y, cellSize, cellSize);
                
                ctx.strokeStyle = PRIMARY_COLOR;
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
    },

    drawGuesses(ctx, gameData, cellSize, padding, headerHeight) {
        const { col, tryNumber, numbers, allGuesses, answer } = gameData;
        const gridTop = headerHeight + padding;
        
        // Draw previous guesses
        for (let r = 0; r < Math.min(tryNumber, gameData.row); r++) {
            const guess = allGuesses[r].split('');
            const isCurrent = r === tryNumber - 1;
            
            for (let c = 0; c < col; c++) {
                const x = padding + c * (cellSize + 10);
                const y = gridTop + r * (cellSize + 10);
                const digit = guess[c];
                const isCorrectDigit = answer.includes(digit);
                const isCorrectPosition = answer[c] === digit;
                
                // Highlight cell based on correctness
                if (isCurrent) {
                    if (isCorrectPosition) {
                        ctx.fillStyle = 'rgba(52, 211, 153, 0.3)';
                    } else if (isCorrectDigit) {
                        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
                    } else {
                        ctx.fillStyle = 'rgba(248, 113, 113, 0.3)';
                    }
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
                
                // Draw digit
                ctx.fillStyle = '#f8fafc';
                ctx.font = `bold ${cellSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(digit, x + cellSize/2, y + cellSize/2);
                
                // Draw cell border
                ctx.strokeStyle = isCurrent ? ACCENT_COLOR : PRIMARY_COLOR;
                ctx.lineWidth = isCurrent ? 3 : 1;
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
    },

    async showLeaderboard(message, event, getLang, globalData, usersData, args) {
        const rankData = await globalData.get("atomicGuessRank", "data", []);
        if (!rankData.length) return message.reply(getLang("noScore"));
        
        const page = parseInt(args[1]) || 1;
        const perPage = 10;
        const startIdx = (page - 1) * perPage;
        const pageData = rankData.slice(startIdx, startIdx + perPage);
        
        // Create leaderboard text
        let leaderboardText = "🏆 𝗔𝗧𝗢𝗠𝗜𝗖 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗\n\n";
        leaderboardText += "```" + "Rank  Player".padEnd(25) + "Score  Wins```\n";
        
        await Promise.all(pageData.map(async (user, idx) => {
            const userName = await usersData.getName(user.id);
            const rank = startIdx + idx + 1;
            const rankSymbol = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "▫️";
            
            leaderboardText += `${rankSymbol} ${rank.toString().padEnd(2)} ${userName.slice(0, 15).padEnd(20)} ${user.points.toString().padEnd(5)} ${user.wins?.length || 0}\n`;
        }));
        
        leaderboardText += `\n📊 Total Players: ${rankData.length}`;
        leaderboardText += `\n${getLang("pageInfo", page, Math.ceil(rankData.length / perPage))}`;
        
        message.reply(leaderboardText);
    },

    async showUserStats(message, event, getLang, globalData, usersData, args) {
        const rankData = await globalData.get("atomicGuessRank", "data", []);
        let targetID;
        
        if (Object.keys(event.mentions).length) targetID = Object.keys(event.mentions)[0];
        else if (event.messageReply) targetID = event.messageReply.senderID;
        else if (!isNaN(args[1])) targetID = args[1];
        else targetID = event.senderID;
        
        const userData = rankData.find(u => u.id === targetID);
        if (!userData) return message.reply(getLang("notFoundUser", targetID));
        
        const userName = await usersData.getName(targetID);
        const points = userData.points || 0;
        const totalGames = (userData.wins?.length || 0) + (userData.losses?.length || 0);
        const wins = userData.wins?.length || 0;
        const losses = userData.losses?.length || 0;
        const winRate = totalGames ? ((wins / totalGames) * 100).toFixed(1) : 0;
        
        // Calculate play time
        const playTime = this.calculatePlayTime(userData);
        
        // Format digit stats
        let digitStats = "";
        const digitWins = {};
        (userData.wins || []).forEach(win => {
            digitWins[win.col] = (digitWins[win.col] || 0) + 1;
        });
        
        Object.entries(digitWins).forEach(([digits, count]) => {
            digitStats += getLang("digits", digits, count) + "\n";
        });
        
        const userStats = getLang(
            "userRankInfo",
            userName,
            points,
            totalGames,
            wins,
            digitStats,
            losses,
            winRate,
            playTime
        );
        
        message.reply(userStats);
    },

    calculatePlayTime(userData) {
        let totalMs = 0;
        (userData.wins || []).forEach(win => totalMs += win.timeSuccess || 0);
        (userData.losses || []).forEach(loss => totalMs += loss.timeSuccess || 0);
        return convertTime(totalMs);
    },

    async resetLeaderboard(message, getLang, role, globalData) {
        if (role < 2) return message.reply(getLang("noPermissionReset"));
        await globalData.set("atomicGuessRank", [], "data");
        message.reply(getLang("resetRankSuccess"));
    },

    async updateLeaderboard(globalData, userId, gameData, isWin, rewardPoints) {
        const rankData = await globalData.get("atomicGuessRank", "data", []);
        const userIndex = rankData.findIndex(u => u.id === userId);
        const gameResult = {
            col: gameData.col,
            timeSuccess: Date.now() - gameData.timeStart,
            date: getTime("YYYY-MM-DD HH:mm:ss"),
            tryNumber: gameData.tryNumber
        };
        
        if (userIndex === -1) {
            // New player
            rankData.push({
                id: userId,
                points: isWin ? rewardPoints : 0,
                wins: isWin ? [gameResult] : [],
                losses: isWin ? [] : [gameResult]
            });
        } else {
            // Existing player
            const user = rankData[userIndex];
            user.points = (user.points || 0) + (isWin ? rewardPoints : 0);
            
            if (isWin) {
                user.wins = user.wins || [];
                user.wins.push(gameResult);
            } else {
                user.losses = user.losses || [];
                user.losses.push(gameResult);
            }
        }
        
        await globalData.set("atomicGuessRank", rankData, "data");
    }
};
