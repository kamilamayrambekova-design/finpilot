import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("."));
app.use(express.json());

function loadDB() {
  if (!fs.existsSync("db.json")) {
    fs.writeFileSync("db.json", JSON.stringify({ transactions: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync("db.json"));
}

function saveDB(data) {
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
}

app.post("/upload", upload.single("file"), (req, res) => {
  const arr = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", row => arr.push(row))
    .on("end", () => {
      const db = loadDB();
      db.transactions.push(...arr);
      saveDB(db);
      res.json({ status: "ok", added: arr.length });
    });
});

app.get("/ai", (req, res) => {
  res.json({
    recommendation: "Сократите траты на поставщиков — найдены более дешёвые альтернативы."
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("FinPilot running on port " + PORT));
