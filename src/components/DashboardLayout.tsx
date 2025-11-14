import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Target,
  Wallet,
  PieChart,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { getToken, logoutUser } from "@/lib/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ name?: string } | null>(null);

  // Get first name only
  const getFirstName = (fullName: string) => {
    return fullName?.split(" ")[0] || "User";
  };

  // On mount, verify JWT and fetch user info
  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/auth");
      return;
    }

    // Fetch user data from backend
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await res.json();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: PieChart, label: "Budget", path: "/budget" },
    { icon: Target, label: "Goals", path: "/goals" },
    { icon: Wallet, label: "Income", path: "/income" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-card border-r border-border`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold gradient-text">PennyPal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Financial Wellness
            </p>
          </div>

          {user && (
            <div className="mb-6">
              <p className="text-muted-foreground text-sm">
                Hello,{" "}
                <span className="text-muted-foreground text-sm">
                  {getFirstName(user.name || "User")}
                </span>
              </p>
            </div>
          )}

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>

          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`lg:ml-64 min-h-screen transition-all ${
          sidebarOpen ? "ml-0" : ""
        }`}
      >
        <div className="p-8 pt-20 lg:pt-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;

