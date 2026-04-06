import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  AlertTriangle,
  Wallet,
  Activity,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Settings,
  Server,
  LogOut,
  Sun,
  Moon,
  Edit2,
  Loader2,
  X,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import expenseService from "../features/expenses/expenseService";
import investmentService from "../features/investments/investmentService";
import authService from "../features/auth/authService";

const NavButton = ({
  id,
  label,
  icon,
  isActive,
  onClick,
  isDestructive = false,
}) => {
  const Icon = icon;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left
        ${isActive && !isDestructive ? "bg-secondary/80 text-secondary-foreground font-medium shadow-sm" : ""}
        ${!isActive && !isDestructive ? "text-muted-foreground hover:bg-secondary/40" : ""}
        ${isDestructive && isActive ? "bg-primary/10 text-primary font-medium" : ""}
        ${isDestructive && !isActive ? "text-primary/70 hover:bg-primary/10 hover:text-primary" : ""}
      `}
    >
      <Icon
        className={`w-5 h-5 ${isActive && !isDestructive ? "text-primary" : ""}`}
      />
      <div className="flex-1">{label}</div>
      {isActive && !isDestructive && (
        <ChevronRight className="w-4 h-4 opacity-50" />
      )}
    </button>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [editError, setEditError] = useState("");

  const [stats, setStats] = useState({
    expensesCount: 0,
    investmentsCount: 0,
    activeInvestments: 0,
    closedInvestments: 0,
  });

  useEffect(() => {
    // 1. Get user identity from LocalStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setEditForm({ name: userData.name, email: userData.email });
      } catch {
        console.error("Failed to parse user data");
      }
    }

    // 2. Fetch lightweight snapshot data
    const fetchSnapshot = async () => {
      try {
        setLoading(true);
        const [expenses, investments] = await Promise.all([
          expenseService.getExpenses(),
          investmentService.getInvestments(),
        ]);

        const expCount = expenses ? expenses.length : 0;
        const invCount = investments ? investments.length : 0;
        const activeInv = investments
          ? investments.filter((i) => i.status !== "closed").length
          : 0;
        const closedInv = invCount - activeInv;

        setStats({
          expensesCount: expCount,
          investmentsCount: invCount,
          activeInvestments: activeInv,
          closedInvestments: closedInv,
        });
      } catch (error) {
        console.error("Failed to fetch snapshot data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    setEditError(""); // clear error on type
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError("");
    // Restore original values
    if (user) setEditForm({ name: user.name, email: user.email });
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!editForm.name || editForm.name.length < 2) {
      setEditError("Name must be at least 2 characters.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editForm.email || !emailRegex.test(editForm.email)) {
      setEditError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSaving(true);
      setEditError("");

      // Only send what changed, or just send both
      const updatedUser = await authService.updateProfile({
        name: editForm.name,
        email: editForm.email,
      });

      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        "Failed to update profile";
      setEditError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading account data...</p>
      </div>
    );
  }

  // Formatting Member Since (Month + Year only)
  const memberSinceStr = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
    })
    : "Unknown Date";

  const ageLabel = (() => {
    if (!user.dateOfBirth) return 'Not provided';
    const dob = new Date(user.dateOfBirth);
    if (Number.isNaN(dob.getTime())) return 'Not provided';
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      years--;
    }
    if (years < 0) return 'Not provided';
    return `${years} year${years === 1 ? '' : 's'}`;
  })();

  const accountAgeLabel = (() => {
    if (!user.createdAt) return 'Account age unavailable';
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffYears >= 1) {
      const remMonths = diffMonths - diffYears * 12;
      if (remMonths > 0) {
        return `Account active for ${diffYears} year${diffYears > 1 ? 's' : ''} and ${remMonths} month${remMonths > 1 ? 's' : ''}`;
      }
      return `Account active for ${diffYears} year${diffYears > 1 ? 's' : ''}`;
    }
    if (diffMonths >= 1) {
      return `Account active for ${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
    return `Account active for ${diffDays || 1} day${diffDays === 1 ? '' : 's'}`;
  })();

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Account Identity */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent flex justify-end items-start p-4">
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
              <CardContent className="px-6 sm:px-10 pb-10 pt-0 relative">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-background transition-colors">
                    {initial}
                  </div>
                  <div className="flex-1 space-y-1 pb-1">
                    <h2 className="text-2xl font-bold tracking-tight">
                      {user.name}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-accent">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </div>
                  </div>
                </div>

                {editError && (
                  <div className="mb-6 p-4 bg-primary/10 border border-primary/25 text-primary rounded-lg text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {editError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Full Name</p>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        disabled={isSaving}
                        className="bg-background"
                      />
                    ) : (
                      <p className="text-base font-medium bg-secondary/30 px-3 py-2 rounded-md border border-border/50">{user.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">This is how you appear internally.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Email Address</p>
                    {isEditing ? (
                      <Input
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        disabled={isSaving}
                        className="bg-background"
                      />
                    ) : (
                      <p className="text-base font-medium bg-secondary/30 px-3 py-2 rounded-md border border-border/50">{user.email}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">This email is used for login.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Member Since</p>
                    <p className="text-base font-medium bg-secondary/30 px-3 py-2 rounded-md border border-border/50 opacity-80 cursor-not-allowed">
                      {memberSinceStr}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Account Age</p>
                    <p className="text-base font-medium bg-secondary/30 px-3 py-2 rounded-md border border-border/50 opacity-80 cursor-not-allowed">
                      {accountAgeLabel}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border/50">
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Snapshot & Profile Extras */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="px-6 sm:px-10 pt-8">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Financial Snapshot
                </CardTitle>
                <CardDescription>An overview of your tracked data.</CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-10 pb-8">
                {loading ? (
                  <div className="py-8 text-center text-muted-foreground animate-pulse">Loading snapshot...</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-4">
                      <div className="bg-secondary/20 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted-foreground text-sm flex items-center gap-2"><CreditCard className="w-4 h-4" /> Expenses</span>
                        <span className="text-2xl font-bold">{stats.expensesCount}</span>
                      </div>
                      <div className="bg-secondary/20 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted-foreground text-sm flex items-center gap-2"><Wallet className="w-4 h-4" /> Assets</span>
                        <span className="text-2xl font-bold">{stats.investmentsCount}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-emerald-500/80 text-sm flex items-center gap-2">Active</span>
                        <span className="text-2xl font-bold text-emerald-500">{stats.activeInvestments}</span>
                      </div>
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted-foreground text-sm flex items-center gap-2">Closed</span>
                        <span className="text-2xl font-bold opacity-70">{stats.closedInvestments}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-secondary/20 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted-foreground text-sm">Role / Occupation</span>
                        <span className="text-base font-medium">
                          {user.occupation || 'Not provided'}
                        </span>
                      </div>
                      <div className="bg-secondary/20 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted-foreground text-sm">Financial Experience</span>
                        <span className="text-base font-medium capitalize">
                          {user.investmentExperience || 'Not provided'}
                        </span>
                      </div>
                      <div className="bg-secondary/20 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted-foreground text-sm">Age</span>
                        <span className="text-base font-medium">
                          {ageLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="px-6 sm:px-10 pt-8">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Account Preferences
                </CardTitle>
                <CardDescription>Your localized settings and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-10 pb-8 grid gap-6">

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary/20 border border-border/50 rounded-xl gap-4">
                  <div>
                    <p className="font-medium">Currency</p>
                    <p className="text-sm text-muted-foreground">The primary currency applied to your portfolio.</p>
                  </div>
                  <div className="bg-background border border-border px-4 py-2 rounded-md text-sm font-medium">
                    ₹ INR
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary/20 border border-border/50 rounded-xl gap-4">
                  <div>
                    <p className="font-medium">Timezone</p>
                    <p className="text-sm text-muted-foreground">
                      Used for entry dates and report aggregation.
                    </p>
                  </div>
                  <div className="bg-background border border-border px-4 py-2 rounded-md text-sm font-medium">
                    Asia/Kolkata
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary/20 border border-border/50 rounded-xl gap-4">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Your current active UI appearance.
                    </p>
                  </div>
                  <div className="bg-background border border-border px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 capitalize">
                    {document.documentElement.classList.contains("light") ? (
                      <>
                        <Sun className="w-4 h-4" /> Light
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" /> Dark
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "privacy":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="px-6 sm:px-10 pt-8">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>
                  Manage how your information is stored and exported.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-10 pb-8 space-y-6">
                <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-accent text-sm flex items-center gap-3">
                  <Server className="w-5 h-5 shrink-0" />
                  <p>
                    Your data is stored securely. We implement standard security
                    protocols to protect your sensitive financial information.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary/20 border border-border/50 rounded-xl gap-4">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download a complete copy of all your tracked data.
                    </p>
                  </div>
                  <Button variant="outline" disabled className="gap-2 shrink-0">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "actions":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-primary/25 shadow-sm">
              <CardHeader className="px-6 sm:px-10 pt-8">
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                  <AlertTriangle className="w-5 h-5" />
                  Account Actions
                </CardTitle>
                <CardDescription>
                  Destructive actions and session management.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-10 pb-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary/10 border border-border/50 rounded-xl gap-4">
                  <div>
                    <p className="font-medium">Log Out</p>
                    <p className="text-sm text-muted-foreground">
                      Securely end your current session on this device.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="gap-2 shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-primary/10 border border-primary/25 rounded-xl gap-4">
                  <div>
                    <p className="font-medium text-primary">Delete Account</p>
                    <p className="text-sm text-primary/70">
                      Permanently erase all your data. This cannot be reversed.
                    </p>
                  </div>
                  <Button variant="destructive" disabled className="shrink-0">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };



  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, preferences, and account actions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-2 sticky top-24">
            <NavButton id="profile" label="Profile" icon={User} isActive={activeTab === "profile"} onClick={setActiveTab} />
            <NavButton id="settings" label="Settings" icon={Settings} isActive={activeTab === "settings"} onClick={setActiveTab} />
            <NavButton id="privacy" label="Data & Privacy" icon={Shield} isActive={activeTab === "privacy"} onClick={setActiveTab} />

            <div className="my-2 border-t border-border/50"></div>

            <NavButton
              id="actions"
              label="Account Actions"
              icon={AlertTriangle}
              isDestructive
              isActive={activeTab === "actions"}
              onClick={setActiveTab}
            />
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ProfilePage;
