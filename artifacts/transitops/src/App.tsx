import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import { useEffect, useRef } from 'react';
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';

import Landing from '@/pages/landing';
import Dashboard from '@/pages/dashboard';
import Vehicles from '@/pages/vehicles';
import Drivers from '@/pages/drivers';
import Trips from '@/pages/trips';
import Maintenance from '@/pages/maintenance';
import FuelExpenses from '@/pages/fuel-expenses';
import Reports from '@/pages/reports';
import Team from '@/pages/team';
import Profile from '@/pages/profile';
import Onboarding from '@/pages/onboarding';
import Layout from '@/components/layout';
import { useGetCurrentUser } from '@workspace/api-client-react';

const queryClient = new QueryClient();

const rawClerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const isDevelopmentWithoutClerk =
  !rawClerkPubKey || rawClerkPubKey === 'pk_test_dummy_key_for_development';
let clerkPubKey: string | null = null;
if (!isDevelopmentWithoutClerk) {
  try {
    clerkPubKey = publishableKeyFromHost(window.location.hostname, rawClerkPubKey) || rawClerkPubKey || null;
  } catch (e) {
    clerkPubKey = rawClerkPubKey || null;
  }
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "hsl(221.2 83.2% 53.3%)",
    colorForeground: "hsl(222.2 84% 4.9%)",
    colorMutedForeground: "hsl(215.4 16.3% 46.9%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(222.2 84% 4.9%)",
    colorDanger: "hsl(0 84.2% 60.2%)",
    colorNeutral: "hsl(214.3 31.8% 91.4%)",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-3xl border border-gray-100 w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    formButtonPrimary: "!rounded-full !shadow-md transition-all hover:-translate-y-0.5 !h-12 !text-base",
    socialButtonsBlockButton: "!rounded-full !border !border-gray-300 !bg-white hover:!bg-gray-50 !text-gray-900 !shadow-sm !h-12 !text-base",
    socialButtonsBlockButtonText: "!text-gray-900 !font-semibold",
    formFieldInput: "!rounded-xl !border-gray-200 !bg-gray-50 focus:!bg-white transition-colors !h-12",
    dividerLine: "bg-gray-200",
    dividerText: "text-gray-400 font-medium",
  },
};

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 flex-col justify-between p-12 text-slate-50 relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-slate-950/80"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 font-bold text-3xl tracking-tight text-white mb-16">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
            TransitOps
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-lg mb-6">
            The command center for modern fleets.
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed">
            Total visibility over your fleet. Track vehicles, manage drivers, dispatch trips, and monitor maintenance with uncompromising precision.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 text-slate-400 text-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <p>Join 10,000+ modern dispatchers</p>
        </div>
      </div>
      
      <div className="flex flex-col w-full lg:w-1/2 items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthLayout>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthLayout>
  );
}

function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthLayout>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <SignedInHomeRedirect />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

// Once a user is signed in, send them to onboarding if they haven't picked
// a role yet, otherwise to the dashboard.
function SignedInHomeRedirect() {
  const { data: user, isLoading } = useGetCurrentUser();
  if (isLoading) return null;
  if (!user?.role) return <Redirect to="/onboarding" />;
  return <Redirect to="/dashboard" />;
}

// Onboarding is for signed-in users without a role. Send signed-out users
// back to the landing page; once a role is set, push to the dashboard.
function OnboardingRoute() {
  const { data: user, isLoading } = useGetCurrentUser();
  if (isLoading) return null;
  if (user?.role) return <Redirect to="/dashboard" />;
  return (
    <Show when="signed-in">
      <Onboarding />
    </Show>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <RoleGate>
          <Layout>
            <Component />
          </Layout>
        </RoleGate>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

// Inside a signed-in area, route users without a role to onboarding.
function RoleGate({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetCurrentUser();
  if (isLoading) return null;
  if (!user?.role) return <Redirect to="/onboarding" />;
  return <>{children}</>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  if (!clerkPubKey) return null;

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/onboarding" component={OnboardingRoute} />
          <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/vehicles" component={() => <ProtectedRoute component={Vehicles} />} />
          <Route path="/drivers" component={() => <ProtectedRoute component={Drivers} />} />
          <Route path="/trips" component={() => <ProtectedRoute component={Trips} />} />
          <Route path="/maintenance" component={() => <ProtectedRoute component={Maintenance} />} />
          <Route path="/fuel-expenses" component={() => <ProtectedRoute component={FuelExpenses} />} />
          <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
          <Route path="/team" component={() => <ProtectedRoute component={Team} />} />
          <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  if (isDevelopmentWithoutClerk) {
    const LocalLanding = () => <Landing authHref="/dashboard" />;

    return (
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <QueryClientProvider client={queryClient}>
            <Switch>
              <Route path="/" component={LocalLanding} />
              <Route path="/sign-in/*?">
                <Redirect to="/dashboard" />
              </Route>
              <Route path="/sign-up/*?">
                <Redirect to="/dashboard" />
              </Route>
              <Route path="/dashboard" component={() => <Layout localMode><Dashboard /></Layout>} />
              <Route path="/vehicles" component={() => <Layout localMode><Vehicles /></Layout>} />
              <Route path="/drivers" component={() => <Layout localMode><Drivers /></Layout>} />
              <Route path="/trips" component={() => <Layout localMode><Trips /></Layout>} />
              <Route path="/maintenance" component={() => <Layout localMode><Maintenance /></Layout>} />
              <Route path="/fuel-expenses" component={() => <Layout localMode><FuelExpenses /></Layout>} />
              <Route path="/reports" component={() => <Layout localMode><Reports /></Layout>} />
              <Route path="/team" component={() => <Layout localMode><Team /></Layout>} />
              <Route path="/profile" component={() => <Layout localMode><Profile /></Layout>} />
              <Route component={NotFound} />
            </Switch>
          </QueryClientProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
