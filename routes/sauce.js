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
const sauceRouter = express.Router()

sauceRouter.get("/", getAllSauces)
sauceRouter.post("/", authenticateUser, upload.single("image"), createSauce)
sauceRouter.get("/:id", getSauceById)
sauceRouter.delete("/:id", authenticateUser, deleteSauce)
sauceRouter.put("/:id", authenticateUser, upload.single("image"), modidySauce)
sauceRouter.post("/:id/like", likeSauce)

module.exports = { sauceRouter }