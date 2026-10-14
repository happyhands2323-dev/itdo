const { randomUUID } = require("node:crypto");

const items = new Map();

function list() {
  return Array.from(items.values());
}

function get(id) {
  return items.get(id) ?? null;
}

function create({ title, description = "", done = false }) {
  const now = new Date().toISOString();
  const item = { id: randomUUID(), title, description, done, createdAt: now, updatedAt: now };
  items.set(item.id, item);
  return item;
}

function update(id, changes) {
  const existing = items.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...changes, id, updatedAt: new Date().toISOString() };
  items.set(id, updated);
  return updated;
}

function remove(id) {
  return items.delete(id);
}

module.exports = { list, get, create, update, remove };
