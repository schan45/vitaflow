export function mapSymptomsToSpecialty(symptoms: string): string {
  const text = symptoms.toLowerCase();

  if (text.includes("mellkas") || text.includes("chest")) return "Cardiology";
  if (text.includes("legszomj") || text.includes("breath")) return "Pulmonology";
  if (text.includes("fejfáj") || text.includes("headache")) return "Neurology";
  if (text.includes("alhasi") || text.includes("menstru")) return "Gynecology";

  return "General Medicine";
}
