import React, { memo, useCallback } from "react";
import { FlatList, FlatListProps } from "react-native";

interface OptimizedListProps extends Omit<FlatListProps<any>, "renderItem"> {
  data: any[];
  renderItem: ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => React.ReactElement;
  itemHeight?: number;
}

const OptimizedList = memo<OptimizedListProps>(
  ({ data, renderItem, itemHeight = 80, ...props }) => {
    const getItemLayout = useCallback(
      (data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),
      [itemHeight],
    );

    const keyExtractor = useCallback(
      (item: any, index: number) => item.id?.toString() || index.toString(),
      [],
    );

    const memoizedRenderItem = useCallback(
      ({ item, index }: { item: any; index: number }) =>
        renderItem({ item, index }),
      [renderItem],
    );

    return (
      <FlatList
        {...props}
        data={data}
        renderItem={memoizedRenderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        disableVirtualization={false}
      />
    );
  },
);

OptimizedList.displayName = "OptimizedList";

export default OptimizedList;
