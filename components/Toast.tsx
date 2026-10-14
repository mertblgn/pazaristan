import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, type = 'error', visible, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const backgroundColor = type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6';

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }], backgroundColor }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});