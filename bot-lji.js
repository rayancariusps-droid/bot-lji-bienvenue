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

    const embed = new EmbedBuilder()
      .setTitle(`❄️ Bienvenue sur Naya`)
      .setDescription(`${member} nous rejoint !\nNous sommes maintenant **${memberCount}** membres !\n\nPrends tes rôles dans <#${ROLES_CHANNEL_ID}> \n<@&1479358568091357234>`)
      .setColor("#00FFFF")
      .setThumbnail(member.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Amuse-toi bien sur Naya ❄️" });

    await channel.send({ embeds: [embed] });

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

  // PING
  if (msg === "!ping") {
    const sent = await message.channel.send("Pong");
    sent.edit(`🏓 Pong : ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  // MEMBRES
  if (msg === "!membres") {
    message.channel.send(
      `👥 Nous sommes actuellement ${message.guild?.memberCount} membres sur **Naya ❄️**`
    );
  }

  // RÈGLEMENT
  if (msg === "!règlement") {
    const embed = new EmbedBuilder()
      .setTitle("📜 Règlement complet du serveur Naya ❄️")
      .setColor("#5865F2")
      .setDescription(`
Bienvenue sur **Naya ❄️** ! Merci de lire attentivement le règlement pour profiter pleinement du serveur.

**1. Respect**
• Pas d'insultes, propos haineux ou harcèlement  
• Évitez le trolling ou les conflits inutiles  
• Respectez toutes les communautés et origines  

**2. Contenu**
• Pas de NSFW, gore ou contenu illégal  
• Pas de spam, flood ou publicité sans autorisation  
• Partagez du contenu pertinent et sûr pour tous  

**3. Salons**
• Respectez le thème de chaque salon  
• Pas de hors-sujet répété  
• Les salons vocaux sont soumis aux mêmes règles de respect et de contenu  

**4. Staff**
• Écoutez les modérateurs et administrateurs  
• Toute contestation doit se faire en privé et poliment  
• Sanctions appliquées en cas de non-respect  

**5. Sécurité et vie privée**
• Ne partagez jamais vos informations personnelles  
• Ne harcelez ou n'espionnez pas d'autres membres  
• Signalez tout comportement suspect au staff  

**6. Publicité et promotions**
• Toute publicité doit être autorisée par le staff  
• Les liens suspects ou dangereux sont interdits  
• Les bots et serveurs externes doivent être approuvés avant partage  

**7. Sanctions**
• Avertissement verbal ou écrit  
• Mute temporaire  
• Kick ou ban en cas de récidive ou comportement grave  

Merci de contribuer à une **communauté saine et respectueuse** 💙
`)
      .setImage("https://media.tenor.com/Wj3A0g6Ol9EAAAAC/bleach-rukia.gif");

    message.channel.send({ embeds: [embed] });
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN)
  .catch(err => console.error("Erreur connexion bot :", err));
