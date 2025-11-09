# PRD — Project Dashboard (Next.js • TypeScript • React)

## 1) Summary & Vision
A modern, multi-project dashboard for small teams to track work across folders and projects with “Overview / Workflow / Board / Planner” modes. The UI mirrors the screenshot: left tree navigation, project header & breadcrumbs, upgrade banner, quick-action cards, tab bar, and grouped task lists (“To Do”, “In Progress”) with priority chips and assignee stacks.  
Target: fast, dark-mode-first, keyboard friendly, and real-time.

## 2) Goals / Non-Goals
**Goals**
- Create, view, update, filter, and move tasks across statuses.
- Organize work by **Workspace → Folders → Projects**.
- Multiple views (Overview table, Board/Kanban, Planner calendar).
- Role-based access with multi-tenant workspaces.
- Real-time updates for task changes and assignees.
- Smooth drag-and-drop, great performance on large lists.

**Non-Goals (v1)**
- Gantt charts, time tracking, or advanced reporting.
- Complex automations; simple reminders only.
- External issue sync (Jira/GitHub) beyond import/export.

## 3) Personas
- **PM/Founder (Owner)**: creates structure, sets priorities, invites team.
- **Engineer/Designer (Member)**: updates status, comments, attaches files.
- **Client/Viewer (Guest)**: read-only access to selected projects.

## 4) Core User Stories (MVP)
1. As a user, I can create a **project** within a folder and add tasks quickly.
2. I can switch between **Overview / Workflow / Board / Planner**.
3. I can **drag a task** to reorder or change status.
4. I can set **priority** (High/Medium/Normal), **assignees**, and due date.
5. I can **filter** by status, priority, assignee; **search** by text.
6. I can view **activity** on a task (edits, comments) and see who changed what.
7. I can invite a teammate and assign them a role (Owner/Member/Guest).
8. I can see a **banner** to upgrade and a gated feature set (e.g., Planner).
9. I can use **keyboard shortcuts** (e.g., `N` new task, `Cmd/Ctrl+K` command palette).

## 5) Information Architecture
- **Workspace**
  - Dashboard
  - Inbox (mentions & assigned to me)
  - Stats (basic charts)
  - Calendar (Planner)
  - **Folders**
    - Projects (Brand Identity Refresh, Crypto Mobile App, E-Commerce Revamp, …)
- **Project page**
  - Header: breadcrumb, name, actions (Share, Settings)
  - Banner: Upgrade CTA
  - Quick actions: Create Task / Project / Folder
  - Tabs: **Overview** | Workflow | **Board** | **Planner**
  - Content area (according to tab)

## 6) Data Model (TypeScript types)
```ts
type ID = string;

export type Role = 'OWNER' | 'MEMBER' | 'GUEST';
export type Priority = 'HIGH' | 'MEDIUM' | 'NORMAL';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BACKLOG';

export interface User {
  id: ID; name: string; email: string; avatarUrl?: string;
}

export interface Workspace {
  id: ID; name: string; slug: string;
}

export interface Member {
  id: ID; workspaceId: ID; userId: ID; role: Role;
}

export interface Folder {
  id: ID; workspaceId: ID; name: string; order: number;
}

export interface Project {
  id: ID; folderId: ID; name: string; order: number; description?: string;
}

export interface Task {
  id: ID;
  projectId: ID;
  title: string;
  description?: string;
  status: Status;           // drives group (“To Do”, “In Progress”…)
  priority: Priority;
  assigneeIds: ID[];        // ordered for avatar stack
  dueDate?: string;         // ISO
  order: number;            // position within status group
  createdBy: ID; createdAt: string; updatedAt: string;
}

export interface Comment {
  id: ID; taskId: ID; authorId: ID; body: string; createdAt: string;
}

export interface Activity {
  id: ID; taskId: ID; actorId: ID; type: string; payload: unknown; createdAt: string;
}
```

## 7) Permissions & Tenancy
- Users belong to many workspaces.  
- **Owner**: manage billing, members, all data.  
- **Member**: CRUD tasks/projects.  
- **Guest**: read-only (+ comment if allowed).  
- Row-level security enforced in API by workspaceId membership.

## 8) Features & Acceptance Criteria

### 8.1 Sidebar & Folder Tree
- Collapsible left rail with **Workspace switcher**, **Main menu**, **Folders**, **Projects**.
- Keyboard: `[`/`]` collapse/expand; arrow keys to navigate.
- Persist last open folder/project in local storage.

### 8.2 Project Header & Breadcrumbs
- Shows **Workspace / Client Projects / E-Commerce Revamp**.
- Actions: Share, Settings (Owner only).
- Updates project name inline (Enter to save).

### 8.3 Upgrade Banner
- Visible to non-paid workspaces; links to Billing.
- Dismiss persists per workspace for 7 days.

### 8.4 Quick-Action Cards
- **Create New Task / Project / Folder** modals.
- Task modal uses **react-hook-form + zod**; submit creates task and focuses it.

### 8.5 Tabs (Overview / Workflow / Board / Planner)
- **Overview**: grouped tables by Status (“To Do”, “In Progress”…).  
- **Workflow**: list with step badges (future; v1.1).  
- **Board**: Kanban columns with drag-and-drop.  
- **Planner**: calendar view (month/week) showing task bars by due date (Pro).

**Acceptance**: switching tabs preserves filters & query params.

### 8.6 Task Row/Card
- Fields: title, description snippet, priority chip, assignee avatar stack (+counter), context menu (Edit, Duplicate, Delete).
- Inline quick edits: priority, assignees, status.
- **Drag handle** to reorder within group or move group → status change.
- Row virtualization for >200 tasks.

### 8.7 Filters, Search, Sorting
- Filter by status, priority, assignees, due date range.
- Full-text search (title/description).
- Sort by priority, updatedAt, dueDate.
- URL reflects state for shareable views.

### 8.8 Comments & Activity (v1.1)
- Task drawer shows comments and audit trail.
- @mentions with notifications to Inbox.

### 8.9 Notifications
- In-app toasts + Inbox. Optional email via Resend (on mention/assignment).

### 8.10 Keyboard & Command Palette
- `Cmd/Ctrl+K` to open command palette (kbar or cmdk).  
- `N` new task; `P` new project; `/` focus search.

### 8.11 Dark Mode & Theming
- Default dark. Theme tokens via Tailwind CSS variables. Light mode toggle.

### 8.12 Billing Gates
- Planner & advanced filters gated behind Pro ($9/mo).  
- Server checks entitlements; UI shows lock icon.

## 9) Technical Approach

**Framework**
- Next.js (App Router), React 18+, TypeScript.
- **Data**: Postgres + Prisma.
- **API**: Next.js Route Handlers (`/api/*`) with Zod validation (or tRPC if preferred).
- **Auth**: NextAuth (Email+OAuth). Multi-tenant via workspaceId in JWT/session.
- **UI**: shadcn/ui (Radix primitives) + Tailwind.  
  - Tree view: custom + `aria-treegrid`.  
  - Tabs, Dialogs, Dropdowns from shadcn.  
  - Table: TanStack Table.  
- **Drag & Drop**: `@dnd-kit/core` (Kanban + list reordering).
- **Data fetching**: React Server Components + client hydration; TanStack Query on client mutations.
- **Realtime**: Pusher/Ably or WebSocket via Next.js Route Handlers for task events.
- **Uploads**: UploadThing or S3 (for attachments v1.1).
- **Jobs**: Inngest/Trigger.dev (email notifications).
- **Analytics**: PostHog.

**Why shadcn/ui is fine**  
Shadcn + Radix provides: Tabs, Dialog, Popover, Dropdown, ScrollArea, Tooltip, Toggle, Avatar, Badge, Command. The only bespoke bits are **tree navigation** and **Kanban**; those are implemented with custom components + dnd-kit, then styled with Tailwind to match the screenshot.

## 10) API (sample)
```
GET  /api/workspaces/:wsId/projects?folderId=
POST /api/projects
PATCH/DELETE /api/projects/:id

GET  /api/tasks?projectId=&status=&q=&assigneeId=&priority=
POST /api/tasks
PATCH /api/tasks/:id   // update fields or reorder {status, order}
POST /api/tasks/:id/comments
GET  /api/assignees?projectId=
POST /api/invite
POST /api/stripe/checkout  // Pro
```

**Realtime Events**
```
task.created, task.updated, task.reordered, task.deleted,
comment.created, project.updated
```

## 11) Performance & Reliability
- RSC + streaming for project page shell; skeletons for lists.
- **Virtualized lists** (`@tanstack/react-virtual`) in Overview.
- Batched reorder mutations; optimistic updates with rollback.
- Edge caching for read endpoints where safe; ISR for Stats.
- Sentry for error tracking.

## 12) Accessibility
- Full keyboard support for sidebar tree, tabs, dialogs, DnD (fallback buttons).
- Radix primitives ensure ARIA roles; color contrast ≥ 4.5:1.
- Reduced-motion media query respected.

## 13) Metrics & Success Criteria
- TTFI < 2.5s on mid-tier laptop.
- P95 drag-drop latency < 100ms.
- Task creation to visible in UI < 300ms (optimistic).
- Weekly active teams; tasks created/user/week; upgrade conversion.

## 14) Milestones

**M0 — Design System (1 week)**
- Tailwind theme tokens, dark mode, shadcn setup, icons.

**M1 — Core Structure (2 weeks)**
- Auth, workspaces, sidebar tree, projects CRUD, breadcrumbs.

**M2 — Tasks (3 weeks)**
- Task model, Overview with group sections, filters/search/sort, quick-edit, priority chips, assignee stack, DnD reorder + status changes.

**M3 — Board View (1 week)**
- Kanban columns with DnD; parity with Overview.

**M4 — Planner (Pro) (1 week)**
- Calendar view (react-big-calendar) gated by billing.

**M5 — Realtime & Inbox (1 week)**
- Pusher/WebSockets, notifications, basic Inbox.

**M6 — Billing & Polishing (1 week)**
- Stripe, upgrade banner, command palette, shortcuts, QA.

## 15) QA & Test Plan
- Unit tests for schema & utils (Vitest).
- Component tests (React Testing Library).
- E2E flows (Playwright): create project, add task, drag across statuses, invite user, upgrade.
- Accessibility checks (axe) on core pages.

## 16) Risks & Mitigations
- **Dnd performance** on huge lists → virtualization + batched updates.
- **Multi-tenant security** → strict workspace checks on all queries.
- **Schema churn** → Zod schemas shared client/server; database migrations with Prisma Migrate.
- **Realtime fan-out cost** → channel per project; throttle burst updates.

## 17) Open Questions
- Do Guests need comment-write in MVP?
- Should Planner be read-only on Free or fully locked?
- Import from CSV or Asana/Jira for v1.1?
- Mobile UI now or post-launch?

