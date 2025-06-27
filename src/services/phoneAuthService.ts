// Phone-Based Authentication Service for IraChat
import {
    ConfirmationResult,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    User
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseSimple';

interface PhoneAuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface UserProfile {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: any;
  createdAt: any;
  status?: string;
}

class PhoneAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  /**
   * Initialize reCAPTCHA verifier for phone authentication
   */
  initializeRecaptcha(containerId: string = 'recaptcha-container'): void {
    try {
      if (!auth) {
        throw new Error("Firebase Auth is not available");
      }

      if (!this.recaptchaVerifier) {
        this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => {
            console.log('✅ reCAPTCHA verified');
          },
          'expired-callback': () => {
            console.log('⚠️ reCAPTCHA expired');
            this.recaptchaVerifier = null;
          }
        });
      }
    } catch (error) {
      console.error('❌ Error initializing reCAPTCHA:', error);
    }
  }

  /**
   * Send SMS verification code to phone number
   */
  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📱 Sending verification code to:', phoneNumber);

      // Ensure reCAPTCHA is initialized
      if (!this.recaptchaVerifier) {
        this.initializeRecaptcha();
      }

      // Validate and format phone number (ensure it starts with +)
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      // Basic E.164 format validation
      const e164Regex = /^\+[1-9]\d{1,14}$/;
      if (!e164Regex.test(formattedPhone)) {
        throw new Error("Invalid phone number format. Please use international format (e.g., +1234567890)");
      }

      // Send verification code
      if (!auth) {
        throw new Error("Firebase Auth is not available");
      }

      this.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        this.recaptchaVerifier!
      );

      console.log('✅ Verification code sent successfully');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error sending verification code:', error);
      
      // Reset reCAPTCHA on error
      this.recaptchaVerifier = null;
      
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Verify SMS code and complete phone authentication
   */
  async verifyCode(code: string): Promise<PhoneAuthResult> {
    try {
      if (!this.confirmationResult) {
        return { 
          success: false, 
          error: 'No verification in progress. Please request a new code.' 
        };
      }

      console.log('🔐 Verifying SMS code...');

      // Confirm the verification code
      const result = await this.confirmationResult.confirm(code);
      const user = result.user;

      if (user) {
        console.log('✅ Phone authentication successful:', user.phoneNumber);

        // Create or update user profile
        await this.createOrUpdateUserProfile(user);

        return { success: true, user };
      } else {
        return { success: false, error: 'Authentication failed' };
      }

    } catch (error: any) {
      console.error('❌ Error verifying code:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Create or update user profile in Firestore
   */
  private async createOrUpdateUserProfile(user: User): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      const userProfile: UserProfile = {
        uid: user.uid,
        phoneNumber: user.phoneNumber!,
        isOnline: true,
        lastSeen: serverTimestamp(),
        createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp(),
        status: userDoc.exists() ? userDoc.data().status : 'Available',
        displayName: userDoc.exists() ? userDoc.data().displayName : undefined,
        avatar: userDoc.exists() ? userDoc.data().avatar : undefined,
      };

      await setDoc(userRef, userProfile, { merge: true });
      console.log('✅ User profile created/updated');

    } catch (error) {
      console.error('❌ Error creating user profile:', error);
    }
  }

  /**
   * Check if phone number is already registered
   */
  async isPhoneRegistered(phoneNumber: string): Promise<boolean> {
    try {
      // This is a simplified check - in production you might want to query by phone number
      // For now, we'll let Firebase Auth handle duplicate phone numbers
      return false;
    } catch (error) {
      console.error('❌ Error checking phone registration:', error);
      return false;
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      if (!auth) {
        throw new Error("Firebase Auth is not available");
      }
      await auth.signOut();
      console.log('✅ User signed out');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return auth?.currentUser || null;
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format';
      case 'auth/missing-phone-number':
        return 'Phone number is required';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please try again later';
      case 'auth/user-disabled':
        return 'This phone number has been disabled';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code';
      case 'auth/code-expired':
        return 'Verification code has expired';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/captcha-check-failed':
        return 'reCAPTCHA verification failed';
      default:
        return 'Authentication failed. Please try again';
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }
}

// Export singleton instance
export const phoneAuthService = new PhoneAuthService();
export default phoneAuthService;
