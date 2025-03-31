import { Animated, TouchableOpacity } from "react-native";
import React, { useRef } from "react";

const ExpandableButton = ({ onPress, style, children }) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnimation, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 100,
      bounciness: 0,
    }).start();
  };

  const handlePress = (event) => {
    Animated.sequence([
      Animated.spring(scaleAnimation, {
        toValue: 1.1,
        useNativeDriver: true,
        speed: 100,
        bounciness: 0,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        speed: 100,
        bounciness: 0,
      })
    ]).start();

    if (onPress) {
      onPress(event);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPress={handlePress}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ExpandableButton;
