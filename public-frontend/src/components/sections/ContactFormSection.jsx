import React, { useState } from "react";
import DisclosureBar from "../DisclosureBar.jsx";
import { API_BASE_URL } from "../../api.js";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

export default function ContactFormSection({ data }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", msg: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setStatus({ type: "", msg: "" });
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.subject.trim()) return "Please enter a subject.";
    if (!form.phone.trim()) return "Please enter your phone number.";
    if (!/^[\d\s\-\+\(\)]+$/.test(form.phone)) return "Please enter a valid phone number.";
    if (!form.message.trim()) return "Please enter a message.";
    return "";
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus({ type: "error", msg: err });
      return;
    }
    setStatus({ type: "success", msg: "Message sent successfully." });
    setForm({ name: "", email: "", subject: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-3 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          <div className="animate-fadeInLeft">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
              {data?.title || "SEND A MESSAGE"}
            </h2>
            <form onSubmit={onSubmit} className="mt-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                <div className="w-full">
                  <label htmlFor="name" className="block text-xs text-black/50 mb-2">Name*</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none border-b border-black/20 py-2 text-sm placeholder:text-black/30 focus:border-black/60 transition"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="email" className="block text-xs text-black/50 mb-2">Email*</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none border-b border-black/20 py-2 text-sm placeholder:text-black/30 focus:border-black/60 transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                <div className="w-full">
                  <label htmlFor="subject" className="block text-xs text-black/50 mb-2">Subject*</label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none border-b border-black/20 py-2 text-sm placeholder:text-black/30 focus:border-black/60 transition"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="phone" className="block text-xs text-black/50 mb-2">Phone*</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none border-b border-black/20 py-2 text-sm placeholder:text-black/30 focus:border-black/60 transition"
                  />
                </div>
              </div>
              <div className="w-full">
                <label htmlFor="message" className="block text-xs text-black/50 mb-2">Message here</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={5}
                  className="w-full bg-transparent outline-none border-b border-black/20 py-2 text-sm placeholder:text-black/30 focus:border-black/60 transition resize-none"
                />
              </div>
              {status.msg ? (
                <div
                  className={[
                    "text-sm animate-fadeIn",
                    status.type === "success" ? "text-green-700" : "text-red-600",
                  ].join(" ")}
                >
                  {status.msg}
                </div>
              ) : null}
              <button type="submit" className="inline-flex items-center justify-center bg-black text-white px-10 py-3 text-sm font-semibold hover:bg-black/90 transition">
                SEND
              </button>
            </form>
          </div>
          <div className="animate-fadeInRight flex items-center justify-center pt-2 lg:pt-0 mx-9 lg:mx-19">
            <img
              src={resolveUrl(data?.image || "/contactRightImage.png")}
              alt={data?.imageAlt || "Contact Us"}
              className="max-w-[900px] h-auto max-h-[500px] lg:max-h-[500px]"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200" />
      <DisclosureBar />

      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeInLeft { animation: fadeInLeft 0.8s ease-out; }
        .animate-fadeInRight { animation: fadeInRight 0.8s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}
