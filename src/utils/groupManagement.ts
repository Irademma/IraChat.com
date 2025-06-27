import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { Alert, Clipboard, Share } from "react-native";
import { db } from '../services/firebaseSimple';
import { GroupChat } from "../types/groupChat";
import { GroupMemberPreferences } from "../types/index";

export const defaultMemberPreferences: GroupMemberPreferences = {
  notifications: {
    messages: true,
    mentions: true,
    reactions: true,
  },
  privacy: {
    readReceipts: true,
    lastSeen: true,
    profilePhoto: true,
  },
  media: {
    autoDownload: true,
    quality: "medium" as const,
  },
  isMuted: false,
  isArchived: false,
  isLocked: false,
  hiddenMessages: [],
  hiddenUpdates: [],
};

export const handleGroupAction = async (
  action: string,
  groupId: string,
  userId: string,
  isAdmin: boolean,
  onAction: (action: string, groupId: string, userId: string) => Promise<void>,
) => {
  try {
    switch (action) {
      case "mute":
        await onAction(action, groupId, userId);
        Alert.alert(
          "Group Muted",
          "You will no longer receive notifications from this group.",
        );
        break;
      case "unmute":
        await onAction(action, groupId, userId);
        Alert.alert(
          "Group Unmuted",
          "You will now receive notifications from this group.",
        );
        break;
      case "archive":
        await onAction(action, groupId, userId);
        Alert.alert("Group Archived", "This group has been archived.");
        break;
      case "unarchive":
        await onAction(action, groupId, userId);
        Alert.alert("Group Unarchived", "This group has been unarchived.");
        break;
      case "lock":
        if (!isAdmin) {
          Alert.alert(
            "Permission Denied",
            "Only group admins can lock the group.",
          );
          return;
        }
        await onAction(action, groupId, userId);
        Alert.alert(
          "Group Locked",
          "Only admins can send messages in this group now.",
        );
        break;
      case "unlock":
        if (!isAdmin) {
          Alert.alert(
            "Permission Denied",
            "Only group admins can unlock the group.",
          );
          return;
        }
        await onAction(action, groupId, userId);
        Alert.alert(
          "Group Unlocked",
          "All members can now send messages in this group.",
        );
        break;
      case "block":
        if (!isAdmin) {
          Alert.alert(
            "Permission Denied",
            "Only group admins can block members.",
          );
          return;
        }
        await onAction(action, groupId, userId);
        Alert.alert(
          "Member Blocked",
          "This member can no longer participate in the group until unblocked by an admin.",
        );
        break;
      case "unblock":
        if (!isAdmin) {
          Alert.alert(
            "Permission Denied",
            "Only group admins can unblock members.",
          );
          return;
        }
        await onAction(action, groupId, userId);
        Alert.alert(
          "Member Unblocked",
          "This member can now participate in the group again.",
        );
        break;
      case "report":
        await onAction(action, groupId, userId);
        Alert.alert(
          "Group Reported",
          "Thank you for your report. We will review it shortly.",
        );
        break;
      case "unreport":
        await onAction(action, groupId, userId);
        Alert.alert("Report Removed", "Your report has been removed.");
        break;
      case "share":
        await shareGroupLink(groupId);
        break;
      case "copyLink":
        await copyGroupLink(groupId);
        break;
      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    console.error("Error handling group action:", error);
    Alert.alert("Error", "Failed to perform the requested action.");
    throw error;
  }
};

export const handleContentHide = async (
  type: "message" | "update",
  contentId: string,
  userId: string,
  onHide: (
    type: "message" | "update",
    contentId: string,
    userId: string,
  ) => Promise<void>,
) => {
  try {
    await onHide(type, contentId, userId);
    Alert.alert(
      "Content Hidden",
      `This ${type} has been hidden from your view. You can unhide it in group settings.`,
    );
  } catch (error) {
    console.error("Error hiding content:", error);
    Alert.alert("Error", "Failed to hide the content.");
    throw error;
  }
};

export const handleAdminAction = async (
  action: "deleteMessage" | "editSettings" | "addAdmin" | "removeAdmin",
  groupId: string,
  targetId: string,
  isAdmin: boolean,
  onAction: (
    action: string,
    groupId: string,
    targetId: string,
  ) => Promise<void>,
) => {
  if (!isAdmin) {
    Alert.alert(
      "Permission Denied",
      "Only group admins can perform this action.",
    );
    return;
  }

  try {
    switch (action) {
      case "deleteMessage":
        await onAction(action, groupId, targetId);
        Alert.alert(
          "Message Deleted",
          "The message has been deleted for all members.",
        );
        break;
      case "editSettings":
        await onAction(action, groupId, targetId);
        Alert.alert("Settings Updated", "Group settings have been updated.");
        break;
      case "addAdmin":
        await onAction(action, groupId, targetId);
        Alert.alert("Admin Added", "The member has been promoted to admin.");
        break;
      case "removeAdmin":
        await onAction(action, groupId, targetId);
        Alert.alert("Admin Removed", "The member has been demoted from admin.");
        break;
      default:
        throw new Error("Invalid admin action");
    }
  } catch (error) {
    console.error("Error handling admin action:", error);
    Alert.alert("Error", "Failed to perform the requested action.");
    throw error;
  }
};

export const notifyNewMember = async (
  groupId: string,
  memberId: string,
  onNotify: (groupId: string, memberId: string) => Promise<void>,
) => {
  try {
    await onNotify(groupId, memberId);
    // The notification will be handled by the notification system
  } catch (error) {
    console.error("Error notifying new member:", error);
    throw error;
  }
};

export const shareGroupLink = async (groupId: string) => {
  try {
    const groupLink = await generateGroupLink(groupId);
    await Share.share({
      message: `Join my group on IraChat! ${groupLink}`,
      url: groupLink,
    });
  } catch (error) {
    console.error("Error sharing group link:", error);
    Alert.alert("Error", "Failed to share group link.");
    throw error;
  }
};

export const copyGroupLink = async (groupId: string) => {
  try {
    const groupLink = await generateGroupLink(groupId);
    await Clipboard.setString(groupLink);
    Alert.alert("Success", "Group link copied to clipboard");
  } catch (error) {
    console.error("Error copying group link:", error);
    Alert.alert("Error", "Failed to copy group link.");
    throw error;
  }
};

export const generateGroupLink = async (groupId: string): Promise<string> => {
  try {
    // Generate a unique invite link for the group
    const inviteCode = `${groupId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store invite code in Firebase for validation
    if (db) {
      await setDoc(doc(db, "groupInvites", inviteCode), {
        groupId,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true
      });
    }

    return `https://irachat.com/join/${inviteCode}`;
  } catch (error) {
    console.error("Error generating group link:", error);
    throw new Error("Failed to generate group invite link");
  }
};

export const getGroupDetails = async (
  groupId: string,
  userId: string,
): Promise<{
  info: GroupChat;
  stats: {
    memberCount: number;
    messageCount: number;
    mediaCount: number;
    adminCount: number;
  };
  recentActivity: Array<{
    type: "message" | "member" | "media";
    timestamp: number;
    description: string;
  }>;
}> => {
  try {
    if (!db) {
      throw new Error("Firebase not available");
    }

    // Get group info
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const groupInfo = { id: groupId, ...groupDoc.data() } as GroupChat;

    // Get group statistics
    const messagesSnapshot = await getDocs(collection(db, "groups", groupId, "messages"));
    const mediaMessages = messagesSnapshot.docs.filter(doc =>
      doc.data().type && ["image", "video", "audio", "document"].includes(doc.data().type)
    );

    const stats = {
      memberCount: groupInfo.members?.length || 0,
      messageCount: messagesSnapshot.size,
      mediaCount: mediaMessages.length,
      adminCount: groupInfo.admins?.length || 0,
    };

    // Get recent activity (last 10 messages)
    const recentMessagesQuery = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const recentSnapshot = await getDocs(recentMessagesQuery);
    const recentActivity = recentSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        type: data.type === "text" ? "message" as const : "media" as const,
        timestamp: data.timestamp?.toMillis() || Date.now(),
        description: data.type === "text" ? `New message: ${data.content?.substring(0, 50)}...` : `Media shared: ${data.type}`,
      };
    });

    return {
      info: groupInfo,
      stats,
      recentActivity,
    };
  } catch (error) {
    console.error("Error fetching group details:", error);
    throw error;
  }
};

export const handleGroupInvite = async (
  inviteCode: string,
  userId: string,
  onJoin: (groupId: string, userId: string) => Promise<void>,
) => {
  try {
    if (!db) {
      throw new Error("Firebase not available");
    }

    // Validate invite code
    const inviteDoc = await getDoc(doc(db, "groupInvites", inviteCode));
    if (!inviteDoc.exists()) {
      throw new Error("Invalid invite code");
    }

    const inviteData = inviteDoc.data();
    if (!inviteData.isActive || new Date() > inviteData.expiresAt.toDate()) {
      throw new Error("Invite code has expired");
    }

    const groupId = inviteData.groupId;

    // Check if group exists
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (!groupDoc.exists()) {
      throw new Error("Group no longer exists");
    }

    await onJoin(groupId, userId);
    Alert.alert("Success", "You have joined the group successfully!");
  } catch (error) {
    console.error("Error handling group invite:", error);
    Alert.alert("Error", error instanceof Error ? error.message : "Failed to join the group.");
    throw error;
  }
};

// All mock functions have been replaced with real Firebase implementations
