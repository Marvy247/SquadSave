import type { DappPortalSDK as DappPortalSDKType } from '@linenext/dapp-portal-sdk';

let sdkInstance: DappPortalSDKType | null = null;

const getSdk = async (): Promise<DappPortalSDKType> => {
  if (sdkInstance) {
    return sdkInstance;
  }

  const DappPortalSDK = (await import('@linenext/dapp-portal-sdk')).default;
  const clientId = process.env.NEXT_PUBLIC_DAPP_PORTAL_CLIENT_ID;

  if (!clientId) {
    throw new Error('DAPP_PORTAL_CLIENT_ID is not configured in .env');
  }

  sdkInstance = await DappPortalSDK.init({ clientId });
  return sdkInstance;
};

export default getSdk;
