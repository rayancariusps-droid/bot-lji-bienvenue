// =====================
// CONFIG
// =====================
require("dotenv").config();

// =====================
// SERVEUR WEB (ANTI-OFF)
// =====================
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot Naya ❄️ en ligne");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur web actif sur le port " + PORT);
});

// =====================
// DISCORD
// =====================
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =====================
// IDS
// =====================
const WELCOME_CHANNEL_ID = "1483601884165181604";
const ROLES_CHANNEL_ID = "1483992171538550935";
const REGLEMENT_CHANNEL_ID = "1483583968241651722";

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// =====================
// WELCOME SYSTEM
// =====================
client.on("guildMemberAdd", async member => {
  try {
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    const memberCount = member.guild.memberCount;

    const message =
      `❄️ Bienvenue sur **Naya ❄️** ${member} !\n` +
      `Nous sommes maintenant **${memberCount}** membres !\n` +
      `Prends tes rôles dans <#${ROLES_CHANNEL_ID}> \n` +
      `<@&1479358568091357234>`;

    await channel.send({
      content: message
    });

  } catch (err) {
    console.error("Erreur welcome:", err);
  }
});

// =====================
// COMMANDES
// =====================
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // ping
  if (msg === "!ping") {
    const sent = await message.channel.send("Pong");
    sent.edit(`🏓 Pong : ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  // membres
  if (msg === "!membres") {
    message.channel.send(
      `👥 Nous sommes actuellement ${message.guild.memberCount} membres sur **Naya ❄️**`
    );
  }

  // règlement
  if (msg === "!règlement") {

    const embed = new EmbedBuilder()
      .setTitle("📜 Règlement du serveur")
      .setColor("#5865F2")
      .setDescription(`
Bienvenue sur **Naya ❄️**

**1. Respect**
• Pas d'insultes, haine ou harcèlement  
• Restez respectueux  

**2. Contenu**
• Pas de NSFW, gore ou illégal  
• Pas de spam ou pub  

**3. Salons**
• Respectez les thèmes  
• Pas de hors-sujet  

**4. Staff**
• Écoutez les modérateurs  
• Sanctions si nécessaire  

Merci de garder une bonne ambiance 💙
`)
      .setImage("https://media.tenor.com/YXjYxFaPVr0AAAAC/rukia-bankai-bleach.gif");

    message.channel.send({ embeds: [embed] });
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN)
  .catch(err => console.error("Erreur connexion bot :", err));
