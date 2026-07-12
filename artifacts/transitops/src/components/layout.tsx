import { useGetCurrentUser } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Wrench,
  Droplet,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  UserCircle,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
  localMode?: boolean;
}

type LayoutUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

function LayoutShell({
  children,
  user,
  onSignOut,
}: LayoutProps & {
  user?: LayoutUser | null;
  onSignOut: () => void;
}) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vehicles", href: "/vehicles", icon: Truck },
    { name: "Drivers", href: "/drivers", icon: Users },
    { name: "Trips", href: "/trips", icon: Map },
    { name: "Maintenance", href: "/maintenance", icon: Wrench },
    { name: "Fuel & Expenses", href: "/fuel-expenses", icon: Droplet },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    ...(user?.role === "fleet_manager" ? [{ name: "Team", href: "/team", icon: ShieldCheck }] : []),
  ];

  const NavContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-16 items-center px-6 font-bold text-xl border-b tracking-tight">
        TransitOps
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-base font-medium space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-200/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className={`flex flex-col rounded-md px-1 py-0.5 -mx-1 transition-colors hover:bg-muted ${
              location === "/profile" ? "bg-muted" : ""
            }`}
            title="Open your profile"
          >
            <span className="text-sm font-medium leading-tight">
              {user?.name || user?.email}
            </span>
            <span className="text-xs text-muted-foreground uppercase font-mono leading-tight">
              {user?.role?.replace('_', ' ') || 'No Role'}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                title="Profile"
                aria-label="Profile"
              >
                <UserCircle className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={onSignOut} title="Sign Out">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-blue-50/30 md:block">
        <NavContent />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-blue-50/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="font-semibold text-lg tracking-tight">TransitOps</div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-blue-50/20">
          {children}
        </main>
      </div>
    </div>
  );
}

function ClerkLayout({ children }: LayoutProps) {
  const { data: user } = useGetCurrentUser();
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" });
  };

  return (
    <LayoutShell user={user} onSignOut={handleSignOut}>
      {children}
    </LayoutShell>
  );
}

function LocalLayout({ children }: LayoutProps) {
  const [, setLocation] = useLocation();

  return (
    <LayoutShell
      user={{
        name: "Local Operator",
        email: "local@transitops.dev",
        role: "fleet_manager",
      }}
      onSignOut={() => setLocation("/")}
    >
      {children}
    </LayoutShell>
  );
}

export default function Layout({ children, localMode = false }: LayoutProps) {
  return localMode ? (
    <LocalLayout>{children}</LocalLayout>
  ) : (
    <ClerkLayout>{children}</ClerkLayout>
  );
}
