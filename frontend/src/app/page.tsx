"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import useDappPortal from '@/hooks/useDappPortal';
import { getMissionFactoryContract } from '@/lib/contracts';

export default function Home() {
  const { sdk, loading, error } = useDappPortal();
  const [account, setAccount] = useState<string | null>(null);
  const [missionPools, setMissionPools] = useState<string[]>([]);
  const [newMission, setNewMission] = useState({
    asset: '',
    targetAmount: '',
    cadence: '',
    duration: '',
    yieldStrategy: '',
    rewardDistributor: '',
  });

  const connectWallet = async () => {
    if (!sdk) return;
    try {
      const walletProvider = sdk.getWalletProvider();
      const accounts = await walletProvider.request({ method: 'kaia_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet", error);
    }
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
      fetchMissionPools();
    } catch (error) {
      console.error("Failed to create mission", error);
    }
  };

  useEffect(() => {
    if (account) {
      fetchMissionPools();
    }
  }, [account]);

  if (loading) {
    return <div>Loading SDK...</div>;
  }

  if (error) {
    return <div>Error initializing SDK: {error.message}</div>;
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Kaia Mini Dapp</h1>
        {!account ? (
          <button onClick={connectWallet} disabled={!sdk} className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto">
            {sdk ? 'Connect Wallet' : 'Initializing SDK...'}
          </button>
        ) : (
          <div>
            <p>Connected: {account}</p>
          </div>
        )}

        {account && (
          <div className='w-full'>
            <h2 className="text-2xl font-bold mt-8">Create Mission</h2>
            <div className="flex flex-col gap-4 mt-4">
              <input name="asset" value={newMission.asset} onChange={handleInputChange} placeholder="Asset Address" className="border p-2" />
              <input name="targetAmount" value={newMission.targetAmount} onChange={handleInputChange} placeholder="Target Amount (in ETH)" className="border p-2" />
              <input name="cadence" value={newMission.cadence} onChange={handleInputChange} placeholder="Cadence" className="border p-2" />
              <input name="duration" value={newMission.duration} onChange={handleInputChange} placeholder="Duration" className="border p-2" />
              <input name="yieldStrategy" value={newMission.yieldStrategy} onChange={handleInputChange} placeholder="Yield Strategy Address" className="border p-2" />
              <input name="rewardDistributor" value={newMission.rewardDistributor} onChange={handleInputChange} placeholder="Reward Distributor Address" className="border p-2" />
              <button onClick={createMission} className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]">
                Create Mission
              </button>
            </div>

            <h2 className="text-2xl font-bold mt-8">Mission Pools</h2>
            <ul className="list-disc list-inside mt-4">
              {missionPools.map((pool, index) => (
                <li key={index}>{pool}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}