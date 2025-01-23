# Expense Tracker CLI 💸

*https://roadmap.sh/projects/expense-tracker*

Una aplicación de línea de comandos (CLI) para gestionar gastos personales, desarrollada en Node.js.

## Características 🚀

- Agregar gastos con descripción y precio.

- Listar todos los gastos registrados.

- Obtener un resumen total de los gastos.

- Filtrar gastos por mes.

- Eliminar un gasto por ID.

## Instalación 📦

1. Clona este repositorio:

```
git clone https://github.com/xSergioBG/roadmapsh-expense-tracker.git
cd roadmapsh-expense-tracker
```

2. Instala las dependencias:

```
npm install
```

## Uso 🛠

Ejecuta los siguientes comandos desde la terminal:

### Agregar un gasto

```
node expenseTracker.js add --description "Cena" --amount 25.50
```

📌 Agrega un gasto con la descripción "Cena" y con precio $25.50.

### Listar todos los gastos

```
node expenseTracker.js list
```

📌 Muestra una lista con todos los gastos registrados.

### Obtener un resumen total

```
node expenseTracker.js summary
```

📌 Muestra el total de todos los gastos.

### Obtener un resumen por mes

```
node expenseTracker.js summary --month 1
```

📌 Muestra el total de gastos para el mes de enero.

### Eliminar un gasto por ID

```
node expenseTracker.js delete --id 1
```

📌 Elimina el gasto con ID 1.
