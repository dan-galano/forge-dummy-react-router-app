# To-Do List — React Router (framework mode) + MySQL

A minimal to-do list app. One route, one MySQL table, no ORM, no UI libraries.

- **Loader** fetches all tasks from MySQL.
- **Action** handles three `<Form>` submissions: add, toggle completed, delete.
- `mysql2` connection pool in a single server module (`app/db.server.ts`).

## Project structure

```
app/
  db.server.ts      # mysql2 connection pool (server-only module)
  routes/home.tsx   # "/" route: loader + action + UI
  app.css           # plain CSS
database/
  schema.sql        # creates the database and tasks table
.env.example        # template for DB credentials
```

## Setup

### 1. Install and start MySQL

**macOS (Homebrew):**

```sh
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**

```sh
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:** install [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) and start the MySQL service.

(Optional) Set a root password:

```sh
mysql_secure_installation
```

### 2. Create the database and table

From the project root:

```sh
mysql -u root -p < database/schema.sql
```

This creates a `todo_app` database with a `tasks` table:

| column    | type                    |
| --------- | ----------------------- |
| id        | INT AUTO_INCREMENT (PK) |
| title     | VARCHAR(255)            |
| completed | BOOLEAN, default FALSE  |

### 3. Configure credentials

```sh
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=todo_app
```

### 4. Install dependencies

```sh
npm install
```

### 5. Run the dev server

```sh
npm run dev
```

Open http://localhost:5173 — add, toggle, and delete tasks. Everything is
submitted with React Router's `<Form>` component, so it works even with
JavaScript disabled.

## Production

```sh
npm run build
npm run start
```
