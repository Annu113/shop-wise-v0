import { DashboardStats } from "@/components/DashboardStats";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <DashboardStats />
      </div>
    </div>
  );
};

export default Dashboard;