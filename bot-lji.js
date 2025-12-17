const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// Quand le bot est prêt
client.on("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// Message de bienvenue
client.on("guildMemberAdd", member => {
  const welcomeChannel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (!welcomeChannel) return;

  const memberCount = member.guild.memberCount;

  welcomeChannel.send(
    `🌸 Bienvenue sur **LJI World** ${member} !\n` +
    `>>> Nous sommes maintenant **${memberCount}** membres\n` +
    `Prends tes rôles dans <#${process.env.ROLES_CHANNEL_ID}>`
  );
});

// Poster les règles automatiquement si le salon est vide
client.on("ready", async () => {
  const rulesChannel = client.channels.cache.get(process.env.ROLES_CHANNEL_ID); // tu peux mettre le salon de règles ici si tu veux
  if (!rulesChannel) return;

  const messages = await rulesChannel.messages.fetch({ limit: 1 });
  if (messages.size === 0) {
    const rulesMessage = `
## _ _            Règlement 💮

**I. Le respect**  
Respectez-vous tous entre vous, pas d’insultes à part pour rigoler. Pas de discrimination.

**II. L’utilisation des salons**  
Évitez de spam et d’abuser des salons lock, etc.

**III. Informations personnelles**  
Pas de divulgation d’infos privées.

**IV. Contenu approprié**  
Pas de NSFW, gore, etc.

**V. Flood / Spam**  
Interdit sans autorisation.

**VI. Publicité / Grab**  
Interdit sans autorisation.

**VII. Le staff**  
Respectez les décisions du staff.

**VIII. Autres**  
Troll, ragebait, pub, spam, etc. = interdit.

**IX. Important**  
Si vous n’aimez pas quelqu’un, ignorez-le.

**X. Problèmes**  
Ouvrez un ticket en cas de souci.
`;
    rulesChannel.send(rulesMessage);
  }
});

client.login(process.env.DISCORD_TOKEN);
