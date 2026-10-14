const { eq, desc } = require("drizzle-orm");
const { db } = require("./db");
const { items } = require("./db/schema");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidId = (id) => typeof id === "string" && UUID_RE.test(id);

async function list({ done } = {}) {
  const query = db.select().from(items).orderBy(desc(items.createdAt));
  return typeof done === "boolean" ? query.where(eq(items.done, done)) : query;
}

async function get(id) {
  if (!isValidId(id)) return null;
  const [item] = await db.select().from(items).where(eq(items.id, id));
  return item ?? null;
}

async function create({ title, description = "", done = false }) {
  const [item] = await db.insert(items).values({ title, description, done }).returning();
  return item;
}

async function update(id, changes) {
  if (!isValidId(id)) return null;
  const [item] = await db
    .update(items)
    .set({ ...changes, updatedAt: new Date() })
    .where(eq(items.id, id))
    .returning();
  return item ?? null;
}

async function remove(id) {
  if (!isValidId(id)) return false;
  const deleted = await db.delete(items).where(eq(items.id, id)).returning({ id: items.id });
  return deleted.length > 0;
}

module.exports = { list, get, create, update, remove };
