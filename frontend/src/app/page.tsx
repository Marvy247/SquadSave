"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useDappPortal from '@/hooks/useDappPortal';
import { getMissionFactoryContract } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { sdk, loading, error } = useDappPortal();
  const [account, setAccount] = useState<string | null>(null);
  const [missionPools, setMissionPools] = useState<string[]>([]);

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
        <div className="flex justify-between w-full items-center">
          <h1 className="text-4xl font-bold">Kaia Mini Dapp</h1>
          {!account ? (
            <Button onClick={connectWallet} disabled={!sdk}>
              {sdk ? 'Connect Wallet' : 'Initializing SDK...'}
            </Button>
          ) : (
            <div>
              <p>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
            </div>
          )}
        </div>


        {account && (
          <div className='w-full'>
            <div className="flex justify-between w-full items-center mt-8">
              <h2 className="text-2xl font-bold">Missions</h2>
              <Link href="/missions/create" passHref>
                <Button>
                  Create Mission
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 mt-4">
              {missionPools.map((pool, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>
                      <Link href={`/missions/${pool}`}>
                        {pool}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
