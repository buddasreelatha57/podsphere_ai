import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import "./DashbaordLayout.css";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="dashboard">

       <Sidebar />
      <div className="dashboard-main">

        <Navbar />

        <main className="dashboard-content">

          {children}

        </main>

      </div>

    </div>
  );
}