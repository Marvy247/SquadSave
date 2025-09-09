import { Flame, Trophy, Users, CheckCircle, Star } from 'lucide-react';

export function StreakBadge({ days }: { days: number }) {
  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer animate-pulse">
      <Flame className="h-3 w-3 mr-1 animate-bounce" />
      {days}d 🔥
    </div>
  );
}

export function CompletionBadge() {
  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
      <CheckCircle className="h-3 w-3 mr-1" />
      Done ✅
    </div>
  );
}

export function SquadBadge({ members }: { members: number }) {
  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 text-white text-xs font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
      <Users className="h-3 w-3 mr-1" />
      {members} 👥
    </div>
  );
}

export function SavingsBadge({ amount }: { amount: string }) {
  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
      <Trophy className="h-3 w-3 mr-1" />
      ${amount} 🏆
    </div>
  );
}

export function FirstMissionBadge() {
  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer animate-pulse">
      <Star className="h-3 w-3 mr-1 animate-spin" />
      First! ⭐
    </div>
  );
}
