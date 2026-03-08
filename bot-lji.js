// Serveur web pour garder le bot en ligne
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot Naya LJI en ligne");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur web actif sur le port " + PORT);
});

// Discord
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// IDS
const WELCOME_CHANNEL_ID = "1441916367942193233";
const ROLES_CHANNEL_ID = "1446702499082928158";  // ← ID corrigé : #『🎨』role

// Bot prêt
client.on("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// Message de bienvenue (compact comme avant)
client.on("guildMemberAdd", async member => {
  const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const memberCount = member.guild.memberCount;

  channel.send(
    `🐾 Bienvenue sur **や . Naya . lji** ${member} !\n` +
    `Nous sommes maintenant **${memberCount}** membres !\n` +
    `Prends tes rôles dans <#${ROLES_CHANNEL_ID}> \n` +
    `<@&1479358568091357234>`
  );
});

// Commandes simples
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg === "!ping") {
    const sent = await message.channel.send("Pong");
    sent.edit(`Pong ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  if (msg === "!membres") {
    message.channel.send(`Nous sommes actuellement ${message.guild.memberCount} membres sur le serveur`);
  }
});

client.login(process.env.DISCORD_TOKEN);
