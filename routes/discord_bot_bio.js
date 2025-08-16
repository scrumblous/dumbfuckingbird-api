const express = require("express")
const router = express.Router()
const authenticate = require("../auth.js")
const fs = require("fs")

router.get('/discord_bot_bio', (req, res) => {
	fs.readFile(__dirname + "/../files/discord_bot_bio.txt", 'utf-8', (err,data) => {
		if (err) {
			console.error('Error reading files', err)
			return res.status(500).send("Internal server error")
		}
		res.json({text: data})
	})
})

router.post('/discord_bot_bio', authenticate, (req, res) => {
	let requestText = req.body.text
	fs.writeFile(__dirname + "/../files/discord_bot_bio.txt", String(requestText), function(err) {
		if (err) throw err
		console.log("done")
	})
	res.send(`authenticate request recieved: ${requestText}`)
})

module.exports = router;