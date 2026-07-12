import { useState, useEffect } from "react";
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

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`font-bold text-3xl tracking-tight -ml-6 ${light ? 'text-slate-50' : 'text-slate-900'}`}>
      <span className="text-primary">Transit</span>Ops
    </Link>
  );
}

export default function Landing({ authHref = "/sign-in" }: LandingProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background font-sans text-foreground">
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 bg-slate-950/85 backdrop-blur-lg border-b border-slate-800/60 ${scrolled ? 'py-3 shadow-xl' : 'py-5'}`}>
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo light />
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {primaryLinks.map((link) => (
                  <NavigationMenuItem key={link.name}>
                    <NavigationMenuLink
                      href={link.href}
                      className={`${navigationMenuTriggerStyle()} bg-transparent text-slate-300 font-medium hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white rounded-full transition-colors text-base`}
                    >
                      {link.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-slate-300 font-medium hover:bg-slate-800 hover:text-white data-[state=open]:bg-slate-800 data-[state=open]:text-white rounded-full transition-colors text-base">Features</NavigationMenuTrigger>
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

          <div className="hidden md:flex items-center gap-3">
            <Link href={authHref}>
              <Button variant="ghost" size="lg" className="font-semibold rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-base">Sign In</Button>
            </Link>
            <Link href={authHref}>
              <Button size="lg" className="font-bold rounded-full transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 text-base">Get Started</Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu" className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
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
        <section className="w-full pt-8 pb-20 md:pt-12 md:pb-28 lg:pt-16 lg:pb-40">
          <div className="container px-6 md:px-10 lg:px-16">
            <div className="grid gap-10 lg:gap-20 lg:grid-cols-[1.1fr_1fr] items-center">
              <div className="flex flex-col items-start text-left space-y-8 max-w-2xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.25] [text-wrap:balance]">
                  Command Center for <span className="text-primary">Modern Dispatchers</span>
                </h1>
                <p className="text-muted-foreground text-base md:text-lg lg:text-xl leading-relaxed">
                  Total visibility over your fleet. Track vehicles, manage drivers,
                  dispatch trips, and monitor expenses with uncompromising precision.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                  <Link href={authHref}>
                    <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30">
                      Start Operations
                    </Button>
                  </Link>
                  <Link href={authHref}>
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-muted">
                      Sign In to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full flex justify-end lg:-mr-48 xl:-mr-72 2xl:-mr-96 translate-x-4 lg:translate-x-12">
                <img
                  src="/transitops-hero.png"
                  alt="TransitOps Dispatch operations"
                  className="w-full max-w-[600px] object-cover ml-auto"
                />
              </div>
            </div>
          </div>
        </section>
        {/* Integrated Maintenance Platform Section */}
        <section className="w-full py-16 lg:py-24 border-y bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary uppercase tracking-wider">
                Integrated Maintenance Platform
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl max-w-3xl">
                Fully integrated, AI-powered fleet maintenance suite.
              </h2>
            </div>
            
            <div className="flex flex-col gap-16 lg:gap-24 mt-12">
              {[
                {
                  label: "PREVENTIVE MAINTENANCE",
                  title: "Stay ahead of breakdowns.",
                  desc: "Automate PM schedules based on mileage or engine hours to maximize vehicle uptime.",
                  image: "/pm_dashboard.png"
                },
                {
                  label: "REPAIR TRACKING",
                  title: "Streamline defect resolution.",
                  desc: "Turn driver vehicle inspection reports (DVIRs) directly into actionable repair work orders.",
                  image: "/repair_tracking.png"
                },
                {
                  label: "VEHICLE HEALTH",
                  title: "Real-time diagnostics.",
                  desc: "Connect directly to engine fault codes and get alerted before minor issues become major failures.",
                  image: "/vehicle_health.png"
                },
                {
                  label: "PARTS & INVENTORY",
                  title: "Optimize your stockroom.",
                  desc: "Track spare parts consumption, set reorder thresholds, and manage vendor lead times.",
                  image: "/parts_inventory.png"
                },
                {
                  label: "SERVICE SCHEDULING",
                  title: "Maximize bay utilization.",
                  desc: "Schedule mechanics efficiently and track repair times against industry standards.",
                  image: "/service_scheduling.png"
                },
                {
                  label: "MAINTENANCE ANALYTICS",
                  title: "Data-driven decisions.",
                  desc: "Monitor total cost of ownership, repair trends, and technician productivity in one dashboard.",
                  image: "/maintenance_analytics.png"
                }
              ].map((category, i) => (
                <div key={i} className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-20 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`flex-1 flex flex-col items-start text-left gap-4 max-w-xl ${i % 2 === 0 ? 'lg:pl-16 xl:pl-24 2xl:pl-32' : 'lg:pr-16 xl:pr-24 2xl:pr-32'}`}>
                    <div className="text-sm font-bold text-primary tracking-wide">{category.label}</div>
                    <h3 className="text-2xl md:text-3xl font-bold leading-tight">{category.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{category.desc}</p>
                  </div>
                  <div className="flex-1 w-full max-w-2xl">
                    <div className="aspect-[4/3] w-full rounded-2xl bg-muted/40 border border-slate-200/60 shadow-lg overflow-hidden group">
                      <img 
                        src={category.image} 
                        alt={category.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Trust / Logo Strip */}
        <section className="w-full py-16 bg-muted/30">
          <div className="container px-4 md:px-6 flex flex-col items-center justify-center text-center">
            <div className="inline-block px-3 py-1 text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Our Customers
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-10 max-w-3xl">
              The most complex fleets in the world trust TransitOps.
            </h2>
            
            <div className="w-full overflow-hidden mb-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max items-center animate-marquee gap-8 md:gap-16 py-12 opacity-60 hover:opacity-100 transition-all duration-500 cursor-pointer select-none">
                {[...Array(4)].map((_, groupIndex) => (
                  <div key={groupIndex} className="flex items-center gap-8 md:gap-16 pr-8 md:pr-16">
                    {['LogisticsCo', 'TransportX', 'ColdChain Solutions', 'Apex Delivery', 'BuildRight Const.', 'GlobalFreight', 'PrimeHaul'].map((logo, i) => (
                      <div key={i} className="text-2xl md:text-3xl font-black font-serif italic tracking-tighter whitespace-nowrap text-primary">
                        {logo}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Resources / Insights Section */}
        <section className="w-full py-16 lg:py-24 border-t bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl max-w-3xl">
                Latest in fleet maintenance
              </h2>
              <Button variant="ghost" className="hidden sm:flex font-semibold">
                View all resources <span className="ml-1">→</span>
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { type: "Guide", title: "The 2026 State of Fleet Maintenance", desc: "Discover benchmark data and strategies to reduce fleet downtime by 30%.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" },
                { type: "Webinar", title: "Automating DVIR Compliance", desc: "Join our experts to learn how to seamlessly connect driver inspections with shop workflows.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" },
                { type: "Industry News", title: "Navigating the Technician Shortage", desc: "Read how top fleets are using software to maximize mechanic productivity.", image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800" }
              ].map((resource, i) => (
                <div key={i} className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-lg cursor-pointer">
                  <div className="aspect-[16/9] w-full bg-muted flex items-center justify-center overflow-hidden">
                    <img src={resource.image} alt={resource.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="px-8 py-6 flex flex-col flex-1">
                    <div className="text-xs font-bold text-primary tracking-wide mb-2 uppercase">{resource.type}</div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm flex-1 mb-4">{resource.desc}</p>
                    <div className="text-sm font-semibold flex items-center gap-1 mt-auto">
                      Read more <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-8 w-full sm:hidden font-semibold">
              View all resources <span className="ml-1">→</span>
            </Button>
          </div>
        </section>

        {/* Contact / Demo CTA Section */}
        <section className="w-full py-16 lg:py-24 bg-zinc-950 text-zinc-50 border-t">
          <div className="container px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col space-y-8">
                <div>
                  <div className="inline-block px-3 py-1 text-sm font-semibold text-primary uppercase tracking-widest mb-4">
                    Connect With Us
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
                    See TransitOps in action.
                  </h2>
                  <ul className="space-y-4">
                    {[
                      "Reduce unplanned downtime by predicting failures.",
                      "Improve service lifecycle visibility across all bays.",
                      "Automate complex maintenance and compliance workflows."
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-300">
                        <svg className="h-6 w-6 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        <span className="text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-8 border-t border-zinc-800">
                  <p className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Recognized by the industry</p>
                  <div className="flex flex-wrap gap-4 opacity-70">
                    {/* Placeholder badges */}
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">G2</div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-white text-zinc-950 p-8 md:p-10 rounded-3xl shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Schedule a demo</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold" htmlFor="firstName">First name</label>
                      <input id="firstName" className="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold" htmlFor="lastName">Last name</label>
                      <input id="lastName" className="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="phone">Phone number</label>
                    <input id="phone" type="tel" className="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white" placeholder="(555) 000-0000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="email">Company email</label>
                    <input id="email" type="email" className="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white" placeholder="john@company.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="company">Company name</label>
                    <input id="company" className="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white" placeholder="Acme Logistics" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="fleetSize">Fleet size</label>
                    <select id="fleetSize" className="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white appearance-none">
                      <option value="">Select fleet size...</option>
                      <option value="1-10">1-10 vehicles</option>
                      <option value="11-50">11-50 vehicles</option>
                      <option value="51-200">51-200 vehicles</option>
                      <option value="201+">201+ vehicles</option>
                    </select>
                  </div>
                  <Button type="submit" size="lg" className="w-full mt-6 h-12 text-base font-bold rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30">
                    Schedule a demo
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full bg-slate-950 text-slate-50 py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2 space-y-6">
              <Logo light />
              <p className="text-slate-400 max-w-sm mt-6">
                The fully integrated, AI-powered fleet maintenance suite. Modernize your shop, empower your technicians, and maximize uptime.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-base">Product</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-primary transition-colors">Preventive Maintenance</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Vehicle Health</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Parts & Inventory</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Service Scheduling</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-base">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Success Stories</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Webinars</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-base">Company</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} TransitOps Logistics Platform. All rights reserved.</p>
            <div className="flex gap-6 font-medium">
              <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-primary transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-primary transition-colors">YouTube</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
