import express from "express";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);

const app = express();
app.use(cookieParser());
app.use(express.json());

interface User {
  id: string;
  name: string;
}

interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

interface ProjectNode {
  id: string;
  folderId: string;
  name: string;
  order: number;
  description?: string;
}

interface FolderNode {
  id: string;
  workspaceId: string;
  name: string;
  order: number;
  projects: ProjectNode[];
}

interface WorkspaceTree {
  workspace: WorkspaceSummary;
  folders: FolderNode[];
}

const USERS: User[] = [
  {
    id: "1",
    name: "John Doe",
  },
  {
    id: "2",
    name: "Jane Smith",
  },
];

const AUTH_COOKIE_NAME = "saas_microservices_authed_user";

app.get("/api/users/login", (req, res) => {
  const existingUser = req.cookies[AUTH_COOKIE_NAME];
  if (!existingUser) {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    res.cookie(AUTH_COOKIE_NAME, user.id);
  }
  return res.redirect("/");
});

app.get("/api/users/logout", (req, res) => {
  return res.clearCookie(AUTH_COOKIE_NAME).redirect("/");
});

app.get("/api/users/user", (req, res) => {
  const existingUser = req.cookies[AUTH_COOKIE_NAME];
  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }
  const user = USERS.find((user) => user.id === existingUser);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(user);
});

// Fake data generators
const firstNames = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Avery",
  "Quinn",
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "William",
  "Mia",
  "James",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Lucas",
  "Harper",
  "Henry",
  "Evelyn",
  "Alexander",
  "Abigail",
  "Michael",
  "Emily",
  "Daniel",
  "Elizabeth",
  "Jacob",
  "Sofia",
  "Logan",
  "Avery",
  "Jackson",
  "Ella",
  "Sebastian",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
];

const actions = [
  "created a new project",
  "deleted a file",
  "shared a document",
  "commented on a task",
  "completed a milestone",
  "invited a team member",
  "updated project settings",
  "exported data report",
  "created a new team",
  "archived old project",
  "updated billing information",
  "changed password",
  "enabled two-factor authentication",
  "uploaded a new file",
  "created a backup",
  "merged a pull request",
  "deployed to production",
  "ran automated tests",
  "reviewed code changes",
  "created a new API key",
  "updated integration settings",
  "scheduled a meeting",
  "published a blog post",
  "updated documentation",
  "created a new workflow",
  "optimized database queries",
  "configured monitoring alerts",
  "updated security policies",
];

const WORKSPACE_TREES: Record<string, WorkspaceTree> = {
  "ws_acme-ops": {
    workspace: {
      id: "ws_acme-ops",
      name: "Acme Operations",
      slug: "acme-ops",
    },
    folders: [
      {
        id: "fld_brand",
        workspaceId: "ws_acme-ops",
        name: "Brand Systems",
        order: 1,
        projects: [
          {
            id: "prj_brand-refresh",
            folderId: "fld_brand",
            name: "Brand Identity Refresh",
            order: 1,
            description: "Update visuals for 2025 campaign.",
          },
          {
            id: "prj_web-guidelines",
            folderId: "fld_brand",
            name: "Web Guidelines",
            order: 2,
          },
        ],
      },
      {
        id: "fld_client",
        workspaceId: "ws_acme-ops",
        name: "Client Projects",
        order: 2,
        projects: [
          {
            id: "prj_crypto-mobile",
            folderId: "fld_client",
            name: "Crypto Mobile App",
            order: 1,
            description: "iOS + Android release candidate.",
          },
          {
            id: "prj_ecom-revamp",
            folderId: "fld_client",
            name: "E-Commerce Revamp",
            order: 2,
            description: "Next.js storefront migration.",
          },
          {
            id: "prj_ai-agent",
            folderId: "fld_client",
            name: "AI Agent Dashboard",
            order: 3,
          },
        ],
      },
      {
        id: "fld_internal",
        workspaceId: "ws_acme-ops",
        name: "Internal",
        order: 3,
        projects: [
          {
            id: "prj_marketing-site",
            folderId: "fld_internal",
            name: "Marketing Site",
            order: 1,
          },
          {
            id: "prj_growth-experiments",
            folderId: "fld_internal",
            name: "Growth Experiments",
            order: 2,
          },
        ],
      },
    ],
  },
  "ws_kree8": {
    workspace: {
      id: "ws_kree8",
      name: "Kree8 Studio",
      slug: "kree8",
    },
    folders: [
      {
        id: "fld_sprint",
        workspaceId: "ws_kree8",
        name: "Sprint Planning",
        order: 1,
        projects: [
          {
            id: "prj_q3-roadmap",
            folderId: "fld_sprint",
            name: "Q3 Roadmap",
            order: 1,
          },
        ],
      },
      {
        id: "fld_archives",
        workspaceId: "ws_kree8",
        name: "Archives",
        order: 2,
        projects: [
          {
            id: "prj_portfolio-site",
            folderId: "fld_archives",
            name: "Portfolio Site",
            order: 1,
          },
        ],
      },
    ],
  },
};

function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateRandomActivity() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];

  // Generate timestamp within the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime = new Date(
    thirtyDaysAgo.getTime() +
      Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
  );

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${firstName} ${lastName}`,
    action: action,
    timestamp: randomTime.toISOString(),
  };
}

app.get("/api/dashboard/activity", (req, res) => {
  const activities = Array.from({ length: 20 }, () => generateRandomActivity());
  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  res.json({
    activities,
    total: activities.length,
    generated_at: new Date().toISOString(),
  });
});

app.get("/api/workspaces", (req, res) => {
  const workspaces = Object.values(WORKSPACE_TREES).map(
    (workspace) => workspace.workspace
  );
  res.json({ workspaces });
});

app.get("/api/workspaces/:workspaceId/tree", (req, res) => {
  const { workspaceId } = req.params;
  const workspaceTree = WORKSPACE_TREES[workspaceId];
  if (!workspaceTree) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Simulate latency to showcase skeleton states.
  const delay = Number(req.query.delay ?? 300);
  setTimeout(() => {
    res.json(workspaceTree);
  }, Math.min(delay, 2000));
});

app.post("/api/workspaces/:workspaceId/folders", (req, res) => {
  const { workspaceId } = req.params;
  const { name } = req.body ?? {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Folder name is required" });
  }
  const workspaceTree = WORKSPACE_TREES[workspaceId];
  if (!workspaceTree) {
    return res.status(404).json({ error: "Workspace not found" });
  }
  const nextOrder =
    workspaceTree.folders.reduce((max, folder) => Math.max(max, folder.order), 0) +
    1;
  const newFolder = {
    id: generateId("fld"),
    workspaceId,
    name,
    order: nextOrder,
    projects: [],
  };
  workspaceTree.folders.push(newFolder);
  return res.status(201).json(newFolder);
});

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(3001, () => {
  console.log(`API app listening on port 3001`);
});
