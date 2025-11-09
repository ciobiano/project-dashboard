import { cookies, headers } from "next/headers";
import { Bell, ChevronRight, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { fetchApi } from "@/lib/fetch-api";

interface User {
  name: string;
}

export async function DashboardHeader() {
  const user = await fetchApi<User>("/api/users/user");

  return (
    <header className="flex   items-center gap-4 border-b border-gray-700/50   ">
      <nav className="flex flex-1 items-center  text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li className="flex items-center gap-2 font-medium ">
            <Folder className="h-4 w-4" />
            Folder
          </li>
          <li className="flex items-center gap-2 text-foreground">
            <ChevronRight className="h-4 w-4" />
            Subfolder
          </li>
        </ol>
      </nav>
      <span className="text-sm">{user.name}</span>
      <ThemeToggle />
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
        <span className="sr-only">Notifications</span>
      </Button>
    </header>
  );
}
