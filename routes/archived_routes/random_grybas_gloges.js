const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require("path")

router.get('/randomgrybas', (req, res) => {
    fs.readdir(__dirname + '/grybas', (err, files) => {
        if (err){
            console.error(err)
        } else {
            let random_image = files[Math.round(Math.random() * (files.length - 1))]
            let image_path = path.join(__dirname, "grybas", random_image)
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

router.post('/randomgrybas', async (req, res) => {
    let buffer = req.body.buffer
    let name = req.body.name
    let date = String(Date.now())
    let new_name = `${date}-${name}`
    let path = __dirname + '/grybas/' + new_name
    let image = Buffer.from(buffer, 'base64')
    await fs.writeFile(path, image, (err) => {
        if (err) {
            res.status(500).send("failed")
        }
    })
})

router.get('/randomgloges', (req, res) => {
    fs.readdir(__dirname + '/gloges', (err, files) => {
        if (err){
            console.error(err)
        } else {
            let random_image = files[Math.trunc(Math.random() * files.length)]
            let image_path = path.join(__dirname, "gloges", random_image)
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

router.post('/randomgloges', async (req, res) => {
    let buffer = req.body.buffer
    let name = req.body.name
    let date = String(Date.now())
    let new_name = `${date}-${name}`
    let path = __dirname + '/gloges/' + new_name
    let image = Buffer.from(buffer, 'base64')
    await fs.writeFile(path, image, (err) => {
        if (err) {
            res.status(500).send("failed")
        }
    })
})

module.exports = router