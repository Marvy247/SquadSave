"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import useDappPortal from '@/hooks/useDappPortal';
import { getMissionFactoryContract } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageLoading, WalletLoading } from '@/components/Loading';
import { StreakBadge, CompletionBadge, SquadBadge, SavingsBadge, FirstMissionBadge } from '@/components/AchievementBadge';

export default function Home() {
  const { sdk, loading, error } = useDappPortal();
  const [account, setAccount] = useState<string | null>(null);
  const [missionPools, setMissionPools] = useState<string[]>([]);
  const [isDark, setIsDark] = useState(false);

  const connectWallet = async () => {
    if (!sdk) return;
    try {
      const walletProvider = sdk.getWalletProvider();
      const accounts = await walletProvider.request({ method: 'kaia_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        toast.success('Wallet connected successfully! 🎉');
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

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
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
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header account={account} onConnectWallet={connectWallet} onDisconnectWallet={disconnectWallet} isDark={isDark} toggleDark={toggleDark} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block p-4 md:p-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 md:mb-6 shadow-lg">
            <span className="text-4xl md:text-6xl">💰</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to SquadSave!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Save money socially and earn rewards with your squad. Turn saving into a fun, collaborative adventure! 🚀
          </p>
        </div>

        {account && (
          <div className='max-w-6xl mx-auto space-y-8'>
            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg flex items-center">
                    <span className="text-xl md:text-2xl mr-2">💰</span>
                    Total Saved
                  </CardTitle>
                </CardHeader>
                <div className="px-4 md:px-6 pb-4">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">$247.50</div>
                  <p className="text-xs md:text-sm text-muted-foreground">+12% from last month</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg flex items-center">
                    <span className="text-xl md:text-2xl mr-2">🔥</span>
                    Best Streak
                  </CardTitle>
                </CardHeader>
                <div className="px-4 md:px-6 pb-4">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">15 days</div>
                  <p className="text-xs md:text-sm text-muted-foreground">Personal record!</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 sm:col-span-2 md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg flex items-center">
                    <span className="text-xl md:text-2xl mr-2">👥</span>
                    Squad Rank
                  </CardTitle>
                </CardHeader>
                <div className="px-4 md:px-6 pb-4">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">#3</div>
                  <p className="text-xs md:text-sm text-muted-foreground">Top 10% of squads</p>
                </div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-bold flex items-center">
                <Target className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                Your Missions
              </h2>
              <Link href="/missions/create" passHref>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm md:text-base">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mission
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {missionPools.length === 0 ? (
                <div className="col-span-full text-center py-8 md:py-12">
                  <div className="text-4xl md:text-6xl mb-4">🎯</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">No missions yet!</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 px-4">Create your first savings mission to get started.</p>
                  <Link href="/missions/create" passHref>
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm md:text-base">
                      <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Create Your First Mission
                    </Button>
                  </Link>
                </div>
              ) : (
                missionPools.map((pool, index) => (
                  <Card key={index} className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                    <CardHeader className="pb-3 md:pb-4">
                      <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="p-1.5 md:p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-2 md:mr-3 group-hover:scale-110 transition-transform flex-shrink-0">
                            <Target className="h-4 w-4 md:h-5 md:w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/missions/${pool}`} className="hover:text-primary transition-colors font-semibold text-sm md:text-base truncate block">
                              Mission {index + 1}
                            </Link>
                            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Active savings goal</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1 sm:space-y-2 flex-shrink-0">
                          <StreakBadge days={Math.floor(Math.random() * 15) + 1} />
                          <div className="flex justify-end space-x-1">
                            <CompletionBadge />
                            <SquadBadge members={Math.floor(Math.random() * 5) + 1} />
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <div className="px-4 md:px-6 pb-4">
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-bold text-primary">75%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 md:h-3 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 md:h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                          <div className="text-center">
                            <div className="font-bold text-green-600 text-sm md:text-base">$75.00</div>
                            <div className="text-muted-foreground text-xs">Saved</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-blue-600 text-sm md:text-base">$25.00</div>
                            <div className="text-muted-foreground text-xs">Next Deposit</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <span className="text-muted-foreground">Next deposit in</span>
                          <span className="font-medium text-primary bg-primary/10 px-2 py-1 rounded-full text-xs">2 days ⏰</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
