import type DappPortalSDK from '@linenext/dapp-portal-sdk';

let sdkInstance: DappPortalSDK | null = null;

const getSdk = async (): Promise<DappPortalSDK> => {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    throw new Error('SDK can only be initialized on the client side');
  }

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
