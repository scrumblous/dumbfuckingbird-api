const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 1234;
const cors = require("cors");
const fs = require("fs")

let default_page = __dirname + "/files/default_page.html";

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

fs.readdir("./routes/", (err, files) => {
  files.forEach(file => {
    if (file.endsWith(".js")){
      app.use("", require(`./routes/${file}`))
    }
  })
})

app.get("", (req, res) => {
  res.sendFile(default_page);
});

// Start the server
app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});
