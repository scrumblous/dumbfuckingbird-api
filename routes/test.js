const express = require("express")
const fs = require('fs')
const path = require("path")
const router = express.Router()

router.get('/test', (req, res) => {
	let image_path = path.join(__dirname, "grybas", "test1.png")
	let image_info = path.basename(image_path)
	fs.readFile(image_path, (err, data) => {
		if (err){
			console.error(err)
			res.status(500).json({error: "failed to load image"})
		}
		let base64_image = Buffer.from(data).toString("base64")
		let imageType = 'image/jpeg'
		res.json({
			name: image_info,
			image_data: base64_image,
			imageType: imageType
		})
	})
});

module.exports = router