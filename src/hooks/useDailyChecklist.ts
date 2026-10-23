import { useState, useEffect, useCallback } from 'react';

export interface TaskItemState {
  current: number;
  target: number;
  completed: boolean;
}

export interface DailyChecklistData {
  dateStr: string; // YYYY-MM-DD
  streak: number;
  lastCompletedDate: string | null;
  tasks: {
    feed: TaskItemState;
    quiz: TaskItemState;
    pet: TaskItemState;
  };
  weeklyStamps: boolean[]; // 7 days (0: Senin, 1: Selasa, ... 6: Minggu)
  claimedBonusToday: boolean;
}

const STORAGE_KEY = 'cincau_daily_checklist_v1';

const getTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDayIndex = (): number => {
  const day = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  return day === 0 ? 6 : day - 1; // 0: Senin, 1: Selasa ... 6: Minggu
};

const DEFAULT_STATE: DailyChecklistData = {
  dateStr: getTodayStr(),
  streak: 3, // Starter streak for playful onboarding feel
  lastCompletedDate: getYesterdayStr(),
  tasks: {
    feed: { current: 0, target: 1, completed: false },
    quiz: { current: 0, target: 1, completed: false },
    pet: { current: 0, target: 3, completed: false },
  },
  weeklyStamps: [true, true, true, false, false, false, false], // Monday-Wednesday pre-stamped
  claimedBonusToday: false,
};

export const useDailyChecklist = () => {
  const [data, setData] = useState<DailyChecklistData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = getTodayStr();

        if (parsed && typeof parsed === 'object' && parsed.dateStr) {
          // If saved date is today, retain progress
          if (parsed.dateStr === today) {
            return {
              ...DEFAULT_STATE,
              ...parsed,
              tasks: {
                feed: parsed.tasks?.feed || DEFAULT_STATE.tasks.feed,
                quiz: parsed.tasks?.quiz || DEFAULT_STATE.tasks.quiz,
                pet: parsed.tasks?.pet || DEFAULT_STATE.tasks.pet,
              },
            };
          } else {
            // New day! Check if yesterday was completed
            const yesterday = getYesterdayStr();
            const wasYesterdayCompleted = parsed.lastCompletedDate === yesterday;
            const newStreak = wasYesterdayCompleted ? parsed.streak : 0;

            const updatedStamps = Array.isArray(parsed.weeklyStamps) && parsed.weeklyStamps.length === 7
              ? [...parsed.weeklyStamps]
              : [...DEFAULT_STATE.weeklyStamps];

            return {
              dateStr: today,
              streak: newStreak,
              lastCompletedDate: parsed.lastCompletedDate || null,
              tasks: {
                feed: { current: 0, target: 1, completed: false },
                quiz: { current: 0, target: 1, completed: false },
                pet: { current: 0, target: 3, completed: false },
              },
              weeklyStamps: updatedStamps,
              claimedBonusToday: false,
            };
          }
        }
      }
    } catch {
      // Storage error fallback
    }
    return DEFAULT_STATE;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota error
    }
  }, [data]);

  // Helper to verify if all tasks are complete
  const checkCompletion = useCallback((tasks: DailyChecklistData['tasks'], currentStreak: number, lastCompleted: string | null, stamps: boolean[]) => {
    const allDone = tasks.feed.completed && tasks.quiz.completed && tasks.pet.completed;
    const today = getTodayStr();
    
    if (allDone && lastCompleted !== today) {
      const dayIdx = getTodayDayIndex();
      const newStamps = [...stamps];
      newStamps[dayIdx] = true;
      const newStreak = currentStreak + 1;

      return {
        allDone,
        newStreak,
        lastCompleted: today,
        newStamps,
        justCompleted: true,
      };
    }

    return {
      allDone,
      newStreak: currentStreak,
      lastCompleted,
      newStamps: stamps,
      justCompleted: false,
    };
  }, []);

  // Track Feeding Madu Hutan / Food
  const trackFeed = useCallback(() => {
    let resultJustCompleted = false;
    setData((prev) => {
      const newFeedCurrent = Math.min(prev.tasks.feed.target, prev.tasks.feed.current + 1);
      const isFeedDone = newFeedCurrent >= prev.tasks.feed.target;
      
      const newTasks = {
        ...prev.tasks,
        feed: {
          ...prev.tasks.feed,
          current: newFeedCurrent,
          completed: isFeedDone,
        },
      };

      const check = checkCompletion(newTasks, prev.streak, prev.lastCompletedDate, prev.weeklyStamps);
      if (check.justCompleted) resultJustCompleted = true;

      return {
        ...prev,
        streak: check.newStreak,
        lastCompletedDate: check.lastCompleted,
        weeklyStamps: check.newStamps,
        tasks: newTasks,
      };
    });
    return resultJustCompleted;
  }, [checkCompletion]);

  // Track Quiz Challenge
  const trackQuiz = useCallback(() => {
    let resultJustCompleted = false;
    setData((prev) => {
      const newQuizCurrent = Math.min(prev.tasks.quiz.target, prev.tasks.quiz.current + 1);
      const isQuizDone = newQuizCurrent >= prev.tasks.quiz.target;

      const newTasks = {
        ...prev.tasks,
        quiz: {
          ...prev.tasks.quiz,
          current: newQuizCurrent,
          completed: isQuizDone,
        },
      };

      const check = checkCompletion(newTasks, prev.streak, prev.lastCompletedDate, prev.weeklyStamps);
      if (check.justCompleted) resultJustCompleted = true;

      return {
        ...prev,
        streak: check.newStreak,
        lastCompletedDate: check.lastCompleted,
        weeklyStamps: check.newStamps,
        tasks: newTasks,
      };
    });
    return resultJustCompleted;
  }, [checkCompletion]);

  // Track Petting / Tapping Cincau Mascot (Target 3)
  const trackPet = useCallback(() => {
    let resultJustCompleted = false;
    setData((prev) => {
      const newPetCurrent = Math.min(prev.tasks.pet.target, prev.tasks.pet.current + 1);
      const isPetDone = newPetCurrent >= prev.tasks.pet.target;

      const newTasks = {
        ...prev.tasks,
        pet: {
          ...prev.tasks.pet,
          current: newPetCurrent,
          completed: isPetDone,
        },
      };

      const check = checkCompletion(newTasks, prev.streak, prev.lastCompletedDate, prev.weeklyStamps);
      if (check.justCompleted) resultJustCompleted = true;

      return {
        ...prev,
        streak: check.newStreak,
        lastCompletedDate: check.lastCompleted,
        weeklyStamps: check.newStamps,
        tasks: newTasks,
      };
    });
    return resultJustCompleted;
  }, [checkCompletion]);

  const claimBonus = useCallback(() => {
    setData((prev) => ({
      ...prev,
      claimedBonusToday: true,
    }));
  }, []);

  const completedCount = (data.tasks.feed.completed ? 1 : 0) +
                         (data.tasks.quiz.completed ? 1 : 0) +
                         (data.tasks.pet.completed ? 1 : 0);
  const totalTasks = 3;
  const isAllCompleted = completedCount === totalTasks;

  return {
    ...data,
    completedCount,
    totalTasks,
    isAllCompleted,
    trackFeed,
    trackQuiz,
    trackPet,
    claimBonus,
  };
};
