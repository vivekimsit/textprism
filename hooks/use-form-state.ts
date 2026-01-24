'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Platform } from '@/lib/intent-matrix';

const STORAGE_KEYS = {
  ROLE: 'liaison_user_role',
  VIBE: 'liaison_user_vibe',
  PRO_UNLOCKED: 'liaison_pro_unlocked',
};

export function useFormState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from URL params or localStorage
  const [platform, setPlatform] = useState<Platform>(() => {
    const urlPlatform = searchParams.get('platform') as Platform;
    return urlPlatform || 'slack';
  });

  const [intentId, setIntentId] = useState<string | null>(() => {
    return searchParams.get('intent');
  });

  const [role, setRole] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.ROLE) || 'senior-engineer';
    }
    return 'senior-engineer';
  });

  const [vibe, setVibe] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.VIBE) || 'direct';
    }
    return 'direct';
  });

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const [isProUnlocked, setIsProUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.PRO_UNLOCKED) === 'true';
    }
    return false;
  });

  // Persist role and vibe to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
    }
  }, [role]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VIBE, vibe);
    }
  }, [vibe]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRO_UNLOCKED, String(isProUnlocked));
    }
  }, [isProUnlocked]);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('platform', platform);
    if (intentId) {
      params.set('intent', intentId);
    }
    if (role !== 'senior-engineer') {
      params.set('role', role);
    }

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [platform, intentId, role, pathname, router]);

  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
    setIntentId(null); // Reset intent when platform changes
    setFieldValues({}); // Clear field values
  };

  const handleIntentChange = (newIntentId: string) => {
    setIntentId(newIntentId);
    setFieldValues({}); // Clear field values when intent changes
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const unlockPro = () => {
    setIsProUnlocked(true);
  };

  return {
    platform,
    intentId,
    role,
    vibe,
    fieldValues,
    isProUnlocked,
    setPlatform: handlePlatformChange,
    setIntentId: handleIntentChange,
    setRole,
    setVibe,
    setFieldValues: handleFieldChange,
    unlockPro,
  };
}
