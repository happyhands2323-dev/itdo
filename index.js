const express = require("express");
const bodyParser = require("body-parser");
const itemsRouter = require("./src/routes/items");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(bodyParser.json({ limit: "100kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100kb" }));

app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    endpoints: {
      health: "GET /api/health",
      listItems: "GET /api/items?done=true|false",
      getItem: "GET /api/items/:id",
      createItem: "POST /api/items",
      replaceItem: "PUT /api/items/:id",
      updateItem: "PATCH /api/items/:id",
      deleteItem: "DELETE /api/items/:id",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/items", itemsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
