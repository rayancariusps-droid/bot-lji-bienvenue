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
const WELCOME_CHANNEL_ID = "1483601884165181604";   // Salon de bienvenue
const ROLES_CHANNEL_ID = "1483992171538550935";     // Salon des rôles
const STATUS_ROLE_ID = "1486974281073168495";       // Rôle pour le statut /Naya
const BOOSTER_ROLE_ID = "1450116107061956800";      // Rôle Booster
const ANNOUNCE_CHANNEL_ID = "ID_DU_SALON";          // Remplace par l'ID du salon pour !annonce

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
    await message.channel.send(
      `👥 Nous sommes actuellement ${message.guild?.memberCount} membres sur **Naya ❄️**`
    );
  }

  // ANNONCE
  if (msg === "!annonce") {
    // Vérifie permission (optionnel)
    if (!message.member.permissions.has("ManageMessages")) {
      return message.reply("❌ Tu n'as pas la permission d'envoyer une annonce !");
    }

    const channel = await client.channels.fetch(ANNOUNCE_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("❄️ _Tu souhaites soutenir Naya ? Parfait !_")
      .setColor("#00FFFF")
      .setDescription(`
- <:arrow:1480533393509847042> **Rôle Statut :** Mets **/Naya** dans ton statut ! Cela te donnera automatiquement le rôle <@&${STATUS_ROLE_ID}> et accès aux permissions images/stickers.  

- <:arrow:1480533393509847042> **Boost :** En boostant le serveur, tu obtiendras le rôle <@&${BOOSTER_ROLE_ID}> ainsi que les permissions images.
`)
      .setFooter({ text: "Merci de soutenir Naya ❄️ !" });

    channel.send({ embeds: [embed] });
  }
});

// =====================
// ROLE STATUT / NAYA
// =====================
client.on("presenceUpdate", async (oldPresence, newPresence) => {
  try {
    if (!newPresence || !newPresence.member) return;

    const member = newPresence.member;

    // Vérifie le statut personnalisé
    const activities = newPresence.activities;
    const statutPerso = activities.find(act => act.type === 4)?.state; // type 4 = custom status

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
