const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const M = require("../setup.json");
const http = M.host + "/bot/api/leaderboard.php";

module.exports.run = async (client, msg, args) => {
    let page = args[1];
    let type = args[0];
    
    if (!type) return msg.channel.send("Try this command `" + M.prefix + "leaderboard stars 1`");
    if (page && isNaN(page)) return msg.channel.send("Please enter a number, not letters");
    
    let fetchhost = page ? `${http}?in=${type}&page=${page}` : `${http}?in=${type}`;
    
    try {
        let res = await axios.get(fetchhost, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        
        let body = res.data;

        if (!body) return msg.channel.send("Please use `stars` or `demon`");
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) {}
        }
        if (!body.top) return msg.channel.send("Page leaderboard `" + type + "` is not found");
        
        let embed = new EmbedBuilder()
            .setTitle("Leaderboards of " + body.type)
            .addFields(
                { name: "Top " + body.topTo, value: String(body.top) },
                { name: "__For Next Page__", value: "`" + M.prefix + "leaderboard " + type + " <page-num>`" }
            )
            .setFooter({ text: "Now Page = " + body.page });

        return msg.channel.send({ embeds: [embed] });
    } catch (err) {
        console.error("Lỗi Leaderboard API:", err.message);
        return msg.channel.send(`Không thể kết nối đến Web GDPS (${M.host}). Hãy kiểm tra xem host web GDPS của bạn có đang mở không!`);
    }
};

module.exports.help = {
    name: "leaderboard"
};
