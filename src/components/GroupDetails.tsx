import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { GroupChat } from "../types/groupChat";

interface GroupDetailsProps {
  group: GroupChat;
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
  onShare: () => void;
  onCopyLink: () => void;
  onViewMembers: () => void;
  onViewMedia: () => void;
}

export const GroupDetails: React.FC<GroupDetailsProps> = ({
  group,
  stats,
  recentActivity,
  onShare,
  onCopyLink,
  onViewMembers,
  onViewMedia,
}) => {
  const renderStatItem = (icon: string, label: string, value: number) => (
    <View style={styles.statItem}>
      <Ionicons name={icon as any} size={24} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderActivityItem = (activity: (typeof recentActivity)[0]) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case "message":
          return "chatbubble";
        case "member":
          return "person";
        case "media":
          return "image";
        default:
          return "ellipsis-horizontal";
      }
    };

    return (
      <View style={styles.activityItem}>
        <Ionicons
          name={getActivityIcon() as any}
          size={20}
          color={colors.textSecondary}
        />
        <Text style={styles.activityText}>{activity.description}</Text>
        <Text style={styles.activityTime}>
          {new Date(activity.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: group.photo }} style={styles.groupPhoto} />
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupDescription}>{group.description}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-social" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onCopyLink}>
          <Ionicons name="link" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Copy Link</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        {renderStatItem("people", "Members", stats.memberCount)}
        {renderStatItem("chatbubbles", "Messages", stats.messageCount)}
        {renderStatItem("images", "Media", stats.mediaCount)}
        {renderStatItem("shield-checkmark", "Admins", stats.adminCount)}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={onViewMembers}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>View Members</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={onViewMedia}>
            <Ionicons name="images" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>View Media</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        {recentActivity.map((activity, index) => (
          <React.Fragment key={index}>
            {renderActivityItem(activity)}
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButton: {
    alignItems: "center",
    padding: 12,
  },
  actionText: {
    marginTop: 4,
    fontSize: 14,
    color: colors.primary,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickAction: {
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: "45%",
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.text,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
