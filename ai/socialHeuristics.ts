import type { BotScorePostPayload, SocialPost, SocialPostAssessment } from "@/types/ai";
import { computeBotScore } from "@/lib/ai/heuristics";

export type BotHeuristicResult = Pick<
  SocialPostAssessment,
  "botScore" | "bot_score" | "reason_flags"
>;

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
  const author = post.author ?? { id: "unknown" };
  const flags: string[] = [];

  if (author.is_bot_flag) {
    flags.push("provider_flagged_bot");
  }

  const accountAgeDays =
    author.age_days ??
    (author.created_at
      ? Math.max(0, (Date.now() - new Date(author.created_at).getTime()) / 86_400_000)
      : undefined);

  const payload: BotScorePostPayload = {
    author: {
      age_days: Number.isFinite(accountAgeDays) ? accountAgeDays : undefined,
      followers: typeof author.followers === "number" ? author.followers : 0,
      verified: author.verified === true,
    },
    post_frequency_per_day: Number.isFinite(post.post_frequency_per_day)
      ? (post.post_frequency_per_day as number)
      : undefined,
    repeated: Boolean(post.repeated),
    source_type: post.source_type,
    text: post.text ?? "",
  };

  const botScore = clampToUnit(computeBotScore(payload));

  if (typeof accountAgeDays === "number" && accountAgeDays < 7) {
    flags.push(DEFAULT_FLAGS.NEW_ACCOUNT);
  }

  if ((author.followers ?? 0) < 10) {
    flags.push(DEFAULT_FLAGS.LOW_FOLLOWERS);
  }

  if ((author.following ?? 0) > 2000 && (author.followers ?? 0) < 50) {
    flags.push("follow_ratio_skewed");
  }

  if (post.source_type && ["api", "webhook"].includes(post.source_type)) {
    flags.push(DEFAULT_FLAGS.SIGNAL_SOURCE);
  }

  if (/https?:\/\//i.test(post.text) && (post.text.match(/https?:\/\//gi)?.length ?? 0) > 1) {
    flags.push(DEFAULT_FLAGS.LINK_SPAM);
  }

  if (/signal/i.test(post.text) || /copy/i.test(post.text)) {
    flags.push("signal_language");
  }

  if (!/https?:\/\//i.test(post.text) && /buy|sell|long|short/i.test(post.text)) {
    flags.push("trading_language");
  }

  if (/default|user\d{3,}/i.test(author.id ?? "")) {
    flags.push(DEFAULT_FLAGS.GENERIC_PROFILE);
  }

  if (author.verified) {
    flags.push(DEFAULT_FLAGS.VERIFIED);
  }

  return {
    botScore,
    bot_score: botScore,
    reason_flags: Array.from(new Set(flags)),
  };
}

function clampToUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
