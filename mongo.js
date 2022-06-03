// Database
const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator")

// Contenu d'un Utilisateur
const userSchema = mongoose.Schema( {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator)

//Utilisateur
const User = mongoose.model("User", userSchema);

// Connection a la data base
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
{ useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((err) => console.error('Connexion à MongoDB échouée !'));
    
module.exports = {mongoose, User}