import React, { useState } from "react";
import { API_BASE_URL } from "../../api.js";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

const DEFAULT_TOPICS = [
  "General inquiry",
  "Investment opportunities",
  "My existing investment",
  "Press & media",
  "Other",
];

const inputClasses =
  "w-full rounded-md border border-black/15 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-black/30 focus:border-black/60 transition";

export default function ContactFormSection({ data }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    topic: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", msg: "" });

  const topics =
    Array.isArray(data?.topics) && data.topics.length > 0
      ? data.topics
      : DEFAULT_TOPICS;

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
    if (form.phone.trim() && !/^[\d\s+()-]+$/.test(form.phone))
      return "Please enter a valid phone number.";
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
    setForm({ name: "", email: "", subject: "", phone: "", topic: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          <div className="min-w-0 animate-fadeInLeft">
            <h2 className="font-serif text-4xl md:text-[2.75rem] text-gray-900">
              {data?.title || data?.heading || "Send a Message"}
            </h2>
            <p className="mt-3 max-w-md text-sm text-gray-600 leading-relaxed">
              {data?.subtext ||
                "Use the form below and our team will direct your message to the right person."}
            </p>
            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="w-full">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Name*
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    className={inputClasses}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email*
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className={inputClasses}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="w-full">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                    Subject*
                  </label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    placeholder="Enter subject"
                    className={inputClasses}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    className={inputClasses}
                  />
                </div>
              </div>
              <div className="w-full">
                <label htmlFor="topic" className="block text-sm font-semibold text-gray-900 mb-2">
                  I'm contacting you about
                </label>
                <div className="relative">
                  <select
                    id="topic"
                    name="topic"
                    value={form.topic}
                    onChange={onChange}
                    className={`${inputClasses} appearance-none pr-10 ${
                      form.topic ? "text-gray-900" : "text-black/30"
                    }`}
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic} className="text-gray-900">
                        {topic}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <div className="w-full">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                  Message*
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={5}
                  placeholder="Type your message here..."
                  className={`${inputClasses} resize-y min-h-[120px]`}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15 14" />
                </svg>
                <span>{data?.responseNote || "We aim to respond within 1–2 business days."}</span>
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
              <button
                type="submit"
                className="w-full rounded-lg bg-black text-white px-10 py-3.5 text-sm font-semibold hover:bg-black/90 transition"
              >
                {data?.buttonLabel || "Send Message"}
              </button>
            </form>
          </div>
          <div className="min-w-0 animate-fadeInRight flex items-center justify-center px-8 pt-2 lg:px-0 lg:pt-0">
            <img
              src={resolveUrl(data?.image || "/contactRightImage.png")}
              alt={data?.imageAlt || "Contact Us"}
              className="h-auto w-full max-w-[420px] max-h-[500px] object-contain"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>

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
