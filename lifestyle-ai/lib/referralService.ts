import { shouldReferToDoctor } from "@/lib/referralEngine";

export function createReferralMessage(riskScore: number): string {
  if (shouldReferToDoctor(riskScore)) {
    return "Based on your current risk profile, specialist consultation is recommended.";
  }

  return "No immediate specialist referral is required at this time.";
}
