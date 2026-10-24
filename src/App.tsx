import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import ColorPsychology from "./pages/ColorPsychology.tsx";
import HowColorsWork from "./pages/HowColorsWork.tsx";
import NotFound from "./pages/NotFound.tsx";

// The single-file build (hosted inside a sandboxed viewer) cannot use URL paths,
// so it routes in memory and opens the view named by a bare #token.
const HASH_VIEWS: Record<string, string> = {
  studio: "/studio", wheel: "/wheel", psychology: "/color-psychology", colors: "/how-colors-work",
};
const useMemoryRouter = import.meta.env.VITE_ROUTER === "memory";
const initialPath = HASH_VIEWS[window.location.hash.slice(1)] ?? "/";

const FacadeStudio = lazy(() => import("./pages/FacadeStudio.tsx"));

const Page = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Landing /></Page>} />
        <Route path="/studio" element={<Page><Suspense fallback={<div className="min-h-screen bg-[#0b0d11]" />}><FacadeStudio /></Suspense></Page>} />
        <Route path="/wheel" element={<Page><Index /></Page>} />
        <Route path="/color-psychology" element={<Page><ColorPsychology /></Page>} />
        <Route path="/how-colors-work" element={<Page><HowColorsWork /></Page>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {useMemoryRouter ? (
        <MemoryRouter initialEntries={[initialPath]}>
          <AnimatedRoutes />
        </MemoryRouter>
      ) : (
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
      )}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
