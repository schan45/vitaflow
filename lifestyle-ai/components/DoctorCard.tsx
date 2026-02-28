type DoctorRecommendation = {
  id: string | number;
  full_name: string;
  specialty: string;
  clinic_name: string;
  city: string;
  country: string;
  website_url?: string | null;
  booking_url?: string | null;
};

export default function DoctorCard({
  doctor,
}: {
  doctor: DoctorRecommendation;
}) {
  return (
    <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-2">
      <p className="text-blue-200 font-semibold">
        Recommended Specialist
      </p>
      <p className="text-slate-100">
        <strong>{doctor.full_name}</strong> — {doctor.specialty}
      </p>
      <p className="text-slate-300">
        {doctor.clinic_name}, {doctor.city}, {doctor.country}
      </p>
      <div className="flex gap-3 text-blue-300">
        {doctor.website_url && (
          <a
            href={doctor.website_url}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Website
          </a>
        )}
        {doctor.booking_url && (
          <a
            href={doctor.booking_url}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Book appointment
          </a>
        )}
      </div>
    </div>
  );
}
