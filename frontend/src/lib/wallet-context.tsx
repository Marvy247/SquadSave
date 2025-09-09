'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import useDappPortal from '@/hooks/useDappPortal';

interface WalletContextType {
  account: string | null;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  loading: boolean;
  error: Error | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { sdk, loading: sdkLoading, error: sdkError } = useDappPortal();
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load account from localStorage on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('walletAccount');
    if (savedAccount) {
      setAccount(savedAccount);
    }
    setLoading(false);
  }, []);

  // Save account to localStorage when it changes
  useEffect(() => {
    if (account) {
      localStorage.setItem('walletAccount', account);
    } else {
      localStorage.removeItem('walletAccount');
    }
  }, [account]);

  const connectWallet = async (): Promise<boolean> => {
    if (!sdk) return false;
    try {
      const walletProvider = sdk.getWalletProvider();
      const accounts = await walletProvider.request({ method: 'kaia_requestAccounts' }) as string[];
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        toast.success('Wallet connected successfully! 🎉');
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to connect wallet", error);
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    toast.success('Wallet disconnected');
  };

  const value = {
    account,
    connectWallet,
    disconnectWallet,
    loading: loading || sdkLoading,
    error: sdkError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
