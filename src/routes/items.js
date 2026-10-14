const express = require("express");
const store = require("../store");

const router = express.Router();

const ALLOWED_FIELDS = ["title", "description", "done"];

function validate(body, { partial }) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object" };
  }

  const data = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (!partial && data.title === undefined) {
    return { error: "title is required" };
  }
  if (data.title !== undefined) {
    if (typeof data.title !== "string" || !data.title.trim()) {
      return { error: "title must be a non-empty string" };
    }
    if (data.title.length > 200) return { error: "title must be 200 characters or fewer" };
    data.title = data.title.trim();
  }
  if (data.description !== undefined) {
    if (typeof data.description !== "string") return { error: "description must be a string" };
    if (data.description.length > 2000) {
      return { error: "description must be 2000 characters or fewer" };
    }
  }
  if (data.done !== undefined && typeof data.done !== "boolean") {
    return { error: "done must be a boolean" };
  }
  if (partial && Object.keys(data).length === 0) {
    return { error: `Provide at least one of: ${ALLOWED_FIELDS.join(", ")}` };
  }

  return { data };
}

router.get("/", (req, res) => {
  let items = store.list();
  if (req.query.done === "true" || req.query.done === "false") {
    const done = req.query.done === "true";
    items = items.filter((item) => item.done === done);
  }
  res.json({ data: items, count: items.length });
});

router.get("/:id", (req, res) => {
  const item = store.get(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json({ data: item });
});

router.post("/", (req, res) => {
  const { data, error } = validate(req.body, { partial: false });
  if (error) return res.status(400).json({ error });
  const item = store.create(data);
  res.status(201).location(`${req.baseUrl}/${item.id}`).json({ data: item });
});

function handleUpdate(partial) {
  return (req, res) => {
    if (!store.get(req.params.id)) return res.status(404).json({ error: "Item not found" });
    const { data, error } = validate(req.body, { partial });
    if (error) return res.status(400).json({ error });
    const changes = partial ? data : { description: "", done: false, ...data };
    res.json({ data: store.update(req.params.id, changes) });
  };
}

router.put("/:id", handleUpdate(false));
router.patch("/:id", handleUpdate(true));

router.delete("/:id", (req, res) => {
  if (!store.remove(req.params.id)) return res.status(404).json({ error: "Item not found" });
  res.status(204).end();
});

module.exports = router;
