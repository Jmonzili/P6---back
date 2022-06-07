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
    const { like, userId } =req.body
// Condition en cas d'erreur si la valeur du vote est invalide
    if (![1, 0, -1].includes(like)) return res.status(403),send({ message: "Invalid like value" })

    getSauce(req, res)
      .then((product) => updateVote(product, like, userId, res))
// Envois dans la database
      .then((prod) => prod.save())
// 
      .then((likesProduct) => sendClientResponse(likesProduct, res))
      .catch((err) => res.status(500).send(err))
}

// Fonction de mise à jour des votes
function updateVote(product, like, userId, res) {
    if (like === 1 || like === -1) return addVote(product, userId, like)
    return resetVote(product, userId, res)
}

// Fontion d'anulation du vote like = 0
function resetVote(product, userId, res) {
    const { usersLiked, usersDisliked } = product

// Erreur si le userId est dans les 2 array de users
    if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
    return Promise.reject("User seems to have voted both ways")

// Si le userId est dans aucun des array de users
    if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId))) 
    return Promise.reject("User seems to have not voted")

// Suppression de l'id dans l'array de usersLiked ou usersDisliked
    if (usersLiked.includes(userId)) {
        --product.likes
        product.usersLiked = product.usersLiked.filter((id) => id !== userId)
    } else {
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
    }
    return product
}

// Fonction d'ajout du like ou Dislike
function addVote(product, userId, like) {
    const { usersLiked, usersDisliked } = product
// Vérification de l'array a updater
    const votersArray = like === 1 ? usersLiked : usersDisliked

// Condition si l'utilisateur a déjà liké
    if (votersArray.includes(userId)) return product
// Envoi de l'id du user dans usersLiked
    votersArray.push(userId)

// Ajout du like ou du dislike
    like === 1 ? ++product.likes : ++product.dislikes
    return product
}

// Envois des fonctions a exporté dans l'app
module.exports = { getAllSauces, createSauce, getSauceById, deleteSauce, modidySauce, likeSauce }

/*
console.log("")
*/