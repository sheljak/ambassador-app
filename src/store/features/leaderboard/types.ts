import type { LeaderboardAmbassador } from '../../types_that_will_used';

export interface LeaderboardState {
  leaders: LeaderboardAmbassador[]; // Top 3 leaders
  nextLeaders: LeaderboardAmbassador[]; // Rest of the leaderboard
  currentAmbassador: LeaderboardAmbassador | null;
  total: number;
  isLoading: boolean;
  error: string | null;
}
