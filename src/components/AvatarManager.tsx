/**
 * Avatar Manager Component for IraChat
 * 
 * Centralized avatar management system that ensures consistency
 * across all avatar implementations in the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { avatarService, UserProfile } from '../services/avatarService';
import { cleanContactName, generatePlaceholderAvatar } from '../utils/avatarUtils';

interface AvatarContextType {
  getAvatarUrl: (user: Partial<UserProfile>, size?: number) => string;
  updateAvatar: (userId: string, imageUri: string) => Promise<string>;
  preloadAvatars: (users: Partial<UserProfile>[]) => Promise<void>;
  clearCache: () => void;
  isLoading: boolean;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const useAvatarManager = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatarManager must be used within an AvatarProvider');
  }
  return context;
};

interface AvatarProviderProps {
  children: React.ReactNode;
}

export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getAvatarUrl = (user: Partial<UserProfile>, size: number = 150): string => {
    return avatarService.getAvatarUrl(user, size);
  };

  const updateAvatar = async (userId: string, imageUri: string): Promise<string> => {
    setIsLoading(true);
    try {
      const avatarUrl = await avatarService.uploadAvatar(userId, imageUri);
      return avatarUrl;
    } finally {
      setIsLoading(false);
    }
  };

  const preloadAvatars = async (users: Partial<UserProfile>[]): Promise<void> => {
    setIsLoading(true);
    try {
      await avatarService.preloadAvatars(users);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = (): void => {
    avatarService.clearCache();
  };

  const value: AvatarContextType = {
    getAvatarUrl,
    updateAvatar,
    preloadAvatars,
    clearCache,
    isLoading,
  };

  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
};

/**
 * Avatar Consistency Checker
 * 
 * Development tool to ensure all avatars in the app are using
 * the consistent Avatar component system
 */
export class AvatarConsistencyChecker {
  private static violations: string[] = [];

  static checkComponent(componentName: string, hasAvatarComponent: boolean, hasManualImage: boolean) {
    if (hasManualImage && !hasAvatarComponent) {
      this.violations.push(`${componentName}: Manual Image component used instead of Avatar component`);
    }
  }

  static getViolations(): string[] {
    return this.violations;
  }

  static clearViolations(): void {
    this.violations = [];
  }

  static reportViolations(): void {
    if (this.violations.length > 0) {
      console.warn('🚨 Avatar Consistency Violations Found:');
      this.violations.forEach((violation, index) => {
        console.warn(`${index + 1}. ${violation}`);
      });
      console.warn('Please use the Avatar component from src/components/Avatar.tsx for consistency');
    } else {
      console.log('✅ All avatar implementations are consistent!');
    }
  }
}

/**
 * Avatar Fallback System
 * 
 * Ensures that all avatars have proper fallbacks and error handling
 */
export const AvatarFallbackSystem = {
  /**
   * Generate consistent fallback avatar data
   */
  generateFallback: (user: Partial<UserProfile>) => {
    const name = cleanContactName(user.name || user.phone || 'User');
    const avatarData = avatarService.getOfflineAvatarData(user);
    
    return {
      ...avatarData,
      name,
      fallbackUrl: generatePlaceholderAvatar(name),
    };
  },

  /**
   * Validate avatar URL and provide fallback
   */
  validateAndFallback: (imageUrl: string | null | undefined, user: Partial<UserProfile>) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return AvatarFallbackSystem.generateFallback(user);
    }

    try {
      new URL(imageUrl);
      return {
        isValid: true,
        imageUrl,
        fallback: AvatarFallbackSystem.generateFallback(user),
      };
    } catch {
      return AvatarFallbackSystem.generateFallback(user);
    }
  },
};

/**
 * Avatar Performance Monitor
 * 
 * Monitors avatar loading performance and provides optimization suggestions
 */
export class AvatarPerformanceMonitor {
  private static loadTimes: Map<string, number> = new Map();
  private static errorCounts: Map<string, number> = new Map();

  static startLoad(avatarId: string): void {
    this.loadTimes.set(avatarId, Date.now());
  }

  static endLoad(avatarId: string): void {
    const startTime = this.loadTimes.get(avatarId);
    if (startTime) {
      const loadTime = Date.now() - startTime;
      console.log(`Avatar ${avatarId} loaded in ${loadTime}ms`);
      
      if (loadTime > 2000) {
        console.warn(`⚠️ Slow avatar load detected: ${avatarId} took ${loadTime}ms`);
      }
    }
  }

  static recordError(avatarId: string): void {
    const currentCount = this.errorCounts.get(avatarId) || 0;
    this.errorCounts.set(avatarId, currentCount + 1);
    
    if (currentCount >= 3) {
      console.error(`❌ Avatar ${avatarId} has failed to load ${currentCount + 1} times`);
    }
  }

  static getStats(): {
    averageLoadTime: number;
    totalErrors: number;
    slowLoads: number;
  } {
    const loadTimes = Array.from(this.loadTimes.values());
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length 
      : 0;
    
    const totalErrors = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    const slowLoads = loadTimes.filter(time => time > 2000).length;

    return {
      averageLoadTime,
      totalErrors,
      slowLoads,
    };
  }

  static reset(): void {
    this.loadTimes.clear();
    this.errorCounts.clear();
  }
}

/**
 * Avatar Quality Assurance
 * 
 * Ensures all avatars meet quality standards
 */
export const AvatarQualityAssurance = {
  /**
   * Check if avatar meets quality standards
   */
  checkQuality: (user: Partial<UserProfile>) => {
    const issues: string[] = [];

    // Check if user has a name
    if (!user.name || user.name.trim().length === 0) {
      issues.push('User name is missing or empty');
    }

    // Check if avatar URL is valid
    if (user.avatar) {
      try {
        new URL(user.avatar);
      } catch {
        issues.push('Invalid avatar URL format');
      }
    }

    // Check for system-like names
    if (user.name && /^\*\d+#?$/.test(user.name)) {
      issues.push('System-like name detected (e.g., *43#)');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },

  /**
   * Batch check multiple users
   */
  batchCheck: (users: Partial<UserProfile>[]) => {
    const results = users.map((user, index) => ({
      index,
      user,
      quality: AvatarQualityAssurance.checkQuality(user),
    }));

    const validUsers = results.filter(r => r.quality.isValid);
    const invalidUsers = results.filter(r => !r.quality.isValid);

    return {
      total: users.length,
      valid: validUsers.length,
      invalid: invalidUsers.length,
      invalidUsers,
      qualityScore: (validUsers.length / users.length) * 100,
    };
  },
};

export default AvatarProvider;
