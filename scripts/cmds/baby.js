const axios = require('axios');

module.exports.config = {
    name: "sweetie",
    aliases: ["swt"],
    version: "1.0.0",
    author: "Mr. Smokey",
    countDown: 0,
    role: 0,
    description: "Rebranded chatbot with training commands",
    category: "chat",
    guide: {
        en: "{pn} [message] OR\ntrain [YourMessage] - [Reply1], [Reply2], ... OR\ntrain [react] [YourMessage] - [React1], [React2], ... OR\nforget [YourMessage] OR\nrevise [YourMessage] - [NewReply] OR\nlist all"
    }
};

const baseApiUrl = async () => {
    return "https://www.noobs-api.top/mrsmokey";
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const link = `${await baseApiUrl()}/sweetie`;
    const input = args.join(" ").toLowerCase();
    const uid = event.senderID;

    try {
        if (!args[0]) {
            const prompts = [
                "Yes, dear?", 
                "I'm here, what do you need?", 
                "Type !sweetie help to see instructions", 
                "Hello, how can I assist?"
            ];
            return api.sendMessage(prompts[Math.floor(Math.random() * prompts.length)], event.threadID, event.messageID);
        }

        if (args[0] === 'forget') {
            const trimmed = input.replace("forget ", "");
            if (trimmed.includes('-')) {
                const [key, idx] = trimmed.split(/\s*-\s*/);
                const res = await axios.get(`${link}?forget=${encodeURIComponent(key)}&index=${idx.trim()}`);
                const message = res.data.message;
                return api.sendMessage(message, event.threadID, event.messageID);
            } else {
                const res = await axios.get(`${link}?forget=${encodeURIComponent(trimmed)}`);
                const message = res.data.message;
                return api.sendMessage(message, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'list') {
            if (args[1] && args[1].toLowerCase() === 'all') {
                const res = await axios.get(`${link}?list=all`);
                const data = res.data;
                const teachers = await Promise.all(
                    data.teacher.teacherList.map(async item => {
                        const id = Object.keys(item)[0];
                        const count = item[id];
                        const name = (await usersData.get(id))?.name || "Unknown";
                        return { name, count };
                    })
                );
                teachers.sort((a, b) => b.count - a.count);
                const list = teachers.map((t, i) => `${i + 1}. ${t.name}: ${t.count}`).join("\n");
                const replyText = `Total Trained: ${data.length}\nList of trainers:\n${list}`;
                return api.sendMessage(replyText, event.threadID, event.messageID);
            } else {
                const res = await axios.get(`${link}?list=all`);
                const d = res.data;
                const replyText = `❇️ Total Trained = ${d.length}\n♻️ Total Responses = ${d.responseLength}`;
                return api.sendMessage(replyText, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'revise') {
            const parts = input.split(/\s*-\s*/);
            const newReply = parts[1];
            if (!newReply || newReply.length < 1) {
                return api.sendMessage('❌ | Invalid format! Use revise [YourMessage] - [NewReply]', event.threadID, event.messageID);
            }
            const original = parts[0].replace("revise ", "");
            const res = await axios.get(`${link}?revise=${encodeURIComponent(original)}&replace=${encodeURIComponent(newReply)}&senderID=${uid}`);
            const message = res.data.message;
            return api.sendMessage(`Revised: ${message}`, event.threadID, event.messageID);
        }

        if (args[0] === 'train' && args[1] !== 'react') {
            const parts = input.split(/\s*-\s*/);
            const final = parts[0].replace("train ", "");
            const replies = parts[1];
            if (!replies || replies.length < 1) {
                return api.sendMessage('❌ | Invalid format! Use train [YourMessage] - [Reply1], [Reply2], ...', event.threadID, event.messageID);
            }
            const res = await axios.get(`${link}?train=${encodeURIComponent(final)}&reply=${encodeURIComponent(replies)}&senderID=${uid}&threadID=${event.threadID}`);
            const data = res.data;
            const teacherName = (await usersData.get(data.teacher)).name;
            const replyText = `✅ Replies added: ${data.message}\nTrainer: ${teacherName}\nTotal: ${data.teachs}`;
            return api.sendMessage(replyText, event.threadID, event.messageID);
        }

        if (args[0] === 'train' && args[1] === 'react') {
            const parts = input.split(/\s*-\s*/);
            const final = parts[0].replace("train react ", "");
            const replies = parts[1];
            if (!replies || replies.length < 1) {
                return api.sendMessage('❌ | Invalid format! Use train react [YourMessage] - [Reply1], [Reply2], ...', event.threadID, event.messageID);
            }
            const res = await axios.get(`${link}?train=${encodeURIComponent(final)}&react=${encodeURIComponent(replies)}`);
            const message = res.data.message;
            return api.sendMessage(`✅ Replies added: ${message}`, event.threadID, event.messageID);
        }

        if (args[0] === 'msg') {
            const key = input.replace("msg ", "");
            const res = await axios.get(`${link}?list=${encodeURIComponent(key)}`);
            const data = res.data.data;
            return api.sendMessage(`Message ${key} = ${data}`, event.threadID, event.messageID);
        }

        const res = await axios.get(`${link}?text=${encodeURIComponent(input)}&senderID=${uid}&font=1`);
        const reply = res.data.reply;
        api.sendMessage(reply, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                messageID: info.messageID,
                commandName: module.exports.config.name,
                type: "reply",
                author: event.senderID
            });
        }, event.messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage(`Error: ${e.message}`, event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({ api, event, Reply }) => {
    try {
        if (event.type === "message_reply") {
            const text = event.body ? event.body.toLowerCase() : "";
            const res = await axios.get(`${await baseApiUrl()}/sweetie?text=${encodeURIComponent(text)}&senderID=${event.senderID}&font=1`);
            const replyText = res.data.reply;
            await api.sendMessage(replyText, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    messageID: info.messageID,
                    commandName: module.exports.config.name,
                    type: "reply",
                    author: event.senderID
                });
            }, event.messageID);
        }
    } catch (err) {
        console.error(err);
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onChat = async ({ api, event, message }) => {
    try {
        const body = event.body ? event.body.toLowerCase() : "";
        if (body.startsWith("sweetie")) {
            const arr = body.replace(/^\S+\s*/, "");
            const randomReplies = ["Yes, dear", "I'm listening", "What do you need?", "Hello there"];
            if (!arr) {
                await api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, (error, info) => {
                    global.GoatBot.onReply.set(info.messageID, {
                        messageID: info.messageID,
                        commandName: module.exports.config.name,
                        type: "reply",
                        author: event.senderID
                    });
                }, event.messageID);
                return;
            }
            const res = await axios.get(`${await baseApiUrl()}/sweetie?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`);
            const reply = res.data.reply;
            await api.sendMessage(reply, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    messageID: info.messageID,
                    commandName: module.exports.config.name,
                    type: "reply",
                    author: event.senderID
                });
            }, event.messageID);
        }
    } catch (err) {
        console.error(err);
    }
};
