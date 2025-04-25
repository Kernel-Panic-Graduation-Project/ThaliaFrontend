import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const SpeechLibrary = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const [speeches, setSpeeches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSpeeches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with your actual API endpoint
      //const response = await fetch('http://localhost:8010/api/audio-files/getlist/');

      //console.log('Response:', response);
      
      //if (!response.ok) {
      //  throw new Error('Failed to fetch speech data');
      //}
      
      //const data = await response.json();

      // TODO: Replace with actual data fetching logic
      
      const data = [
        {
            "id": 1,
            "name": "Trump",
            "file": "/media/uploads/tmp6emn5dvu.wav",
            "transcript": "Today I stand before the United Nations General Assembly to share the extraordinary progress we've made.",
            "uploaded_at": "2025-04-25T00:49:57.705435Z"
        },
        {
          "id": 2,
          "name": "GLaDOS",
          "file": "/media/uploads/tmp8dgasjl3.wav",
          "transcript": "Do you hear that? That's the sound of the neurotoxin emitters emitting neurotoxin.",
          "uploaded_at": "2025-04-25T00:49:57.705435Z"
        }
      ];
      
      setSpeeches(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching speeches:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpeeches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSpeeches();
  };

  const navigateToSpeechDetail = (speech) => {
    navigation.navigate('Speech', { speech });
  };

  const renderSpeechItem = ({ item }) => {
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

    return (
      <TouchableOpacity 
        style={[styles.itemContainer, { backgroundColor: theme.cardBackground }]}
        onPress={() => navigateToSpeechDetail(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemName, { color: theme.textColor }]} numberOfLines={1}>
          {item.name}
        </Text>
        
        <View style={styles.itemMeta}>
          <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
            {formatDate(item.uploaded_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          {t('LoadingSpeeches')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          {t('Error')}: {error}
        </Text>
        <Text 
          style={[styles.retryText, { color: theme.primary }]} 
          onPress={fetchSpeeches}
        >
          {t('TapToRetry')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <FlatList
        data={speeches}
        renderItem={renderSpeechItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {t('NoSpeechesAvailable')}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  itemContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDuration: {
    fontSize: 14,
  },
  itemDate: {
    fontSize: 14,
  },
});

export default SpeechLibrary;