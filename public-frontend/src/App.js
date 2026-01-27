import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/contact";
import InvestNow from "./pages/InvestNow";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import GreaterBoston from "./pages/greater-boston";
import PropertyDetails from "./pages/PropertyDetails";
import FAQ from "./pages/Faq";
import Privacypolicy from "./pages/Privacy-policy";

// ✅ IMPORTANT: Component name must be Capitalized
import Portfolios from "./pages/portfolios";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <ScrollToTop />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/invest-now" element={<InvestNow />} />
          <Route path="/greater-boston" element={<GreaterBoston />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<Privacypolicy />} />

          {/* keep this LAST (catch-all) */}
          <Route path="/:slug" element={<PropertyDetails />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
