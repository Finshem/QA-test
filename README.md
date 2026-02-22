# QA Test Task – Delivery Schedule

Automated test suite for [altlog.ru – Delivery Schedule](https://altlog.ru/grafik-dostavok-sbornyh-gruzov), built with Playwright and AI.

---

## Tech Stack

- [Playwright](https://playwright.dev/) – end-to-end testing
- Playwright MCP – AI-assisted test generation
- SQLite – local test database (`fixtures/delivery.db`)
- Node.js

---

## Project Structure

```
├── fixtures/
│   └── delivery.db          # SQLite database (warehouses, cities, routes)
├── sql/
│   └── queries.sql          # SQL task: route count & avg delivery days per warehouse
├── tests/
│   ├── delivery-filter-test.spec.js     # UI interaction test
│   ├── delivery-schedule-test.spec.js   # Data validation test (site vs SQLite)
│   └── support-contact-test.spec.js     # Support contact flow test
├── Manual testing.pdf        # Manual test cases documentation
├── playwright.config.js
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- sqlite3 CLI — on Ubuntu/Debian: `sudo apt install sqlite3`

### Installation

```bash
git clone https://github.com/Finshem/QA-test.git
cd QA-test
npm install
npx playwright install
```

### Database Setup

```bash
sqlite3 fixtures/delivery.db < sql/queries.sql
```

---

## Running Tests

```bash
# Run all tests
npx playwright test

# Run a specific test file
npx playwright test tests/delivery-filter-test.spec.js
```

---

## Test Coverage

| Test file | Type | Description |
|---|---|---|
| `delivery-filter-test.spec.js` | UI | Verifies filtering and display of delivery schedule elements |
| `delivery-schedule-test.spec.js` | Data | Selects a warehouse and city on the site, retrieves the delivery timeframe, and validates it against the SQLite database |
| `support-contact-test.spec.js` | Scenario | Tests the support contact form flow |

---

## SQL Task

`sql/queries.sql` contains a query that, for each warehouse, calculates:
- total number of routes
- average delivery time (in days)

---
