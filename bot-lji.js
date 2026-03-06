// 🌐 Serveur web pour rester en ligne (Render / Freshping)
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot LJI en ligne 🐾");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur web actif sur le port " + PORT);
});

// 🤖 Discord
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🆔 IDS DES SALONS
const WELCOME_CHANNEL_ID = "1441916367942193233";
const ROLES_CHANNEL_ID = "1446702499082928158";
const REGLEMENT_CHANNEL_ID = "1441951191234908290";

// 📄 Fichier pour savoir si les règles ont déjà été envoyées
const FILE = "./regles_envoyees.json";

// Bot prêt
client.on("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// Message de bienvenue
client.on("guildMemberAdd", async member => {
  const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const memberCount = member.guild.memberCount;

  channel.send(
    `🐾 Bienvenue sur **や . Naya . lji** ${member} !\n` +
    `>>> Nous sommes maintenant **${memberCount}** membres\n` +
    `Prends tes rôles dans <#${ROLES_CHANNEL_ID}> \n\n` +
    `<@&1479358568091357234>`
  );
});

// Commandes
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg === "!ping") {
    const sent = await message.channel.send("Pong...");
    sent.edit(`Pong! Latence : ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  if (msg === "!membres") {
    message.channel.send(
      `Nous sommes actuellement **${message.guild.memberCount}** membres sur le serveur !`
    );
  }

  if (msg === "!règlement") {
    if (fs.existsSync(FILE)) return;

    const embed = new EmbedBuilder()
      .setTitle(" Règlement 🐾")
      .setColor("Blue")
      .setDescription(
        "**I. Le respect**\nRespectez-vous tous...\n\n" +
        "**IX. Important**\nSi vous n’aimez pas une personne..."
      );

    const channel = await message.guild.channels.fetch(REGLEMENT_CHANNEL_ID);
    if (!channel) return;

    await channel.send({ embeds: [embed] });
    fs.writeFileSync(FILE, JSON.stringify({ envoye: true }));
    console.log("Règlement envoyé ✅");
  }
});

client.login(process.env.DISCORD_TOKEN);
