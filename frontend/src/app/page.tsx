"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Target, Trophy, Users, TrendingUp, Sparkles, Zap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useDappPortal from '@/hooks/useDappPortal';
import { getMissionFactoryContract } from '@/lib/contracts';
import { useTheme } from '@/lib/theme-context';
import { useWallet } from '@/lib/wallet-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageLoading, WalletLoading } from '@/components/Loading';
import { StreakBadge, CompletionBadge, SquadBadge, SavingsBadge, FirstMissionBadge } from '@/components/AchievementBadge';
import AchievementNotification, { triggerStreakAchievement, triggerMilestoneAchievement, triggerSquadAchievement } from '@/components/AchievementNotification';

export default function Home() {
  const { sdk, loading, error } = useDappPortal();
  const { account, connectWallet, disconnectWallet } = useWallet();
  const [missionPools, setMissionPools] = useState<string[]>([]);
  const { isDark, toggleDark } = useTheme();

  // Achievement notification state
  const [achievement, setAchievement] = useState<{
    title: string;
    description: string;
    type: 'streak' | 'milestone' | 'achievement' | 'squad';
  } | null>(null);

  const handleConnectWallet = async () => {
    await connectWallet();
    // Example: Trigger a streak achievement notification on connect
    const streakAch = triggerStreakAchievement(7);
    if (streakAch) {
      setAchievement({
        title: streakAch.title,
        description: streakAch.description,
        type: 'streak',
      });
    }
  };

  const fetchMissionPools = async () => {
    if (!sdk) return; // Don't fetch if SDK is not available

    try {
      const contract = await getMissionFactoryContract();
      const pools = await contract.getMissionPools();
      setMissionPools(pools);
    } catch (error) {
      console.error("Failed to fetch mission pools", error);
    }
  };

  useEffect(() => {
    if (account && sdk) {
      fetchMissionPools();
    }
  }, [account, sdk]);

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

      <main className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
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
                onClick={handleConnectWallet}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                  </motion.div>
                  Dashboard
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Powered by Kaia Network</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Secure & Decentralized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Community Driven</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
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

        {/* How It Works Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            How SquadSave Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create or Join',
                description: 'Start your own savings mission or join an existing one with friends and like-minded savers.',
                icon: '🚀',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: '02',
                title: 'Save Together',
                description: 'Contribute regularly to your mission pool. The smart contract ensures everyone stays committed.',
                icon: '💰',
                color: 'from-green-500 to-emerald-500'
              },
              {
                step: '03',
                title: 'Earn Rewards',
                description: 'Complete missions to earn yield rewards, achievement badges, and maintain saving streaks.',
                icon: '🏆',
                color: 'from-purple-500 to-pink-500'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className={`inline-block p-4 rounded-full bg-gradient-to-r ${item.color} mb-4 shadow-lg`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 mb-3">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Why Choose SquadSave? 
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Smart Contracts',
                description: 'Automated, trustless savings with blockchain security'
              },
              {
                icon: '👥',
                title: 'Social Accountability',
                description: 'Stay motivated with friends and community support'
              },
              {
                icon: '💎',
                title: 'Yield Rewards',
                description: 'Earn additional returns on your savings deposits'
              },
              {
                icon: '🎯',
                title: 'Gamified Experience',
                description: 'Turn saving into an engaging, rewarding adventure'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Achievement System 
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <StreakBadge days={7} />
            <CompletionBadge />
            <SquadBadge members={5} />
            <SavingsBadge amount="150" />
            <FirstMissionBadge />
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            What Our Squad Members Say <Heart className="inline ml-2 h-8 w-8 text-red-500" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "SquadSave helped me save $500 in just 2 months! The social accountability kept me motivated.",
                author: "Sarah Chen",
                role: "Marketing Manager",
                avatar: "SC"
              },
              {
                quote: "Finally, saving money feels fun! The achievement system and rewards make it addictive.",
                author: "Mike Johnson",
                role: "Software Engineer",
                avatar: "MJ"
              },
              {
                quote: "Started a mission with my college friends. We've all improved our saving habits together!",
                author: "Emma Rodriguez",
                role: "Student",
                avatar: "ER"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">&#34;{testimonial.quote}&#34;</p>
                <div className="flex text-yellow-400 mt-3">
                  {'★'.repeat(5)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission Pools */}
        {account && (
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Active Mission Pools 
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
                    transition={{ delay: 1.7 + index * 0.1 }}
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

        {/* Final CTA Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.9 }}
              >
                Ready to Start Your Savings Journey? 
              </motion.h2>
              <motion.p
                className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0 }}
              >
                Join thousands of savers who are building wealth together. Your financial future starts with one mission.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.1 }}
              >
                {!account ? (
                  <Button
                    onClick={handleConnectWallet}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Connect Wallet & Start Saving
                  </Button>
                ) : (
                  <Link href="/missions/create">
                    <Button
                      size="lg"
                      className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Mission
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 text-4xl animate-bounce"></div>
            <div className="absolute top-4 right-4 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-4 left-4 text-4xl animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-4 right-4 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </motion.div>

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
