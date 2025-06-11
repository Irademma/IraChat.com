import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const FastLoader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="flash" size={32} color="#3B82F6" />
        <Text style={styles.text}>IraChat</Text>
        <View style={styles.progressBar}>
          <View style={styles.progress} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  content: {
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 20,
  },
  progressBar: {
    width: 120,
    height: 3,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
});