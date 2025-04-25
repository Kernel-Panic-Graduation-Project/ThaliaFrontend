import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const SpeechItem = ({ route }) => {
  const { speech } = route.params || {};
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format the date to a readable string
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format: "Apr 25, 2025, 12:49 AM"
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handlePlayPause = async () => {
    try {
      setLoading(true);
      // TODO: Implement audio playback logic here
      // This is just a placeholder to simulate audio loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!speech) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          {t('SpeechNotFound')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.name, { color: theme.textColor }]}>
          {speech.name}
        </Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>
              {t('Date')}:
            </Text>
            <Text style={[styles.metaValue, { color: theme.textColor }]}>
              {formatDate(speech.uploaded_at)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: isPlaying ? theme.secondary : theme.primary }
          ]}
          onPress={handlePlayPause}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.playButtonText}>
              {isPlaying ? t('Pause') : t('Play')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.transcriptTitle, { color: theme.textColor }]}>
          {t('Transcript')}
        </Text>
        <Text style={[styles.transcript, { color: theme.textColor }]}>
          {speech.transcript || t('NoTranscriptAvailable')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metaContainer: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  metaValue: {
    fontSize: 14,
  },
  playButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transcriptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  transcript: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default SpeechItem;