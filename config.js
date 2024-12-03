require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    mongoUri: process.env.MONGODB_URI,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    staffRoleId: process.env.STAFF_ROLE_ID || "1111",
    logChannelId: process.env.LOG_CHANNEL_ID || "1111"
};

