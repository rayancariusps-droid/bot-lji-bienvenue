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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ]
});

// =====================
// IDS
// =====================
const WELCOME_CHANNEL_ID = "1483601884165181604";
const ROLES_CHANNEL_ID = "1483992171538550935";
const STATUS_ROLE_ID = "1486974281073168495";
const BOOSTER_ROLE_ID = "1450116107061956800";
const SUPPORT_CHANNEL_ID = "1483992232121077930";
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
      .setTitle(`❄️ Bienvenue sur Naya ❄️`)
      .setDescription(`${member} nous rejoint !\nNous sommes maintenant **${memberCount}** membres !\n\nPrends tes rôles dans <#${ROLES_CHANNEL_ID}> \n<@&1479358568091357234>\n\n💎 **Boosters** : si tu boost le serveur, tu recevras automatiquement le rôle <@&${BOOSTER_ROLE_ID}> !`)
      .setColor("#00BFFF")
      .setThumbnail(member.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Amuse-toi bien sur Naya ❄️" });

    await channel.send({
      embeds: [embed],
      files: ["https://media.tenor.com/YXjYxFaPVr0AAAAd/rukia-bankai.gif"]
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

  // SOUTIEN
  if (msg === "!soutien") {
    const channel = await client.channels.fetch(SUPPORT_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("❄️ Tu souhaites soutenir Naya ? Parfait !")
      .setColor("#00BFFF")
      .setDescription(`
❄️ **Rôle Statut :** Mets **/Naya** dans ton statut ! Cela te donnera automatiquement le rôle <@&${STATUS_ROLE_ID}> et accès aux permissions images/stickers.

❄️ **Boost :** En boostant le serveur, tu obtiendras le rôle <@&${BOOSTER_ROLE_ID}> ainsi que les permissions images.
`)
      .setFooter({ text: "Merci de soutenir Naya ❄️ !" });

    channel.send({
      embeds: [embed],
      files: ["https://media.tenor.com/4pWnI5KiQzgAAAAd/rukia-kuchiki-bleach-bankai.gif"]
    });
  }

  // REGLEMENT
  if (msg === "!règlement") {
    const channel = message.guild.channels.cache.get(REGLEMENT_CHANNEL_ID);
    if (!channel) return message.channel.send("Salon règlement introuvable");

    const embed = new EmbedBuilder()
      .setTitle("📜 Règlement du serveur")
      .setColor("#00BFFF")
      .setDescription(`
Bienvenue sur **Naya ❄️** !

Afin de garantir une ambiance saine et agréable pour tous, merci de respecter les règles suivantes :

**1. Respect**
• Pas d'insultes, propos haineux ou harcèlement envers quiconque  
• Évitez le racisme, sexisme, homophobie ou toute forme de discrimination  
• Soyez respectueux envers les membres et le staff

**2. Contenu**
• Pas de contenu NSFW, gore, piraté ou illégal  
• Pas de spam ou publicité non autorisée  
• Pas de liens suspects ou malveillants

**3. Salons**
• Respectez les thèmes de chaque salon  
• Les hors-sujets sont interdits  
• Utilisez les salons appropriés pour les suggestions, jeux, discussions générales, etc.

**4. Staff et modération**
• Écoutez les modérateurs et administrateurs  
• Ne contestez pas publiquement une sanction, contactez un membre du staff en privé  
• Les décisions du staff sont finales

**5. Sécurité**
• Ne partagez pas vos informations personnelles  
• Ne harcelez pas d’autres membres  
• Signalez tout comportement suspect au staff

**6. Activités du serveur**
• Restez courtois dans les discussions et les jeux  
• Respectez les limites des autres joueurs  
• Encouragez une communauté positive

Merci de suivre ces règles pour garantir un serveur agréable à tous. 💙
`);

    channel.send({
      embeds: [embed],
      files: ["https://media.tenor.com/EkQdd6qCqjgAAAAd/rukia-bankai.gif"]
    });
  }
});

// =====================
// ROLE STATUT / NAYA
// =====================
client.on("presenceUpdate", async (oldPresence, newPresence) => {
  try {
    if (!newPresence || !newPresence.member) return;

    const member = newPresence.member;

    const activities = newPresence.activities;
    const statutPerso = activities.find(act => act.type === 4)?.state;

    if (statutPerso && statutPerso.includes("/Naya")) {
      if (!member.roles.cache.has(STATUS_ROLE_ID)) {
        await member.roles.add(STATUS_ROLE_ID);
        console.log(`Rôle ajouté à ${member.user.tag} pour le statut Naya`);
      }
    } else {
      if (member.roles.cache.has(STATUS_ROLE_ID)) {
        await member.roles.remove(STATUS_ROLE_ID);
        console.log(`Rôle retiré à ${member.user.tag} car statut changé`);
      }
    }

  } catch (err) {
    console.error("Erreur statut → rôle :", err);
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN)
  .catch(err => console.error("Erreur connexion bot :", err));
