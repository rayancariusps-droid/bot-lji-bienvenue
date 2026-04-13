module.exports = (client) => {

// =====================
// REACT GROUPS
// =====================
const REACT_GROUPS = {
genre: ["1398475032480583821","1398475137678049370","1441952406685352208"],
age: ["1492989745385443560","1492989803531342045"],
situation: ["1492993649141612575","1492993697627902033","1492993754225705070"],
couleur: ["1492991889815765072","1492991801332863118","1448233887431131146","1448056662706618430","1448058154124204124","1448056143736996062","1448058039109160980","1448057680680718550","1448233970910105691","1448233601354170421","1448057514678812732","1492992429454917765","1492992142904266752"]
};

// =====================
// MESSAGE COMMANDS
// =====================
client.on("messageCreate", async (message) => {
if (message.author.bot) return;

const msg = message.content.toLowerCase();

if (msg === "!react1") {
sendReact(message.channel,
"Selectionnez votre genre",
"https://cdn.discordapp.com/attachments/1483604871276924959/1492970578011885689/17760222888293576085531044650226.gif",
"genre",
[
["Homme","1398475032480583821"],
["Femme","1398475137678049370"],
["Non binaire","1441952406685352208"]
]);
}

if (msg === "!react2") {
sendReact(message.channel,
"Selectionnez votre age",
"https://cdn.discordapp.com/attachments/1483604871276924959/1492972636844851341/17760227849791360223833108533606.gif",
"age",
[
["Majeur","1492989745385443560"],
["Mineur","1492989803531342045"]
]);
}

if (msg === "!react3") {
sendReact(message.channel,
"Selectionnez votre situation",
"https://cdn.discordapp.com/attachments/1483604871276924959/1492994572148543518/17760280123167317692973232058489.gif",
"situation",
[
["Couple","1492993649141612575"],
["Celibataire","1492993697627902033"],
["Complique","1492993754225705070"]
]);
}

if (msg === "!react4") {
sendReact(message.channel,
"Selectionnez une couleur",
"https://cdn.discordapp.com/attachments/1483604871276924959/1493001041233444915/17760295614282950030473050114055.gif",
"couleur",
[
["Noir","1492991889815765072"],
["Blanc","1492991801332863118"],
["Gris","1448233887431131146"],
["Rouge","1448056662706618430"],
["Violet","1448058154124204124"],
["Rose","1448056143736996062"],
["Vert","1448058039109160980"],
["Jaune","1448057680680718550"],
["Orange","1448233970910105691"],
["Marron","1448233601354170421"],
["Bleu","1448057514678812732"],
["Bleu fonce","1492992429454917765"],
["Pastel","1492992142904266752"]
]);
}
});

// =====================
// FUNCTION
// =====================
function sendReact(channel, title, gif, id, options) {

const embed = new EmbedBuilder()
.setColor("#000000")
.setTitle(title)
.setDescription("Selectionne une option")
.setImage(gif);

const row = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId(id)
.setPlaceholder("Choisir")
.addOptions(options.map(o => ({
label: o[0],
value: o[1]
})))
);

channel.send({ embeds: [embed], components: [row] });
}

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {

if (!interaction.isStringSelectMenu()) return;

const group = REACT_GROUPS[interaction.customId];
if (!group) return;

const member = interaction.member;
const roleId = interaction.values[0];

await member.roles.remove(group).catch(() => {});
await member.roles.add(roleId).catch(() => {});

interaction.reply({
content: "Role mis a jour",
ephemeral: true
});
});

};
