const mongoose = require("mongoose");
const { unlink } = require("fs/promises")

// Contenu d'un produit sauce
const sauceSchema = new mongoose.Schema({
    userId: String,
    name: String,
    manufacturer: String,
    description: String,
    mainPepper: String,
    imageUrl: String,
    heat: Number,
    likes: Number,
    dislikes: Number,
    usersLiked: [String],
    usersDisliked: [String]
});
const Sauce = mongoose.model("Sauce", sauceSchema)

// Affichage de toutes les sauces dans la data base
function getAllSauces(req, res) {
    Sauce.find({})
      .then((sauces) => res.json(sauces))
      .catch(error => res.status(500).send(error))
}

// Séléctionné une sauce
function getSauce(req, res) {
    const { id } = req.params
    return Sauce.findById(id)
}

// Affichage de la sauce Sélectionné
function getSauceById(req, res) {
    getSauce(req, res)
      .then((product) => sendClientResponse(product, res))
      .catch((err) => res.status(500).send(err))
}

// Supprimer produit
function deleteSauce(req, res) {
    const { id } = req.params
    Sauce.findByIdAndDelete(id)
      .then((product) => sendClientResponse(product, res))
      .then((item) => deleteImage(item))
      .then((res) => console.log("FILE DELETED:", res))
      .catch((err) => res.status(500).send({ message: err }))
}

// Modifier produit
function modidySauce(req, res) {
    const {
        params: { id }
    } = req

    const hasNewImage = req.file != null
    const payload = makePayload(hasNewImage, req)

    Sauce.findByIdAndUpdate(id, payload)
      .then((dbResponse) => sendClientResponse(dbResponse, res))
      .then((product) => deleteImage(product))
      .then((res) => console.log("FILE DELETED:", res))
      .catch((err) => console.error("PROBLEM UPDATING:", err))
}

// Supression de l'image dans le dossier images
function deleteImage(product) {
    if (product == null) return
    console.log("DELETE IMAGE:", product)
    const fileToDelete = product.imageUrl.split("/").at(-1)
    return unlink("images/" + fileToDelete)
}

// Rémplacer l'image un produit si elle est modifier dans un produit
function makePayload(hasNewImage, req) {
    console.log("hasNewImage :", hasNewImage)
    if (!hasNewImage) return req.body
    const payload = JSON.parse(req.body.sauce)
    payload.imageUrl = makeImageUrl(req, req.file.filename)
    console.log("voici le body:", payload)
    return payload
}

// Envoi de la reponse du client
function sendClientResponse(product, res) {
    if (product == null) {
        return res.status(404).send({ message: "Object not found in database" })
    }
    console.log("ALL GOOD, UPDATING:", product)
    return Promise.resolve(res.status(200).send(product)).then(() => product)
}

// Création de l'Url de l'image ajouté par le client
function makeImageUrl(req, fileName) {
    return req.protocol + "://" + req.get('host') + "/images/" + fileName
}

// Création du produit sauce ajouté par le client
function createSauce(req, res) {
    const { body, file } = req
    const fileName = file.filename
    const sauceObject = JSON.parse(body.sauce)
    const { name, manufacturer, description, mainPepper, heat, userId } = sauceObject

// Récupération des data envoyer par le client pour la création
    const sauce = new Sauce( {
        userId: userId,
        name: name,
        manufacturer: manufacturer,
        description: description,
        mainPepper: mainPepper,
        imageUrl: makeImageUrl(req, fileName),
        heat: heat,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    })
// Sauvegarde du produit dans la Data Base
    sauce
      .save()
      .then((message) => res.status(201).send({ message }))
      .catch((err) => res.status(500).send({ message: err }))
}

// Fonction des Likes
function likeSauce(req, res) {
    const { like, userId } = req.body

    // Like === 0, -1, 1
    if(![1, -1, 0].includes(like)) return res.status(403).send({ message: "Invalid like value" })
    
    console.log({ like, userId })
    getSauce(req, res)
      .then((product) => updateVote(product, like, userId, res))
      .then((pr) => pr.save())
      .then((likesProduct) => sendClientResponse(likesProduct, res))
      .catch((err) => res.status(500).send(err))
}

function updateVote(product, like, userId, res) {
    if (like === 1 || like === -1) addVote(product, userId, like)
    return resetVote(product, userId, res)
}

// Annuler le vote
function resetVote(product, userId, res) {
    const { usersLiked, usersDisliked } = product
    if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId))) 
    return Promise.reject("User seems to have voted both ways" )

    if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId))) 
    return Promise.reject("User seems to have not voted")

    if (usersLiked.includes(userId)) {
        --product.likes
        product.usersLiked = product.usersLiked.filter((id) => id !== userId)
    } else {
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
    }

    return product
}

// Ajouter un Like ou un dislike
function addVote(product, userId, like) {
    const { usersLiked, usersDisliked } = product

    const votersArray = like === 1 ? usersLiked : usersDisliked
    if (votersArray.includes(userId)) return product
    votersArray.push(userId)

    like === 1 ? ++product.likes : ++product.dislikes
    return product
}

// Envois des fonctions a exporté dans l'app
module.exports = { getAllSauces, createSauce, getSauceById, deleteSauce, modidySauce, likeSauce }