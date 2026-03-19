import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { MentorDashboardStats } from '@shared/models';

interface MentorDashboardState {
  stats: MentorDashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

export const MentorDashboardStore = signalStore(
  { providedIn: 'root' },
  withState<MentorDashboardState>({
    stats: null,
    isLoading: false,
    error: null
  }),
  withComputed((state) => ({
    hasStats: computed(() => !!state.stats()),
    hasPendingRequests: computed(() => false),
    hasActiveMentees: computed(() => false),
    hasUpcomingSessions: computed(() => false)
  })),

  withMethods((store) => ({
    loadStats: () => {
      patchState(store, {
        stats: {
          totalSessions: 1,
          upcomingSessions: 3,
          completedSessions: 4,
          activeMentees: 1,
          totalMentees: 3,
          pendingRequests: 2,
          averageRating: 4
        },
        isLoading: false
      });
    },

    reset: () => {
      patchState(store, {
        stats: null,
        isLoading: false,
        error: null
      });
    }
  }))
);
