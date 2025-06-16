import { Alert } from "react-native";

interface DeleteOptions {
  onDelete: () => Promise<void>;
  onCancel?: () => void;
  title?: string;
  message?: string;
  type?: "update" | "message" | "media" | "file";
}

export const handleDelete = async ({
  onDelete,
  onCancel,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this?",
  type = "message",
}: DeleteOptions) => {
  const getMessage = () => {
    switch (type) {
      case "update":
        return "Are you sure you want to delete this update? This action cannot be undone.";
      case "message":
        return "Are you sure you want to delete this message? This action cannot be undone.";
      case "media":
        return "Are you sure you want to delete this media? This action cannot be undone.";
      case "file":
        return "Are you sure you want to delete this file? This action cannot be undone.";
      default:
        return message;
    }
  };

  Alert.alert(
    title,
    getMessage(),
    [
      {
        text: "Cancel",
        style: "cancel",
        onPress: onCancel,
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await onDelete();
          } catch (error) {
            Alert.alert("Error", "Failed to delete. Please try again.", [
              { text: "OK" },
            ]);
          }
        },
      },
    ],
    { cancelable: true },
  );
};
