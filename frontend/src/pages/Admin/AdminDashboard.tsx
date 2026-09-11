import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  Users, Activity, LineChart as LineChartIcon, Smartphone, Globe, 
  Target, UserMinus, ShieldAlert, DollarSign, FileText, Server, 
  LogOut, ChevronRight
} from "lucide-react";
import { 
  Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import "./AdminDashboard.css";

interface FullAnalyticsData {
  users: { total: number; new: number; active: number; blocked: number };
  engagement: { dau: number; wau: number; mau: number; sessions: number; sessionDuration: string };
  activity: { likes: number; comments: number; shares: number; uploads: number; searches: number };
  appUsage: { name: string; value: number; fill: string }[];
  geography: { country: string; users: number }[];
  retention: { day1: number; day7: number; day30: number };
  churn: { rate: number; usersLost: number };
  security: { suspiciousLogins: number; failedAttempts: number; abuseReports: number };
  revenue: { mrr: string; subscriptions: number; growth: string };
  system: { uptime: string; apiLatency: string; errors: number };
}

type TabType = "users" | "engagement" | "activity" | "app-usage" | "geography" | "retention" | "churn" | "security" | "revenue" | "content" | "system";

export default function AdminDashboard() {
  const [data, setData] = useState<FullAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFullStats = async () => {
      try {
        const res = await api.get("/admin/analytics/full");
        setData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchFullStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="admin-container center-content">
        <div className="spinner"></div>
        <p>Loading Enterprise Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container center-content">
        <div className="error-message">
          <h3>Connection Error</h3>
          <p>{error}</p>
          <button className="btn-primary mt-4" onClick={() => window.location.reload()}>Retry Connection</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "engagement", label: "Engagement", icon: <LineChartIcon size={18} /> },
    { id: "activity", label: "Activity", icon: <Activity size={18} /> },
    { id: "app-usage", label: "App Usage", icon: <Smartphone size={18} /> },
    { id: "geography", label: "Geography", icon: <Globe size={18} /> },
    { id: "retention", label: "Retention", icon: <Target size={18} /> },
    { id: "churn", label: "Churn", icon: <UserMinus size={18} /> },
    { id: "security", label: "Security", icon: <ShieldAlert size={18} /> },
    { id: "revenue", label: "Revenue", icon: <DollarSign size={18} /> },
    { id: "content", label: "Content", icon: <FileText size={18} /> },
    { id: "system", label: "System", icon: <Server size={18} /> },
  ];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo-icon">
            <Activity size={24} color="white" />
          </div>
          <h2>PodSphere AI</h2>
        </div>
        
        <nav className="sidebar-nav">
          <p className="nav-label">ANALYTICS</p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              <div className="nav-icon">{tab.icon}</div>
              <span>{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={16} className="active-arrow" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-area">
        <header className="main-header">
          <div>
            <h1 className="admin-title">{tabs.find(t => t.id === activeTab)?.label} Dashboard</h1>
            <p className="admin-subtitle">Live analytics and insights</p>
          </div>
          <span className="live-indicator"><span className="pulse-dot"></span> System Online</span>
        </header>

        <div className="dashboard-content">
          {activeTab === "users" && data && (
            <div className="grid">
              <StatCard title="Total Users" value={data.users.total} color="blue" />
              <StatCard title="New Users (30d)" value={data.users.new} color="green" />
              <StatCard title="Active Users" value={data.users.active} color="purple" />
              <StatCard title="Blocked Users" value={data.users.blocked} color="red" />
            </div>
          )}

          {activeTab === "engagement" && data && (
            <div className="grid">
              <StatCard title="Daily Active (DAU)" value={data.engagement.dau} color="orange" />
              <StatCard title="Weekly Active (WAU)" value={data.engagement.wau} color="cyan" />
              <StatCard title="Monthly Active (MAU)" value={data.engagement.mau} color="blue" />
              <StatCard title="Avg Session" value={data.engagement.sessionDuration} color="pink" />
            </div>
          )}

          {activeTab === "activity" && data && (
            <div className="grid">
              <StatCard title="Total Likes" value={data.activity.likes} color="pink" />
              <StatCard title="Comments" value={data.activity.comments} color="purple" />
              <StatCard title="Shares" value={data.activity.shares} color="yellow" />
              <StatCard title="Content Uploads" value={data.activity.uploads} color="green" />
            </div>
          )}

          {activeTab === "app-usage" && data && (
            <div className="detailed-grid">
              <div className="chart-card glass-panel">
                <h3>Device Distribution</h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.appUsage} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {data.appUsage.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "geography" && data && (
            <div className="table-card glass-panel">
              <h3>Top Countries by Users</h3>
              <table className="modern-table">
                <thead><tr><th>Country</th><th>Users</th><th>% of Total</th></tr></thead>
                <tbody>
                  {data.geography.map((geo, i) => (
                    <tr key={i}>
                      <td>{geo.country}</td>
                      <td>{geo.users.toLocaleString()}</td>
                      <td><span className="badge-highlight">{((geo.users / data.users.total) * 100).toFixed(1)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "retention" && data && (
            <div className="grid">
              <StatCard title="Day 1 Retention" value={`${data.retention.day1}%`} color="green" />
              <StatCard title="Day 7 Retention" value={`${data.retention.day7}%`} color="blue" />
              <StatCard title="Day 30 Retention" value={`${data.retention.day30}%`} color="orange" />
            </div>
          )}

          {activeTab === "churn" && data && (
            <div className="grid">
              <StatCard title="Monthly Churn Rate" value={`${data.churn.rate}%`} color="red" />
              <StatCard title="Users Lost (30d)" value={data.churn.usersLost} color="orange" />
            </div>
          )}

          {activeTab === "security" && data && (
            <div className="grid">
              <StatCard title="Suspicious Logins" value={data.security.suspiciousLogins} color="red" />
              <StatCard title="Failed Attempts" value={data.security.failedAttempts} color="orange" />
              <StatCard title="Abuse Reports" value={data.security.abuseReports} color="pink" />
            </div>
          )}

          {activeTab === "revenue" && data && (
            <div className="grid">
              <StatCard title="Monthly Recurring (MRR)" value={data.revenue.mrr} color="green" />
              <StatCard title="Active Subscriptions" value={data.revenue.subscriptions} color="blue" />
              <StatCard title="Revenue Growth" value={data.revenue.growth} color="purple" />
            </div>
          )}
          
          {activeTab === "content" && data && (
            <div className="chart-card glass-panel">
              <div className="center-content p-8 text-center" style={{ padding: '3rem' }}>
                <FileText size={48} className="text-muted" style={{ margin: '0 auto 1rem auto' }} />
                <h3>Detailed Content Analytics</h3>
                <p className="text-muted">Content performance is natively tracked in our core database. This module is active.</p>
              </div>
            </div>
          )}

          {activeTab === "system" && data && (
            <div className="grid">
              <StatCard title="System Uptime" value={data.system.uptime} color="green" />
              <StatCard title="API Latency" value={data.system.apiLatency} color="blue" />
              <StatCard title="System Errors (24h)" value={data.system.errors} color="red" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper Component
function StatCard({ title, value, color }: { title: string, value: string | number, color: string }) {
  return (
    <div className="card stat-card glass-panel">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className={`stat-value text-gradient-${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </div>
  );
}
