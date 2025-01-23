const fs = require("fs");
const path = require("path");
const { Command } = require("commander");

const dataFilePath = path.join(__dirname, "expenses.json");

// Load expenses from file
function loadExpenses() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save expenses to file
function saveExpenses(expenses) {
  fs.writeFileSync(dataFilePath, JSON.stringify(expenses, null, 2), "utf8");
}

// Add an expense
function addExpense(description, amount) {
  const expenses = loadExpenses();
  const expense = {
    id: expenses.length + 1,
    date: new Date().toISOString().split("T")[0], // Get the current date (YYYY-MM-DD)
    description,
    amount: parseFloat(amount),
  };
  expenses.push(expense);
  saveExpenses(expenses);
  console.log(`Expense added successfully (ID: ${expense.id})`);
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
    total += expense.amount;
  });

  if (month) {
    console.log(`Total expenses for month ${month}: $${total}`);
  } else {
    console.log(`Total expenses: $${total}`);
  }
}

// Delete an expense by ID
function deleteExpense(id) {
  let expenses = loadExpenses();
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
    const month = cmd.month ? parseInt(cmd.month, 10) : null;
    getSummary(month);
  });

program
  .command("delete")
  .description("Delete an expense by ID")
  .requiredOption("--id <id>", "ID of the expense to delete")
  .action((cmd) => {
    deleteExpense(parseInt(cmd.id, 10));
  });

// Parse the command-line arguments
program.parse(process.argv);
