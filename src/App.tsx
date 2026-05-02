import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AppShell from "./components/shell/AppShell";
import Live from "./pages/Live";
import Policy from "./pages/Policy";
import Review from "./pages/Review";
import Recordings from "./pages/Recordings";
import Search from "./pages/Search";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<AppShell />}>
            <Route path="/live" element={<Live />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/review" element={<Review />} />
            <Route path="/recordings" element={<Recordings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/integrations" element={<Integrations />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
