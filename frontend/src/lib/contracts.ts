
import { ethers } from 'ethers';
import getSdk from '@/lib/dapp-portal';
import MissionFactoryAbi from '@/lib/abi/MissionFactory.json';
import RewardDistributorAbi from '@/lib/abi/RewardDistributor.json';
import IdentityBinderAbi from '@/lib/abi/IdentityBinder.json';
import { MISSION_FACTORY_ADDRESS, REWARD_DISTRIBUTOR_ADDRESS, IDENTITY_BINDER_ADDRESS } from '@/lib/constants';

export const getProvider = async () => {
  const sdk = await getSdk();
  const walletProvider = sdk.getWalletProvider();
  return new ethers.BrowserProvider(walletProvider);
};

export const getSigner = async () => {
  const provider = await getProvider();
  return await provider.getSigner();
};

export const getMissionFactoryContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(MISSION_FACTORY_ADDRESS, MissionFactoryAbi, signer);
};

export const getRewardDistributorContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(REWARD_DISTRIBUTOR_ADDRESS, RewardDistributorAbi, signer);
};

export const getIdentityBinderContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(IDENTITY_BINDER_ADDRESS, IdentityBinderAbi, signer);
};
