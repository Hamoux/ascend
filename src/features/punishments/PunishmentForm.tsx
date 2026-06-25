import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { Punishment, PunishmentTrigger } from '@/types';
import { useStore, type PunishmentDraft } from '@/store/useStore';
import { useT } from '@/i18n/useT';
import { Button, EmojiPicker, Field, Modal, SegmentedControl, TextArea, TextInput } from '@/components/ui';
import styles from './PunishmentForm.module.css';

interface PunishmentFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Punishment | null;
}

interface FormState {
  name: string;
  icon: string;
  trigger: PunishmentTrigger;
  threshold: string;
  description: string;
}

const DEFAULTS: FormState = { name: '', icon: '🔥', trigger: 'balance-below', threshold: '0', description: '' };

export function PunishmentForm({ open, onClose, editing }: PunishmentFormProps) {
  const addPunishment = useStore((s) => s.addPunishment);
  const updatePunishment = useStore((s) => s.updatePunishment);
  const { t } = useT();
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            name: editing.name,
            icon: editing.icon,
            trigger: editing.trigger,
            threshold: String(editing.threshold),
            description: editing.description ?? '',
          }
        : DEFAULTS,
    );
    setNameError('');
  }, [open, editing]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.name.trim()) {
      setNameError(t('pform.name_err'));
      return;
    }
    const draft: PunishmentDraft = {
      name: form.name.trim(),
      icon: form.icon || '🔥',
      trigger: form.trigger,
      threshold: Math.round(Number(form.threshold) || 0),
      description: form.description.trim() || undefined,
    };
    if (editing) updatePunishment(editing.id, draft);
    else addPunishment(draft);
    onClose();
  };

  const balanceMode = form.trigger === 'balance-below';

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<ShieldAlert />}
      title={editing ? t('pform.edit_title') : t('pform.new_title')}
      subtitle={t('pform.sub')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={submit}>
            {editing ? t('pform.save') : t('pform.add')}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.identityRow}>
          <EmojiPicker value={form.icon} onChange={(v) => set('icon', v)} />
          <Field label={t('pform.name')} htmlFor="pun-name" error={nameError} className={styles.grow}>
            <TextInput
              id="pun-name"
              placeholder={t('pform.name_ph')}
              value={form.name}
              invalid={Boolean(nameError)}
              onChange={(e) => {
                set('name', e.target.value);
                if (nameError) setNameError('');
              }}
              autoFocus
            />
          </Field>
        </div>

        <Field label={t('pform.trigger')}>
          <SegmentedControl
            fluid
            options={[
              { value: 'balance-below', label: t('pform.trigger_balance') },
              { value: 'skip-streak', label: t('pform.trigger_skips') },
            ]}
            value={form.trigger}
            onChange={(v) => set('trigger', v)}
          />
        </Field>

        <Field
          label={balanceMode ? t('pform.threshold_balance') : t('pform.threshold_skips')}
          hint={balanceMode ? t('pform.threshold_balance_hint') : t('pform.threshold_skips_hint')}
        >
          <TextInput
            type="number"
            inputMode="numeric"
            value={form.threshold}
            onChange={(e) => set('threshold', e.target.value)}
          />
        </Field>

        <Field label={t('hform.description')} optional htmlFor="pun-desc">
          <TextArea
            id="pun-desc"
            placeholder={t('pform.desc_ph')}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
