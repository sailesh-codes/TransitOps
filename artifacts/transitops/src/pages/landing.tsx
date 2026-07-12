import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background font-sans text-foreground">
      <header className="px-6 h-16 flex items-center border-b justify-between shrink-0">
        <div className="font-bold text-xl tracking-tight text-primary">TransitOps</div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="font-medium">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="font-medium">Get Started</Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Command Center for <br/> <span className="text-primary">Modern Dispatchers</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-6">
              Total visibility over your fleet. Track vehicles, manage drivers, dispatch trips, and monitor expenses with uncompromising precision.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base font-semibold">Start Operations</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">Sign In to Dashboard</Button>
              </Link>
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
