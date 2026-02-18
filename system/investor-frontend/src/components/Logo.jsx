import React from "react";
import logo from "../assets/access-logo.png";

const Logo = () => (
  <div className="flex items-center gap-3">
    <img src={logo} alt="Access Properties" className="h-10 w-auto" />
    <div className="text-sm uppercase tracking-[0.3em] text-slate">Investor Portal</div>
  </div>
);

export default Logo;
