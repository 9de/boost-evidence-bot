// commands/echo.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Send a message to a specific channel (Admin only)')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reply_to')
                .setDescription('Message ID to reply to (optional)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check for administrator permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ This command is only available to administrators.',
                ephemeral: true
            });
        }

        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel');
        const replyToId = interaction.options.getString('reply_to');

        try {
            if (replyToId) {
                try {
                    // Try to fetch the message to reply to
                    const messageToReply = await channel.messages.fetch(replyToId);
                    
                    await channel.send({
                        content: message,
                        reply: {
                            messageReference: messageToReply.id,
                            failIfNotExists: true
                        }
                    });
                } catch (error) {
                    return interaction.reply({
                        content: '❌ Could not find the message to reply to. Make sure the message ID is correct and from the selected channel.',
                        ephemeral: true
                    });
                }
            } else {
                // Send normal message if no reply_to is provided
                await channel.send(message);
            }
            
            await interaction.reply({
                content: `✅ Message sent to ${channel}${replyToId ? ' as a reply' : ''}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `❌ Failed to send message to ${channel}. Make sure I have permission to send messages there.`,
                ephemeral: true
            });
        }
    }
};