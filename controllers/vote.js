const { getSauce, sendClientResponse } = require("./sauces")

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

module.exports = { likeSauce }