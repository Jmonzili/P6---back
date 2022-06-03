const { User } = require("../mongo")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Création d'un utilisateur
async function createUser(req, res) {
  try { 
    const { email, password } = req.body
    const hashedPassword = await hashPassword(password)
    const user = new User({ email, password: hashedPassword});
    user.save()
    res.status(201).json({ message: 'Utilisateur bien été reçue' })
  } 
  catch(err) {
    res.status(409).json({ message: "User non enregistré: "+ err })
  }
  
}

// Cryptage du MDP
function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds)
}

// Connection d'un utilisateur
async function logUser(req, res) {
  const email = req.body.email
  const password = req.body.password
  const user = await User.findOne( {email: email})

// Vérification MDP
  const passwortCtrl = await bcrypt.compare(password, user.password)
  try { 
    if (!passwortCtrl) {
      return res.status(403).json({ error: 'Mot de passe incorrect !' });
    }
    const token = createToken(email)
    res.status(200).json({ userId: user._id, token: token})
  } 
  catch(err) {
    console.error(err)
    res.status(500).json({ message: "Erreur de connexion" })
  }
}

// Création TOKEN
function createToken(email) {
  const jwtPassword = process.env.JWT_PASSWORD
  return jwt.sign({email: email}, jwtPassword, {expiresIn: "24h"})
}

module.exports = {createUser, logUser}