import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import "./DashbaordLayout.css";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="dashboard">

      <Sidebar mobileOpen={mobileSidebarOpen} onMobileOpenChange={setMobileSidebarOpen} />
      <div className="dashboard-main">

        <Navbar onMenuClick={() => setMobileSidebarOpen((open) => !open)} />

        <main className="dashboard-content">

          {children}

        </main>

      </div>

    </div>
  );
}