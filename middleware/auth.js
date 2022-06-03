const jwt = require("jsonwebtoken")

// Authentification par le TOKEN
function authenticateUser(req, res, next) {
    console.log("ctrl User")
    const header = req.header("Authorization")
    if (header == null) return res.status(403).json({ message: "Invalid" })

    const token = header.split(" ")[1]
    if (token == null) return res.status(403).json({ message: "Invalid" })

    jwt.verify(token, process.env.JWT_PASSWORD,(err, decoded) => {
        if (err) return res.status(403).json({ message: "Token invalid" + err })
        console.log("Le Token est bon !")
        next()
    })
}

module.exports = { authenticateUser }
