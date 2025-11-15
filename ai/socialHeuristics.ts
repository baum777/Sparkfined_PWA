import { SocialPost, SocialPostAssessment } from "./types.js";

export type BotHeuristicResult = Pick<SocialPostAssessment, "botScore" | "reason_flags">;

const DEFAULT_FLAGS = {
  NEW_ACCOUNT: "account_age_lt_7d",
  LOW_FOLLOWERS: "followers_lt_10",
  HIGH_FREQUENCY: "post_frequency_gt_50_per_day",
  REPEATED_TEXT: "repeated_pattern",
  SIGNAL_SOURCE: "source_is_signal_provider",
  LINK_SPAM: "link_spam",
  GENERIC_PROFILE: "generic_profile",
  VERIFIED: "verified_reduction",
};

export function scoreBotLikelihood(post: SocialPost): BotHeuristicResult {
  let score = 0;
  const flags: string[] = [];
  const author = post.author || { id: "unknown" };

  if (author.is_bot_flag) {
    score += 0.4;
    flags.push("provider_flagged_bot");
  }

  const accountAgeDays = author.created_at
    ? Math.max(0, (Date.now() - new Date(author.created_at).getTime()) / 86_400_000)
    : undefined;

  if (typeof accountAgeDays === "number" && accountAgeDays < 7) {
    score += 0.25;
    flags.push(DEFAULT_FLAGS.NEW_ACCOUNT);
  }

  if ((author.followers ?? 0) < 10) {
    score += 0.15;
    flags.push(DEFAULT_FLAGS.LOW_FOLLOWERS);
  }

  if ((author.following ?? 0) > 2000 && (author.followers ?? 0) < 50) {
    score += 0.05;
    flags.push("follow_ratio_skewed");
  }

  if (post.source_type && ["api", "webhook"].includes(post.source_type)) {
    score += 0.4;
    flags.push(DEFAULT_FLAGS.SIGNAL_SOURCE);
  }

  if (/https?:\/\//i.test(post.text) && (post.text.match(/https?:\/\//gi)?.length ?? 0) > 1) {
    score += 0.2;
    flags.push(DEFAULT_FLAGS.LINK_SPAM);
  }

  if (/signal/i.test(post.text) || /copy/i.test(post.text)) {
    score += 0.1;
    flags.push("signal_language");
  }

  if (!/https?:\/\//i.test(post.text) && /buy|sell|long|short/i.test(post.text)) {
    flags.push("trading_language");
  }

  if (/default|user\d{3,}/i.test(post.author?.id ?? "")) {
    score += 0.1;
    flags.push(DEFAULT_FLAGS.GENERIC_PROFILE);
  }

  if (author.verified) {
    score -= 0.15;
    flags.push(DEFAULT_FLAGS.VERIFIED);
  }

  return {
    botScore: Math.min(1, Math.max(0, score)),
    reason_flags: Array.from(new Set(flags)),
  };
}
