const express = require("express");
const router = express.Router();
const sql = require("mysql");
const { db_password, username } = require("./secrets.json");

router.get("/visits", (req, res) => {
  let conn = sql.createConnection({
    host: "62.60.247.163",
    user: username,
    password: db_password,
    database: "my_experiments",
  });
  let visitor_amount;
  conn.connect(function (err) {
    if (err) throw err;
    conn.query("SELECT ip_address FROM visits", function (err, result, fields) {
      if (err) throw err;
      visitor_amount = result.length;
    });
    conn.query(
      "SELECT total_visits, discord_visits, clicked_no FROM total_visits",
      function (err, result, fields) {
        if (err) throw err;
        let real_visits =
          Number(result[0].discord_visits) + Number(result[0].clicked_no);
        res.json({
          visits: result[0].total_visits,
          real_visitors: real_visits,
          unique_visitors: visitor_amount,
        });
      },
    );
  });
});

module.exports = router;
