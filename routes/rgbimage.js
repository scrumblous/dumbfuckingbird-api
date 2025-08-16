const express = require("express")
const sharp = require("sharp")
const router = express.Router()

router.post("/rgbimage", async (req, res) => {
    let body = req.body
    let imgurl = body.url
    let img = await fetch(imgurl)
    let buffer = Buffer.from(await img.arrayBuffer())
    let { data, info } = await sharp(buffer)
        .raw()
        //.removeAlpha()
        .ensureAlpha()
        .resize(100, 100, {fit: "contain"})
        .toBuffer({resolveWithObject: true})
    let rgba_array = []
    for (let i = 0; i < data.length; i+=4){
        rgba_array.push([data[i], data[i + 1], data[i + 2], data[i+3]])
    }
    console.log(info)
    res.send(rgba_array.join(";"))
})
module.exports = router