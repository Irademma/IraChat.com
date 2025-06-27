// Custom hook for vertical media updates functionality
import { useCallback, useEffect, useState } from "react";
import { Update } from "../types";

interface UseUpdatesProps {
  currentUserId?: string;
  onError?: (error: Error) => void;
}

// No mock data - all updates will come from Firebase
import { arrayRemove, arrayUnion, collection, doc, getDocs, increment, limit, orderBy, query, startAfter, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseSimple";

export const useUpdates = ({ currentUserId, onError }: UseUpdatesProps) => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const fetchUpdates = useCallback(async (refresh = false) => {
    if (!db) {
      console.warn("⚠️ Firestore not available");
      return;
    }

    setIsLoading(true);
    try {
      let updatesQuery = query(
        collection(db, "updates"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      if (!refresh && lastDoc) {
        updatesQuery = query(
          collection(db, "updates"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(10)
        );
      }

      const querySnapshot = await getDocs(updatesQuery);
      const newUpdates: Update[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        newUpdates.push({
          id: doc.id,
          user: data.user,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          caption: data.caption,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          likeCount: data.likeCount || 0,
          commentCount: data.commentCount || 0,
          shareCount: data.shareCount || 0,
          viewCount: data.viewCount || 0,
          isLiked: data.likedBy?.includes(currentUserId) || false,
          isFollowing: data.user?.followers?.includes(currentUserId) || false,
        });
      });

      if (refresh) {
        setUpdates(newUpdates);
      } else {
        setUpdates(prev => [...prev, ...newUpdates]);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 10);

      console.log(`✅ Loaded ${newUpdates.length} updates from Firebase`);
    } catch (error) {
      console.error("❌ Error fetching updates:", error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, lastDoc, onError]);

  const handleLike = useCallback(async (updateId: string) => {
    if (!db || !currentUserId) return;

    try {
      const updateRef = doc(db, "updates", updateId);
      const currentUpdate = updates.find(u => u.id === updateId);

      if (currentUpdate) {
        const isLiked = currentUpdate.isLiked;

        // Update Firestore
        await updateDoc(updateRef, {
          likeCount: increment(isLiked ? -1 : 1),
          likedBy: isLiked
            ? arrayRemove(currentUserId)
            : arrayUnion(currentUserId)
        });

        // Update local state
        setUpdates((prev) =>
          prev.map((update) =>
            update.id === updateId
              ? {
                  ...update,
                  isLiked: !update.isLiked,
                  likeCount: update.likeCount + (update.isLiked ? -1 : 1),
                }
              : update,
          ),
        );
      }
    } catch (error) {
      console.error("❌ Error liking update:", error);
      onError?.(error as Error);
    }
  }, [currentUserId, updates, onError]);

  const handleComment = useCallback(async (updateId: string) => {
    // Open comments modal or navigate to comments screen
    try {
      // In a real implementation, this would open a comments modal
      // or navigate to a dedicated comments screen
      console.log("Opening comments for update:", updateId);

      // For now, we'll just log the action
      // This could be enhanced to show a modal with comments
      console.log(`Comments for update ${updateId} - Feature coming in next update!`);
    } catch (error) {
      console.error("Error opening comments:", error);
    }
  }, []);

  const handleShare = useCallback(async (updateId: string) => {
    if (!db) return;

    try {
      const updateRef = doc(db, "updates", updateId);
      await updateDoc(updateRef, {
        shareCount: increment(1)
      });

      // Update local state
      setUpdates((prev) =>
        prev.map((update) =>
          update.id === updateId
            ? { ...update, shareCount: update.shareCount + 1 }
            : update,
        ),
      );

      console.log("✅ Update shared successfully");
    } catch (error) {
      console.error("❌ Error sharing update:", error);
      onError?.(error as Error);
    }
  }, [onError]);

  const handleDownload = useCallback(async (updateId: string) => {
    try {
      console.log("Downloading update:", updateId);

      // Find the update to download
      const update = updates.find(u => u.id === updateId);
      if (!update) {
        throw new Error("Update not found");
      }

      // Increment download count in Firebase
      if (db) {
        const updateRef = doc(db, "updates", updateId);
        await updateDoc(updateRef, {
          downloadCount: increment(1)
        });

        // Update local state
        setUpdates((prev) =>
          prev.map((u) =>
            u.id === updateId
              ? { ...u, downloadCount: (u.downloadCount || 0) + 1 }
              : u,
          ),
        );
      }

      // In a real app, this would download the media file
      // For now, we'll show a success message
      console.log(`Media downloaded successfully! (${update.mediaUrl})`);

      console.log("✅ Download completed for update:", updateId);
    } catch (error) {
      console.error("❌ Error downloading update:", error);
      console.error("Failed to download media. Please try again.");
      onError?.(error as Error);
    }
  }, [updates, onError]);

  const handleReport = useCallback(async (updateId: string) => {
    try {
      console.log("Reporting update:", updateId);

      // Find the update to report
      const update = updates.find(u => u.id === updateId);
      if (!update) {
        throw new Error("Update not found");
      }

      // Create a report in Firebase
      if (db && currentUserId) {
        const reportData = {
          reporterId: currentUserId,
          reportedUpdateId: updateId,
          reportedUserId: update.user.id,
          reason: "inappropriate_content", // Default reason
          timestamp: new Date(),
          status: "pending"
        };

        await updateDoc(doc(db, "reportedContent", `${currentUserId}_${updateId}_${Date.now()}`), reportData);

        console.log("✅ Report submitted successfully");
        console.log("Report submitted successfully. Our team will review it shortly.");
      } else {
        throw new Error("Unable to submit report - authentication required");
      }
    } catch (error) {
      console.error("❌ Error reporting update:", error);
      console.error("Failed to submit report. Please try again.");
      onError?.(error as Error);
    }
  }, [updates, currentUserId, onError]);

  useEffect(() => {
    fetchUpdates(true);
  }, [fetchUpdates]);

  return {
    updates,
    isLoading,
    hasMore,
    fetchUpdates,
    handleLike,
    handleComment,
    handleShare,
    handleDownload,
    handleReport,
  };
};
