const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot LJI en ligne 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur web actif sur le port " + PORT);
});const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
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
const WELCOME_CHANNEL_ID = "1441916367942193233"; // Salon bienvenue
const ROLES_CHANNEL_ID = "1446702499082928158";   // Salon rôle
const REGLEMENT_CHANNEL_ID = "1441951191234908290"; // Salon règlement

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
    `🌸 Bienvenue sur **LJI World** ${member} !\n` +
    `>>> Nous sommes maintenant **${memberCount}** membres\n` +
    `Prends tes rôles dans <#${ROLES_CHANNEL_ID}> 🌸`
  );
});

// Commandes
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // Commande ping
  if (msg === "!ping") {
    const sent = await message.channel.send("Pong...");
    sent.edit(`Pong! Latence : ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  // Commande membres
  if (msg === "!membres") {
    message.channel.send(`Nous sommes actuellement **${message.guild.memberCount}** membres sur le serveur !`);
  }

  // Commande règlement (une seule fois)
  if (msg === "!règlement") {
    if (fs.existsSync(FILE)) return; // déjà envoyé

    const embed = new EmbedBuilder()
      .setTitle("📜 Règlement du serveur 💮")
      .setColor("Blue")
      .setDescription(
        "**I. Le respect**\n" +
        "Respectez-vous tous entre vous, pas d’insultes à part pour rigoler. Si vos insultes blessent quelqu’un, excusez-vous. Pas de discrimination non plus.\n\n" +

        "**II. L’utilisation des salons**\n" +
        "Évitez de faire des fils dans les salons lock, évitez de spam les photos dans le chat, cmd, les salons pour les jeux, etc…\n" +
        "(Pas de spam de soundboard intense dans les vocs)\n\n" +

        "**III. Informations personnelles**\n" +
        "Toute divulgation d’informations privées concernant une personne est strictement interdite et les menaces à ce sujet le sont aussi.\n\n" +

        "**IV. Contenu approprié**\n" +
        "Aucun contenu NSFW, gore, etc. n’est autorisé sur le serveur, quelle que soit sa forme.\n\n" +

        "**V. Flood / Spam**\n" +
        "Le flood / spam est interdit sans l’autorisation d’un owner.\n\n" +

        "**VI. Publicité / Grab**\n" +
        "Les publicités au sein du serveur, sans autorisation d’un·e Owner, sont interdites. Si des gens vous grab en mp, veuillez le signaler à un·e Owner.\n\n" +

        "**VII. Le staff**\n" +
        "J’essaie de faire en sorte que le staff ne fasse pas d’abus de perms. Cela dit, si vous allez ragebait un owner ou modo et que vous vous faites mute, ce n’est plus mon problème (sauf si c’est un mute trop long, etc., contactez-moi en mp).\n\n" +

        "**VIII. Autres**\n" +
        "Troll, ragebait, insultes, nsfw, gore, pub, flood, spam = interdit.\n\n" +

        "**IX. Important**\n" +
        "Si vous n’aimez pas une personne ou avez des différents avec, je vous invite à ignorer cette personne."
      );

    const channel = await message.guild.channels.fetch(REGLEMENT_CHANNEL_ID);
    if (!channel) return;

    await channel.send({ embeds: [embed] });
    fs.writeFileSync(FILE, JSON.stringify({ envoye: true }));
    console.log("Règlement envoyé ✅");
  }
});

client.login(process.env.DISCORD_TOKEN);
