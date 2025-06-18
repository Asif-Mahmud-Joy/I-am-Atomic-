const axios = require('axios');
const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

module.exports.config = {
    name: "bby",
    aliases: ["baby", "bbe", "babe", "jan","Jan","Bow","bow","Bby","bbu"],
    version: "6.9.0",
    author: "Asif",
    countDown: 0,
    role: 0,
    description: "better then all sim simi",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NeeMessage]"
    }
};

module.exports.onStart = async ({
    api,
    event,
    args,
    usersData
}) => {
    const link = (await baseApiUrl()) + '/baby';
    const dipto = args.join(" ").toLowerCase();
    const uid = event.senderID;
    const username = await usersData.getName(uid);
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
            return api.sendMessage(`✨ ${username} ✨\n${ran[Math.floor(Math.random() * ran.length)]}`, event.threadID, event.messageID);
        }

        if (args[0] === 'remove') {
            const fina = dipto.replace("remove ", "");
            const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
            return api.sendMessage(`✨ ${username} ✨\n${dat}`, event.threadID, event.messageID);
        }

        if (args[0] === 'rm' && dipto.includes('-')) {
            const [fi, f] = dipto.replace("rm ", "").split(/\s*-\s*/);
            const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
            return api.sendMessage(`✨ ${username} ✨\n${da}`, event.threadID, event.messageID);
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const limit = parseInt(args[2]) || 100;
                const limited = data?.teacher?.teacherList?.slice(0, limit);
                const teachers = await Promise.all(limited.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = await usersData.getName(number).catch(() => number) || "Not found";
                    return {
                        name,
                        value
                    };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return api.sendMessage(`✨ ${username} ✨\nTotal Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data;
                return api.sendMessage(`✨ ${username} ✨\n❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'msg') {
            const fuk = dipto.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`✨ ${username} ✨\nMessage ${fuk} = ${d}`, event.threadID, event.messageID);
        }

        if (args[0] === 'edit') {
            const command = dipto.split(/\s*-\s*/)[1];
            if (command.length < 2) return api.sendMessage(`✨ ${username} ✨\n❌ | Invalid format! Use edit [YourMessage] - [NewReply]`, event.threadID, event.messageID);
            const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
            return api.sendMessage(`✨ ${username} ✨\nchanged ${dA}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            [comd, command] = dipto.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage(`✨ ${username} ✨\n❌ | Invalid format!`, event.threadID, event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
            const tex = re.data.message;
            const teacher = (await usersData.get(re.data.teacher)).name;
            return api.sendMessage(`✨ ${username} ✨\n✅ Replies added ${tex}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            [comd, command] = dipto.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage(`✨ ${username} ✨\n❌ | Invalid format!`, event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✨ ${username} ✨\n✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            [comd, command] = dipto.split(/\s*-\s*/);
            final = comd.replace("teach react ", "");
            if (command.length < 2) return api.sendMessage(`✨ ${username} ✨\n❌ | Invalid format!`, event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✨ ${username} ✨\n✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(`✨ ${username} ✨\n${data}`, event.threadID, event.messageID);
        }

        const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
        api.sendMessage(`✨ ${username} ✨\n${d}`, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                d,
                apiUrl: link
            });
        }, event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage(`✨ ${username} ✨\nCheck console for error`, event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({
    api,
    event,
    Reply,
    usersData
}) => {
    try {
        if (event.type == "message_reply") {
            const username = await usersData.getName(event.senderID);
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(`✨ ${username} ✨\n${a}`, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        const username = await usersData.getName(event.senderID);
        return api.sendMessage(`✨ ${username} ✨\nError: ${err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onChat = async ({
    api,
    event,
    message,
    usersData
}) => {
    try {
        const body = event.body ? event.body.toLowerCase() : "";
        const username = await usersData.getName(event.senderID);
        if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("bot") || body.startsWith("jan") || body.startsWith("babu") || body.startsWith("janu")) {
            const arr = body.replace(/^\S+\s*/, "");
            const randomReplies = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte panmr jonno"];
            if (!arr) {
                await api.sendMessage(`✨ ${username} ✨\n${randomReplies[Math.floor(Math.random() * randomReplies.length)]}`, event.threadID, (error, info) => {
                    if (!info) api.sendMessage(`✨ ${username} ✨\ninfo obj not found`, event.threadID, event.messageID);
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }, event.messageID);
            } else {
                const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
                await api.sendMessage(`✨ ${username} ✨\n${a}`, event.threadID, (error, info) => {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID,
                        a
                    });
                }, event.messageID);
            }
        }
    } catch (err) {
        const username = await usersData.getName(event.senderID);
        return api.sendMessage(`✨ ${username} ✨\nError: ${err.message}`, event.threadID, event.messageID);
    }
};
