// context/TaskContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type Task = {
  id: string;
  title: string;
  daily: boolean;
  createdAt: string;
  expiresAt: string; // ISO string
  durationHours: number;
  completedToday?: boolean;
  lastCompletedAt?: string | null;
};

type TaskContextType = {
  tasks: Task[];
  addTask: (task: { title: string; daily?: boolean; expiresAt?: string; durationHours?: number }) => void;
  removeTask: (idOrIndex: string | number) => void;
  completeTask: (id: string) => void;
};

const TaskContext = createContext<TaskContextType | null>(null);

// TEST flag: set true for quick testing, false for production
const TEST_DAILY_MODE = false;
const TEST_DAILY_MINUTES = 1;
const TICK_INTERVAL_MS = TEST_DAILY_MODE ? 5_000 : 60_000;

const nowLocalDateString = () => {
  const d = new Date();
  return d.toLocaleDateString();
};

const getNextMidnightISO = () => {
  if (TEST_DAILY_MODE) {
    const d = new Date(Date.now() + TEST_DAILY_MINUTES * 60 * 1000);
    return d.toISOString();
  }
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.toISOString();
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastResetDate, setLastResetDate] = useState<string>(nowLocalDateString());

  // load & migrate tasks, and if a daily task's expiresAt is in the past, reset expiresAt AND clear completedToday
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('tasks');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === 'string') {
          const migrated: Task[] = parsed.map((t: string) => ({
            id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            title: t,
            daily: false,
            createdAt: new Date().toISOString(),
            durationHours: 24,
            expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            completedToday: false,
            lastCompletedAt: null,
          }));
          setTasks(migrated);
          return;
        }
        if (Array.isArray(parsed)) {
          const normalized = (parsed as any[]).map((p) => {
            const daily = !!p.daily;
            let expiresAt = p.expiresAt ?? (daily ? getNextMidnightISO() : new Date(Date.now() + 24 * 3600 * 1000).toISOString());
            let completedToday = !!p.completedToday;
            // if stored daily task expired while the app was closed, reset expiry AND clear completedToday
            if (daily && new Date(expiresAt).getTime() <= Date.now()) {
              expiresAt = getNextMidnightISO();
              completedToday = false;
            }
            return {
              id: p.id ?? `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              title: p.title ?? String(p),
              daily,
              createdAt: p.createdAt ?? new Date().toISOString(),
              durationHours: p.durationHours ?? (daily ? 24 : 24),
              expiresAt,
              completedToday,
              lastCompletedAt: p.lastCompletedAt ?? null,
            } as Task;
          });
          setTasks(normalized);
        }
      } catch (e) {
        console.warn('Failed to load tasks', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist tasks
  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks)).catch((e) => console.warn('Failed to save tasks', e));
  }, [tasks]);

  // periodic tick: reset daily tasks when local date changes (robust across app restarts)
  useEffect(() => {
    const tick = () => {
      const today = nowLocalDateString();
      if (today === lastResetDate) return; // nothing to do
      // date changed -> perform daily reset
      setTasks((prev) => {
        const next = prev.map((t) => {
          if (!t.daily) return t;
          return { ...t, expiresAt: getNextMidnightISO(), completedToday: false };
        });
        return next;
      });
      setLastResetDate(today);
      // persist lastResetDate optional: not necessary, it will be set on mount
      console.debug('[TaskContext] Daily reset performed for date:', today);
    };

    // Also run a quick check: if any daily task has expiresAt <= now, reset it immediately
    const quickCheck = () => {
      setTasks((prev) => {
        const now = Date.now();
        let changed = false;
        const next = prev.map((t) => {
          if (!t.daily) return t;
          if (new Date(t.expiresAt).getTime() <= now) {
            changed = true;
            return { ...t, expiresAt: getNextMidnightISO(), completedToday: false };
          }
          return t;
        });
        return changed ? next : prev;
      });
    };

    quickCheck();
    const id = setInterval(() => {
      quickCheck();
      tick();
    }, TICK_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResetDate]);

  const addTask = (task: { title: string; daily?: boolean; expiresAt?: string; durationHours?: number }) => {
    const daily = !!task.daily;
    const durationHours = task.durationHours ?? (daily ? 24 : 24);
    const expiresAt = task.expiresAt ?? (daily ? getNextMidnightISO() : new Date(Date.now() + durationHours * 3600 * 1000).toISOString());

    const newTask: Task = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title: task.title,
      daily,
      createdAt: new Date().toISOString(),
      durationHours,
      expiresAt,
      completedToday: false,
      lastCompletedAt: null,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const removeTask = (idOrIndex: string | number) => {
    setTasks((prev) =>
      typeof idOrIndex === 'number' ? prev.filter((_, i) => i !== idOrIndex) : prev.filter((t) => t.id !== idOrIndex)
    );
  };

  const completeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        // if daily, mark completedToday; if not daily, will be removed by UI when completed
        return { ...t, completedToday: true, lastCompletedAt: new Date().toISOString() };
      })
    );
  };

  return <TaskContext.Provider value={{ tasks, addTask, removeTask, completeTask }}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextType => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider');
  return ctx;
};
