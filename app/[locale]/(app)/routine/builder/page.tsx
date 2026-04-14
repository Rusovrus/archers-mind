'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { ArrowLeft, GripVertical, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getRoutine, getDefaultRoutine, saveRoutine } from '@/lib/routines';
import { RoutineStep } from '@/types/exercise';
import { Button } from '@/components/ui/Button';

interface EditableStep extends RoutineStep {
  _id: string; // stable key for dnd-kit
}

let stepIdCounter = 0;
function nextStepId(): string {
  return `step-${++stepIdCounter}`;
}

function makeEditable(steps: RoutineStep[]): EditableStep[] {
  return steps.map((s) => ({ ...s, _id: nextStepId() }));
}

function emptyStep(order: number): EditableStep {
  return { _id: nextStepId(), order, name: '', duration: 3, cue: '' };
}

export default function RoutineBuilderPage() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const editId = searchParams.get('id');
  const t = useTranslations('routine');
  const tc = useTranslations('common');

  const [name, setName] = useState('');
  const [steps, setSteps] = useState<EditableStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load existing routine if editing
  useEffect(() => {
    if (loaded) return;

    if (editId && editId !== 'default') {
      // Wait for auth before loading custom routine
      if (!firebaseUser) return;
      getRoutine(firebaseUser.uid, editId).then((r) => {
        if (r) {
          setName(r.name);
          setSteps(makeEditable(r.steps));
        }
        setLoaded(true);
      });
    } else if (editId === 'default') {
      const def = getDefaultRoutine(locale);
      setName('');
      setSteps(makeEditable(def.steps));
      setLoaded(true);
    } else {
      // New routine — start with 3 empty steps
      setSteps([emptyStep(1), emptyStep(2), emptyStep(3)]);
      setLoaded(true);
    }
  }, [editId, firebaseUser, locale, loaded]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSteps((prev) => {
      const oldIndex = prev.findIndex((s) => s._id === active.id);
      const newIndex = prev.findIndex((s) => s._id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((s, i) => ({ ...s, order: i + 1 }));
    });
  }

  function updateStep(id: string, field: keyof RoutineStep, value: string | number) {
    setSteps((prev) =>
      prev.map((s) => (s._id === id ? { ...s, [field]: value } : s))
    );
  }

  function addStep() {
    setSteps((prev) => [...prev, emptyStep(prev.length + 1)]);
  }

  function removeStep(id: string) {
    setSteps((prev) =>
      prev.filter((s) => s._id !== id).map((s, i) => ({ ...s, order: i + 1 }))
    );
  }

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);

  const handleSave = useCallback(async () => {
    if (!firebaseUser || !name.trim() || steps.length === 0) return;

    const hasEmptyNames = steps.some((s) => !s.name.trim());
    if (hasEmptyNames) {
      toast.error(locale === 'ro' ? 'Completează numele tuturor pașilor' : 'Fill in all step names');
      return;
    }

    setSaving(true);
    try {
      const cleanSteps: RoutineStep[] = steps.map((s) => ({
        order: s.order,
        name: s.name.trim(),
        duration: s.duration,
        cue: s.cue.trim(),
      }));

      await saveRoutine(firebaseUser.uid, {
        id: editId && editId !== 'default' ? editId : undefined,
        name: name.trim(),
        steps: cleanSteps,
      });

      toast.success(t('saved'));
      router.push(`/${locale}/routine`);
    } catch {
      toast.error(tc('error'));
    } finally {
      setSaving(false);
    }
  }, [firebaseUser, name, steps, editId, locale, t, tc, router]);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/routine`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-stone-900">{t('builder')}</h1>
      </div>

      {/* Routine name */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          {t('routineName')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
        />
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-stone-700">
            {t('steps')} ({steps.length})
          </label>
          <p className="text-xs text-stone-400">{t('reorderHint')}</p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((s) => s._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {steps.map((step) => (
                <SortableStep
                  key={step._id}
                  step={step}
                  t={t}
                  onUpdate={updateStep}
                  onRemove={() => removeStep(step._id)}
                  canRemove={steps.length > 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          onClick={addStep}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 py-3 text-sm text-stone-500 hover:border-amber-600 hover:text-amber-800 transition-colors"
        >
          <Plus size={16} />
          {t('addStep')}
        </button>
      </div>

      {/* Total duration */}
      <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
        <span className="text-sm font-medium text-amber-900">{t('totalDuration')}</span>
        <span className="text-lg font-bold text-amber-800">{totalDuration}s</span>
      </div>

      {/* Save */}
      <Button
        variant="primary"
        onClick={handleSave}
        loading={saving}
        disabled={!name.trim() || steps.length === 0}
      >
        {t('save')}
      </Button>
    </div>
  );
}

function SortableStep({
  step,
  t,
  onUpdate,
  onRemove,
  canRemove,
}: {
  step: EditableStep;
  t: ReturnType<typeof useTranslations>;
  onUpdate: (id: string, field: keyof RoutineStep, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: step._id,
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-2 flex h-8 w-8 shrink-0 touch-none items-center justify-center rounded text-stone-400 hover:bg-stone-100"
        >
          <GripVertical size={18} />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Step number + name */}
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
              {step.order}
            </span>
            <input
              type="text"
              value={step.name}
              onChange={(e) => onUpdate(step._id, 'name', e.target.value)}
              placeholder={t('stepName')}
              className="flex-1 rounded border border-stone-200 px-2 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none"
            />
          </div>

          {/* Duration + cue */}
          <div className="flex gap-2">
            <div className="w-20 shrink-0">
              <input
                type="number"
                min={1}
                max={60}
                value={step.duration}
                onChange={(e) => onUpdate(step._id, 'duration', Math.max(1, Number(e.target.value)))}
                className="w-full rounded border border-stone-200 px-2 py-1.5 text-center text-sm text-stone-900 focus:border-amber-600 focus:outline-none"
              />
              <p className="mt-0.5 text-center text-[10px] text-stone-400">sec</p>
            </div>
            <input
              type="text"
              value={step.cue}
              onChange={(e) => onUpdate(step._id, 'cue', e.target.value)}
              placeholder={t('cuePlaceholder')}
              className="flex-1 rounded border border-stone-200 px-2 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Remove */}
        {canRemove && (
          <button
            onClick={onRemove}
            className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
