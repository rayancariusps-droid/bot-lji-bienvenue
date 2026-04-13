// =====================
// CONFIGURATION
// =====================
const ROLES_CHANNEL_ID = "TON_ID_CHANNEL_ROLES";
const WELCOME_ROLE_ID = "TON_ID_ROLE";

// =====================
// EVENT WELCOME
// =====================
client.on("guildMemberAdd", async (member) => {
  try {

    const channel = member.guild.systemChannel 
      || member.guild.channels.cache.find(c => c.name === "welcome");

    if (!channel) return;

    await channel.send(
      `**Bienvenue sur Naya❄️${member}!Noussommesmaintenant${member.guild.memberCount}membres.**` +
      `**Prendstesrôlesici:<#${ROLES_CHANNEL_ID}><@&${WELCOME_ROLE_ID}>**`
    );

  } catch (err) {
    console.error("Erreur welcome:", err);
  }
});
