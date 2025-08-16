const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require("path")

router.get('/nailrage', (req, res) => {
    fs.readdir(__dirname + '/nailrages', (err, files) => {
        if (err){
            console.error(err)
        } else {
            let random_image = files[Math.round(Math.random() * (files.length - 1))]
            let image_path = path.join(__dirname, "nailrages", random_image)
            fs.readFile(image_path, (err, data) => {
                if (err){
                    console.error(err)
                    res.status(500).json({error: "failed to load image"})
                }
                let base64_image = Buffer.from(data).toString("base64")
                let imageType = 'image/jpeg'
                let image_info = path.basename(image_path)
                res.json({
                    name: image_info,
                    image_data: base64_image,
                    imageType: imageType
                })
            })
        }
    })
})

router.post('/nailrage', async (req, res) => {
    let buffer = req.body.buffer
    let name = req.body.name
    let date = String(Date.now())
    let new_name = `${date}-${name}`
    let path = __dirname + '/nailrages/' + new_name
    let image = Buffer.from(buffer, 'base64')
    await fs.writeFile(path, image, (err) => {
        if (err) {
            res.status(500).send("failed")
        }
    })
})

module.exports = router