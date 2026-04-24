'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Logo from '@/components/Logo';

export default function JoinPage() {
  const t = useTranslations('join');
  const router = useRouter();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) {
      setErr(t('codeRequired'));
      return;
    }
    router.push(`/join/${encodeURIComponent(cleaned)}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-deep-navy">
      <Logo size={56} className="mb-6" />
      <h1 className="text-2xl font-bold text-white mb-2">{t('title')}</h1>
      <p className="text-slate-400 text-sm mb-8 text-center max-w-sm">
        {t('subtitle')}
      </p>

      <form
        onSubmit={submit}
        className="w-full max-w-sm flex flex-col gap-3 bg-[#0F1A3A] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/40"
      >
        <label className="text-sm font-semibold text-slate-200">
          {t('codeLabel')}
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setErr('');
          }}
          placeholder="CAS-INC-XXXX-YYYY"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className="px-4 py-3 rounded-xl bg-deep-navy border border-white/15 text-white font-mono tracking-wider placeholder:text-slate-500 focus:outline-none focus:border-electric-blue"
          style={{ textTransform: 'uppercase' }}
        />
        {err && (
          <p className="text-status-error text-xs">⚠ {err}</p>
        )}
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-electric-blue text-white font-semibold text-sm hover:bg-electric-blue/90 transition-colors"
        >
          {t('continue')}
        </button>
        <p className="text-slate-500 text-xs text-center mt-2">
          {t('codeHint')}
        </p>
      </form>
    </main>
  );
}
