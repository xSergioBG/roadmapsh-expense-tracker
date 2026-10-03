const fs = require("fs");
const path = require("path");
const { Command } = require("commander");

const dataFilePath = process.env.EXPENSES_FILE || path.join(__dirname, "expenses.json");

// Invalid JSON must never be interpreted as an empty ledger.
function loadExpenses() {
  let data;
  try { data = fs.readFileSync(dataFilePath, "utf8"); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const expenses = data.trim() ? JSON.parse(data) : [];
  if (!Array.isArray(expenses) || expenses.some(e => !e ||
      !Number.isSafeInteger(e.id) || e.id < 1 || typeof e.description !== "string" ||
      !Number.isFinite(e.amount) || e.amount <= 0 || typeof e.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || Number.isNaN(Date.parse(e.date))) ||
      new Set(expenses.map(e => e.id)).size !== expenses.length) {
    throw new Error("Invalid expenses file; recover it before making changes.");
  }
  return expenses;
}
function saveExpenses(expenses) {
  const temporary = dataFilePath + "." + process.pid + ".tmp";
  try {
    fs.writeFileSync(temporary, JSON.stringify(expenses, null, 2), "utf8");
    fs.renameSync(temporary, dataFilePath);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
function positiveInteger(value, label) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) {
    throw new Error(label + " must be a positive integer.");
  }
  return Number(value);
}
function addExpense(description, amount) {
  if (!description.trim()) throw new Error("Description cannot be empty.");
  if (!/^\d+(?:\.\d{1,2})?$/.test(String(amount)) || Number(amount) <= 0 ||
      !Number.isSafeInteger(Math.round(Number(amount) * 100))) {
    throw new Error("Amount must be positive with at most two decimal places.");
  }
  const expenses = loadExpenses();
  const id = expenses.reduce((maximum, e) => Math.max(maximum, e.id), 0) + 1;
  positiveInteger(id, "ID");
  expenses.push({
    id, date: new Date().toISOString().split("T")[0],
    description: description.trim(), amount: Number(amount),
  });
  saveExpenses(expenses);
  console.log(`Expense added successfully (ID: ${id})`);
}

// List all expenses
function listExpenses() {
  const expenses = loadExpenses();
  console.log("ID  Date       Description  Amount");
  expenses.forEach((expense) => {
    console.log(
      `${expense.id}   ${expense.date}  ${expense.description}  $${expense.amount}`
    );
  });
}

// Get the total of all expenses
function getSummary(month = null) {
  const expenses = loadExpenses();
  let total = 0;
  const filteredExpenses = month
    ? expenses.filter(
        (expense) => new Date(expense.date).getMonth() + 1 === month
      )
    : expenses;

  filteredExpenses.forEach((expense) => {
    total += Math.round(expense.amount * 100);
  });

  total /= 100;
  if (month) {
    console.log(`Total expenses for month ${month}: $${total}`);
  } else {
    console.log(`Total expenses: $${total}`);
  }
}

// Delete an expense by ID
function deleteExpense(id) {
  let expenses = loadExpenses();
  if (!expenses.some(expense => expense.id === id)) throw new Error(`Expense with ID ${id} not found.`);
  expenses = expenses.filter((expense) => expense.id !== id);
  saveExpenses(expenses);
  console.log("Expense deleted successfully");
}

// Command-line interface setup
const program = new Command();

program
  .command("add")
  .description("Add a new expense")
  .requiredOption("--description <description>", "Description of the expense")
  .requiredOption("--amount <amount>", "Amount of the expense")
  .action((cmd) => {
    addExpense(cmd.description, cmd.amount);
  });

program
  .command("list")
  .description("List all expenses")
  .action(() => {
    listExpenses();
  });

program
  .command("summary")
  .description("Show a summary of expenses")
  .option("--month <month>", "Specify the month (1-12) to filter by")
  .action((cmd) => {
    const month = cmd.month === undefined ? null : positiveInteger(cmd.month, "Month");
    if (month !== null && month > 12) throw new Error("Month must be between 1 and 12.");
    getSummary(month);
  });

program
  .command("delete")
  .description("Delete an expense by ID")
  .requiredOption("--id <id>", "ID of the expense to delete")
  .action((cmd) => {
    deleteExpense(positiveInteger(cmd.id, "ID"));
  });

// Parse the command-line arguments
try {
  program.parse(process.argv);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
