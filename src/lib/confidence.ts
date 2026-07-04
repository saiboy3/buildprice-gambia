/**
 * Confidence scoring for crowd-sourced field reports. Everything now requires
 * a real account (no anonymous submissions), so this isn't "verified account
 * vs anonymous" — it's "how much track record does this account have yet."
 * New accounts start cautious; a track record of admin-approved reports (and
 * a good admin-set rating) raises confidence over time.
 *
 * AUTO_APPROVE_THRESHOLD: reports at/above this confidence skip the PENDING
 * review queue and publish immediately — the payoff for building trust.
 */
export const AUTO_APPROVE_THRESHOLD = 85

export function computeConfidence(reporter: { rating: number; approvedCount: number; rejectedCount: number }): number {
  const { rating, approvedCount, rejectedCount } = reporter
  const reviewed = approvedCount + rejectedCount

  // Brand-new account with no review history yet — cautious baseline.
  if (reviewed === 0) return 40

  const approvalRate = approvedCount / reviewed // 0..1
  // Track record carries the most weight; admin star rating nudges it up/down.
  const trackRecordScore = approvalRate * 80        // 0..80
  const ratingBonus      = (rating / 5) * 20         // 0..20
  const volumeBonus      = Math.min(reviewed, 20) / 20 * 10 // up to +10 for having enough history to trust the rate

  const score = trackRecordScore + ratingBonus + volumeBonus
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function initialStatusForConfidence(confidence: number): 'PENDING' | 'APPROVED' {
  return confidence >= AUTO_APPROVE_THRESHOLD ? 'APPROVED' : 'PENDING'
}
