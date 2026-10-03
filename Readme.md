# Expense Tracker CLI

Gestor de gastos personales en Node.js, basado en [Expense Tracker de roadmap.sh](https://roadmap.sh/projects/expense-tracker).

## Instalación

Node.js 22 o posterior.

```sh
git clone https://github.com/xSergioBG/roadmapsh-expense-tracker.git
cd roadmapsh-expense-tracker
npm ci
```

## Comandos

```sh
node expenseTracker.js add --description "Cena" --amount 25.50
node expenseTracker.js list
node expenseTracker.js summary
node expenseTracker.js summary --month 1
node expenseTracker.js delete --id 1
```

Los importes deben ser positivos y tener como máximo dos decimales, usando punto como separador. Los IDs deben ser enteros positivos completos. El filtro de mes acepta 1 a 12 y reúne ese mes de todos los años registrados. El símbolo `$` es una etiqueta de presentación: no hay conversión de divisas.

## Persistencia

`expenses.json` se guarda junto al script y se crea al añadir el primer gasto. `EXPENSES_FILE` permite indicar otro archivo dentro de una carpeta existente.

Un archivo vacío representa un libro sin gastos. Los archivos con JSON dañado o estructura inválida generan un error y se conservan. La escritura usa archivo temporal y reemplazo. La aplicación está pensada para un único proceso escritor.

## Pruebas

```sh
npm test
```

Cubren IDs después de borrados, importes, filtros, resumen decimal, archivos dañados y persistencia. Los datos de prueba están aislados en carpetas temporales.
