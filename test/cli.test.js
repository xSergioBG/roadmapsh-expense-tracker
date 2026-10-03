const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const cli = path.resolve(__dirname, "../expenseTracker.js");
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "expenses-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "expenses.json");
  return { file, run: (...args) => spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8", env: { ...process.env, EXPENSES_FILE: file },
  }), read: () => JSON.parse(fs.readFileSync(file, "utf8")) };
}
test("IDs remain unique after deleting an earlier expense", t => {
  const f = fixture(t);
  for (const description of ["A", "B"]) assert.equal(f.run("add", "--description", description, "--amount", "2").status, 0);
  assert.equal(f.run("delete", "--id", "1").status, 0);
  assert.equal(f.run("add", "--description", "C", "--amount", "3").status, 0);
  assert.deepEqual(f.read().map(e => e.id), [2, 3]);
});
test("invalid amounts fail before data changes", t => {
  const f = fixture(t);
  f.run("add", "--description", "A", "--amount", "2");
  const before = fs.readFileSync(f.file, "utf8");
  for (const amount of ["-1", "0", "abc", "12abc", "Infinity", "1.234"]) {
    assert.equal(f.run("add", "--description", "B", "--amount", amount).status, 1);
    assert.equal(fs.readFileSync(f.file, "utf8"), before);
  }
});
test("corrupt JSON is preserved", t => {
  const f = fixture(t); fs.writeFileSync(f.file, "{broken");
  assert.equal(f.run("add", "--description", "A", "--amount", "2").status, 1);
  assert.equal(fs.readFileSync(f.file, "utf8"), "{broken");
});
test("months and IDs must be complete valid integers", t => {
  const f = fixture(t);
  for (const month of ["0", "13", "1abc", "1.5"]) assert.equal(f.run("summary", "--month", month).status, 1);
  for (const id of ["1abc", "0", "1.5", "999"]) assert.equal(f.run("delete", "--id", id).status, 1);
});
test("summary adds decimal amounts without floating point artifacts", t => {
  const f = fixture(t);
  f.run("add", "--description", "A", "--amount", "0.10");
  f.run("add", "--description", "B", "--amount", "0.20");
  assert.match(f.run("summary").stdout, /\$0\.3\s/);
});
test("invalid ledger shape and empty descriptions fail", t => {
  const f = fixture(t); fs.writeFileSync(f.file, "{}");
  assert.equal(f.run("list").status, 1);
  assert.equal(f.run("add", "--description", "  ", "--amount", "1").status, 1);
  assert.equal(fs.readFileSync(f.file, "utf8"), "{}");
});
test("empty initial ledger is accepted and list persists entries", t => {
  const f = fixture(t); fs.writeFileSync(f.file, "");
  assert.equal(f.run("add", "--description", "Cena", "--amount", "25.50").status, 0);
  assert.match(f.run("list").stdout, /Cena/);
  assert.equal(f.read()[0].amount, 25.5);
});
