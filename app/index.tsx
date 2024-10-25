import React from 'react';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity  } from 'react-native';

import testData from '../data/testData.json';
import { Gesture, GestureDetector, FlatList, ScrollView } from 'react-native-gesture-handler';

function clamp(value, lowerBound, upperBound) {
    'worklet';
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
  } from 'react-native-reanimated';

  const MovableMenuItem = ({ item, index, menuTitle, menuData, menuItemCount, positions, scrollX }) => {
    console.log(positions.value)
    console.log(positions.value[index])
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const left = useSharedValue(positions.value[index]);
    const [moving, setMoving] = useState(false);

    console.log("left")
    console.log(left.value)

    useAnimatedReaction(
        () => positions.value[index],
        (currentPosition, previousPosition) => {
            if(currentPosition !== previousPosition) {
                if(!moving) {
                    left.value = withSpring(currentPosition);
                }
            }
        },
        [moving]
    );

    const itemDragGesture = Gesture.Pan()
        .onUpdate((e) => {
            runOnJS(setMoving)(true);

            const x = e.translationX;
            const y = e.translationY;
        })
        .onChange((e) => {
            const positionX = e.absoluteX + scrollX.value;

            left.value = withTiming(positionX, {
                duration: 16,
            });

            const itemWidth = 120;
            const newPosition = clamp(Math.round(positionX / itemWidth), 0, menuData.length - 1);;

            console.log("newPosition")
            console.log(newPosition)
            console.log(positions.value[index])

            if (newPosition !== positions.value[index]) {
                positions.value = objectMove(positions.value, positions.value[index], newPosition);
            }
        })
        .onEnd(() => {
            left.value = positions.value[index];
            runOnJS(setMoving)(false);
        });

    const itemAnimatedStyles = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            left: left.value,
            top: 0,
            backgroundColor: withSpring(moving ? 'blue' : 'yellow'),
            zIndex: moving ? 100 : -1,
            elevation: moving ? 100 : 0,
            height: 120,
            width: 120,
            opacity: moving ? 0.8 : 1,
        };
    });

    return (
        <GestureDetector gesture={itemDragGesture}>
            <Animated.View style={[itemAnimatedStyles]}>
                <Text
                    style={styles.menuText}>
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
        menuData.map((_, index) => index * 120) // Assuming each item is 120px wide
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
            style={styles.container}>
            <Text style={styles.title}>Menu</Text>
            <FlatList
                style={styles.FlatList}
                data={uniqueMenuItems}
                renderItem={({ item, index }) => <MovableMenuItem item={item} index={index} menuTitle={item[1]} menuData={menuData} menuItemCount={menuData.length} positions={positions} scrollX={scrollX}  />}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true} 
            />

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
        backgroundColor: '#fff',
        flexDirection: 'column',
        margin: 'auto',
        // i want a width of 1200px
        width: 1200,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    menuText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    FlatList: {
        width: '70%',
        height: 120,
        zIndex: -1,
    },
});

function objectMove(object, from, to) {
    'worklet';
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