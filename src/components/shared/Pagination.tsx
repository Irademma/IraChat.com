import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface PaginationProps {
  path: string;
  pageNumber: number;
  isNext: boolean;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  path,
  pageNumber,
  isNext,
  onPageChange,
}: PaginationProps) {
  const handlePrevious = () => {
    if (pageNumber > 1 && onPageChange) {
      onPageChange(pageNumber - 1);
    }
  };

  const handleNext = () => {
    if (isNext && onPageChange) {
      onPageChange(pageNumber + 1);
    }
  };

  if (pageNumber === 1 && !isNext) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <View className="flex-row items-center justify-between mt-6 px-4">
      {/* Previous Button */}
      <TouchableOpacity
        onPress={handlePrevious}
        disabled={pageNumber <= 1}
        className={`px-4 py-2 rounded-lg ${
          pageNumber <= 1
            ? 'bg-gray-100'
            : 'bg-blue-500'
        }`}
      >
        <Text
          className={pageNumber <= 1 ? 'text-gray-400' : 'text-white'}
          style={{ fontWeight: '500' }}
        >
          Previous
        </Text>
      </TouchableOpacity>

      {/* Page Info */}
      <View className="flex-row items-center">
        <Text className="text-gray-600 text-sm">
          Page {pageNumber}
        </Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        onPress={handleNext}
        disabled={!isNext}
        className={`px-4 py-2 rounded-lg ${
          !isNext
            ? 'bg-gray-100'
            : 'bg-blue-500'
        }`}
      >
        <Text
          className={!isNext ? 'text-gray-400' : 'text-white'}
          style={{ fontWeight: '500' }}
        >
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
}
