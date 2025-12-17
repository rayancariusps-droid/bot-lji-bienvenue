
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.on("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on("guildMemberAdd", member => {
  const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (!channel) return;

  const memberCount = member.guild.memberCount;

  channel.send(
    `🌸 Bienvenue sur **LJI World** ${member} !\n` +
    `>>> Nous sommes maintenant **${memberCount}** membres\n` +
    `Prends tes rôles dans <#${process.env.ROLES_CHANNEL_ID}> 🌸`
  );
});

client.login(process.env.DISCORD_TOKEN);
