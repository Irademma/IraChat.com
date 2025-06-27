import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PostCard from "../src/components/cards/PostCard";
import Pagination from "../src/components/shared/Pagination";

interface Post {
  _id: string;
  text: string;
  author: {
    _id: string;
    name: string;
    username: string;
    image: string;
  };
  createdAt: string;
  children: any[];
  likes: string[];
  isOwner: boolean;
  repostOf?: any;
  parentId?: string;
  group?: any;
}

// interface SearchParams {
//   page?: number;
// }

export default function SocialFeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUserAndPosts();
  }, [currentPage]);

  const loadUserAndPosts = async () => {
    try {
      // Load current user data
      const userData = localStorage.getItem("iraChat_currentUser");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }

      // Load posts (following your example pattern)
      const result = await fetchPosts(currentPage, 3);
      const postsWithOwnership = await Promise.all(
        result.posts.map(async (post: any) => {
          const isOwner = currentUser
            ? await isPostByUser(currentUser._id || currentUser.id, post._id)
            : false;
          return { ...post, isOwner };
        }),
      );

      setPosts(postsWithOwnership);
      setHasNextPage(result.isNext);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Following your example's fetchPosts pattern
  const fetchPosts = async (page: number, limit: number) => {
    // Mock implementation - in real app, this would fetch from your backend
    const mockPosts = [
      {
        _id: "1",
        text: "Welcome to IraChat Social! 🎉 Share your thoughts and connect with friends.",
        author: {
          _id: "system",
          name: "IraChat Team",
          username: "irachat",
          image: "",
        },
        createdAt: new Date().toISOString(),
        children: [
          { _id: "comment1", text: "Great app!", author: "user1" },
          { _id: "comment2", text: "Love it!", author: "user2" },
        ],
        likes: ["user1", "user2", "user3"],
        repostOf: null,
        parentId: null,
        group: null,
      },
      {
        _id: "2",
        text: "Just shared a beautiful sunset photo! 🌅 Nature never fails to amaze me.",
        author: {
          _id: "user1",
          name: "John Doe",
          username: "johndoe",
          image: "",
        },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        children: [{ _id: "comment3", text: "Beautiful!", author: "user2" }],
        likes: ["user2", "user3"],
        repostOf: null,
        parentId: null,
        group: null,
      },
      {
        _id: "3",
        text: "Working on some exciting new features for IraChat! Stay tuned for updates. 💻✨",
        author: {
          _id: "dev1",
          name: "Sarah Wilson",
          username: "sarahdev",
          image: "",
        },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        children: [],
        likes: ["user1"],
        repostOf: null,
        parentId: null,
        group: null,
      },
    ];

    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = mockPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      isNext: endIndex < mockPosts.length,
    };
  };

  // Following your example's isPostByUser pattern
  const isPostByUser = async (userId: string, postId: string) => {
    // Mock implementation - in real app, this would check if user owns the post
    // For demo, let's say user owns posts with specific IDs
    return userId === "current_user_id" && postId === "2";
  };

  const handleCreatePost = () => {
    Alert.prompt(
      "Create Post",
      "What's on your mind?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Post",
          onPress: (text) => {
            if (text && text.trim()) {
              const newPost: Post = {
                _id: Date.now().toString(),
                text: text.trim(),
                author: {
                  _id: "current_user_id",
                  name: "You",
                  username: "currentuser",
                  image: "",
                },
                createdAt: new Date().toISOString(),
                children: [],
                likes: [],
                repostOf: null,
                parentId: undefined,
                group: null,
                isOwner: true,
              };

              // Add to the beginning of posts
              setPosts(prevPosts => [newPost, ...prevPosts]);
              Alert.alert("Success", "Your post has been shared!");
            }
          },
        },
      ],
      "plain-text",
      "",
      "default"
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadUserAndPosts();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-500 px-6 py-4 pt-12">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl" style={{ fontWeight: "700" }}>
            Social Feed
          </Text>
          <TouchableOpacity
            onPress={handleCreatePost}
            className="bg-white/20 p-2 rounded-full"
          >
            <Text className="text-white text-lg">✏️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content - Following your example pattern */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6 px-4">
          {/* Following your example's conditional rendering */}
          {posts.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center">
              <Image
                source={require("../assets/images/comment.png")}
                className="w-16 h-16 mb-4"
                style={{ tintColor: "#9CA3AF" }}
                resizeMode="contain"
              />
              <Text
                className="text-gray-500 text-lg text-center"
                style={{ fontWeight: "500" }}
              >
                No posts found
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Be the first to share something!
              </Text>
              <TouchableOpacity
                onPress={handleCreatePost}
                className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
              >
                <Text className="text-white" style={{ fontWeight: "500" }}>
                  Create Post
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Following your example's post mapping */}
              {posts.map((post) => (
                <View className="mb-4" key={post._id}>
                  <PostCard
                    id={post._id}
                    currentUserId={currentUser?.id || ""}
                    owner={post.isOwner}
                    content={post.text}
                    author={post.author}
                    createdAt={post.createdAt}
                    comments={post.children}
                    likes={post.likes}
                    liked={currentUser?.likedPosts?.includes(post._id) || false}
                  />
                </View>
              ))}

              {/* Following your example's Pagination */}
              <Pagination
                path="/social-feed"
                pageNumber={currentPage}
                isNext={hasNextPage}
                onPageChange={handlePageChange}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
