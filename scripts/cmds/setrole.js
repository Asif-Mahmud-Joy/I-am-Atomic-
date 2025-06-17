module.exports = {
  config: {
    name: "setrole2",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 1,
    shortDescription: {
      vi: "Chỉnh sửa role của lệnh",
      en: "Edit command role",
      bn: "কমান্ডের রোল সম্পাদনা করুন"
    },
    longDescription: {
      vi: "Chỉnh sửa quyền truy cập (role) cho các lệnh có role < 2",
      en: "Edit access level (role) of commands with role < 2",
      bn: "role < 2 এর জন্য কমান্ডগুলোর অ্যাক্সেস লেভেল পরিবর্তন করুন"
    },
    category: "info",
    guide: {
      vi: `
{pn} <commandName> <role>: cập nhật quyền truy cập cho lệnh
+ 0: Mọi người
+ 1: Quản trị viên
+ default: Reset về mặc định
Ví dụ:
  {pn} rank 1
  {pn} rank 0
  {pn} rank default

{pn} view|viewrole|show: Xem danh sách lệnh đã chỉnh sửa role`,
      en: `
{pn} <commandName> <role>: update role for command
+ 0: Everyone
+ 1: Admins only
+ default: Reset to default
Example:
  {pn} rank 1
  {pn} rank 0
  {pn} rank default

{pn} view|viewrole|show: See modified command roles`,
      bn: `
{pn} <commandName> <role>: কমান্ডের রোল সেট করুন
+ 0: সবাই ব্যবহার করতে পারবে
+ 1: শুধু অ্যাডমিন
+ default: ডিফল্ট রোলে রিসেট
উদাহরণ:
  {pn} rank 1
  {pn} rank 0
  {pn} rank default

{pn} view|viewrole|show: কোন কোন কমান্ডে রোল চেঞ্জ হয়েছে তা দেখুন`
    }
  },

  langs: {
    vi: {
      noEditedCommand: "✅ Không có lệnh nào bị chỉnh role trong nhóm này",
      editedCommand: "⚠️ Danh sách lệnh đã chỉnh role:\n",
      noPermission: "❗ Chỉ admin mới được dùng lệnh này",
      commandNotFound: "Không tìm thấy lệnh \"%1\"",
      noChangeRole: "❗ Không thể thay đổi role của lệnh \"%1\"",
      resetRole: "✅ Đã reset role về mặc định cho lệnh \"%1\"",
      changedRole: "✅ Đã cập nhật role của lệnh \"%1\" thành %2"
    },
    en: {
      noEditedCommand: "✅ No commands have modified roles in this group",
      editedCommand: "⚠️ Commands with modified roles:\n",
      noPermission: "❗ Only admins can use this command",
      commandNotFound: "Command \"%1\" not found",
      noChangeRole: "❗ Cannot change role of command \"%1\"",
      resetRole: "✅ Reset role of \"%1\" to default",
      changedRole: "✅ Updated role of \"%1\" to %2"
    },
    bn: {
      noEditedCommand: "✅ এই গ্রুপে কোনো কমান্ডের রোল পরিবর্তন করা হয়নি",
      editedCommand: "⚠️ পরিবর্তিত রোলসহ কমান্ডসমূহ:\n",
      noPermission: "❗ শুধু অ্যাডমিনরা এই কমান্ড ব্যবহার করতে পারবে",
      commandNotFound: "\"%1\" নামক কোনো কমান্ড পাওয়া যায়নি",
      noChangeRole: "❗ \"%1\" কমান্ডের রোল পরিবর্তন করা যাবে না",
      resetRole: "✅ \"%1\" কমান্ডের রোল ডিফল্টে রিসেট করা হয়েছে",
      changedRole: "✅ \"%1\" কমান্ডের রোল %2 এ আপডেট করা হয়েছে"
    }
  },

  onStart: async function ({ message, event, args, role, threadsData, getLang }) {
    const { commands, aliases } = global.GoatBot;
    const setRole = await threadsData.get(event.threadID, "data.setRole", {});

    const input = args[0]?.toLowerCase();
    if (["view", "viewrole", "show"].includes(input)) {
      if (!Object.keys(setRole).length)
        return message.reply(getLang("noEditedCommand"));
      let msg = getLang("editedCommand");
      for (const cmd in setRole) msg += `- ${cmd} => ${setRole[cmd]}\n`;
      return message.reply(msg);
    }

    if (!args[0] || (!args[1] && args[1] !== 0))
      return message.SyntaxError();
    if (role < 1)
      return message.reply(getLang("noPermission"));

    let commandName = args[0].toLowerCase();
    let newRole = args[1];

    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!command)
      return message.reply(getLang("commandNotFound", commandName));

    commandName = command.config.name;
    if (command.config.role > 1)
      return message.reply(getLang("noChangeRole", commandName));

    if (newRole === "default" || newRole === command.config.role.toString()) {
      delete setRole[commandName];
      await threadsData.set(event.threadID, setRole, "data.setRole");
      return message.reply(getLang("resetRole", commandName));
    }

    newRole = parseInt(newRole);
    setRole[commandName] = newRole;
    await threadsData.set(event.threadID, setRole, "data.setRole");
    return message.reply(getLang("changedRole", commandName, newRole));
  }
};
