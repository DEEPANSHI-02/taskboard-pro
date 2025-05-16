import { auth } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';

/**
 * Service for handling user-related operations
 */
class UserService {
  /**
   * Fetches the user profile from Firestore
   * @param {string} userId - The ID of the user to fetch
   * @returns {Promise<Object>} - The user profile data
   */
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        console.log('No user profile found for this user');
        return {};
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  /**
   * Creates a new user profile in Firestore after registration
   * @param {string} userId - The ID of the user
   * @param {Object} userData - Basic user data
   * @returns {Promise<void>}
   */
  async createUserProfile(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Default profile structure
      const profileData = {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        bio: '',
        jobTitle: '',
        phone: '',
        timeZone: 'UTC',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        notifications: {
          taskAssigned: true,
          taskStatusChanged: true,
          commentsMentions: true,
          projectInvites: true,
          dailyDigest: false,
          weeklyReport: true
        },
        preferences: {
          darkMode: false,
          compactView: false,
          autoAssignDueDate: true,
          defaultProjectView: 'kanban',
          language: 'en'
        }
      };
      
      await setDoc(userRef, profileData);
      return profileData;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Updates the user profile in Firestore
   * @param {string} userId - The ID of the user
   * @param {Object} profileData - The profile data to update
   * @returns {Promise<void>}
   */
  async updateUserProfile(userId, profileData) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Update the timestamp
      profileData.updatedAt = serverTimestamp();
      
      await updateDoc(userRef, profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Updates user settings such as notifications and preferences
   * @param {string} userId - The ID of the user
   * @param {Object} settings - The settings to update
   * @returns {Promise<void>}
   */
  async updateUserSettings(userId, settings) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Add a timestamp to track when settings were updated
      settings.updatedAt = serverTimestamp();
      
      await updateDoc(userRef, settings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }
  
  /**
   * Updates the user's last login timestamp
   * @param {string} userId - The ID of the user
   * @returns {Promise<void>}
   */
  async updateLastLogin(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Not throwing here as this is non-critical
    }
  }
  
  /**
   * Adds a project to the user's recent projects list
   * @param {string} userId - The ID of the user
   * @param {string} projectId - The ID of the project
   * @returns {Promise<void>}
   */
  async addRecentProject(userId, projectId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        recentProjects: arrayUnion(projectId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding recent project:', error);
      throw error;
    }
  }
  
  /**
   * Gets all users who match specific criteria (for team search, etc.)
   * @param {Array} emailList - Optional list of emails to filter by
   * @returns {Promise<Array>} - Array of matching user profiles
   */
  async findUsers(emailList = []) {
    try {
      // This is a simplified implementation
      // In a real app, you'd use a more efficient query
      // but for simplicity, we're just returning placeholders
      
      return emailList.map(email => ({
        email,
        displayName: 'User',
        photoURL: '',
        uid: Math.random().toString(36).substring(2)
      }));
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }
}

export const userService = new UserService();