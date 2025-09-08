'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { getMissionPoolContract } from '@/lib/contracts';
import useDappPortal from '@/hooks/useDappPortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

  const [missionDetails, setMissionDetails] = useState<MissionDetails | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchMissionDetails = useCallback(async () => {
    if (!missionId) return;
    try {
      const contract = await getMissionPoolContract(missionId);
      const details = await contract.getMissionDetails();
      const participantsList = await contract.getParticipants();
      
      setMissionDetails({
        asset: details._asset,
        targetAmount: ethers.formatEther(details._targetAmount),
        cadence: details._cadence.toString(),
        duration: details._duration.toString(),
        startTime: new Date(Number(details._startTime) * 1000).toLocaleString(),
        endTime: new Date(Number(details._endTime) * 1000).toLocaleString(),
        yieldStrategy: details._yieldStrategy,
        rewardDistributor: details._rewardDistributor,
      });
      setParticipants(participantsList);

      if (sdk) {
        const accounts = await sdk.getWalletProvider().request({ method: 'kaia_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const userProgressDetails = await contract.getUserProgress(accounts[0]);
          setUserProgress({
            totalDeposited: ethers.formatEther(userProgressDetails.totalDeposited),
            currentStreak: userProgressDetails.currentStreak.toString(),
            lastDepositTimestamp: new Date(Number(userProgressDetails.lastDepositTimestamp) * 1000).toLocaleString(),
            nextDepositWindow: new Date(Number(userProgressDetails.nextDepositWindow) * 1000).toLocaleString(),
          });
        }
      }

    } catch (error) {
      console.error("Failed to fetch mission details", error);
    }
  }, [missionId, sdk, setMissionDetails, setParticipants, setUserProgress]);

  const handleDeposit = async () => {
    if (!missionId || !depositAmount) return;
    try {
      const contract = await getMissionPoolContract(missionId);
      const tx = await contract.deposit({ value: ethers.parseEther(depositAmount) });
      await tx.wait();
      alert('Deposit successful!');
      fetchMissionDetails(); // Refresh details
    } catch (error) {
      console.error("Failed to deposit", error);
      alert('Deposit failed');
    }
  };

  const handleWithdraw = async () => {
    if (!missionId || !withdrawAmount) return;
    try {
      const contract = await getMissionPoolContract(missionId);
      const tx = await contract.withdraw(ethers.parseEther(withdrawAmount));
      await tx.wait();
      alert('Withdrawal successful!');
      fetchMissionDetails(); // Refresh details
    } catch (error) {
      console.error("Failed to withdraw", error);
      alert('Withdrawal failed');
    }
  };

  useEffect(() => {
    fetchMissionDetails();
  }, [fetchMissionDetails]);

  if (!missionDetails) {
    return <div>Loading mission details...</div>;
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
        <h1 className="text-4xl font-bold">Mission Details</h1>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Mission Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Address:</strong> {missionId}</div>
              <div><strong>Asset:</strong> {missionDetails.asset}</div>
              <div><strong>Target Amount:</strong> {missionDetails.targetAmount} ETH</div>
              <div><strong>Cadence:</strong> {missionDetails.cadence} seconds</div>
              <div><strong>Duration:</strong> {missionDetails.duration} seconds</div>
              <div><strong>Start Time:</strong> {missionDetails.startTime}</div>
              <div><strong>End Time:</strong> {missionDetails.endTime}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {userProgress ? (
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Total Deposited:</strong> {userProgress.totalDeposited} ETH</div>
                <div><strong>Current Streak:</strong> {userProgress.currentStreak}</div>
                <div><strong>Last Deposit:</strong> {userProgress.lastDepositTimestamp}</div>
                <div><strong>Next Deposit Window Closes:</strong> {userProgress.nextDepositWindow}</div>
              </div>
            ) : (
              <p>Connect your wallet to see your progress.</p>
            )}
          </CardContent>
        </Card>

        <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle>Participants ({participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside">
              {participants.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 mt-8 w-full">
          <h2 className="text-2xl font-bold">Actions</h2>
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount in ETH"
            />
            <Button onClick={handleDeposit}>
              Deposit
            </Button>
          </div>
          <div className="flex gap-4 items-center mt-4">
            <input
              type="text"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount in ETH"
            />
            <Button onClick={handleWithdraw}>
              Withdraw
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
