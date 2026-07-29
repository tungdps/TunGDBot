const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const M = require("../setup.json");

module.exports.run = async (client, msg, args) => {
    let page = args[1];
    let type = args[0];
    
    if (!type) return msg.channel.send("Try this command `" + M.prefix + "leaderboard stars 1`");
    if (page && isNaN(page)) return msg.channel.send("Please enter a number, not letters");
    
    // Tự động làm sạch URL để không bao giờ bị dính //
    let host = M.host.endsWith('/') ? M.host.slice(0, -1) : M.host;
    let http = `${host}/bot/api/leaderboard.php`;
    let fetchhost = page ? `${http}?in=${type}&page=${page}` : `${http}?in=${type}`;
    
    try {
        let res = await axios.get(fetchhost, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 10000
        });
        
        let body = res.data;

        if (typeof body === 'string') {
            try { 
                body = JSON.parse(body); 
            } catch(e) {
                return msg.channel.send("Web GDPS (FHGDPS) đang bật chặn Anti-Bot/Cloudflare nên không thể lấy dữ liệu tự động!");
            }
        }

        if (!body || !body.top) return msg.channel.send("Page leaderboard `" + type + "` is not found");
        
        let embed = new EmbedBuilder()
            .setTitle("Leaderboards of " + (body.type || type))
            .addFields(
                { name: "Top " + (body.topTo || "1"), value: String(body.top) },
                { name: "__For Next Page__", value: "`" + M.prefix + "leaderboard " + type + " <page-num>`" }
            )
            .setFooter({ text: "Now Page = " + (body.page || "1") });

        return msg.channel.send({ embeds: [embed] });
    } catch (err) {
        console.error("Lỗi Leaderboard API:", err.message);
        return msg.channel.send(`Không thể kết nối đến Web GDPS API (${http}). Hãy kiểm tra xem file \`/bot/api/leaderboard.php\` đã có trên web chưa!`);
    }
};

module.exports.help = {
    name: "leaderboard"
};
