const { User } = require("../mongo")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Création d'un utilisateur
async function createUser(req, res) {
  try { 
    const { email, password } = req.body
    const hashedPassword = await hashPassword(password)
    const user = new User({ email, password: hashedPassword});
    await user.save()
    res.status(201).send({ message: 'Utilisateur bien été reçue !' })
  } 
  catch(err) {
    res.status(409).send({ message: "User non enregistré:" + err })
  }
}

// Cryptage du MDP
function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds)
}

// Connection d'un utilisateur
async function logUser(req, res) {
  try { 
    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne( {email: email})
  
  // Vérification MDP
    const passwortCtrl = await bcrypt.compare(password, user.password)
    if (!passwortCtrl) {
      return res.status(403).send({ error: 'Mot de passe incorrect !' });
    }
    const token = createToken(email)
    res.status(200).send({ userId: user._id, token: token})
  } 
  catch(err) {
    console.error(err)
    res.status(500).send({ message: "Erreur de connexion" })
  }
}

// Création TOKEN
function createToken(email) {
  const jwtPassword = process.env.JWT_PASSWORD
  return jwt.sign({email: email}, jwtPassword, { expiresIn: "24h" })
}

module.exports = {createUser, logUser}