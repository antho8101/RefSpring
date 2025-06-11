
export const createCryptoSystem = () => `
  // 🔒 SYSTÈME CRYPTOGRAPHIQUE INTÉGRÉ
  const CryptoSystem = {
    getClientSecret: function() {
      const existingSecret = sessionStorage.getItem('refspring_client_secret');
      if (existingSecret) return existingSecret;
      
      const clientFingerprint = [
        navigator.userAgent,
        screen.width + 'x' + screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language,
        new Date().getTimezoneOffset().toString()
      ].join('|');
      
      const secret = btoa(clientFingerprint).substring(0, 32);
      sessionStorage.setItem('refspring_client_secret', secret);
      return secret;
    },
    
    encrypt: function(data) {
      const secret = this.getClientSecret();
      const jsonData = JSON.stringify(data);
      let encrypted = '';
      
      for (let i = 0; i < jsonData.length; i++) {
        const char = jsonData.charCodeAt(i);
        const keyChar = secret.charCodeAt(i % secret.length);
        encrypted += String.fromCharCode(char ^ keyChar);
      }
      
      return btoa(encrypted);
    },
    
    decrypt: function(encryptedData) {
      try {
        const secret = this.getClientSecret();
        const encrypted = atob(encryptedData);
        let decrypted = '';
        
        for (let i = 0; i < encrypted.length; i++) {
          const char = encrypted.charCodeAt(i);
          const keyChar = secret.charCodeAt(i % secret.length);
          decrypted += String.fromCharCode(char ^ keyChar);
        }
        
        return JSON.parse(decrypted);
      } catch (error) {
        console.error('🔒 CRYPTO - Erreur déchiffrement:', error);
        return null;
      }
    },
    
    signData: function(data) {
      const secret = this.getClientSecret();
      const timestamp = Date.now();
      const nonce = Math.random().toString(36).substring(2, 15);
      
      const payload = JSON.stringify({
        data, timestamp, nonce,
        secret: secret.substring(0, 8)
      });
      
      let hash = 0;
      for (let i = 0; i < payload.length; i++) {
        const char = payload.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return btoa(hash.toString() + '|' + timestamp + '|' + nonce);
    },
    
    secureStore: function(key, data) {
      const encrypted = this.encrypt(data);
      const signature = this.signData(data);
      const integrity = btoa(JSON.stringify(data)).substring(0, 16);
      
      const secureData = {
        encrypted, signature,
        timestamp: Date.now(),
        integrity
      };
      
      localStorage.setItem('refspring_secure_' + key, JSON.stringify(secureData));
    },
    
    secureRetrieve: function(key) {
      try {
        const stored = localStorage.getItem('refspring_secure_' + key);
        if (!stored) return null;
        
        const secureData = JSON.parse(stored);
        
        // Vérifier l'âge (max 24h)
        if (Date.now() - secureData.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('refspring_secure_' + key);
          return null;
        }
        
        const decryptedData = this.decrypt(secureData.encrypted);
        if (!decryptedData) return null;
        
        // Vérifier l'intégrité
        const currentIntegrity = btoa(JSON.stringify(decryptedData)).substring(0, 16);
        if (currentIntegrity !== secureData.integrity) {
          localStorage.removeItem('refspring_secure_' + key);
          return null;
        }
        
        return decryptedData;
      } catch (error) {
        console.error('🔒 CRYPTO - Erreur récupération:', error);
        return null;
      }
    }
  };
`;
