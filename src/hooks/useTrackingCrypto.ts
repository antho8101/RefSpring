
import { useEncryption } from './crypto/useEncryption';
import { useSignature } from './crypto/useSignature';
import { useSecureStorage } from './crypto/useSecureStorage';
import { useSecureTokens } from './crypto/useSecureTokens';

export const useTrackingCrypto = () => {
  const { encrypt, decrypt } = useEncryption();
  const { signData, verifySignature } = useSignature();
  const { secureStore, secureRetrieve } = useSecureStorage();
  const { generateSecureToken, validateSecureToken } = useSecureTokens();

  return {
    encrypt,
    decrypt,
    signData,
    verifySignature,
    secureStore,
    secureRetrieve,
    generateSecureToken,
    validateSecureToken
  };
};
