import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Star, Users, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

interface AchievementNotificationProps {
  show: boolean;
  title: string;
  description: string;
  type: 'streak' | 'milestone' | 'achievement' | 'squad';
  onClose: () => void;
  autoHide?: boolean;
  duration?: number;
}

export default function AchievementNotification({
  show,
  title,
  description,
  type,
  onClose,
  autoHide = true,
  duration = 5000
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    if (show && autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, autoHide, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'streak':
        return <Flame className="h-8 w-8 text-orange-500" />;
      case 'milestone':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'squad':
        return <Users className="h-8 w-8 text-purple-500" />;
      default:
        return <Star className="h-8 w-8 text-blue-500" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'streak':
        return 'from-orange-400 to-red-500';
      case 'milestone':
        return 'from-yellow-400 to-orange-500';
      case 'squad':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.5
          }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className={`bg-gradient-to-r ${getGradient()} rounded-lg shadow-2xl border-2 border-white/20 backdrop-blur-sm overflow-hidden`}>
            <div className="p-4 text-white">
              <div className="flex items-start space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                  className="flex-shrink-0"
                >
                  {getIcon()}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <motion.h3
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg font-bold mb-1"
                  >
                    {title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm opacity-90"
                  >
                    {description}
                  </motion.p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="flex-shrink-0 h-6 w-6 p-0 text-white hover:bg-white/20 rounded-full"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Animated progress bar for auto-hide */}
            {autoHide && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className="h-1 bg-white/30"
              />
            )}

            {/* Sparkle effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%'
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="absolute w-2 h-2 bg-white rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Achievement trigger functions
export const triggerStreakAchievement = (days: number) => {
  const achievements = [
    { days: 3, title: "Getting Started!", description: "3-day saving streak! Keep it up! 🔥" },
    { days: 7, title: "Week Warrior!", description: "7-day streak! You're unstoppable! 💪" },
    { days: 14, title: "Fortnight Champion!", description: "14-day streak! Squad goals achieved! 🏆" },
    { days: 30, title: "Monthly Master!", description: "30-day streak! Legend status unlocked! 👑" },
    { days: 50, title: "Golden Streak!", description: "50-day streak! You're a savings legend! ✨" },
    { days: 100, title: "Century Club!", description: "100-day streak! Immortal saver! 🌟" }
  ];

  return achievements.find(a => a.days === days);
};

export const triggerMilestoneAchievement = (amount: number) => {
  const milestones = [
    { amount: 100, title: "First Hundred!", description: "Saved $100! Every journey begins with a single step! 🎯" },
    { amount: 500, title: "Half Grand!", description: "Saved $500! You're building wealth! 💰" },
    { amount: 1000, title: "Thousand Club!", description: "Saved $1,000! Major milestone achieved! 🏆" },
    { amount: 5000, title: "Five Grand!", description: "Saved $5,000! Wealth builder extraordinaire! 💎" },
    { amount: 10000, title: "Ten Thousand!", description: "Saved $10,000! Financial freedom is calling! 🚀" }
  ];

  return milestones.find(m => m.amount === amount);
};

export const triggerSquadAchievement = (members: number) => {
  const squadAchievements = [
    { members: 3, title: "Squad Formed!", description: "Got 3 squad members! Teamwork makes the dream work! 👥" },
    { members: 5, title: "Squad Goals!", description: "5 squad members! Your squad is growing strong! 💪" },
    { members: 10, title: "Squad Army!", description: "10 squad members! Leading a savings revolution! 👑" },
    { members: 25, title: "Squad Empire!", description: "25 squad members! You're a squad leader! 🌟" }
  ];

  return squadAchievements.find(s => s.members === members);
};
