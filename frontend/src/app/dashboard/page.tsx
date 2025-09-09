'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Target, Trophy, Users, Plus, Zap, DollarSign, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useDappPortal from '@/hooks/useDappPortal';
import { useTheme } from '@/lib/theme-context';
import { useWallet } from '@/lib/wallet-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageLoading } from '@/components/Loading';
import ProgressChart from '@/components/ProgressChart';
import { StreakBadge, CompletionBadge, SquadBadge, SavingsBadge, FirstMissionBadge } from '@/components/AchievementBadge';
import ConfettiComponent from '@/components/Confetti';

export default function DashboardPage() {
  const { sdk, loading: sdkLoading, error: sdkError } = useDappPortal();
  const { account } = useWallet();
  const { isDark, toggleDark } = useTheme();

  // Mock data - in real app, fetch from contracts/API
  const [stats, setStats] = useState({
    totalSaved: 1250.50,
    activeMissions: 3,
    completedMissions: 7,
    currentStreak: 12,
    totalParticipants: 24
  });

  // Confetti state for achievements - only show when actual achievements are earned
  const [showConfetti, setShowConfetti] = useState(false);

  if (sdkLoading) {
    return <PageLoading message="Loading your dashboard..." />;
  }

  if (sdkError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg">⚠️ Error loading dashboard</div>
          <p className="text-gray-600">{sdkError.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-block p-6 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 mb-6 shadow-2xl relative"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Award className="h-10 w-10 text-white" />
              </motion.div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 blur-lg opacity-50"></div>
            </motion.div>
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Welcome to Your Dashboard
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Track your savings progress and achievements! 🚀
            </motion.p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {[
              {
                icon: DollarSign,
                label: 'Total Saved',
                value: `$${stats.totalSaved.toFixed(2)}`,
                color: 'from-green-400 to-emerald-500',
                bgColor: 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20',
                borderColor: 'border-green-200 dark:border-green-800',
                textColor: 'text-green-600',
                emoji: '💰'
              },
              {
                icon: Target,
                label: 'Active Missions',
                value: stats.activeMissions.toString(),
                color: 'from-blue-400 to-cyan-500',
                bgColor: 'from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20',
                borderColor: 'border-blue-200 dark:border-blue-800',
                textColor: 'text-blue-600',
                emoji: '🎯'
              },
              {
                icon: Trophy,
                label: 'Completed',
                value: stats.completedMissions.toString(),
                color: 'from-purple-400 to-pink-500',
                bgColor: 'from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-800/20',
                borderColor: 'border-purple-200 dark:border-purple-800',
                textColor: 'text-purple-600',
                emoji: '🏆'
              },
              {
                icon: Zap,
                label: 'Current Streak',
                value: `${stats.currentStreak} days`,
                color: 'from-orange-400 to-red-500',
                bgColor: 'from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-800/20',
                borderColor: 'border-orange-200 dark:border-orange-800',
                textColor: 'text-orange-600',
                emoji: '⚡'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3 + index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className={`bg-gradient-to-br ${stat.bgColor} ${stat.borderColor} border-2 shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        className={`p-4 rounded-full bg-gradient-to-r ${stat.color} shadow-lg`}
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <stat.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <motion.span
                        className="text-3xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.8,
                          ease: "easeInOut"
                        }}
                      >
                        {stat.emoji}
                      </motion.span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                      <motion.p
                        className={`text-3xl font-bold ${stat.textColor}`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                title: 'Create New Mission',
                description: 'Start a new savings mission and invite friends to join!',
                icon: Plus,
                gradient: 'from-green-400 via-blue-500 to-cyan-500',
                bgGradient: 'from-green-50 via-blue-50 to-cyan-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-cyan-900/20',
                buttonGradient: 'from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700',
                href: '/missions/create',
                buttonText: 'Create Mission',
                emoji: '🚀'
              },
              {
                title: 'Join Active Missions',
                description: 'Browse and join existing savings missions with other users.',
                icon: Users,
                gradient: 'from-purple-400 via-pink-500 to-rose-500',
                bgGradient: 'from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20',
                buttonGradient: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
                href: '/missions',
                buttonText: 'Browse Missions',
                emoji: '👥'
              }
            ].map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.5 + index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{
                  scale: 1.03,
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`bg-gradient-to-br ${action.bgGradient} border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm relative overflow-hidden group cursor-pointer`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 text-center relative z-10">
                    <motion.div
                      className={`inline-block p-4 rounded-full bg-gradient-to-r ${action.gradient} mb-6 shadow-xl relative`}
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: index * 2 }}
                      >
                        <action.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent blur-sm"></div>
                    </motion.div>
                    <motion.h3
                      className="text-2xl font-bold mb-3 text-gray-900 dark:text-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      {action.title}
                    </motion.h3>
                    <motion.p
                      className="text-muted-foreground mb-6 text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {action.description}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <Link href={action.href}>
                        <Button className={`bg-gradient-to-r ${action.buttonGradient} text-white px-6 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                          <action.icon className="mr-2 h-5 w-5" />
                          {action.buttonText}
                          <span className="ml-2">{action.emoji}</span>
                        </Button>
                      </Link>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <CardHeader className="relative z-10 pb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <motion.div
                        className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <TrendingUp className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                        Savings Progress
                      </span>
                      <motion.span
                        className="text-2xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        📈
                      </motion.span>
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <ProgressChart
                      data={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                      labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']}
                      title="Savings Progress Over Time"
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-yellow-100/50 dark:from-yellow-900/10 dark:to-yellow-900/10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
                <CardHeader className="relative z-10 pb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <motion.div
                        className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg"
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Trophy className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent font-bold">
                        Your Achievements
                      </span>
                      <motion.span
                        className="text-2xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        🏅
                      </motion.span>
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="flex flex-wrap justify-center gap-6">
                      <StreakBadge days={stats.currentStreak} />
                      <CompletionBadge />
                      <SquadBadge members={stats.totalParticipants} />
                      <SavingsBadge amount={stats.totalSaved.toString()} />
                      <FirstMissionBadge />
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>


        </div>
      </main>

      <Footer />

      {/* Confetti for achievements */}
      <ConfettiComponent
        show={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
}
