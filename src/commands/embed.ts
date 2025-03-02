import {
	SlashCommandBuilder,
	EmbedBuilder,
	CommandInteraction,
} from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("guild-info")
		.setDescription("Sends guild information"),
	async execute(interaction: CommandInteraction) {
		try {
			// Defer the reply first to prevent timeout
			await interaction.deferReply({ flags: 64 });

			const guild = interaction.guild;
			if (!guild) {
				return await interaction.editReply(
					"This command can only be used in a server."
				);
			}

			// Fetch owner and calculate online members
			const owner = await guild.fetchOwner();
			const onlineMembers =
				guild.members.cache.filter(
					(member) =>
						member.presence?.status === "online" ||
						member.presence?.status === "idle" ||
						member.presence?.status === "dnd"
				).size || 0;

			const embed = new EmbedBuilder()
				.setColor("Random")
				.setTitle(guild.name)
				.setDescription(`Here's some info about the server`)
				.addFields({
					name: "Guild owner",
					value: owner ? `${owner.user.username}` : "Unknown",
				})
				.addFields(
					{
						name: "Total Members",
						value: `${guild.memberCount}`,
						inline: true,
					},
					{
						name: "Members online",
						value: `${onlineMembers}`,
						inline: true,
					}
				)
				.setTimestamp()
				.setFooter({
					text: `Guild ID: ${guild.id}`,
					iconURL: guild.iconURL() || undefined,
				});

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error("Error in guild-info command:", error);

			if (interaction.deferred) {
				await interaction.editReply(
					"There was an error fetching guild information."
				);
			} else if (!interaction.replied) {
				await interaction.reply({
					content: "There was an error fetching guild information.",
					flags: 64,
				});
			}
		}
	},
};
