"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Target, Trophy, Users, TrendingUp, Sparkles, Zap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useDappPortal from '@/hooks/useDappPortal';
import { getMissionFactoryContract } from '@/lib/contracts';
import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageLoading, WalletLoading } from '@/components/Loading';
import { StreakBadge, CompletionBadge, SquadBadge, SavingsBadge, FirstMissionBadge } from '@/components/AchievementBadge';
import AchievementNotification, { triggerStreakAchievement, triggerMilestoneAchievement, triggerSquadAchievement } from '@/components/AchievementNotification';

export default function Home() {
  const { sdk, loading, error } = useDappPortal();
  const [account, setAccount] = useState<string | null>(null);
  const [missionPools, setMissionPools] = useState<string[]>([]);
  const { isDark, toggleDark } = useTheme();

  // Achievement notification state
  const [achievement, setAchievement] = useState<{
    title: string;
    description: string;
    type: 'streak' | 'milestone' | 'achievement' | 'squad';
  } | null>(null);

  const connectWallet = async () => {
    if (!sdk) return;
    try {
      const walletProvider = sdk.getWalletProvider();
      const accounts = await walletProvider.request({ method: 'kaia_requestAccounts' }) as string[];
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        toast.success('Wallet connected successfully! 🎉');

        // Example: Trigger a streak achievement notification on connect
        const streakAch = triggerStreakAchievement(7);
        if (streakAch) {
          setAchievement({
            title: streakAch.title,
            description: streakAch.description,
            type: 'streak',
          });
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet", error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    toast.success('Wallet disconnected');
  };

  const fetchMissionPools = async () => {
    try {
      const contract = await getMissionFactoryContract();
      const pools = await contract.getMissionPools();
      setMissionPools(pools);
    } catch (error) {
      console.error("Failed to fetch mission pools", error);
    }
  };

  useEffect(() => {
    if (account) {
      fetchMissionPools();
    }
  }, [account]);

  if (loading) {
    return <PageLoading message="Initializing SquadSave..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg">⚠️ Error initializing application</div>
          <p className="text-gray-600">{error.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            SquadSave
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Make saving money <span className="text-purple-600 font-semibold">fun</span> and <span className="text-blue-600 font-semibold">social</span> with Kaia-powered mission pools
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {!account ? (
              <Button
                onClick={connectWallet}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            ) : (
              <Link href="/missions/create">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                  </motion.div>
                  Create Mission
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { icon: Target, label: 'Active Missions', value: '1,247', emoji: '🎯' },
            { icon: Users, label: 'Squad Members', value: '5,893', emoji: '👥' },
            { icon: TrendingUp, label: 'Total Saved', value: '$127K', emoji: '📈' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <motion.div
                      className="text-4xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    >
                      {stat.emoji}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Your Achievements <Trophy className="inline ml-2 h-8 w-8 text-yellow-500" />
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <StreakBadge days={7} />
            <CompletionBadge />
            <SquadBadge members={5} />
            <SavingsBadge amount="150" />
            <FirstMissionBadge />
          </div>
        </motion.div>

        {/* Mission Pools */}
        {account && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Active Mission Pools <Zap className="inline ml-2 h-8 w-8 text-yellow-500" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missionPools.length > 0 ? (
                missionPools.map((pool, index) => (
                  <motion.div
                    key={pool}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                  >
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-500" />
                          Mission Pool #{index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Join this mission to save money with friends and earn rewards!
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          12 members
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Active Missions</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to create a mission pool!</p>
                  <Link href="/missions/create">
                    <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Mission
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Achievement Notification */}
        {achievement && (
          <AchievementNotification
            show={true}
            title={achievement.title}
            description={achievement.description}
            type={achievement.type}
            onClose={() => setAchievement(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
