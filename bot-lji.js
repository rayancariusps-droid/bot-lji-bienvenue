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
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// IDS
const WELCOME_CHANNEL_ID = "1483601884165181604";
const ROLES_CHANNEL_ID = "1483992171538550935";
const REGLEMENT_CHANNEL_ID = "1483583968241651722";

// Ready
client.once("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// =====================
// WELCOME SYSTEM
// =====================
client.on("guildMemberAdd", async member => {
  try {
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    const message =
      `⛩️ Bienvenue sur ** Naya . lji** ${member} !\n` +
      `Nous sommes maintenant **${memberCount}** membres !\n` +
      `Prends tes rôles dans <#${ROLES_CHANNEL_ID}> \n` +
      `<@&1479358568091357234>`;

    await channel.send({
      content: message,
      files: [
        "https://media1.tenor.com/m/YXjYxFaPVr0AAAAC/akame-ga-kill.gif"
      ]
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
    sent.edit(`Pong ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  // membres
  if (msg === "!membres") {
    message.channel.send(
      `Nous sommes actuellement ${message.guild.memberCount} membres sur le serveur`
    );
  }

  // règlement
  if (msg === "!règlement") {
    const channel = message.guild.channels.cache.get(REGLEMENT_CHANNEL_ID);
    if (!channel) return message.channel.send("Salon règlement introuvable");

    const embed = new EmbedBuilder()
      .setTitle("Règlement du serveur :")
      .setColor("#5865F2")
      .setDescription(`
Bienvenue sur **や . Naya . lji**, un espace dédié aux passionnés d'anime. Pour garantir une expérience agréable à tous, merci de respecter les règles suivantes :

**1. Respect et bienveillance**
• Aucun propos haineux, discriminatoire ou harcèlement ne sera toléré.  
• Pas de conflits inutiles, restez courtois même en cas de désaccord.  
• Respectez les avis et goûts de chacun.

**2. Contenu approprié**
• Aucune image, vidéo ou texte explicite, gore ou illégal.  
• Utilisez les salons appropriés pour chaque type de contenu.  
• Le spoil est interdit sans balise appropriée.

**3. Convivialité et participation**
• Participez activement et respectez les discussions en cours.  
• Pas de spam, flood ou publicité non autorisée.  
• Les pseudonymes et avatars doivent rester corrects et non offensants.

**4. Utilisation des salons**
• Lisez la description des salons avant de poster.  
• Pas de hors-sujet excessif.  
• Les commandes bots doivent être utilisées uniquement dans les salons dédiés.

**5. Rôles et modération**
• Suivez les instructions des modérateurs.  
• En cas de problème, contactez un membre du staff.  
• Les avertissements et sanctions sont à la discrétion de l’équipe de modération.

Merci de respecter ces règles pour assurer une bonne ambiance.

![GIF](https://media1.tenor.com/m/YXjYxFaPVr0AAAAC/akame-ga-kill.gif)
`);

    channel.send({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
