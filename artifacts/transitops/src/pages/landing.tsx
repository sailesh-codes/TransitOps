import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Truck, Users, Map, Wrench, Droplet, BarChart3, ShieldCheck } from "lucide-react";

type LandingProps = {
  authHref?: string;
};

const features = [
  {
    title: "Fleet Registry",
    href: "/vehicles",
    description: "Maintain a real-time record of every vehicle, capacity, and odometer reading.",
    icon: Truck,
  },
  {
    title: "Driver Management",
    href: "/drivers",
    description: "Track licenses, performance, and assignments for every driver in your team.",
    icon: Users,
  },
  {
    title: "Trip Dispatch",
    href: "/trips",
    description: "Assign drivers, schedule routes, and move trips from draft to completed.",
    icon: Map,
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    description: "Schedule service, log work orders, and stay ahead of breakdowns.",
    icon: Wrench,
  },
  {
    title: "Fuel & Expenses",
    href: "/fuel-expenses",
    description: "Capture fuel-ups and operational costs against the right vehicle.",
    icon: Droplet,
  },
  {
    title: "Cost Analytics",
    href: "/reports",
    description: "Analyze ROI and per-vehicle cost with built-in reporting tools.",
    icon: BarChart3,
  },
];

const primaryLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Truck className="h-4 w-4" />
      </span>
      TransitOps
    </Link>
  );
}

export default function Landing({ authHref = "/sign-in" }: LandingProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo />
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {primaryLinks.map((link) => (
                  <NavigationMenuItem key={link.name}>
                    <NavigationMenuLink
                      href={link.href}
                      className={navigationMenuTriggerStyle()}
                    >
                      {link.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
                      {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <li key={feature.title}>
                            <NavigationMenuLink
                              href={feature.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2 text-sm font-semibold leading-none">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                  <Icon className="h-4 w-4" />
                                </span>
                                {feature.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {feature.description}
                              </p>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="border-t p-3">
                      <NavigationMenuLink
                        href="#features"
                        className="flex items-center justify-between rounded-md p-2 text-sm font-medium hover:bg-accent"
                      >
                        <span>Explore the full platform</span>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link href={authHref}>
              <Button variant="ghost" className="font-medium">Sign In</Button>
            </Link>
            <Link href={authHref}>
              <Button className="font-medium">Get Started</Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-80 flex-col gap-4 p-6">
                <Logo />
                <nav className="mt-2 flex flex-col gap-1 text-sm font-medium">
                  {primaryLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="rounded-md px-3 py-2 hover:bg-muted"
                    >
                      {link.name}
                    </a>
                  ))}
                  <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Features
                  </div>
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <Link
                        key={feature.title}
                        href={feature.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        {feature.title}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-auto flex flex-col gap-2">
                  <Link href={authHref}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href={authHref}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-20 md:py-28 lg:py-40">
          <div className="container px-6 md:px-10 lg:px-16">
            <div className="grid gap-10 lg:gap-20 lg:grid-cols-[1.1fr_1fr] items-center">
              <div className="flex flex-col items-start text-left space-y-8 max-w-2xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] [text-wrap:balance]">
                  Command Center for <span className="text-primary">Modern Dispatchers</span>
                </h1>
                <p className="text-muted-foreground text-base md:text-lg lg:text-xl leading-relaxed">
                  Total visibility over your fleet. Track vehicles, manage drivers,
                  dispatch trips, and monitor expenses with uncompromising precision.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                  <Link href={authHref}>
                    <Button size="lg" className="h-12 px-8 text-base font-semibold">
                      Start Operations
                    </Button>
                  </Link>
                  <Link href={authHref}>
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">
                      Sign In to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full flex justify-end lg:-mr-32 xl:-mr-48 2xl:-mr-64">
                <div
                  role="img"
                  aria-label="Dispatch operations placeholder"
                  className="aspect-[4/3] w-full max-w-[420px] rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/40 flex items-center justify-center"
                >
                  <span className="text-muted-foreground/60 text-sm font-medium tracking-wide uppercase">
                    Placeholder Image
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-16 lg:py-24 bg-muted/50 border-y">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Fleet Registry</h3>
                <p className="text-muted-foreground">Maintain comprehensive records of all vehicles, capacities, odometers, and current statuses in real time.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Trip Dispatch</h3>
                <p className="text-muted-foreground">Assign drivers to vehicles, schedule routes, and transition trips from draft to dispatched to completed seamlessly.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Cost Analytics</h3>
                <p className="text-muted-foreground">Log fuel and expenses, calculate operational costs per vehicle, and analyze ROI with built-in reporting tools.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 w-full shrink-0 border-t flex flex-col items-center justify-center bg-muted/20">
        <p className="text-xs text-muted-foreground">TransitOps Logistics Platform. Secure & operational.</p>
      </footer>
    </div>
  );
}
