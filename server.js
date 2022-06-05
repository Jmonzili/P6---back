const { app, express } = require("./app")
const { saucesRouter } = require("./routes/sauce")
const { authRouter } = require("./routes/user")
const bodyParser = require("body-parser")
const port = 3000
const path = require("path")

// Connection to database
require("./mongo")

// Middleware
app.use(bodyParser.json())
app.use("/api/sauces", saucesRouter)
app.use("/api/auth", authRouter)

//Routes
app.get("/", (req, res) => res.send("Réponse envoyée avec succès !"))

// Listen
app.use("/images", express.static(path.join(__dirname, "images")))
app.listen(port, () => console.log("Listening on port " + port))