// Phone Authentication Service
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseSimple';

// Global variables for reCAPTCHA
let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

// Initialize reCAPTCHA verifier
export const initializeRecaptcha = (): Promise<RecaptchaVerifier> => {
  return new Promise((resolve, reject) => {
    try {
      // Clean up existing verifier
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }

      // Create reCAPTCHA container if it doesn't exist
      let recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = 'recaptcha-container';
        recaptchaContainer.style.display = 'none';
        document.body.appendChild(recaptchaContainer);
      }

      recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA solved:', response);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          reject(new Error('reCAPTCHA expired. Please try again.'));
        }
      });

      recaptchaVerifier.render().then(() => {
        console.log('reCAPTCHA rendered successfully');
        resolve(recaptchaVerifier!);
      }).catch((error) => {
        console.error('reCAPTCHA render failed:', error);
        reject(error);
      });
    } catch (error) {
      console.error('reCAPTCHA initialization failed:', error);
      reject(error);
    }
  });
};

// Format phone number to international format
export const formatPhoneNumber = (phoneNumber: string, countryCode: string = '+1'): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If number doesn't start with country code, add it
  if (!phoneNumber.startsWith('+')) {
    return `${countryCode}${cleaned}`;
  }
  
  return `+${cleaned}`;
};

// Validate phone number format
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Basic international phone number validation
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

// Send SMS verification code
export const sendVerificationCode = async (phoneNumber: string): Promise<{success: boolean, message: string}> => {
  try {
    console.log('Sending verification code to:', phoneNumber);
    
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format. Please include country code (e.g., +1234567890)');
    }

    // Initialize reCAPTCHA if not already done
    if (!recaptchaVerifier) {
      await initializeRecaptcha();
    }

    // Send verification code
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier!);
    
    console.log('SMS sent successfully');
    return {
      success: true,
      message: 'Verification code sent successfully!'
    };
  } catch (error: any) {
    console.error('SMS sending failed:', error);
    
    let errorMessage = 'Failed to send verification code. Please try again.';
    
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number. Please check the number and try again.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'SMS quota exceeded. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Verify OTP code
export const verifyOTPCode = async (code: string, name: string): Promise<{success: boolean, message: string, user?: any}> => {
  try {
    console.log('Verifying OTP code...');
    
    if (!confirmationResult) {
      throw new Error('No verification in progress. Please request a new code.');
    }

    if (!code || code.length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code.');
    }

    // Verify the code
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    console.log('Phone verification successful:', user.uid);

    // Update user profile with name
    if (name.trim()) {
      await updateProfile(user, {
        displayName: name.trim()
      });
    }

    // Create or update user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // New user - create profile
      await setDoc(userDocRef, {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        name: name.trim() || 'User',
        displayName: name.trim() || 'User',
        avatar: '',
        status: 'I Love IraChat',
        bio: 'I Love IraChat',
        isOnline: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
      console.log('New user profile created');
    } else {
      // Existing user - update last login
      await setDoc(userDocRef, {
        lastLoginAt: new Date(),
        isOnline: true,
      }, { merge: true });
      console.log('Existing user login updated');
    }

    // Clear verification state
    confirmationResult = null;
    
    return {
      success: true,
      message: 'Phone number verified successfully!',
      user: {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName || name.trim() || 'User',
        name: name.trim() || 'User',
      }
    };
  } catch (error: any) {
    console.error('OTP verification failed:', error);
    
    let errorMessage = 'Invalid verification code. Please try again.';
    
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid verification code. Please check and try again.';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'Verification code has expired. Please request a new one.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Resend verification code
export const resendVerificationCode = async (phoneNumber: string): Promise<{success: boolean, message: string}> => {
  try {
    // Clear previous verification
    confirmationResult = null;
    
    // Send new code
    return await sendVerificationCode(phoneNumber);
  } catch (error: any) {
    console.error('Resend failed:', error);
    return {
      success: false,
      message: 'Failed to resend code. Please try again.'
    };
  }
};

// Clean up reCAPTCHA
export const cleanupRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
};

// Sign in existing user with phone number
export const signInWithPhone = async (phoneNumber: string): Promise<{success: boolean, message: string}> => {
  try {
    return await sendVerificationCode(phoneNumber);
  } catch (error: any) {
    console.error('Phone sign-in failed:', error);
    return {
      success: false,
      message: 'Failed to send verification code. Please try again.'
    };
  }
};
