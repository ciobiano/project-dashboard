import type { Metadata } from "next";
import DashboardPage from "./soul/dashboard-page";

export const metadata: Metadata = {
  title: "Acme Dashboard",
};

export default function Dashboard() {
  return <DashboardPage />;
}
