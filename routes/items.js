const express = require("express");
const router = express.Router();
let items = require("../data/items");

router.get("/", (req, res) => res.json(items));

router.get("/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).send("Item not found");
  res.json(item);
});

router.post("/", (req, res) => {
  const { name } = req.body;
  // Trim leading and trailing whitespace
  const trimmedName = name.trim();
  // Validate name is not just whitespace
  if (!trimmedName) {
    return res.status(400).send("Name is required");
  }

  const newItem = {
    id: Date.now(),
    name: trimmedName,
    completed: false,
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

router.put("/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).send("Item not found");
  // ✅ Fix: apply the updates
  if (typeof req.body.name === "string") {
    item.name = req.body.name.trim(); // Optional: normalize input
  }
  if (typeof req.body.completed === "boolean") {
    item.completed = req.body.completed;
  }
  res.json(item);
});

router.delete("/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).send("Item not found");
  items = items.filter((i) => i.id !== parseInt(req.params.id));
  res.status(204).send();
});

module.exports = router;
