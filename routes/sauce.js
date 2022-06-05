const express = require('express')
const {
    getAllSauces,
    createSauce,
    getSauceById,
    deleteSauce,
    modidySauce,
    likeSauce
} = require("../controllers/sauces")
const { authenticateUser } = require("../middleware/auth")
const { upload } = require("../middleware/multer")
const saucesRouter = express.Router()
const bodyParser = require("body-parser")

saucesRouter.use(bodyParser.json())
saucesRouter.use(authenticateUser)

saucesRouter.get("/", getAllSauces)
saucesRouter.post("/", upload.single("image"), createSauce)
saucesRouter.get("/:id", getSauceById)
saucesRouter.delete("/:id", deleteSauce)
saucesRouter.put("/:id", upload.single("image"), modidySauce)
saucesRouter.post("/:id/like", likeSauce)

module.exports = { saucesRouter }