# Using ProjectFlow

Once the backend and frontend are running, open `http://localhost:5173` in your browser.

## Web Interface

### Login

The login page (`/login`) displays demo credentials (see `backend/seed.py` for default values). By default the demo user is:

- **Email:** `demo@example.com`
- **Password:** `demo123`

Enter these credentials and click **Sign In**. You will be redirected to the Dashboard.

### Dashboard

`/dashboard` lists all projects you are a member of, each showing its name, description, and total task count. Click a project to navigate to its kanban board.

### Kanban Board

URL: `/projects/:projectId/board`

Drag-and-drop tasks between columns: **To Do**, **In Progress**, **Done**. Each card shows the task title and assignee. Click a card to edit details or change status.

### Tasks Table

URL: `/projects/:projectId/table`

A sortable, filterable table of all tasks in the project. Use the search box to filter by title, the status dropdown to filter by status, and click column headers to sort by title, status, or creation date.

### Team

URL: `/projects/:projectId/team`

Displays the list of project members with their name, email, role, and join date.

### Settings

URL: `/settings`

Update your profile name, email, or change your password. The password change requires your current password.

## REST API (for developers or automation)

The backend runs on `http://localhost:8000`. All endpoints (except `/api/health`) require authentication. After logging in, include the `access_token` cookie in subsequent requests.

A quick way to interact is via `curl` with cookie storage.

### Health Check

```bash
curl http://localhost:8000/api/health
# {"status":"ok"}
```

### Login

```bash
curl -c cookies.txt -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'
```

The response contains user info; the JWT is set as an HTTP-only cookie.

### Dashboard (authenticated)

```bash
curl -b cookies.txt http://localhost:8000/api/dashboard
```

### List Projects (first project from dashboard)

Use a project ID returned by the dashboard endpoint, e.g., `1`.

```bash
curl -b cookies.txt http://localhost:8000/api/projects/1
```

### List Tasks in a Project

```bash
curl -b cookies.txt http://localhost:8000/api/projects/1/tasks
```

Filter by status:

```bash
curl -b cookies.txt "http://localhost:8000/api/projects/1/tasks?status=To+Do"
```

Search:

```bash
curl -b cookies.txt "http://localhost:8000/api/projects/1/tasks?search=design"
```

Sort by title descending:

```bash
curl -b cookies.txt "http://localhost:8000/api/projects/1/tasks?sort_by=title&sort_dir=desc"
```

### Create a Task

```bash
curl -b cookies.txt -X POST http://localhost:8000/api/projects/1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New task","description":"Details here","status":"To Do"}'
```

### Update a Task

```bash
curl -b cookies.txt -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","status":"In Progress"}'
```

### Delete a Task

```bash
curl -b cookies.txt -X DELETE http://localhost:8000/api/tasks/1
```

### Team Members

```bash
curl -b cookies.txt http://localhost:8000/api/projects/1/members
```

### User Profile & Password

**Get profile:**
```bash
curl -b cookies.txt http://localhost:8000/api/users/me
```

**Update name/email:**
```bash
curl -b cookies.txt -X PUT http://localhost:8000/api/users/me \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name"}'
```

**Change password:**
```bash
curl -b cookies.txt -X PUT http://localhost:8000/api/users/me/password \
  -H "Content-Type: application/json" \
  -d '{"old_password":"demo123","new_password":"newSecret"}'
```

### Logout

```bash
curl -b cookies.txt -X POST http://localhost:8000/api/auth/logout
```

This deletes the cookie, terminating the session.