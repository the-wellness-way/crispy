import React from "react";
import { useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import testData from "../data/testData.json";
import {
  Gesture,
  GestureDetector,
  FlatList,
  ScrollView,
} from "react-native-gesture-handler";

function clamp(value, lowerBound, upperBound) {
  "worklet";
  return Math.min(Math.max(value, lowerBound), upperBound);
}

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";

const MovableMenuItem = ({
  item,
  index,
  menuTitle,
  menuData,
  menuItemCount,
  positions,
  scrollX,
}) => {
  const left = useSharedValue(positions.value[index]);
  const [moving, setMoving] = useState(false);

  useAnimatedReaction(
    () => positions.value[index],
    (currentPosition, previousPosition) => {
      if (currentPosition !== previousPosition) {
        if (!moving) {
          left.value = withSpring(currentPosition * 120);
        }
      }
    },
    [moving]
  );

  const itemDragGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setMoving)(true);
    })
    .onUpdate((e) => {
      const positionX = e.absoluteX + scrollX.value;
      left.value = positionX;

      const itemWidth = 120;
      const newPosition = clamp(
        Math.round(positionX / itemWidth),
        0,
        menuData.length - 1
      );

      if (newPosition !== positions.value[index]) {
        positions.value = objectMove(
          positions.value,
          positions.value[index],
          newPosition
        );
      }
    })
    .onFinalize(() => {
      const finalPosition = positions.value[index] * 120;
      left.value = withSpring(finalPosition);
      runOnJS(setMoving)(false);
    });

  const itemAnimatedStyles = useAnimatedStyle(() => {
    return {
      left: left.value,
      backgroundColor: withSpring(moving ? "blue" : "yellow"),
      zIndex: moving ? 1 : 0,
      elevation: moving ? 1 : 0,
      opacity: moving ? 0.8 : 1,
    };
  });

  return (
    <GestureDetector gesture={itemDragGesture}>
      <Animated.View style={[styles.menuItem, itemAnimatedStyles]}>
        <Text style={styles.menuText}>
          {menuTitle}
          {index}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
};

const Menu = () => {
  const menuData = testData.rows.row1;
  const positions = useSharedValue(
    Object.fromEntries(menuData.map((_, index) => [index, index]))
  );

  const scrollX = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });
  const uniqueMenuItems = Array.from(new Set(menuData.map((item) => item)));

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      style={styles.container}
    >
      <Text style={styles.title}>Menu</Text>
      <View style={styles.menuContainer}>
        {uniqueMenuItems.map((item, index) => (
          <MovableMenuItem
            key={index}
            item={item}
            index={index}
            menuTitle={item[1]}
            menuData={menuData}
            menuItemCount={menuData.length}
            positions={positions}
            scrollX={scrollX}
          />
        ))}
      </View>
      <TouchableOpacity>
        <Text>Click Me</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "column",
    margin: "auto",
    width: 1200,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  menuContainer: {
    height: 120,
    position: "relative",
    marginBottom: 20,
  },
  menuItem: {
    position: "absolute",
    height: 120,
    width: 150,
    justifyContent: "center",
    alignItems: "center",
  },
});

function objectMove(object, from, to) {
  "worklet";
  const newObject = { ...object };

  for (const id in object) {
    if (object[id] === from) {
      newObject[id] = to;
    }

    if (object[id] === to) {
      newObject[id] = from;
    }
  }

  return newObject;
}