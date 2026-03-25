// src/components/HomePromoBanner.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  HOME_PROMO_SCOPE,
  decideBanner,
  trackBannerDisplay,
  trackBannerClick,
  getBannerFallback,
  BannerPayloadV1,
  Proposition,
} from '../adapters/optimizeAdapter';

type Props = { hasReservation: boolean };

export default function HomePromoBanner({ hasReservation }: Props) {
  const [payload, setPayload] = useState<BannerPayloadV1 | null>(null);
  const [propRef, setPropRef] = useState<Proposition | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (hasReservation) return; // regra de negócio do piloto
    setLoading(true);
    try {
      const { payload, proposition } = await decideBanner(HOME_PROMO_SCOPE, {
        timeoutSec: 2,
        context: { route: 'home', hasReservation: false },
      });
      setPayload(payload ?? getBannerFallback());
      setPropRef(proposition);
      await trackBannerDisplay(proposition);
    } catch (e) {
      setPayload(getBannerFallback());
      setPropRef(null);
      console.warn('HomePromoBanner: fallback aplicado', e);
    } finally {
      setLoading(false);
    }
  }, [hasReservation]);

  useEffect(() => {
    load();
  }, [load]);

  if (hasReservation) return null;
  if (loading && !payload) return <ActivityIndicator />;
  if (!payload) return null;

  return (
    <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
      {!!payload.imageUrl && (
        <Image
          source={{ uri: payload.imageUrl }}
          style={{ width: '100%', height: 160, borderRadius: 12, backgroundColor: '#eee' }}
          resizeMode="cover"
        />
      )}
      {!!payload.title && <Text style={{ marginTop: 8, fontWeight: '600' }}>{payload.title}</Text>}
      {!!payload.subtitle && <Text style={{ color: '#444' }}>{payload.subtitle}</Text>}

      {payload.cta?.label && (
        <TouchableOpacity
          onPress={async () => {
            await trackBannerClick(propRef, { interactionType: 'tap', label: payload.cta?.label });
            // TODO: navegar para o deeplink, ex.: Linking.openURL(payload.cta.deeplink ?? 'app://offers');
          }}
          style={{
            marginTop: 10,
            backgroundColor: '#005eb8',
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>{payload.cta.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
