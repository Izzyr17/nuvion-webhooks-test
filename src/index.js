const express = require("express");
const webhooksRouter = require("./routes/webhooks");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 2023;

app.use(express.json());

app.use("/api/webhooks", webhooksRouter);

app.get("/", (req, res) => res.send("test-server running"));

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});
