// packages/mobile/src/components/fade-in-view.tsx
import React, { useEffect, useRef } from "react"
import { Animated, type ViewStyle } from "react-native"

interface FadeInViewProps {
  delay?: number
  duration?: number
  translateY?: number
  style?: ViewStyle
  children: React.ReactNode
}

/**
 * Fades in + slides up children on mount.
 * Each element can have a different `delay` to create a staggered entrance.
 */
export function FadeInView({
  delay = 0,
  duration = 500,
  translateY = 20,
  style,
  children,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const translate = useRef(new Animated.Value(translateY)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        style,
        { opacity, transform: [{ translateY: translate }] },
      ]}
    >
      {children}
    </Animated.View>
  )
}
