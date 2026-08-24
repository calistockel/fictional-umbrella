import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SavedProvider } from "./lib/SavedContext";
import { TopNav } from "./components/TopNav";
import { Discover } from "./pages/Discover";
import { OpportunityDetail } from "./pages/OpportunityDetail";
import { Intelligence } from "./pages/Intelligence";
import { Alerts } from "./pages/Alerts";
import { Saved } from "./pages/Saved";

export default function App() {
  return (
    <SavedProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-ink-50">
          <TopNav />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Discover />} />
              <Route path="/opportunity/:id" element={<OpportunityDetail />} />
              <Route path="/intelligence" element={<Intelligence />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/saved" element={<Saved />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SavedProvider>
  );
}
