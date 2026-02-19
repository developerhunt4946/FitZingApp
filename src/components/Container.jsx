import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING } from '../theme';

const Container = ({
  children,
  scroll = false,
  centerContent = false,
  style,
  backgroundColor = COLORS.background,
}) => {
  const content = (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  );

  if (scroll) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={centerContent && styles.centerContent}
          scrollEventThrottle={16}
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={[styles.container, { backgroundColor }, style]}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING['16'],
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Container;
