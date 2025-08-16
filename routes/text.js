const express = require('express')
const router = express.Router()
const authenticate = require("../auth.js")
const fs = require("fs")

router.get('/text', (req, res) => {
	fs.readFile(__dirname + "/../files/text.txt", 'utf-8', (err, data) => {
		if (err) {
			console.error('Error reading file', err)
			return res.status(500).send("Internal server error")
		}
		res.json({text: data})
	})
})

router.post('/text', authenticate, (req, res) => {
	let requestText = req.body.text
	fs.writeFile(__dirname + "/files/text.txt", String(requestText), function(err) {
		if (err) throw err
		console.log("done")
	})
	res.send(`authenticate request recieved: ${requestText}`)
})

module.exports = router