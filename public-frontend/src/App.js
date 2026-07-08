import { Routes, Route } from "react-router-dom";
import InvestNow from "./pages/InvestNow";
import DynamicPage from "./pages/DynamicPage";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <ScrollToTop />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DynamicPage />} />
          <Route path="/invest-now" element={<InvestNow />} />

          {/* CMS pages by slug (with alias redirects); falls back to property details */}
          <Route path="/:slug" element={<DynamicPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
