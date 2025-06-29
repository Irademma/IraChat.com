import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  where,
  limit,
} from 'firebase/firestore';
import { db } from './firebaseSimple';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: 'bug' | 'feature' | 'account' | 'billing' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  adminNotes?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  userSatisfaction: number;
}

class RealSupportService {
  /**
   * Submit a support ticket
   */
  async submitTicket(
    userId: string,
    userName: string,
    userEmail: string,
    ticketData: {
      subject: string;
      description: string;
      category: 'bug' | 'feature' | 'account' | 'billing' | 'other';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      attachments?: string[];
    }
  ): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    try {
      const ticketRef = collection(db, 'support_tickets');
      const ticketDoc = await addDoc(ticketRef, {
        userId,
        userName,
        userEmail,
        ...ticketData,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Support ticket submitted:', ticketDoc.id);
      return { success: true, ticketId: ticketDoc.id };
    } catch (error) {
      console.error('❌ Error submitting support ticket:', error);
      return { success: false, error: 'Failed to submit support ticket' };
    }
  }

  /**
   * Get user's support tickets
   */
  async getUserTickets(userId: string): Promise<{ success: boolean; tickets?: SupportTicket[]; error?: string }> {
    try {
      const ticketsRef = collection(db, 'support_tickets');
      const q = query(
        ticketsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tickets: SupportTicket[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      })) as SupportTicket[];

      return { success: true, tickets };
    } catch (error) {
      console.error('❌ Error getting user tickets:', error);
      return { success: false, error: 'Failed to get support tickets' };
    }
  }

  /**
   * Get FAQ items
   */
  async getFAQs(category?: string): Promise<{ success: boolean; faqs?: FAQItem[]; error?: string }> {
    try {
      const faqsRef = collection(db, 'faqs');
      let q = query(faqsRef, orderBy('helpful', 'desc'), limit(50));
      
      if (category) {
        q = query(faqsRef, where('category', '==', category), orderBy('helpful', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      const faqs: FAQItem[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as FAQItem[];

      return { success: true, faqs };
    } catch (error) {
      console.error('❌ Error getting FAQs:', error);
      return { success: false, error: 'Failed to get FAQs' };
    }
  }

  /**
   * Rate FAQ helpfulness
   */
  async rateFAQ(faqId: string, helpful: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const faqRef = doc(db, 'faqs', faqId);
      const faqDoc = await getDoc(faqRef);
      
      if (!faqDoc.exists()) {
        return { success: false, error: 'FAQ not found' };
      }

      const currentData = faqDoc.data();
      const updates = helpful 
        ? { helpful: (currentData.helpful || 0) + 1 }
        : { notHelpful: (currentData.notHelpful || 0) + 1 };

      await setDoc(faqRef, {
        ...currentData,
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error rating FAQ:', error);
      return { success: false, error: 'Failed to rate FAQ' };
    }
  }

  /**
   * Search FAQs
   */
  async searchFAQs(searchTerm: string): Promise<{ success: boolean; faqs?: FAQItem[]; error?: string }> {
    try {
      // In a real implementation, you'd use a search service like Algolia
      // For now, we'll do a simple client-side search after fetching all FAQs
      const result = await this.getFAQs();
      
      if (!result.success || !result.faqs) {
        return result;
      }

      const searchTermLower = searchTerm.toLowerCase();
      const filteredFAQs = result.faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTermLower) ||
        faq.answer.toLowerCase().includes(searchTermLower) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      );

      return { success: true, faqs: filteredFAQs };
    } catch (error) {
      console.error('❌ Error searching FAQs:', error);
      return { success: false, error: 'Failed to search FAQs' };
    }
  }

  /**
   * Get support statistics
   */
  async getSupportStats(): Promise<{ success: boolean; stats?: SupportStats; error?: string }> {
    try {
      const statsRef = doc(db, 'support_stats', 'global');
      const statsDoc = await getDoc(statsRef);
      
      if (!statsDoc.exists()) {
        // Return default stats if none exist
        const defaultStats: SupportStats = {
          totalTickets: 0,
          openTickets: 0,
          resolvedTickets: 0,
          averageResponseTime: 24, // hours
          userSatisfaction: 4.5, // out of 5
        };
        return { success: true, stats: defaultStats };
      }

      const stats = statsDoc.data() as SupportStats;
      return { success: true, stats };
    } catch (error) {
      console.error('❌ Error getting support stats:', error);
      return { success: false, error: 'Failed to get support statistics' };
    }
  }

  /**
   * Report a bug
   */
  async reportBug(
    userId: string,
    userName: string,
    userEmail: string,
    bugData: {
      title: string;
      description: string;
      steps: string;
      expectedBehavior: string;
      actualBehavior: string;
      deviceInfo: string;
      appVersion: string;
      screenshots?: string[];
    }
  ): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    try {
      const description = `
**Bug Description:**
${bugData.description}

**Steps to Reproduce:**
${bugData.steps}

**Expected Behavior:**
${bugData.expectedBehavior}

**Actual Behavior:**
${bugData.actualBehavior}

**Device Information:**
${bugData.deviceInfo}

**App Version:**
${bugData.appVersion}
      `.trim();

      return await this.submitTicket(userId, userName, userEmail, {
        subject: `Bug Report: ${bugData.title}`,
        description,
        category: 'bug',
        priority: 'medium',
        attachments: bugData.screenshots,
      });
    } catch (error) {
      console.error('❌ Error reporting bug:', error);
      return { success: false, error: 'Failed to report bug' };
    }
  }

  /**
   * Request a feature
   */
  async requestFeature(
    userId: string,
    userName: string,
    userEmail: string,
    featureData: {
      title: string;
      description: string;
      useCase: string;
      priority: 'low' | 'medium' | 'high';
    }
  ): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    try {
      const description = `
**Feature Request:**
${featureData.description}

**Use Case:**
${featureData.useCase}

**Priority:** ${featureData.priority}
      `.trim();

      return await this.submitTicket(userId, userName, userEmail, {
        subject: `Feature Request: ${featureData.title}`,
        description,
        category: 'feature',
        priority: featureData.priority,
      });
    } catch (error) {
      console.error('❌ Error requesting feature:', error);
      return { success: false, error: 'Failed to request feature' };
    }
  }

  /**
   * Get contact information
   */
  getContactInfo() {
    return {
      email: 'support@irachat.com',
      phone: '+1-800-IRA-CHAT',
      website: 'https://irachat.com/support',
      socialMedia: {
        twitter: '@IraChat',
        facebook: 'IraChatApp',
        instagram: '@irachatapp',
      },
      businessHours: 'Monday - Friday, 9 AM - 6 PM EST',
      emergencySupport: '24/7 for critical issues',
    };
  }
}

export const realSupportService = new RealSupportService();
