import { useMemo, useRef, useState } from 'react';
import {
  Database,
  Download,
  Languages,
  Pencil,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import type { PersistedState, Punishment } from '@/types';
import { useStore } from '@/store/useStore';
import { useLevel } from '@/store/derived';
import { activePenalties } from '@/store/selectors';
import { useUI } from '@/components/layout/UIProvider';
import { Badge, Button, Card, EmptyState, Field, IconButton, SegmentedControl, TextInput, useConfirm } from '@/components/ui';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useT } from '@/i18n/useT';
import { LANGUAGE_LABELS, type Language, type TKey } from '@/i18n';
import { initialsOf } from '@/lib/format';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const profile = useStore((s) => s.profile);
  const habits = useStore((s) => s.habits);
  const logs = useStore((s) => s.logs);
  const rewards = useStore((s) => s.rewards);
  const redemptions = useStore((s) => s.redemptions);
  const punishments = useStore((s) => s.punishments);
  const setProfileName = useStore((s) => s.setProfileName);
  const deletePunishment = useStore((s) => s.deletePunishment);
  const reseed = useStore((s) => s.reseed);
  const resetAll = useStore((s) => s.resetAll);
  const pushToast = useStore((s) => s.pushToast);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const level = useLevel();
  const { openPunishmentForm } = useUI();
  const confirm = useConfirm();
  const { t, tn } = useT();

  const [name, setName] = useState(profile.name);
  const fileRef = useRef<HTMLInputElement>(null);

  const triggerText = (p: Punishment) =>
    p.trigger === 'balance-below' ? t('set.pen_balance', { n: p.threshold }) : t('set.pen_skips', { n: p.threshold });

  const activeIds = useMemo(
    () => new Set(activePenalties(punishments, logs, redemptions).map((a) => a.punishment.id)),
    [punishments, logs, redemptions],
  );

  const saveName = () => {
    if (name.trim() && name.trim() !== profile.name) {
      setProfileName(name);
      pushToast({ variant: 'success', title: t('toast.profile_updated') });
    }
  };

  const exportData = () => {
    const data: PersistedState = { profile, habits, logs, rewards, redemptions, punishments, seeded: true };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascend-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast({ variant: 'success', title: t('toast.exported'), message: t('toast.exported_msg') });
  };

  const importData = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.habits) || !Array.isArray(parsed.logs)) throw new Error('bad shape');
      useStore.setState({
        profile: parsed.profile ?? profile,
        habits: parsed.habits,
        logs: parsed.logs,
        rewards: parsed.rewards ?? [],
        redemptions: parsed.redemptions ?? [],
        punishments: parsed.punishments ?? [],
        seeded: true,
      });
      pushToast({ variant: 'success', title: t('toast.imported'), message: t('toast.imported_msg') });
    } catch {
      pushToast({ variant: 'error', title: t('toast.import_failed'), message: t('toast.import_failed_msg') });
    }
  };

  const onReseed = async () => {
    const ok = await confirm({
      title: t('set.demo_title'),
      message: t('set.demo_msg'),
      confirmLabel: t('set.demo_confirm'),
      icon: <Sparkles />,
    });
    if (ok) reseed();
  };

  const onReset = async () => {
    const ok = await confirm({
      title: t('set.clear_title'),
      message: t('set.clear_msg'),
      confirmLabel: t('set.clear_confirm'),
      tone: 'danger',
      icon: <Trash2 />,
    });
    if (ok) {
      resetAll();
      setName('Achiever');
    }
  };

  const onDeletePunishment = async (p: Punishment) => {
    const ok = await confirm({ title: t('set.del_penalty_title'), message: t('set.del_penalty_msg', { name: p.name }), confirmLabel: t('confirm.delete'), tone: 'danger' });
    if (ok) deletePunishment(p.id);
  };

  return (
    <div className={styles.page}>
      <Card pad="md">
        <SectionHeader icon={<User />} title={t('set.profile')} subtitle={t('set.profile_sub')} />
        <div className={styles.profile}>
          <div className={styles.avatar}>{initialsOf(name || 'A')}</div>
          <Field label={t('set.display_name')} className={styles.nameField}>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              maxLength={28}
            />
          </Field>
          <div className={styles.levelChip}>
            <span className={styles.levelNum}>{t('common.lv')} {level.level}</span>
            <span className={styles.levelTitle}>{t(`level.${level.title}` as TKey)}</span>
          </div>
        </div>
      </Card>

      <Card pad="md">
        <SectionHeader icon={<Languages />} title={t('set.language')} subtitle={t('set.language_sub')} />
        <SegmentedControl
          fluid
          options={[
            { value: 'en', label: `🇬🇧 ${LANGUAGE_LABELS.en}` },
            { value: 'fr', label: `🇫🇷 ${LANGUAGE_LABELS.fr}` },
          ]}
          value={language}
          onChange={(v) => setLanguage(v as Language)}
        />
      </Card>

      <Card pad="md">
        <SectionHeader
          icon={<ShieldAlert />}
          title={t('set.penalties')}
          subtitle={t('set.penalties_sub')}
          action={
            <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => openPunishmentForm()}>
              {t('set.add_penalty')}
            </Button>
          }
        />
        {punishments.length === 0 ? (
          <EmptyState
            compact
            icon="🛡️"
            title={t('set.no_penalties_title')}
            description={t('set.no_penalties_desc')}
            action={<Button size="sm" icon={<Plus />} onClick={() => openPunishmentForm()}>{t('set.add_penalty')}</Button>}
          />
        ) : (
          <div className={styles.punishments}>
            {punishments.map((p) => {
              const active = activeIds.has(p.id);
              return (
                <div key={p.id} className={styles.punRow} data-active={active}>
                  <span className={styles.punIcon}>{p.icon}</span>
                  <div className={styles.punInfo}>
                    <span className={styles.punName}>{p.name}</span>
                    <span className={styles.punTrigger}>{triggerText(p)}</span>
                  </div>
                  {active && <Badge tone="danger">{t('set.active_now')}</Badge>}
                  <div className={styles.punActions}>
                    <IconButton label={t('common.edit')} size="sm" onClick={() => openPunishmentForm(p)}>
                      <Pencil />
                    </IconButton>
                    <IconButton label={t('confirm.delete')} size="sm" variant="danger" onClick={() => onDeletePunishment(p)}>
                      <Trash2 />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card pad="md">
        <SectionHeader icon={<Database />} title={t('set.data')} subtitle={t('set.data_sub')} />
        <div className={styles.dataStats}>
          {[
            { key: 'set.habits', value: habits.length },
            { key: 'set.logs', value: logs.length },
            { key: 'set.rewards', value: rewards.length },
            { key: 'set.redemptions', value: redemptions.length },
          ].map(({ key, value }) => (
            <div key={key} className={styles.dataStat}>
              <span className={styles.dataNum}>{value}</span>
              <span className={styles.dataLabel}>{t(key as TKey)}</span>
            </div>
          ))}
        </div>

        <div className={styles.dataActions}>
          <Button variant="secondary" icon={<Download />} onClick={exportData}>
            {t('set.export')}
          </Button>
          <Button variant="secondary" icon={<Upload />} onClick={() => fileRef.current?.click()}>
            {t('set.import')}
          </Button>
          <Button variant="secondary" icon={<Sparkles />} onClick={onReseed}>
            {t('set.load_demo')}
          </Button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => void importData(e.target.files?.[0])} />
        </div>

        <div className={styles.dangerZone}>
          <div>
            <p className={styles.dangerTitle}>
              <RefreshCw className={styles.dangerIcon} /> {t('set.reset_title')}
            </p>
            <p className={styles.dangerDesc}>{t('set.reset_desc', { logs: tn(logs.length, 'unit.log') })}</p>
          </div>
          <Button variant="danger" icon={<Trash2 />} onClick={onReset}>
            {t('set.clear')}
          </Button>
        </div>
      </Card>

      <p className={styles.footer}>{t('set.footer')}</p>
    </div>
  );
}
