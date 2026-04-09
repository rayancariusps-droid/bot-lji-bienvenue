// =====================
// CONFIG
// =====================
require("dotenv").config();

// =====================
// SERVEUR WEB
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
const TICKET_CHANNEL_ID = "1483599648018006150";

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// =====================
// WELCOME
// =====================
client.on("guildMemberAdd", async member => {
  try {
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("❄️ Bienvenue sur Naya ❄️")
      .setColor("#00BFFF")
      .setDescription(`${member} rejoint le serveur !\nNous sommes maintenant **${member.guild.memberCount}** membres.\n\nPrends tes rôles dans <#${ROLES_CHANNEL_ID}>`);

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
    await sent.edit(`🏓 ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  // MEMBRES
  if (msg === "!membres") {
    await message.channel.send(`👥 ${message.guild.memberCount} membres sur Naya ❄️`);
  }

  // SOUTIEN
  if (msg === "!soutien") {
    const channel = await client.channels.fetch(SUPPORT_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("❄️ **Soutenir __Naya__**")
      .setColor("#00BFFF")
      .setDescription(`
Commence par ajouter dans ton **statut** \`/Naya\` !  
Cela te permettra d'obtenir le rôle <@&${STATUS_ROLE_ID}>, et tu pourras profiter de certaines permissions spéciales.

Tu peux aussi **booster le serveur** !  
En boostant, tu recevras le rôle <@&${BOOSTER_ROLE_ID}> et des permissions supplémentaires.

Enfin, si vous le souhaitez, vous pouvez ajouter le **tag du serveur** !  
Cela nous aidera à gagner en visibilité et à renforcer Naya 💙

_ _  
`)
      .setImage("https://cdn.discordapp.com/attachments/1441925760020385915/1491651763714003016/17757078415539010381883418183249.gif");

    await channel.send({ embeds: [embed] });
  }

  // REGLEMENT
  if (msg === "!règlement") {
    const channel = message.guild.channels.cache.get(REGLEMENT_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("📜 **RÈGLEMENT NAYA**")
      .setColor("#00BFFF")
      .setDescription(`
🔹 [Discord Terms of Service](https://discord.com/terms)  
🔹 [Discord Community Guidelines](https://discord.com/guidelines)  
🔹 [Discord Safety Center](https://discord.com/safety)

---

**1. Respect et bienveillance**  
• Pas d’insultes, harcèlement ou discrimination  
• Restez courtois même en cas de désaccord  
• Respectez les avis et goûts de chacun  
• Aidez les nouveaux membres à se sentir bienvenus  

**2. Contenu**  
• Pas de NSFW / gore / contenu illégal  
• Pas de spam ou publicité non autorisée  
• Les spoilers doivent être signalés avec la balise appropriée  
• Partagez des contenus pertinents pour chaque salon  

**3. Salons**  
• Respectez le thème de chaque salon  
• Pas de hors-sujet excessif  
• Utilisez les fils de discussion si nécessaire  

**4. Staff et modération**  
• Écoutez les modérateurs et administrateurs  
• Les avertissements et sanctions sont à la discrétion de l’équipe  
• Ne contestez pas publiquement les décisions du staff  

**5. Ambiance**  
• Favorisez les échanges positifs et constructifs  
• Encouragez les autres membres et participez activement  

Merci de respecter ces règles afin de garder une ambiance saine et agréable pour tous 💙

*Pour tout problème avec le staff ou autre, hésite pas à ouvrir un [ticket](<#${TICKET_CHANNEL_ID}>)*
`)
      .setImage("https://cdn.discordapp.com/attachments/1441925760020385915/1491652731197325402/17757081041677587786669827963131.gif");

    channel.send({ embeds: [embed] });
  }
});

// =====================
// SYSTEME STATUT OP
// =====================
async function checkStatus(member) {
  try {
    const presence = member.presence;
    if (!presence) return;

    const customStatus = presence.activities.find(a => a.type === 4);
    const hasStatus = customStatus && customStatus.state && customStatus.state.includes("/Naya");

    // AJOUT ROLE
    if (hasStatus && !member.roles.cache.has(STATUS_ROLE_ID)) {
      await member.roles.add(STATUS_ROLE_ID);

      await member.send(`❄️ Merci ${member} !

Tu aides énormément **Naya** à se faire connaître 💙  
Continue comme ça, t’es un vrai ❄️ !`);

      console.log("Rôle ajouté à", member.user.tag);
    }

    // RETRAIT ROLE
    if (!hasStatus && member.roles.cache.has(STATUS_ROLE_ID)) {
      await member.roles.remove(STATUS_ROLE_ID);
      console.log("Rôle retiré à", member.user.tag);
    }

  } catch (err) {
    console.error("Erreur statut:", err);
  }
}

// EVENT
client.on("presenceUpdate", (oldPresence, newPresence) => {
  if (!newPresence || !newPresence.member) return;
  checkStatus(newPresence.member);
});

// SCAN AUTO (ANTI BUG DISCORD)
setInterval(async () => {
  client.guilds.cache.forEach(async guild => {
    const members = await guild.members.fetch();
    members.forEach(member => {
      checkStatus(member);
    });
  });
}, 30000);

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN);
