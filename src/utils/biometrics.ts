import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricCapabilities {
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
  supportsFace: boolean;
  supportsFingerprint: boolean;
}

export const checkBiometricSupport = async (): Promise<BiometricCapabilities> => {
  try {
    if (Platform.OS === 'web') {
      return {
        hasHardware: false,
        isEnrolled: false,
        biometricTypes: [],
        supportsFace: false,
        supportsFingerprint: false,
      };
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const supportsFace = biometricTypes.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
    );
    const supportsFingerprint = biometricTypes.includes(
      LocalAuthentication.AuthenticationType.FINGERPRINT
    );

    return {
      hasHardware,
      isEnrolled,
      biometricTypes,
      supportsFace,
      supportsFingerprint,
    };
  } catch (err) {
    console.warn('[Biometrics] Error checking support:', err);
    return {
      hasHardware: false,
      isEnrolled: false,
      biometricTypes: [],
      supportsFace: false,
      supportsFingerprint: false,
    };
  }
};

export const promptBiometricAuth = async (
  promptMessage: string = 'Scan your Fingerprint or Face to unlock STARGAZE'
): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      return true;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      // In simulator or environments without hardware
      return true;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Device PIN / Password',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (err) {
    console.warn('[Biometrics] Auth prompt error:', err);
    return false;
  }
};
