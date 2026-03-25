// src/adapters/optimizeAdapter.ts
// Adapter para buscar e rastrear um banner via Edge/Optimize (React Native)
// Requer: @adobe/react-native-aepoptimize + Core/Edge/Identity/Consent já integrados.
// Métodos usados (Optimize RN): updatePropositions, getPropositions, propositionDisplay, propositionInteract.

import { Optimize } from '@adobe/react-native-aepoptimize';

export type BannerPayloadV1 = {
  v: number;
  type?: string;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  cta?: { label: string; deeplink?: string };
  [k: string]: any;
};

type PropositionItem = { data?: any };
export type Proposition = {
  id?: string;
  scope?: string;
  scopeDetails?: Record<string, any>;
  items?: PropositionItem[];
};

export const HOME_PROMO_SCOPE = 'home.promo.banner';

const DEFAULT_TIMEOUT_SEC = 2;

/** Busca proposições para um scope e retorna o primeiro payload JSON (schema v1). */
export async function decideBanner(
  scope: string,
  opts?: { timeoutSec?: number; context?: Record<string, any> }
): Promise<{ payload: BannerPayloadV1 | null; proposition: Proposition | null }> {
  const timeout = opts?.timeoutSec ?? DEFAULT_TIMEOUT_SEC;

  // 1) Atualiza/consulta as proposições para o scope informado
  await Optimize.updatePropositions([scope], {
    timeout,
    request: opts?.context ?? {},
  });

  // 2) Lê as proposições em cache para o scope informado
  const result: any = await Optimize.getPropositions([scope], { timeout });
  const list: Proposition[] | undefined =
    (result instanceof Map ? (result.get(scope) as Proposition[] | undefined) : (result?.[scope] as Proposition[] | undefined)) ?? [];

  const proposition = list[0] ?? null;
  const payload: BannerPayloadV1 | null = (proposition?.items?.[0]?.data as BannerPayloadV1 | undefined) ?? null;
  return { payload, proposition };
}

/** Registra exibição (view) da proposição exibida. */
export async function trackBannerDisplay(proposition: Proposition | null): Promise<void> {
  if (!proposition) return;
  await Optimize.propositionDisplay([proposition]);
}

/** Registra clique/interação na proposição. */
export async function trackBannerClick(
  proposition: Proposition | null,
  details?: { interactionType?: string; label?: string }
): Promise<void> {
  if (!proposition) return;
  await Optimize.propositionInteract(proposition, {
    interactionType: details?.interactionType ?? 'tap',
    interactionDetails: details?.label ? { label: details.label } : undefined,
  });
}

/** Fallback local (render padrão) */
export function getBannerFallback(): BannerPayloadV1 {
  return {
    v: 1,
    type: 'hero',
    imageUrl: 'https://cdn.example.com/banners/default.jpg',
    title: 'Bem-vindo ao app Azul',
    subtitle: 'Confira nossas ofertas',
    cta: { label: 'Ver promoções', deeplink: 'app://offers' },
  };
}
