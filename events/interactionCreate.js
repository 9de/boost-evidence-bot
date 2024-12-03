module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
                try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const errorMessage = {
                embeds: [{
                    title: '❌ Error',
                    description: 'There was an error executing this command.',
                    color: 0xff0000
                }],
                ephemeral: true
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
};