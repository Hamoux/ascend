import { useEffect, useState } from 'react';
import { Minus, Plus, Sparkles } from 'lucide-react';
import type { Frequency, Habit, HabitKind } from '@/types';
import { useStore, type HabitDraft } from '@/store/useStore';
import { FREQUENCY_OPTIONS, HABIT_CATEGORIES, KIND_OPTIONS } from '@/lib/constants';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { Button, EmojiPicker, Field, Modal, SegmentedControl, Select, TextArea, TextInput } from '@/components/ui';
import styles from './HabitForm.module.css';

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Habit | null;
}

interface FormState {
  name: string;
  icon: string;
  category: string;
  frequency: Frequency;
  kind: HabitKind;
  positivePoints: string;
  negativePoints: string;
  description: string;
  notes: string;
}

const DEFAULTS: FormState = {
  name: '',
  icon: '🎯',
  category: 'productivity',
  frequency: 'daily',
  kind: 'recurring',
  positivePoints: '10',
  negativePoints: '5',
  description: '',
  notes: '',
};

function fromHabit(h: Habit): FormState {
  return {
    name: h.name,
    icon: h.icon,
    category: h.category,
    frequency: h.frequency,
    kind: h.kind,
    positivePoints: String(h.positivePoints),
    negativePoints: String(h.negativePoints),
    description: h.description ?? '',
    notes: h.notes ?? '',
  };
}

export function HabitForm({ open, onClose, editing }: HabitFormProps) {
  const addHabit = useStore((s) => s.addHabit);
  const updateHabit = useStore((s) => s.updateHabit);
  const { t } = useT();
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(editing ? fromHabit(editing) : DEFAULTS);
      setNameError('');
    }
  }, [open, editing]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.name.trim()) {
      setNameError(t('hform.name_err'));
      return;
    }
    const draft: HabitDraft = {
      name: form.name.trim(),
      icon: form.icon || '🎯',
      category: form.category,
      frequency: form.frequency,
      kind: form.kind,
      positivePoints: Math.max(0, Math.round(Number(form.positivePoints) || 0)),
      negativePoints: Math.max(0, Math.round(Number(form.negativePoints) || 0)),
      description: form.description.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (editing) updateHabit(editing.id, draft);
    else addHabit(draft);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Sparkles />}
      title={editing ? t('hform.edit_title') : t('hform.new_title')}
      subtitle={editing ? t('hform.edit_sub') : t('hform.new_sub')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit}>{editing ? t('hform.save') : t('hform.create')}</Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.identityRow}>
          <EmojiPicker value={form.icon} onChange={(v) => set('icon', v)} />
          <Field label={t('hform.name')} htmlFor="habit-name" error={nameError} className={styles.grow}>
            <TextInput
              id="habit-name"
              placeholder={t('hform.name_ph')}
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

        <div className={styles.row2}>
          <Field label={t('hform.category')} htmlFor="habit-cat">
            <Select id="habit-cat" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {HABIT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon}  {t(`cat.${c.id}` as TKey)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('hform.frequency')} htmlFor="habit-freq">
            <Select id="habit-freq" value={form.frequency} onChange={(e) => set('frequency', e.target.value as Frequency)}>
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {t(`freq.${f.value}` as TKey)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label={t('hform.type')}>
          <SegmentedControl
            fluid
            options={KIND_OPTIONS.map((k) => ({
              value: k.value,
              label: t(k.value === 'recurring' ? 'kind.recurring' : 'kind.one_time'),
            }))}
            value={form.kind}
            onChange={(v) => set('kind', v)}
          />
        </Field>

        <div className={styles.row2}>
          <Field label={t('hform.reward')} hint={t('hform.reward_hint')}>
            <TextInput
              type="number"
              min={0}
              inputMode="numeric"
              prefix={<Plus className={styles.gain} />}
              value={form.positivePoints}
              onChange={(e) => set('positivePoints', e.target.value)}
            />
          </Field>
          <Field label={t('hform.penalty')} hint={t('hform.penalty_hint')}>
            <TextInput
              type="number"
              min={0}
              inputMode="numeric"
              prefix={<Minus className={styles.loss} />}
              value={form.negativePoints}
              onChange={(e) => set('negativePoints', e.target.value)}
            />
          </Field>
        </div>

        <Field label={t('hform.description')} optional htmlFor="habit-desc">
          <TextArea
            id="habit-desc"
            placeholder={t('hform.description_ph')}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>

        <Field label={t('hform.notes')} optional htmlFor="habit-notes">
          <TextArea
            id="habit-notes"
            placeholder={t('hform.notes_ph')}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
