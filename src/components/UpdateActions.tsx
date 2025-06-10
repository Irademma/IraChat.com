// Vertical media right-side action buttons for updates
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Update } from '../types';
import { formatNumber } from '../utils/formatNumber';

interface UpdateActionsProps {
  update: Update;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onDownload: () => void;
  onProfilePress: () => void;
  likeAnimation?: Animated.Value;
}

export const UpdateActions: React.FC<UpdateActionsProps> = ({
  update,
  onLike,
  onComment,
  onShare,
  onDownload,
  onProfilePress,
  likeAnimation,
}) => {
  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <TouchableOpacity
        onPress={onProfilePress}
        style={styles.profileButton}
      >
        <Image
          source={{ uri: update.user.avatar }}
          style={styles.profilePicture}
        />
        <View style={styles.followButton}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Like Button */}
      <TouchableOpacity
        onPress={onLike}
        style={styles.actionButton}
      >
        <Animated.View style={[
          styles.actionIcon,
          likeAnimation && {
            transform: [{
              scale: likeAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.3, 1],
              }),
            }],
          },
        ]}>
          {update.isLiked ? (
            <Image
              source={require('../../assets/images/heart-red.png')}
              style={styles.heartIcon}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('../../assets/images/heart.png')}
              style={[styles.heartIcon, { tintColor: '#FFFFFF' }]}
              resizeMode="contain"
            />
          )}
        </Animated.View>
        <Text style={styles.actionText}>{formatNumber(update.likeCount)}</Text>
      </TouchableOpacity>

      {/* Comment Button */}
      <TouchableOpacity
        onPress={onComment}
        style={styles.actionButton}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.actionText}>{formatNumber(update.commentCount)}</Text>
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity
        onPress={onShare}
        style={styles.actionButton}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="share-social" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.actionText}>{formatNumber(update.shareCount)}</Text>
      </TouchableOpacity>

      {/* Download Button */}
      <TouchableOpacity
        onPress={onDownload}
        style={styles.actionButton}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="download" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.actionText}>Save</Text>
      </TouchableOpacity>

      {/* Music Info */}
      {update.musicTitle && (
        <View style={styles.musicContainer}>
          <View style={styles.musicIcon}>
            <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.musicText} numberOfLines={1}>
            {update.musicTitle}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  profileButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  followButton: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#FF2D55',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    marginBottom: 4,
  },
  heartIcon: {
    width: 28,
    height: 28,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
  },
  musicIcon: {
    marginRight: 6,
  },
  musicText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 100,
  },
});
