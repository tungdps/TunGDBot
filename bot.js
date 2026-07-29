const req = require("request");
const reqp = require("request-promise");
const { EmbedBuilder } = require("discord.js");

module.exports.gdpsstatus = async (client, M) => {
    let channel = await client.channels.fetch(M["channel"]["gdpsstatus"]);
    if (channel) {
        setInterval(() => {
            req.get(M["host"] + "/bot/status.php", async (err, res, status) => {
                if (err || !res) return;

                let last = channel.messages;
                let latest = await last.fetch();
                let msg = latest.find(msg => msg.author.id == client.user.id);
                let embed = new EmbedBuilder();

                let dbStatus = "OK :green_circle:";
                let httpdStatus = "OK :green_circle:";

                if (res.statusCode !== 200) {
                    dbStatus = "ERROR :red_circle:";
                    httpdStatus = "ERROR :red_circle:";
                } else if (status !== "1") {
                    dbStatus = "ERROR :red_circle:";
                }

                let db = "**Database Status**: " + dbStatus;
                let hosting = "**Server Status**: " + httpdStatus;

                embed.setTitle("GDPS Status");
                embed.setDescription(db + "\n" + hosting + "\nThis will be refresh in 60 sec");

                if (!msg) {
                    embed.setFooter({ text: "times refreshed: 1" });
                    return channel.send({ embeds: [embed] });
                } else {
                    if (!msg.embeds[0] || !msg.embeds[0].footer) {
                        await msg.delete();
                        embed.setFooter({ text: "times refreshed: 1" });
                        return channel.send({ embeds: [embed] });
                    }
                    let time = msg.embeds[0].footer.text.split(": ");
                    embed.setFooter({ text: time[0] + ": " + (parseInt(time[1]) + 1) });
                    return msg.edit({ embeds: [embed] });
                }
            });
        }, 60000);
    } else {
        return false;
    }
};

module.exports.ratenotif = async (client, M) => {
    let channel = await client.channels.fetch(M["channel"]["ratestatus"]);
    setInterval(async () => {
        if (channel) {
            let host = M["host"] + "/bot/ratecheck.php";
            try {
                let key = await reqp({
                    uri: host,
                    json: true
                });
                setTimeout(() => {
                    req.get(host + "?verify=" + key["key"], (err, res, body) => {
                        if (err || !res || res.statusCode !== 200) return;
                        if (!body || body.indexOf("<br") !== -1) return;
                        let levels = typeof body === "string" ? JSON.parse(body) : body;
                        if (levels["err"]) return;
                        if (!levels["rated"] || levels["rated"].length == 0) return;

                        levels["rated"].forEach(level => {
                            let embed = new EmbedBuilder();
                            embed.setTitle(`${level["users"]} rated ${level["name"]}`);
                            let info = level["text"] + "\n";
                            info += "==============\n";
                            info += `**LevelID**: ${level["ID"]}\n`;
                            embed.setDescription(info);
                            channel.send({ embeds: [embed] });
                        });
                    });
                }, 5000);
            } catch (e) {
                console.error("Lỗi ratecheck:", e.message);
            }
        } else {
            console.log("Error: channel is not found");
        }
    }, 10000);
};
