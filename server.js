const express = require("express");
const app = express();

// Page principale
app.get("/", (req, res) => res.send("Bot en ligne 🌸"));

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur ping sur le port ${PORT}`));
