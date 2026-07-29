const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const M = require("../setup.json");

module.exports.run = async (client, msg, args) => {
    let page = args[1];
    let type = args[0];
    
    if (!type) return msg.channel.send("Try this command `" + M.prefix + "leaderboard stars 1`");
    if (page && isNaN(page)) return msg.channel.send("Please enter a number, not letters");
    
    // Tự động ép về https và xóa dấu / ở cuối
    let host = M.host.replace("http://", "https://").replace(/\/+$/, "");
    
    // Thử các đường dẫn API phổ biến của GDPS
    let endpoints = [
        `${host}/bot/api/leaderboard.php`,
        `${host}/api/leaderboard.php`,
        `${host}/incl/leaderboard.php`
    ];

    let body = null;
    let successUrl = "";

    for (let url of endpoints) {
        let fetchhost = page ? `${url}?in=${type}&page=${page}` : `${url}?in=${type}`;
        try {
            let res = await axios.get(fetchhost, {
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json, text/plain, */*'
                },
                timeout: 5000
            });
            
            let data = res.data;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch(e) {}
            }

            if (data && (data.top || data.type)) {
                body = data;
                successUrl = url;
                break;
            }
        } catch (e) {
            // Thử tiếp endpoint khác nếu lỗi
        }
    }

    if (!body) {
        return msg.channel.send(`Không thể tìm thấy file API Leaderboard trên web GDPS (${host}).\n\n Hãy đảm bảo bạn đã upload thư mục **\`bot\`** (hoặc \`api\`) lên CPanel / File Manager của Web GDPS!`);
    }

    let embed = new EmbedBuilder()
        .setTitle("Leaderboards of " + (body.type || type))
        .addFields(
            { name: "Top " + (body.topTo || "1"), value: String(body.top) },
            { name: "__For Next Page__", value: "`" + M.prefix + "leaderboard " + type + " <page-num>`" }
        )
        .setFooter({ text: "Now Page = " + (body.page || "1") });

    return msg.channel.send({ embeds: [embed] });
};

module.exports.help = {
    name: "leaderboard"
};
