const express = require('express')
const router = express.Router()
const sql = require("mysql2")
const { db_password, username } = require("./secrets.json")

router.get("/messages", async (req, res) => {
    let max_limit = 200
    let limit = req.query.amount
    limit > max_limit ? limit = max_limit : limit = req.query.amount
    let conn
    try {
        conn = sql.createConnection({
            host: "62.60.247.163",
            user: username,
            password: db_password,
            database: "my_experiments"
        })
        let query = `SELECT * FROM messages ORDER BY id ASC LIMIT ?`
        await conn.execute(query, [limit], (err, rows) => {
            if (err){res.status(500).send({err: err})}
            res.json(rows)
        })
    } catch (err){
        res.status(500).send({sql_error: err})
        console.error(err)
    } finally {
        conn.end()
    }
})
module.exports = router