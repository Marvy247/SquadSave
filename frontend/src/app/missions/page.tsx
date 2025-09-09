'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, Users, Clock, TrendingUp, Plus, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useDappPortal from '@/hooks/useDappPortal';
import { getMissionFactoryContract, getMissionPoolContract } from '@/lib/contracts';
import { ethers } from 'ethers';
import { useTheme } from '@/lib/theme-context';
import { useWallet } from '@/lib/wallet-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageLoading, WalletLoading } from '@/components/Loading';

interface Mission {
  id: string;
  targetAmount: string;
  duration: string;
  participants: number;
  progress: number;
}

export default function MissionsPage() {
  const { sdk, loading, error } = useDappPortal();
  const { account, connectWallet, disconnectWallet } = useWallet();
  const { isDark, toggleDark } = useTheme();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMissions = async () => {
    if (!sdk) return; // Don't fetch if SDK is not available

    try {
      const contract = await getMissionFactoryContract();
      const missionIdsRaw = await contract.getMissionPools();
      const missionIds = Array.isArray(missionIdsRaw) ? missionIdsRaw : Object.values(missionIdsRaw);

      const missionDetails = await Promise.all(
        missionIds.map(async (missionId: string) => {
          try {
            const missionContract = await getMissionPoolContract(missionId);
            const details = await missionContract.getMissionDetails();
            const participantsRaw = await missionContract.getParticipants();
            const participants = Array.isArray(participantsRaw) ? participantsRaw : Object.values(participantsRaw);

            return {
              id: missionId,
              targetAmount: ethers.formatEther(details._targetAmount),
              duration: details._duration.toString(),
              participants: participants.length,
              progress: 0, // We'll calculate this based on user progress if connected
            };
          } catch (error) {
            console.error(`Failed to fetch details for mission ${missionId}:`, error);
            return null;
          }
        })
      );

      setMissions(missionDetails.filter(mission => mission !== null) as Mission[]);
    } catch (error) {
      console.error("Failed to fetch missions", error);
      toast.error('Failed to load missions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sdk) {
      fetchMissions();
    } else if (!loading) {
      // If SDK is not available and we're not loading, set loading to false
      setIsLoading(false);
    }
  }, [sdk, loading]);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block p-4 md:p-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 md:mb-6 shadow-lg">
              <Target className="h-8 w-8 md:h-12 md:w-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Active Missions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Join exciting savings missions with friends and earn rewards! 🚀
            </p>
          </div>

          {/* Create Mission CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-dashed border-primary/30">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="inline-block p-3 md:p-4 rounded-full bg-gradient-to-r from-green-500 to-blue-600 mb-4">
                  <Plus className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">Ready to Start Your Mission?</h2>
                <p className="text-muted-foreground mb-4 md:mb-6">
                  Create a new savings mission and invite friends to join the fun!
                </p>
                <Link href="/missions/create">
                  <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Mission
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Missions List */}
          {isLoading ? (
            <div className="text-center py-12">
              <WalletLoading message="Loading missions..." />
            </div>
          ) : missions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/missions/${mission.id}`}>
                    <Card className="h-full shadow-xl border-2 border-primary/10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                      <CardHeader className="text-center pb-4">
                        <div className="inline-block p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-3">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg font-bold">
                          Mission #{mission.id.substring(0, 8)}...
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                            <div className="font-bold text-blue-600">${mission.targetAmount}</div>
                            <div className="text-xs text-muted-foreground">Target</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                            <Clock className="h-4 w-4 mx-auto mb-1 text-green-600" />
                            <div className="font-bold text-green-600">{Math.floor(parseInt(mission.duration) / 86400)}d</div>
                            <div className="text-xs text-muted-foreground">Duration</div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                          <Users className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                          <div className="font-bold text-purple-600">{mission.participants}</div>
                          <div className="text-xs text-muted-foreground">Participants</div>
                        </div>
                        <div className="text-center">
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                            <Zap className="h-4 w-4 mr-2" />
                            Join Mission
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center py-12 md:py-16">
                <CardContent>
                  <div className="inline-block p-4 md:p-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 mb-4 md:mb-6">
                    <Target className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">No Active Missions Yet</h3>
                  <p className="text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto">
                    Be the first to create a savings mission and invite friends to join! Start your journey to financial freedom today.
                  </p>
                  <Link href="/missions/create">
                    <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Mission
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
