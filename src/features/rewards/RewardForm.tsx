import { useEffect, useRef, useState } from 'react';
import { Coins, Gift, ImagePlus, Trash2 } from 'lucide-react';
import type { Reward } from '@/types';
import { useStore, type RewardDraft } from '@/store/useStore';
import { REWARD_CATEGORIES } from '@/lib/constants';
import { fileToDownscaledDataUrl } from '@/lib/image';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { Button, EmojiPicker, Field, IconButton, Modal, Select, TextArea, TextInput } from '@/components/ui';
import styles from './RewardForm.module.css';

interface RewardFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Reward | null;
}

interface FormState {
  name: string;
  icon: string;
  category: string;
  cost: string;
  description: string;
  image?: string;
}

const DEFAULTS: FormState = { name: '', icon: '🎁', category: 'entertainment', cost: '300', description: '', image: undefined };

export function RewardForm({ open, onClose, editing }: RewardFormProps) {
  const addReward = useStore((s) => s.addReward);
  const updateReward = useStore((s) => s.updateReward);
  const pushToast = useStore((s) => s.pushToast);
  const { t } = useT();
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [nameError, setNameError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            name: editing.name,
            icon: editing.icon,
            category: editing.category,
            cost: String(editing.cost),
            description: editing.description ?? '',
            image: editing.image,
          }
        : DEFAULTS,
    );
    setNameError('');
  }, [open, editing]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onPickImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      set('image', dataUrl);
    } catch {
      pushToast({ variant: 'error', title: t('toast.image_failed'), message: t('toast.image_failed_msg') });
    }
  };

  const submit = () => {
    if (!form.name.trim()) {
      setNameError(t('rform.name_err'));
      return;
    }
    const draft: RewardDraft = {
      name: form.name.trim(),
      icon: form.icon || '🎁',
      category: form.category,
      cost: Math.max(1, Math.round(Number(form.cost) || 0)),
      description: form.description.trim() || undefined,
      image: form.image,
    };
    if (editing) updateReward(editing.id, draft);
    else addReward(draft);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Gift />}
      title={editing ? t('rform.edit_title') : t('rform.new_title')}
      subtitle={editing ? t('rform.edit_sub') : t('rform.new_sub')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit}>{editing ? t('rform.save') : t('rform.add')}</Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.identityRow}>
          <EmojiPicker value={form.icon} onChange={(v) => set('icon', v)} />
          <Field label={t('rform.name')} htmlFor="reward-name" error={nameError} className={styles.grow}>
            <TextInput
              id="reward-name"
              placeholder={t('rform.name_ph')}
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
          <Field label={t('rform.category')} htmlFor="reward-cat">
            <Select id="reward-cat" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {REWARD_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon}  {t(`rcat.${c.id}` as TKey)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('rform.cost')} hint={t('rform.cost_hint')}>
            <TextInput
              type="number"
              min={1}
              inputMode="numeric"
              prefix={<Coins />}
              value={form.cost}
              onChange={(e) => set('cost', e.target.value)}
            />
          </Field>
        </div>

        <Field label={t('rform.cover')} optional>
          {form.image ? (
            <div className={styles.preview} style={{ backgroundImage: `url(${form.image})` }}>
              <IconButton label={t('common.delete')} variant="danger" className={styles.removeImg} onClick={() => set('image', undefined)}>
                <Trash2 />
              </IconButton>
            </div>
          ) : (
            <button type="button" className={styles.dropzone} onClick={() => fileRef.current?.click()}>
              <ImagePlus />
              <span>{t('rform.upload')}</span>
              <small>{t('rform.upload_hint')}</small>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => void onPickImage(e.target.files?.[0])}
          />
        </Field>

        <Field label={t('rform.description')} optional htmlFor="reward-desc">
          <TextArea
            id="reward-desc"
            placeholder={t('rform.description_ph')}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
