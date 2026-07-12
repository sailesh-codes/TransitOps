import { useEffect, useState } from "react";
import { Link, Redirect, useLocation } from "wouter";
import {
  useGetCurrentUser,
  useSetMyRole,
} from "@workspace/api-client-react";
import { UserRole } from "@workspace/api-zod";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  ShieldCheck,
  Wrench,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type RoleOption = {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "driver",
    label: "Driver",
    description: "View assigned trips and log fuel.",
    icon: Truck,
  },
  {
    value: "fleet_manager",
    label: "Fleet Manager",
    description:
      "Full access to vehicles, trips, drivers, and team settings.",
    icon: ShieldCheck,
  },
  {
    value: "safety_officer",
    label: "Safety Officer",
    description: "Manages maintenance, compliance, and driver safety scores.",
    icon: Wrench,
  },
  {
    value: "financial_analyst",
    label: "Financial Analyst",
    description: "Access to expenses, cost reports, and analytics.",
    icon: BarChart3,
  },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Truck className="h-4 w-4" />
      </span>
      TransitOps
    </Link>
  );
}

export default function Onboarding() {
  const { data: user, isLoading } = useGetCurrentUser();
  const setRole = useSetMyRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [confirmedRole, setConfirmedRole] = useState<UserRole | null>(null);
  const [, setLocation] = useLocation();

  // Once the welcome splash is on screen, push the user to /dashboard.
  useEffect(() => {
    if (!confirmedRole) return;
    const t = window.setTimeout(() => setLocation("/dashboard"), 1200);
    return () => window.clearTimeout(t);
  }, [confirmedRole, setLocation]);

  // No role yet — show the picker.
  const handleSetRole = () => {
    if (!selectedRole) return;
    setRole.mutate(
      { data: { role: selectedRole } },
      {
        onSuccess: (updated) => {
          setConfirmedRole(updated.role as UserRole);
          queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });
        },
        onError: (err: any) => {
          toast({
            title: "Failed to save role",
            description: err?.error || "An error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-background">
        <header className="border-b">
          <div className="container mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6 lg:px-8">
            <Logo />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm font-medium">Setting up your account…</p>
          </div>
        </main>
      </div>
    );
  }

  // Already has a role — push them to the dashboard.
  if (user?.role) {
    return <Redirect to="/dashboard" />;
  }

  // Welcome splash right after a successful pick — auto-redirects to /dashboard.
  if (confirmedRole) {
    const roleMeta = ROLE_OPTIONS.find((r) => r.value === confirmedRole);
    const Icon = roleMeta?.icon ?? ShieldCheck;
    return (
      <div className="flex min-h-[100dvh] flex-col bg-background">
        <header className="border-b">
          <div className="container mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6 lg:px-8">
            <Logo />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="flex max-w-md flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome aboard!
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              You're signed in as a{" "}
              <span className="font-semibold text-foreground">
                {roleMeta?.label ?? confirmedRole}
              </span>
              . Taking you to your dashboard…
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" />
              {roleMeta?.description}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No role yet — show the picker.
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6 lg:px-8">
          <Logo />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-2xl space-y-8">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl [text-wrap:balance]">
              Choose your role
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground">
              Tell us how you'll use TransitOps so we can show you the right
              tools. You can change this later from your profile (Fleet Managers
              only).
            </p>
          </div>

          <RadioGroup
            value={selectedRole}
            onValueChange={(v) => setSelectedRole(v as UserRole)}
            className="grid gap-4 sm:grid-cols-2"
          >
            {ROLE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <label
                  key={opt.value}
                  htmlFor={`role-${opt.value}`}
                  className="group flex cursor-pointer flex-col gap-4 rounded-3xl border-2 border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 has-[:checked]:border-primary has-[:checked]:bg-blue-50/50 has-[:checked]:shadow-lg has-[:checked]:shadow-primary/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 group-has-[:checked]:bg-primary group-has-[:checked]:text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="font-bold text-lg">{opt.label}</span>
                    </div>
                    <RadioGroupItem
                      value={opt.value}
                      id={`role-${opt.value}`}
                      className="mt-0 border-2"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed pl-16 -mt-3">
                    {opt.description}
                  </span>
                </label>
              );
            })}
          </RadioGroup>

          <div className="flex flex-col items-center gap-4 pt-6">
            <Button
              size="lg"
              onClick={handleSetRole}
              disabled={!selectedRole || setRole.isPending}
              className="h-14 w-full sm:w-auto sm:px-12 rounded-full text-base font-bold shadow-md transition-all hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
            >
              {setRole.isPending ? (
                "Saving…"
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              This is a one-time selection. Fleet Managers can change roles
              later from the Profile page.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
