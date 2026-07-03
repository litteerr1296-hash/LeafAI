import { pricingPlans as fallbackPricingPlans } from "@/data/mock/plans";
import { normalizePlan, PLANS, type PlanKey } from "@/lib/plans";
import type { ChatMessage, ChatMode, PricingPlan } from "@/types";

type EngagementFetchInit = RequestInit & {
  accessToken?: string | null;
};

export type ServicePlan = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_monthly: string;
  currency: string;
  yolo_enabled: boolean;
  cnn_enabled: boolean;
  rag_enabled: boolean;
  expert_chat_enabled: boolean;
  max_diagnoses_per_month: number;
  metadata: Record<string, unknown>;
  is_active: boolean;
};

export type UserSubscription = {
  id: number;
  plan: ServicePlan;
  status: string;
  starts_at: string;
  ends_at: string | null;
  auto_renew: boolean;
  payment_provider: string;
  provider_subscription_id: string;
  created_at: string;
  updated_at: string;
};

export type ChatConversation = {
  id: number;
  diagnosis: number | null;
  mode: "rag" | "advisor" | "expert";
  title: string;
  summary: string;
  is_archived: boolean;
  messages: DjangoChatMessage[];
  created_at: string;
  updated_at: string;
};

export type DjangoChatMessage = {
  id: number;
  conversation: number;
  role: "system" | "user" | "assistant" | "expert";
  content: string;
  citations: unknown[];
  meta: Record<string, unknown>;
  created_at: string;
};

export type ExpertConsultation = {
  id: number;
  diagnosis: number | null;
  conversation: number | null;
  topic: string;
  question: string;
  status: "open" | "assigned" | "answered" | "closed";
  expert_name: string;
  expert_reply: string;
  priority: string;
  created_at: string;
  updated_at: string;
};

const PLAN_ICON: Record<PlanKey, string> = {
  seed: "🌱",
  grow: "🌿",
  bloom: "🌳",
  elite: "👑",
};

function formatVnd(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Miễn phí";
  return `${amount.toLocaleString("vi-VN")}đ/tháng`;
}

async function engagementFetch<T>(path: string, init?: EngagementFetchInit): Promise<T> {
  const { accessToken, headers, ...fetchInit } = init ?? {};
  const normalizedPath = path.replace(/^\//, "").replace(/\/+$/, "");
  const mergedHeaders: Record<string, string> = {
    "content-type": "application/json",
    ...((headers as Record<string, string> | undefined) ?? {}),
  };
  if (accessToken) mergedHeaders.authorization = `Bearer ${accessToken}`;

  const res = await fetch(`/api/django/${normalizedPath}`, {
    ...fetchInit,
    headers: mergedHeaders,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as any;
      message = data.detail || data.error || data.non_field_errors?.[0] || message;
    } catch {
      // ignore response parsing failures
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function mapServicePlanToPricingPlan(plan: ServicePlan): PricingPlan | null {
  const id = normalizePlan(plan.slug);
  if (!["seed", "grow", "bloom", "elite"].includes(id)) return null;

  const fallback = PLANS[id];
  const fallbackCard = fallbackPricingPlans.find((item) => item.id === id);
  const metadataFeatures = Array.isArray(plan.metadata?.features)
    ? plan.metadata.features.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id,
    name: plan.name || fallback.name,
    icon: PLAN_ICON[id],
    price: formatVnd(plan.price_monthly),
    description: plan.description || fallbackCard?.description || fallback.tagline,
    cta: id === "seed" ? "Dùng miễn phí" : `Nâng cấp ${plan.name || fallback.name}`,
    highlight: Boolean(plan.metadata?.highlight) || id === "bloom",
    badge: typeof plan.metadata?.badge === "string" ? plan.metadata.badge : fallbackCard?.badge,
    features: metadataFeatures.length ? metadataFeatures : [...fallback.features],
  };
}

export async function fetchServicePlans() {
  return engagementFetch<ServicePlan[]>("/api/engagement/plans/");
}

export async function fetchPricingPlansFromApi() {
  const plans = await fetchServicePlans();
  const mapped = plans
    .map(mapServicePlanToPricingPlan)
    .filter((plan): plan is PricingPlan => Boolean(plan))
    .sort((a, b) => {
      const order: Record<PlanKey, number> = { seed: 0, grow: 1, bloom: 2, elite: 3 };
      return order[a.id] - order[b.id];
    });

  return mapped.length ? mapped : fallbackPricingPlans;
}

export function fetchUserSubscriptions(accessToken: string) {
  return engagementFetch<UserSubscription[]>("/api/engagement/subscriptions/", { accessToken });
}

export function fetchChatConversations(accessToken: string, mode?: ChatMode) {
  return engagementFetch<ChatConversation[]>("/api/engagement/conversations/", { accessToken }).then(
    (items) => {
      if (!mode) return items;
      const djangoMode = mode === "expert" ? "expert" : "rag";
      return items.filter((item) => item.mode === djangoMode);
    },
  );
}

export function createChatConversation(
  accessToken: string,
  payload: { mode: ChatMode; title: string; diagnosisId?: string | number | null },
) {
  const diagnosis = payload.diagnosisId && /^\d+$/.test(String(payload.diagnosisId))
    ? Number(payload.diagnosisId)
    : null;

  return engagementFetch<ChatConversation>("/api/engagement/conversations/", {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      mode: payload.mode === "expert" ? "expert" : "rag",
      title: payload.title.slice(0, 180),
      diagnosis,
    }),
  });
}

export function createChatMessage(
  accessToken: string,
  payload: {
    conversationId: number;
    role: DjangoChatMessage["role"];
    content: string;
    meta?: Record<string, unknown>;
  },
) {
  return engagementFetch<DjangoChatMessage>("/api/engagement/messages/", {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      conversation: payload.conversationId,
      role: payload.role,
      content: payload.content,
      meta: payload.meta ?? {},
    }),
  });
}

export function mapDjangoChatMessage(message: DjangoChatMessage): ChatMessage {
  return {
    id: String(message.id),
    role: message.role === "user" ? "user" : "assistant",
    content: message.content,
    createdAt: message.created_at,
  };
}

export function createExpertConsultation(
  accessToken: string,
  payload: {
    topic: string;
    question: string;
    diagnosisId?: string | number | null;
    conversationId?: number | null;
    priority?: string;
  },
) {
  const diagnosis = payload.diagnosisId && /^\d+$/.test(String(payload.diagnosisId))
    ? Number(payload.diagnosisId)
    : null;

  return engagementFetch<ExpertConsultation>("/api/engagement/expert-consultations/", {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      topic: payload.topic.slice(0, 180),
      question: payload.question,
      diagnosis,
      conversation: payload.conversationId ?? null,
      priority: payload.priority ?? "normal",
    }),
  });
}
