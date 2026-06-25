/** Static reference data: categories, frequencies, emoji palette. */
import type { Frequency, HabitKind } from '@/types';

export interface CategoryDef {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const HABIT_CATEGORIES: CategoryDef[] = [
  { id: 'fitness', label: 'Fitness', icon: '💪', color: '#fb7185' },
  { id: 'health', label: 'Health', icon: '🩺', color: '#34d399' },
  { id: 'mind', label: 'Mind', icon: '🧠', color: '#a78bfa' },
  { id: 'productivity', label: 'Productivity', icon: '⚡', color: '#fbbf24' },
  { id: 'learning', label: 'Learning', icon: '📚', color: '#56b6ff' },
  { id: 'finance', label: 'Finance', icon: '💰', color: '#2dd4bf' },
  { id: 'creativity', label: 'Creativity', icon: '🎨', color: '#f472b6' },
  { id: 'social', label: 'Social', icon: '🫂', color: '#fb923c' },
  { id: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: '#818cf8' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗', color: '#4ade80' },
  { id: 'sleep', label: 'Sleep', icon: '😴', color: '#60a5fa' },
  { id: 'other', label: 'Other', icon: '✨', color: '#94a3b8' },
];

export const REWARD_CATEGORIES: CategoryDef[] = [
  { id: 'food', label: 'Food', icon: '🍔', color: '#fb923c' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: '#a78bfa' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#f472b6' },
  { id: 'entertainment', label: 'Entertainment', icon: '🍿', color: '#fbbf24' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#56b6ff' },
  { id: 'wellness', label: 'Wellness', icon: '💆', color: '#34d399' },
  { id: 'tech', label: 'Tech', icon: '🎧', color: '#2dd4bf' },
  { id: 'experience', label: 'Experience', icon: '🎟️', color: '#fb7185' },
  { id: 'other', label: 'Other', icon: '🎁', color: '#94a3b8' },
];

const FALLBACK_CATEGORY: CategoryDef = { id: 'other', label: 'Other', icon: '✨', color: '#94a3b8' };

export function habitCategory(id: string): CategoryDef {
  return HABIT_CATEGORIES.find((c) => c.id === id) ?? FALLBACK_CATEGORY;
}

export function rewardCategory(id: string): CategoryDef {
  return REWARD_CATEGORIES.find((c) => c.id === id) ?? { ...FALLBACK_CATEGORY, icon: '🎁' };
}

export const FREQUENCY_OPTIONS: Array<{ value: Frequency; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const KIND_OPTIONS: Array<{ value: HabitKind; label: string; hint: string }> = [
  { value: 'recurring', label: 'Recurring', hint: 'Repeats every period' },
  { value: 'one-time', label: 'One-time', hint: 'A single task to finish' },
];

export const EMOJI_PALETTE: string[] = [
  '💪', '🏃', '🧘', '🥗', '💧', '😴', '🧠', '📚', '✍️', '🎯',
  '⚡', '🔥', '🚀', '💰', '📈', '🧹', '🛏️', '🚿', '🦷', '☀️',
  '🌙', '🎨', '🎸', '🎹', '📷', '🧑‍💻', '💼', '📝', '🗣️', '🌱',
  '🍎', '🥦', '☕', '🚭', '🧴', '👟', '🏋️', '🚴', '🏊', '⛹️',
  '🧗', '🤸', '🛐', '📖', '🧩', '♟️', '🎮', '🎬', '🎧', '🍿',
  '✈️', '🏖️', '🎁', '🛍️', '🍔', '🍕', '🍣', '🍩', '🏆', '⭐',
];
