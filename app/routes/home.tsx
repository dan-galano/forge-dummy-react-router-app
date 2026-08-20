import { Form } from "react-router";
import type { Route } from "./+types/home";
import { pool, ensureReady } from "../db.server";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "To-Do List" }];
}

export async function loader() {
  await ensureReady();
  const { rows } = await pool.query<Task>(
    "SELECT * FROM tasks ORDER BY id"
  );
  return { tasks: rows };
}

export async function action({ request }: Route.ActionArgs) {
  await ensureReady();
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add") {
    const title = String(formData.get("title") ?? "").trim();
    if (title) {
      await pool.query("INSERT INTO tasks (title) VALUES ($1)", [title]);
    }
  }

  if (intent === "toggle") {
    await pool.query(
      "UPDATE tasks SET completed = NOT completed WHERE id = $1",
      [formData.get("id")]
    );
  }

  if (intent === "delete") {
    await pool.query("DELETE FROM tasks WHERE id = $1", [
      formData.get("id"),
    ]);
  }

  return null;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { tasks } = loaderData;

  return (
    <main className="todo">
      <h1>To-Do List</h1>

      <Form method="post" className="add-form">
        <input
          type="text"
          name="title"
          placeholder="What needs doing?"
          required
        />
        <button type="submit" name="intent" value="add">
          Add
        </button>
      </Form>

      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Add one above!</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <Form method="post">
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  name="intent"
                  value="toggle"
                  className="toggle"
                  aria-label={
                    task.completed ? "Mark as not done" : "Mark as done"
                  }
                >
                  {task.completed ? "☑" : "☐"}
                </button>
              </Form>
              <span className={task.completed ? "done" : ""}>
                {task.title}
              </span>
              <Form method="post">
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  name="intent"
                  value="delete"
                  className="delete"
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </Form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
