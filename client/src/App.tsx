import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Web3 Imports
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi';

/**
 * App.tsx - DxBet Decentralized Betting Platform
 * Roteador principal com suporte a Web3 (RainbowKit/Wagmi)
 * 
 * Rotas disponíveis:
 * - / : Home
 * - /dashboard : Dashboard (requer conexão com carteira)
 * - /how-to-bet : Como Apostar
 * - /whitepaper : Whitepaper
 */

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-display selection:bg-primary selection:text-black">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/dashboard"} component={Dashboard} />
          {/* Placeholder routes for now */}
          <Route path={"/how-to-bet"} component={() => <div className="container py-20 text-center"><h1 className="text-4xl text-primary mb-4">COMO APOSTAR</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
          <Route path={"/whitepaper"} component={() => <div className="container py-20 text-center"><h1 className="text-4xl text-primary mb-4">WHITEPAPER</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider 
            theme={darkTheme({
              accentColor: '#39FF14',
              accentColorForeground: 'black',
              borderRadius: 'none',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
          >
            <ThemeProvider defaultTheme="dark">
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </ThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

export default App;
