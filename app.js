const express = require('express');
const mongoose = require('mongoose');

// Database

mongoose.connect('mongodb+srv://<username>:<password>@cluster0.n5nyb.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// CORS -- header /
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json())

//Routes
app.post("/api/auth/signup", (req, res) => {
    console.log("Signup request:", req.body)
    res.json({ message: 'Votre requête a bien été reçue !' })
})
app.get("/", (req, res) => res.send("Réponse envoyée avec succès !"))

module.exports = app;