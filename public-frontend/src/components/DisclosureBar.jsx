import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DisclosureBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FULL DISCLOSURE */}
      <section className="py-16 md:py-20 bg-gray-100 border-t border-gray-300">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition"
              aria-expanded={open}
            >
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                Full Disclosure
              </h3>
              
              <ChevronDown
                size={20}
                className={`text-gray-500 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {open && (
              <div className="px-6 pb-6 animate-fadeInUp">
                <div className="h-px bg-gray-300 mb-6" />
                
                <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                  <p>
                    This website and its content are provided for informational purposes only. 
                    Nothing herein constitutes an offer to sell, or a solicitation of an offer 
                    to buy, any securities or investment products.
                  </p>

                  <p className="font-semibold">
                    Investing in real estate involves significant risks, including but not limited to:
                  </p>

                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Market Risk</strong> – Real estate values may fluctuate due to 
                      economic, regulatory, and market conditions.
                    </li>
                    <li>
                      <strong>Liquidity Risk</strong> – Real estate investments are typically 
                      illiquid and may not be easily sold or exchanged.
                    </li>
                    <li>
                      <strong>Leverage Risk</strong> – The use of borrowing or leverage may 
                      amplify losses.
                    </li>
                    <li>
                      <strong>Regulatory Risk</strong> – Changes in laws or regulations could 
                      adversely affect the investment.
                    </li>
                  </ul>

                  <p>
                    Past performance is not indicative of future results. There is no assurance 
                    that Access Properties will achieve their investment objectives or that any 
                    investment will be profitable. Real estate investments often require long 
                    holding periods, during which market conditions may change. Any information 
                    contained on this site is current as of the date published and may not reflect 
                    subsequent developments.
                  </p>

                  <p>
                    Prospective investors should conduct their own due diligence and consult 
                    independent legal, tax, and financial advisors before making any investment 
                    decision. Participation in Access Properties is governed exclusively by the 
                    detailed terms and conditions outlined in the official offering documents, 
                    including the Operating Agreement. Prospective investors must thoroughly 
                    review and understand these documents before investing.
                  </p>

                  <p>
                    Access Properties, its affiliates, and management make no representations 
                    or warranties, express or implied, regarding the accuracy or completeness 
                    of the information provided herein.
                  </p>

                  <p className="font-semibold">
                    By accessing this site and its materials, you acknowledge and agree to 
                    these terms.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </>
  );
}