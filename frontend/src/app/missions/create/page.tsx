'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { Target, DollarSign, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import useDappPortal from '@/hooks/useDappPortal';
import { getMissionFactoryContract } from '@/lib/contracts';
import { REWARD_DISTRIBUTOR_ADDRESS, USDT_ADDRESS, MOCK_YIELD_STRATEGY_ADDRESS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CardLoading, ButtonLoading, PageLoading } from '@/components/Loading';
import ConfettiComponent from '@/components/Confetti';

export default function CreateMissionPage() {
  const router = useRouter();
  const { sdk, loading, error } = useDappPortal();
  const [account, setAccount] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newMission, setNewMission] = useState({
    asset: USDT_ADDRESS,
    targetAmount: '',
    cadence: '86400', // Daily in seconds
    duration: '30', // Days
    yieldStrategy: MOCK_YIELD_STRATEGY_ADDRESS,
    rewardDistributor: REWARD_DISTRIBUTOR_ADDRESS,
  });

  const [formErrors, setFormErrors] = useState({
    targetAmount: '',
    cadence: '',
    duration: '',
  });

  const [estimatedRewards, setEstimatedRewards] = useState({
    baseReward: 0,
    streakBonus: 0,
    squadBonus: 0,
    totalReward: 0,
  });

  const [showConfetti, setShowConfetti] = useState(false);

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

  const toggleDark = () => setIsDark(!isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const calculateEstimatedRewards = (missionData: typeof newMission) => {
    const targetAmount = parseFloat(missionData.targetAmount) || 0;
    const duration = parseInt(missionData.duration) || 30;
    const cadence = parseInt(missionData.cadence) || 86400;

    if (targetAmount > 0) {
      // Base yield (5% APY)
      const baseReward = (targetAmount * 0.05 * (duration / 365));

      // Streak bonus (up to 20% for perfect streak)
      const streakBonus = baseReward * 0.2;

      // Squad bonus (10% for squad participation)
      const squadBonus = baseReward * 0.1;

      const totalReward = baseReward + streakBonus + squadBonus;

      setEstimatedRewards({
        baseReward: Math.round(baseReward * 100) / 100,
        streakBonus: Math.round(streakBonus * 100) / 100,
        squadBonus: Math.round(squadBonus * 100) / 100,
        totalReward: Math.round(totalReward * 100) / 100,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMission({ ...newMission, [name]: value });

    // Real-time validation
    if (name === 'targetAmount') {
      if (!value || parseFloat(value) <= 0) {
        setFormErrors(prev => ({ ...prev, targetAmount: 'Please enter a valid amount greater than 0' }));
      } else if (parseFloat(value) < 10) {
        setFormErrors(prev => ({ ...prev, targetAmount: 'Minimum savings amount is $10' }));
      } else {
        setFormErrors(prev => ({ ...prev, targetAmount: '' }));
      }
    }

    // Calculate estimated rewards
    calculateEstimatedRewards({ ...newMission, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    const updatedMission = { ...newMission, [name]: value };
    setNewMission(updatedMission);

    // Validation for duration
    if (name === 'duration') {
      const durationInSeconds = parseInt(value) * 24 * 60 * 60;
      const cadenceInSeconds = parseInt(newMission.cadence);

      if (durationInSeconds <= cadenceInSeconds) {
        setFormErrors(prev => ({ ...prev, duration: 'Duration must be longer than deposit cadence' }));
      } else {
        setFormErrors(prev => ({ ...prev, duration: '' }));
      }
    }

    // Calculate estimated rewards
    calculateEstimatedRewards(updatedMission);
  };

  const createMission = async () => {
    if (!account) {
      toast.error('Please connect your wallet first.');
      return;
    }
    if (!newMission.targetAmount) {
      toast.error('Please enter a target amount.');
      return;
    }

    // Convert duration from days to seconds
    const durationInSeconds = parseInt(newMission.duration) * 24 * 60 * 60; // days * hours * minutes * seconds

    // Validate that duration is longer than cadence
    if (durationInSeconds <= parseInt(newMission.cadence)) {
      toast.error('Mission duration must be longer than the deposit cadence.');
      return;
    }

    setIsLoading(true);
    try {
      const contract = await getMissionFactoryContract();
      const tx = await contract.createMission(
        newMission.asset,
        ethers.parseEther(newMission.targetAmount),
        parseInt(newMission.cadence),
        durationInSeconds, // Send duration in seconds
        newMission.yieldStrategy,
        newMission.rewardDistributor
      );
      await tx.wait();
      toast.success('Mission created successfully! 🎉');
      setShowConfetti(true);

      // Redirect after confetti animation
      setTimeout(() => {
        setShowConfetti(false);
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error("Failed to create mission", error);
      toast.error('Failed to create mission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <PageLoading message="Loading SquadSave..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg">⚠️ Error loading application</div>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <ConfettiComponent show={showConfetti} />
      <Header account={account} onConnectWallet={connectWallet} onDisconnectWallet={disconnectWallet} isDark={isDark} toggleDark={toggleDark} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block p-4 md:p-6 rounded-full bg-gradient-to-r from-green-500 to-blue-600 mb-4 md:mb-6 shadow-lg">
              <span className="text-4xl md:text-6xl">🎯</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Create Your Mission
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto px-4">
              Set up a savings goal and invite friends to join! Turn saving into a fun, collaborative adventure! 💪
            </p>
          </div>

          <Card className="shadow-xl border-2 border-primary/10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader className="text-center pb-4 md:pb-6">
              <CardTitle className="text-xl md:text-2xl font-bold flex items-center justify-center">
                <div className="p-1.5 md:p-2 rounded-full bg-gradient-to-r from-green-500 to-blue-600 mr-2 md:mr-3">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                Mission Details
              </CardTitle>
              <p className="text-sm md:text-base text-muted-foreground mt-2 px-4">Fill in the details to create your savings mission</p>
            </CardHeader>
            <CardContent className="space-y-6 md:space-y-8">
              <div className="space-y-2 md:space-y-3">
                <label className="text-sm font-semibold flex items-center text-gray-700 dark:text-gray-300">
                  <div className="p-1 md:p-1.5 rounded-full bg-gradient-to-r from-green-500 to-blue-600 mr-2">
                    <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                  Target Amount (USDT)
                </label>
                <Input
                  name="targetAmount"
                  type="number"
                  value={newMission.targetAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  className={`text-base md:text-lg h-10 md:h-12 border-2 transition-all duration-200 hover:border-primary/50 ${
                    formErrors.targetAmount
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
                {formErrors.targetAmount ? (
                  <p className="text-xs md:text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {formErrors.targetAmount}
                  </p>
                ) : (
                  <p className="text-xs md:text-sm text-muted-foreground">
                    💰 How much do you want to save in total? This is your savings goal!
                  </p>
                )}
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="text-sm font-semibold flex items-center text-gray-700 dark:text-gray-300">
                  <div className="p-1 md:p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 mr-2">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                  Deposit Cadence
                </label>
                <Select value={newMission.cadence} onValueChange={(value) => handleSelectChange('cadence', value)}>
                  <SelectTrigger className="h-10 md:h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-primary transition-colors">
                    <SelectValue placeholder="Select cadence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="86400">📅 Daily</SelectItem>
                    <SelectItem value="604800">📆 Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs md:text-sm text-muted-foreground">
                  ⏰ How often do you want to deposit? Choose your commitment level!
                </p>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="text-sm font-semibold flex items-center text-gray-700 dark:text-gray-300">
                  <div className="p-1 md:p-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 mr-2">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                  Mission Duration
                </label>
                <Select value={newMission.duration} onValueChange={(value) => handleSelectChange('duration', value)}>
                  <SelectTrigger className="h-10 md:h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-primary transition-colors">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">⏳ 1 Week</SelectItem>
                    <SelectItem value="30">📅 1 Month</SelectItem>
                    <SelectItem value="90">🎯 3 Months</SelectItem>
                    <SelectItem value="180">🏆 6 Months</SelectItem>
                    <SelectItem value="365">👑 1 Year</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.duration ? (
                  <p className="text-xs md:text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {formErrors.duration}
                  </p>
                ) : (
                  <p className="text-xs md:text-sm text-muted-foreground">
                    🏁 How long should the mission last? Longer missions build bigger rewards!
                  </p>
                )}
              </div>

              {/* Estimated Rewards Display */}
              {newMission.targetAmount && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 md:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-base md:text-lg mb-2 md:mb-3 flex items-center">
                    <span className="text-xl md:text-2xl mr-2">💰</span>
                    Estimated Rewards
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                      <div className="text-muted-foreground">Base Yield</div>
                      <div className="font-bold text-green-600 text-sm md:text-base">${estimatedRewards.baseReward}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Streak Bonus</div>
                      <div className="font-bold text-orange-600 text-sm md:text-base">+${estimatedRewards.streakBonus}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Squad Bonus</div>
                      <div className="font-bold text-purple-600 text-sm md:text-base">+${estimatedRewards.squadBonus}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Potential</div>
                      <div className="font-bold text-primary text-base md:text-lg">${estimatedRewards.totalReward}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Rewards increase with perfect streaks and squad participation!
                  </p>
                </div>
              )}

              <Button
                onClick={createMission}
                disabled={isLoading || !!formErrors.targetAmount || !!formErrors.duration}
                className="w-full text-base md:text-lg py-4 md:py-6 h-12 md:h-14 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <ButtonLoading message="Creating Mission..." />
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl md:text-2xl">🚀</span>
                    <span className="font-bold">Create Mission</span>
                    <span className="text-lg md:text-xl">💪</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
