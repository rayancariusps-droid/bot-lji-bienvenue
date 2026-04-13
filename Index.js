require("dotenv").config();

const express = require("express");
const fs = require("fs");

const {
Client,
GatewayIntentBits,
Collection,
SlashCommandBuilder,
Routes,
REST
} = require("discord.js");

const {
joinVoiceChannel,
createAudioPlayer,
createAudioResource,
AudioPlayerStatus
} = require("@discordjs/voice");

const play = require("play-dl");

// =====================
// CONFIG
// =====================
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// =====================
// CLIENT (UNE SEULE FOIS)
// =====================
const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildVoiceStates
]
});

client.commands = new Collection();

// =====================
// EXPRESS
// =====================
const app = express();
app.get("/", (_, res) => res.send("Bot OK"));
app.listen(3000);

// =====================
// STATE
// =====================
const guilds = new Map();

function get(guildId) {
if (!guilds.has(guildId)) {
guilds.set(guildId, {
queue: [],
playing: false,
player: createAudioPlayer(),
connection: null
});
}
return guilds.get(guildId);
}

// =====================
// MUSIC NEXT
// =====================
async function next(guildId) {
const g = get(guildId);

if (!g.queue.length) {
g.playing = false;
return;
}

const song = g.queue[0];

try {
const stream = await play.stream(song);
const res = createAudioResource(stream.stream, { inputType: stream.type });

g.player.play(res);
g.playing = true;

g.player.once(AudioPlayerStatus.Idle, () => {
g.queue.shift();
next(guildId);
});
} catch (e) {
console.log(e);
g.queue.shift();
next(guildId);
}
}

// =====================
// SLASH COMMANDS
// =====================
const cmds = [
new SlashCommandBuilder()
.setName("play")
.setDescription("Play music")
.addStringOption(o =>
o.setName("q")
.setDescription("url or name")
.setRequired(true)
)
].map(x => x.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("ready", async () => {
console.log("Bot ON");

await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{ body: cmds }
);
});

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (i) => {
if (!i.isChatInputCommand()) return;

const g = get(i.guild.id);

if (i.commandName === "play") {
let q = i.options.getString("q");

if (!q.includes("http")) {
const s = await play.search(q, { limit: 1 });
if (s.length) q = s[0].url;
}

g.queue.push(q);

if (!g.playing) next(i.guild.id);

return i.reply("🎵 Ajouté");
}
});

client.login(TOKEN);
