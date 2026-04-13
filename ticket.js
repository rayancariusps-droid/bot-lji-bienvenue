const {
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ChannelType,
PermissionsBitField
} = require("discord.js");

// =====================
// IDS
// =====================
const IDS = {
TICKET_CHANNEL: "1483599648018006150",
LOG_CHANNEL: "1492774051549020180",
STAFF_ROLE: "1390086486291910726"
};

// =====================
// SYSTEM STORAGE
// =====================
const tickets = new Map(); // channelId -> { ownerId, type }
const aiTickets = new Set();

// =====================
// 🎫 TICKET PANEL
// =====================
async function sendTicketPanel(client, channel) {

const embed = new EmbedBuilder()
.setColor("#A020F0")
.setTitle("🎫・Tickets System Naya")
.setDescription(
`👑・ **Tickets Couronne**  
🔹 Tout ce qui est professionnel, échange de Dm4ll, fournisseur, etc.

🛡️・ **Tickets Gestion Staff**  
🔹 Devenir staff, questions relatives aux permissions, rankup / derank

🚨・ **Tickets Gestion Abus**  
🔹 Signalement, abus de permissions, problèmes généraux…

🎉・ **Tickets Animation**  
🔹 Devenir animateur, questions sur les animations…

🤝・ **Partenariat**  
🔹 Demandes de partenariat…

**Choisis la catégorie adaptée à ta demande pour ouvrir ton ticket**`
);

const row = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId("ticket_create")
.setPlaceholder("Ouvrir un ticket")
.addOptions([
{ label: "Couronne", value: "couronne" },
{ label: "Staff", value: "staff" },
{ label: "Abus", value: "abus" },
{ label: "Animation", value: "animation" },
{ label: "Partenariat", value: "partenariat" }
])
);

channel.send({ embeds: [embed], components: [row] });
}

// =====================
// 🎫 CREATE TICKET
// =====================
async function createTicket(i, type) {

const user = i.user;

const ch = await i.guild.channels.create({
name: `ticket-${type}-${user.id}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{
id: i.guild.roles.everyone.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},
{
id: user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},
{
id: IDS.STAFF_ROLE,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
});

tickets.set(ch.id, {
ownerId: user.id,
type
});

aiTickets.add(ch.id);

// LOG OPEN
const log = new EmbedBuilder()
.setColor("#A020F0")
.setTitle("🎫 Ticket Ouvert")
.addFields(
{ name: "User", value: `${user.tag}` },
{ name: "Type", value: type },
{ name: "Channel", value: `<#${ch.id}>` }
);

i.client.channels.cache.get(IDS.LOG_CHANNEL)?.send({ embeds: [log] });

// BUTTON CLOSE
const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("ticket_close")
.setLabel("🔒 Fermer")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("ticket_admin")
.setLabel("🛡 Panel Admin")
.setStyle(ButtonStyle.Secondary)
);

ch.send({ content: `<@${user.id}> <@&${IDS.STAFF_ROLE}>`, components: [row] });

return i.reply({ content: `Ticket créé : ${ch}`, ephemeral: true });
}

// =====================
// 🔒 CLOSE MODAL
// =====================
async function closeTicket(i) {

const modal = new ModalBuilder()
.setCustomId("ticket_close_modal")
.setTitle("Fermeture ticket");

modal.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId("reason")
.setLabel("Raison de fermeture")
.setStyle(TextInputStyle.Paragraph)
)
);

await i.showModal(modal);
}

// =====================
// 🧠 CLOSE FINAL
// =====================
async function closeTicketFinal(i) {

const reason = i.fields.getTextInputValue("reason");
const channel = i.channel;

const data = tickets.get(channel.id);

const log = new EmbedBuilder()
.setColor("#A020F0")
.setTitle("🎫 Ticket Fermé")
.addFields(
{ name: "User", value: `<@${data?.ownerId || "unknown"}>` },
{ name: "Type", value: data?.type || "unknown" },
{ name: "Staff", value: `${i.user.tag}` },
{ name: "Raison", value: reason }
);

i.client.channels.cache.get(IDS.LOG_CHANNEL)?.send({ embeds: [log] });

// DM user
if (data?.ownerId) {
const user = await i.client.users.fetch(data.ownerId).catch(()=>null);
user?.send(`🎫 Ton ticket a été fermé.\nRaison: ${reason}`).catch(()=>{});
}

tickets.delete(channel.id);
aiTickets.delete(channel.id);

await i.reply({ content: "Ticket fermé", ephemeral: true });

setTimeout(() => channel.delete().catch(()=>{}), 2000);
}

// =====================
// 🛡 PANEL ADMIN
// =====================
async function adminPanel(i) {

if (!i.member.roles.cache.has(IDS.STAFF_ROLE))
return i.reply({ content: "❌ Staff uniquement", ephemeral: true });

let list = "";

for (const [id, data] of tickets) {
list += `🎫 <#${id}> | <@${data.ownerId}> | ${data.type}\n`;
}

const embed = new EmbedBuilder()
.setColor("#A020F0")
.setTitle("🛡 Tickets ouverts")
.setDescription(list || "Aucun ticket");

await i.reply({ embeds: [embed], ephemeral: true });
}

// =====================
// 💬 IA RUKIA (simple ticket mode)
// =====================
function rukiaAI(message) {
const replies = [
"Je vois… explique un peu plus ❄️",
"Intéressant, continue 👀",
"Je vais t’aider à régler ça 🤖",
"OK, je comprends la situation 💜"
];

return replies[Math.floor(Math.random() * replies.length)];
}

// =====================
// INTERACTIONS FUSION
// =====================
module.exports = (client) => {

client.on("interactionCreate", async (i) => {

try {

// 🎫 CREATE
if (i.isStringSelectMenu() && i.customId === "ticket_create") {
return createTicket(i, i.values[0]);
}

// 🔒 CLOSE BTN
if (i.isButton() && i.customId === "ticket_close") {
return closeTicket(i);
}

// 🛡 ADMIN PANEL
if (i.isButton() && i.customId === "ticket_admin") {
return adminPanel(i);
}

// 🔒 CLOSE MODAL
if (i.isModalSubmit() && i.customId === "ticket_close_modal") {
return closeTicketFinal(i);
}

} catch (e) {
console.log("ticket error", e);
}
});

// =====================
// IA IN TICKET
// =====================
client.on("messageCreate", async (m) => {

if (m.author.bot) return;

if (aiTickets.has(m.channel.id)) {
return m.reply(`❄️ Rukia: ${rukiaAI(m.content)}`);
}

});

};
