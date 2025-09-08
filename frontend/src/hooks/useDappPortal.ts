import { useState, useEffect } from 'react';
import getSdk from '@/lib/dapp-portal';
import { DappPortalSDK as DappPortalSDKType } from '@linenext/dapp-portal-sdk';

const useDappPortal = () => {
  const [sdk, setSdk] = useState<DappPortalSDKType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initSdk = async () => {
      try {
        const sdkInstance = await getSdk();
        setSdk(sdkInstance);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    initSdk();
  }, []);

  return { sdk, error, loading };
};

export default useDappPortal;
