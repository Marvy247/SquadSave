'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { getMissionFactoryContract } from '@/lib/contracts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CreateMissionPage() {
  const [newMission, setNewMission] = useState({
    asset: '',
    targetAmount: '',
    cadence: '',
    duration: '',
    yieldStrategy: '',
    rewardDistributor: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMission({ ...newMission, [e.target.name]: e.target.value });
  };

  const createMission = async () => {
    try {
      const contract = await getMissionFactoryContract();
      const tx = await contract.createMission(
        newMission.asset,
        ethers.parseEther(newMission.targetAmount),
        newMission.cadence,
        newMission.duration,
        newMission.yieldStrategy,
        newMission.rewardDistributor
      );
      await tx.wait();
      // TODO: Redirect to the new mission page or the home page
      alert('Mission created successfully!');
    } catch (error) {
      console.error("Failed to create mission", error);
      alert('Failed to create mission');
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Create a New Mission</h1>
        <div className='w-full'>
          <div className="flex flex-col gap-4 mt-4">
            <Input name="asset" value={newMission.asset} onChange={handleInputChange} placeholder="Asset Address" />
            <Input name="targetAmount" value={newMission.targetAmount} onChange={handleInputChange} placeholder="Target Amount (in ETH)" />
            <Input name="cadence" value={newMission.cadence} onChange={handleInputChange} placeholder="Cadence" />
            <Input name="duration" value={newMission.duration} onChange={handleInputChange} placeholder="Duration" />
            <Input name="yieldStrategy" value={newMission.yieldStrategy} onChange={handleInputChange} placeholder="Yield Strategy Address" />
            <Input name="rewardDistributor" value={newMission.rewardDistributor} onChange={handleInputChange} placeholder="Reward Distributor Address" />
            <Button onClick={createMission}>
              Create Mission
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
