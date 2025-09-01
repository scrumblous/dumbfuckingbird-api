const express = require("express")
const router = express.Router()
const { spawn } = require("node:child_process")

router.get("/fetch", (req, res) => {
    let command = spawn("fastfetch", ["-l", "none"])
    command.stdout.on('data', (data) => {
        res.send(data)
    })
})

module.exports = router