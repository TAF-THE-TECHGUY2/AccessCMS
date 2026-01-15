import React, { useEffect, useState } from "react";
import { api } from "../../api.js";

export default function FaqAccordionSection({ data }) {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.getFaq().then(setItems).catch(() => setItems([]));
  }, []);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {data?.title ? <h2 className="text-2xl font-semibold">{data.title}</h2> : null}
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item._id} className="border border-gray-200 rounded-lg">
              <button
                type="button"
                className="w-full text-left px-4 py-4 font-semibold"
                onClick={() => toggle(item._id)}
              >
                {item.question}
              </button>
              {openId === item._id ? (
                <div
                  className="px-4 pb-4 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
