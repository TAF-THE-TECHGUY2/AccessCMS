import React, { useEffect, useState } from "react";
import { api, API_BASE_URL } from "../../api.js";

export default function TeamGridSection({ data }) {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    api.getTeam().then(setTeam).catch(() => setTeam([]));
  }, []);

  const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
    return url;
  };

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        {data?.title ? <h2 className="text-2xl font-semibold">{data.title}</h2> : null}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {team.map((member) => (
            <div key={member._id} className="border border-gray-200 rounded-xl overflow-hidden">
              {member.photoUrl ? (
                <img src={resolveUrl(member.photoUrl)} alt={member.name} className="h-64 w-full object-cover" />
              ) : null}
              <div className="p-5">
                <div className="text-lg font-semibold">{member.name}</div>
                <div className="text-sm text-gray-500">{member.role}</div>
                {member.bio ? <p className="mt-3 text-gray-700">{member.bio}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
