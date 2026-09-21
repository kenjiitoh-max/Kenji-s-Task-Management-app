import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, FlatList, FlatListProps, LayoutChangeEvent, PanResponder, View } from 'react-native';
import { moveItem, targetIndex } from './dragMath';

const LONG_PRESS_MS = 350;
const MOVE_SLOP = 8;

type Props<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, dragging: boolean) => React.ReactNode;
  onPress: (item: T) => void;
  onLongPress: (item: T) => void;
  onReorder: (data: T[]) => void;
} & Pick<FlatListProps<T>, 'contentContainerStyle' | 'ListHeaderComponent' | 'ListEmptyComponent'>;

function Row<T>({ item, index, dragging, active, shift, translateY, onLayout, onPress, onLongPress, onDragStart, onDragMove, onDragEnd, children }: {
  item: T;
  index: number;
  dragging: boolean;
  active: boolean;
  shift: number;
  translateY: Animated.Value;
  onLayout: (index: number, event: LayoutChangeEvent) => void;
  onPress: (item: T) => void;
  onLongPress: (item: T) => void;
  onDragStart: (index: number) => void;
  onDragMove: (dy: number) => void;
  onDragEnd: (moved: boolean) => void;
  children: React.ReactNode;
}) {
  const [gesture] = useState<{ timer: ReturnType<typeof setTimeout> | null; lifted: boolean; moved: boolean }>({ timer: null, lifted: false, moved: false });
  const [latest] = useState<{ index: number; item: T; onPress: (item: T) => void; onLongPress: (item: T) => void; onDragStart: (index: number) => void; onDragMove: (dy: number) => void; onDragEnd: (moved: boolean) => void }>({ index, item, onPress, onLongPress, onDragStart, onDragMove, onDragEnd });
  Object.assign(latest, { index, item, onPress, onLongPress, onDragStart, onDragMove, onDragEnd });
  const [responder] = useState(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => !gesture.lifted,
    onPanResponderGrant: () => {
      gesture.lifted = false;
      gesture.moved = false;
      gesture.timer = setTimeout(() => {
        gesture.lifted = true;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        latest.onDragStart(latest.index);
      }, LONG_PRESS_MS);
    },
    onPanResponderMove: (_event, state) => {
      if (!gesture.lifted) {
        if ((Math.abs(state.dy) > MOVE_SLOP || Math.abs(state.dx) > MOVE_SLOP) && gesture.timer) {
          clearTimeout(gesture.timer);
          gesture.timer = null;
        }
        return;
      }
      if (Math.abs(state.dy) > MOVE_SLOP) gesture.moved = true;
      latest.onDragMove(state.dy);
    },
    onPanResponderRelease: () => {
      const wasLifted = gesture.lifted;
      const hadTimer = gesture.timer !== null;
      if (gesture.timer) clearTimeout(gesture.timer);
      gesture.timer = null;
      gesture.lifted = false;
      if (wasLifted) {
        latest.onDragEnd(gesture.moved);
        if (!gesture.moved) latest.onLongPress(latest.item);
      } else if (hadTimer) {
        latest.onPress(latest.item);
      }
    },
    onPanResponderTerminate: () => {
      if (gesture.timer) clearTimeout(gesture.timer);
      gesture.timer = null;
      if (gesture.lifted) latest.onDragEnd(gesture.moved);
      gesture.lifted = false;
    },
  }));
  const style = active
    ? { transform: [{ translateY }, { scale: 1.03 }], zIndex: 10, elevation: 10, opacity: 0.95 }
    : { transform: [{ translateY: shift }], opacity: dragging ? 0.85 : 1 };
  return (
    <Animated.View {...responder.panHandlers} onLayout={(event) => onLayout(index, event)} style={style}>
      {children}
    </Animated.View>
  );
}

export function DraggableList<T>({ data, keyExtractor, renderItem, onPress, onLongPress, onReorder, contentContainerStyle, ListHeaderComponent, ListEmptyComponent }: Props<T>) {
  const heights = useRef<number[]>([]);
  const translateY = useRef(new Animated.Value(0)).current;
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);
  const fromRef = useRef<number | null>(null);
  const toRef = useRef<number | null>(null);

  const onLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    heights.current[index] = event.nativeEvent.layout.height;
  }, []);
  const onDragStart = useCallback((index: number) => {
    fromRef.current = index;
    toRef.current = index;
    translateY.setValue(0);
    setFrom(index);
    setTo(index);
  }, [translateY]);
  const onDragMove = useCallback((dy: number) => {
    if (fromRef.current === null) return;
    translateY.setValue(dy);
    const next = targetIndex(heights.current.slice(0, data.length), fromRef.current, dy);
    if (next !== toRef.current) {
      toRef.current = next;
      setTo(next);
      void Haptics.selectionAsync();
    }
  }, [data.length, translateY]);
  const onDragEnd = useCallback((moved: boolean) => {
    const start = fromRef.current;
    const end = toRef.current;
    fromRef.current = null;
    toRef.current = null;
    setFrom(null);
    setTo(null);
    translateY.setValue(0);
    if (moved && start !== null && end !== null && start !== end) onReorder(moveItem(data, start, end));
  }, [data, onReorder, translateY]);

  const shiftFor = (index: number): number => {
    if (from === null || to === null || index === from) return 0;
    const dragged = heights.current[from] ?? 0;
    if (from < to && index > from && index <= to) return -dragged;
    if (from > to && index >= to && index < from) return dragged;
    return 0;
  };

  return (
    <FlatList
      contentContainerStyle={contentContainerStyle}
      data={data}
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      renderItem={({ item, index }) => (
        <Row
          active={from === index}
          dragging={from !== null}
          index={index}
          item={item}
          onDragEnd={onDragEnd}
          onDragMove={onDragMove}
          onDragStart={onDragStart}
          onLayout={onLayout}
          onLongPress={onLongPress}
          onPress={onPress}
          shift={shiftFor(index)}
          translateY={translateY}
        >
          <View pointerEvents="none">{renderItem(item, from === index)}</View>
        </Row>
      )}
      scrollEnabled={from === null}
    />
  );
}
