'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { Target, DollarSign, Users, TrendingUp, Clock, Trophy, Flame, Calendar } from 'lucide-react';
import { getMissionPoolContract, getUSDTContract } from '@/lib/contracts';
import useDappPortal from '@/hooks/useDappPortal';
import { useTheme } from '@/lib/theme-context';
import { useWallet } from '@/lib/wallet-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressChart from '@/components/ProgressChart';
import { StreakBadge, CompletionBadge, SquadBadge } from '@/components/AchievementBadge';
import { CardLoading } from '@/components/Loading';
import toast from 'react-hot-toast';

interface MissionDetails {
  asset: string;
  targetAmount: string;
  cadence: string;
  duration: string;
  startTime: string;
  endTime: string;
  yieldStrategy: string;
  rewardDistributor: string;
}

interface UserProgress {
  totalDeposited: string;
  currentStreak: string;
  lastDepositTimestamp: string;
  nextDepositWindow: string;
}

export default function MissionDetailPage() {
  const params = useParams();
  const missionId = params.id as string;
  const { sdk } = useDappPortal();
  const { account, connectWallet, disconnectWallet } = useWallet();
  const { isDark, toggleDark } = useTheme();
  const [missionDetails, setMissionDetails] = useState<MissionDetails | null>(null);
  const [participants, setParticipants] = useState([] as string[]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Mock progress data for chart
  const progressData = [0, 25, 50, 75, 90, 100];
  const progressLabels = ['Day 1', 'Day 7', 'Day 14', 'Day 21', 'Day 28', 'Day 30'];



  const fetchMissionDetails = useCallback(async () => {
    if (!missionId || !sdk) return;
    try {
      const contract = await getMissionPoolContract(missionId);
      const details = await contract.getMissionDetails();
      const participantsList = await contract.getParticipants() as string[];

      const missionData = {
        asset: details._asset,
        targetAmount: ethers.formatEther(details._targetAmount),
        cadence: details._cadence.toString(),
        duration: details._duration.toString(),
        startTime: new Date(Number(details._startTime) * 1000).toLocaleString(),
        endTime: new Date(Number(details._endTime) * 1000).toLocaleString(),
        yieldStrategy: details._yieldStrategy,
        rewardDistributor: details._rewardDistributor,
      };
      setMissionDetails(missionData);
      setParticipants(participantsList);
      setDepositAmount(missionData.targetAmount);

      if (sdk && account) {
        const userProgressDetails = await contract.getUserProgress(account);
        setUserProgress({
          totalDeposited: ethers.formatEther(userProgressDetails.totalDeposited),
          currentStreak: userProgressDetails.currentStreak.toString(),
          lastDepositTimestamp: new Date(Number(userProgressDetails.lastDepositTimestamp) * 1000).toLocaleString(),
          nextDepositWindow: new Date(Number(userProgressDetails.nextDepositWindow) * 1000).toLocaleString(),
        });
      }

    } catch (error) {
      console.error("Failed to fetch mission details", error);
      toast.error('Failed to load mission details');
    }
  }, [missionId, sdk, account]);

  const handleDeposit = async () => {
    if (!account) {
      toast.error('Please connect your wallet first.');
      return;
    }
    if (!sdk) {
      toast.error('SDK not initialized. Please refresh the page.');
      return;
    }
    if (!missionDetails) {
      toast.error('Mission details not loaded.');
      return;
    }

    setIsDepositing(true);
    try {
      const usdtContract = await getUSDTContract();
      const missionContract = await getMissionPoolContract(missionId);

      const amount = ethers.parseEther(missionDetails.targetAmount);

      // Check balance
      const balance = await usdtContract.balanceOf(account);
      if (balance < amount) {
        toast.error('Insufficient USDT balance.');
        setIsDepositing(false);
        return;
      }

      // Approve the mission contract to spend USDT
      const approveTx = await usdtContract.approve(missionId, amount);
      await approveTx.wait();
      toast.success('USDT approved for deposit!');

      // Deposit to the mission (contract deposits targetAmount)
      const depositTx = await missionContract.deposit();
      await depositTx.wait();

      toast.success('Deposit successful! 🎉');

      // Refresh user progress
      await fetchMissionDetails();

      setDepositAmount('');
    } catch (error) {
      console.error('Deposit failed:', error);
      toast.error('Deposit failed. Please try again.');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!account || !withdrawAmount) {
      toast.error('Please connect wallet and enter amount');
      return;
    }
    setIsWithdrawing(true);
    try {
      const contract = await getMissionPoolContract(missionId);
      const tx = await contract.withdraw(ethers.parseEther(withdrawAmount));
      await tx.wait();
      toast.success('Withdrawal successful! 💸');
      setWithdrawAmount('');
      fetchMissionDetails(); // Refresh details
    } catch (error) {
      console.error("Failed to withdraw", error);
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const quickDeposit = (amount: string) => {
    setDepositAmount(amount);
  };

  useEffect(() => {
    fetchMissionDetails();
  }, [fetchMissionDetails, sdk]);

  if (!missionDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <CardLoading message="Loading mission details..." />
        </main>
        <Footer />
      </div>
    );
  }

  const progressPercentage = userProgress ? (parseFloat(userProgress.totalDeposited) / parseFloat(missionDetails.targetAmount)) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block p-4 md:p-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 md:mb-6 shadow-lg">
              <Target className="h-8 w-8 md:h-12 md:w-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mission Progress
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Track your savings journey and stay motivated with your squad! 🚀
            </p>
          </div>

          {/* Mission Overview */}
          <Card className="shadow-xl border-2 border-primary/10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader className="text-center pb-4 md:pb-6">
              <CardTitle className="text-xl md:text-2xl font-bold flex items-center justify-center">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                Mission Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <DollarSign className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-lg md:text-xl font-bold text-blue-600">${missionDetails.targetAmount}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Target Amount</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-lg md:text-xl font-bold text-green-600">{Math.floor(parseInt(missionDetails.duration) / 86400)} days</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-lg md:text-xl font-bold text-purple-600">{participants.length}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Participants</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-lg md:text-xl font-bold text-orange-600">{progressPercentage.toFixed(1)}%</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Chart */}
          <Card className="shadow-xl border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                Savings Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart
                data={progressData}
                labels={progressLabels}
                title="Your Mission Progress"
              />
            </CardContent>
          </Card>

          {/* User Progress */}
          {account && userProgress && (
            <Card className="shadow-xl border-2 border-primary/10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                    <DollarSign className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-lg md:text-xl font-bold text-green-600">${userProgress.totalDeposited}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Total Saved</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                    <Flame className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-lg md:text-xl font-bold text-orange-600">{userProgress.currentStreak}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Current Streak</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm md:text-base font-bold text-blue-600">{userProgress.lastDepositTimestamp}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Last Deposit</div>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${Date.now() / 1000 > parseInt(userProgress.nextDepositWindow) ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20' : 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'}`}>
                    <Clock className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm md:text-base font-bold text-purple-600">{userProgress.nextDepositWindow}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Next Deposit Window</div>
                  </div>
                </div>
                {Date.now() / 1000 > parseInt(userProgress.nextDepositWindow) && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center">
                    </div>
                  </div>
                )}
                <div className="flex justify-center space-x-4">
                  <StreakBadge days={parseInt(userProgress.currentStreak)} />
                  <CompletionBadge />
                  <SquadBadge members={participants.length} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="shadow-xl border-2 border-primary/10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                Mission Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Deposit Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">💰</span>
                  Make a Deposit
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Deposit Amount (Fixed per mission)
                    </label>
                    <Input
                      type="number"
                      value={depositAmount}
                      placeholder="Fixed deposit amount"
                      className="h-12 text-base"
                      readOnly
                    />
                  </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    disabled={isDepositing}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-6 py-3"
                  >
                    {isDepositing ? 'Depositing...' : 'Deposit 💰'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deposit</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to deposit <strong>${depositAmount}</strong> now?
                      <br />
                      This is your contribution for this period. Based on the mission cadence (<strong>{Math.floor(parseInt(missionDetails.cadence) / 86400)} day(s)</strong>), you will need to make <strong>{Math.floor(parseInt(missionDetails.duration) / parseInt(missionDetails.cadence))}</strong> deposits in total.
                      <br />
                      Total commitment: <strong>${(parseFloat(depositAmount) * Math.floor(parseInt(missionDetails.duration) / parseInt(missionDetails.cadence))).toFixed(2)}</strong>
                      <br />
                      Depositing now will lock in this period's contribution.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={() => handleDeposit()} disabled={isDepositing}>
                      Confirm
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
              </div>

              {/* Withdraw Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">💸</span>
                  Withdraw Funds
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount in USDT"
                    className="flex-1 h-12 text-base"
                  />
                  <Button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawAmount}
                    variant="outline"
                    className="px-6 py-3"
                  >
                    {isWithdrawing ? 'Withdrawing...' : 'Withdraw 💸'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="shadow-xl border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                Squad Members ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {participant.substring(2, 4).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {participant.substring(0, 6)}...{participant.substring(participant.length - 4)}
                        </div>
                        <div className="text-xs text-muted-foreground">Member #{index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No participants yet. Be the first to join! 🎯
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
