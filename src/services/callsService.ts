import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from './firebaseSimple';

export interface Call {
  id: string;
  type: 'voice' | 'video';
  participants: string[];
  status: 'incoming' | 'outgoing' | 'missed' | 'ended';
  timestamp: Date;
  duration?: number;
  callerName?: string;
  callerAvatar?: string;
}

class CallsService {
  private unsubscribe: (() => void) | null = null;

  /**
   * Start listening for calls with proper error handling
   */
  startListening(onCallsUpdate: (calls: Call[]) => void, onError?: (error: string) => void) {
    try {
      console.log('🔄 Starting calls listener...');

      // Check if auth is available
      if (!auth || !auth.currentUser) {
        console.warn('⚠️ Auth not available, cannot listen for calls');
        if (onError) {
          onError('Authentication required for calls');
        }
        return;
      }

      // Check if Firestore is available
      if (!db) {
        console.warn('⚠️ Firestore not available, cannot listen for calls');
        if (onError) {
          onError('Database not available');
        }
        return;
      }

      const currentUserId = auth.currentUser.uid;
      
      // Create query to listen for calls involving current user
      const callsQuery = query(
        collection(db, 'calls'),
        where('participants', 'array-contains', currentUserId)
      );

      this.unsubscribe = onSnapshot(
        callsQuery,
        (snapshot) => {
          try {
            const calls: Call[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              calls.push({
                id: doc.id,
                type: data.type || 'voice',
                participants: data.participants || [],
                status: data.status || 'ended',
                timestamp: data.timestamp?.toDate() || new Date(),
                duration: data.duration,
                callerName: data.callerName,
                callerAvatar: data.callerAvatar,
              });
            });

            console.log(`📞 Loaded ${calls.length} calls`);
            onCallsUpdate(calls);
          } catch (error) {
            console.error('❌ Error processing calls data:', error);
            if (onError) {
              onError('Error processing calls data');
            }
          }
        },
        (error) => {
          console.error('❌ Error listening for calls:', error);
          
          // Handle specific Firebase errors
          if (error.code === 'permission-denied') {
            console.error('❌ Permission denied - check Firestore rules');
            if (onError) {
              onError('Permission denied - please check your account permissions');
            }
          } else if (error.code === 'unavailable') {
            console.error('❌ Firestore unavailable - network issue');
            if (onError) {
              onError('Network unavailable - please check your connection');
            }
          } else {
            console.error('❌ Unknown error:', error.message);
            if (onError) {
              onError(`Error: ${error.message}`);
            }
          }
        }
      );

      console.log('✅ Calls listener started successfully');
    } catch (error) {
      console.error('❌ Failed to start calls listener:', error);
      if (onError) {
        onError('Failed to start calls listener');
      }
    }
  }

  /**
   * Stop listening for calls
   */
  stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      console.log('🛑 Calls listener stopped');
    }
  }

  /**
   * Get mock calls data for development
   */
  getMockCalls(): Call[] {
    return [
      {
        id: '1',
        type: 'video',
        participants: ['user1', 'user2'],
        status: 'ended',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        duration: 1200, // 20 minutes
        callerName: 'John Doe',
      },
      {
        id: '2',
        type: 'voice',
        participants: ['user1', 'user3'],
        status: 'missed',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        callerName: 'Jane Smith',
      },
    ];
  }
}

export const callsService = new CallsService();
