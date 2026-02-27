export default function Partners() {
  const partners = [
    {
      name: "Medicover",
      description:
        "Private healthcare provider with preventive programs.",
      logo: "🏥",
      link: "https://www.medicover.com",
    },
    {
      name: "VitalCare",
      description:
        "Lifestyle-focused medical consultations.",
      logo: "💙",
      link: "https://example.com",
    },
    {
      name: "HealthHub",
      description:
        "Chronic disease prevention specialists.",
      logo: "🧬",
      link: "https://example.com",
    },
  ];

  return (
    <div className="p-6 pb-28">
      <h1 className="text-2xl font-semibold mb-6">
        Our Partners
      </h1>

      <div className="space-y-5">
        {partners.map((partner, i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {partner.logo}
              </div>
              <h2 className="font-semibold">
                {partner.name}
              </h2>
            </div>

            <p className="text-sm text-slate-400">
              {partner.description}
            </p>

            <a
              href={partner.link}
              target="_blank"
              className="text-blue-400 text-sm"
            >
              Visit website →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
