import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useWebSocket } from '../../utils/useWebSocket';
import { useViewStyle } from '../../hooks/useViewStyle';
import apiClient from '../../utils/Backend';

const SpeechLibrary = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const viewStyle = useViewStyle();
  const [isLoading, setIsLoading] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [audios, setAudios] = useState([]);

  // Fetch audios when component mounts
  useEffect(() => {
    fetchAudioFiles();
  }, []);

  const fetchAudioFiles = () => {
    setIsLoading(true);
    apiClient.get(`/api/audios/`).then((response) => {
      setAudios(response.data);
    }).catch((error) => {
      console.error('Failed to fetch audio files:', error);
      Alert.alert(
        t("Error"),
        t("Failed to fetch audio files."),
        [{ text: t("OK") }]
      );
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const handleRefresh = () => {
    fetchAudioFiles();
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    handleRefresh();
    setIsRefreshing(false);
  };

  const navigateToSpeechDetail = (speech) => {
    if (speech.status === 'completed') {
      navigation.navigate('Speech', { speech });
    } else if (speech.status === 'failed') {
      Alert.alert(
        t("Processing failed"),
        t("This audio processing has failed. Please try again."),
        [{ text: t("OK") }]
      );
    } else if (speech.status === 'queued') {
      Alert.alert(
        t("Audio is in queue"),
        t("This audio is still in the queue. Please wait until it's processed."),
        [{ text: t("OK") }]
      );
    } else {
      Alert.alert(
        t("Audio is not ready"),
        t("This audio is still being processed. Please wait until it's completed."),
        [{ text: t("OK") }]
      );
    }
  };

  // Format the date to a readable string
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      // Format: "Apr 25, 2025"
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format the duration (assuming it's in seconds)
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderSpeechItem = ({ item }) => {
    const getStatusIcon = (status) => {
      switch (status) {
        case 'queued':
          return <FontAwesome6 name="clock" size={16} color={theme.colors.warning} />;
        case 'processing':
          return <ActivityIndicator size="small" color={theme.colors.primary} />;
        case 'completed':
          return <FontAwesome6 name="check-circle" size={16} color={theme.colors.success} />;
        case 'failed':
          return <FontAwesome6 name="times-circle" size={16} color={theme.colors.error} />;
        default:
          return null;
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.speechCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: item.status === 'completed' ? 1 : 0.7
          }
        ]}
        onPress={() => navigateToSpeechDetail(item)}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.speechTitle, { color: theme.colors.primaryText }]}>
            {item.name}
          </Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: theme.colors.secondaryText, marginLeft: 5 }]}>
              {t(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.speechMeta}>
          <View style={styles.metaItem}>
            <FontAwesome6 name="clock" size={14} color={theme.colors.secondaryText} style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: theme.colors.secondaryText }]}>
              {formatDuration(item.duration)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <FontAwesome6 name="calendar-alt" size={14} color={theme.colors.secondaryText} style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: theme.colors.secondaryText }]}>
              {formatDate(item.uploaded_at)}
            </Text>
          </View>
        </View>

        <View style={styles.speechFooter}>
          <Text
            style={[styles.transcriptPreview, { color: theme.colors.secondaryText }]}
            numberOfLines={2}
          >
            {item.transcript}
          </Text>

          {item.favorited && (
            <FontAwesome6
              name="heart"
              solid
              size={16}
              color={theme.colors.error}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const toggleFavoritesFilter = () => {
    setFavoritesOnly(prev => !prev);
  };

  return (
    <View style={[viewStyle, { paddingBottom: 0 }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
          {favoritesOnly
            ? t("Your favorite audio files")
            : t("All your audio files in one place")}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={toggleFavoritesFilter}
            style={styles.filterButton}
          >
            <FontAwesome6
              name="heart"
              size={20}
              solid={favoritesOnly}
              color={favoritesOnly ? theme.colors.error : theme.colors.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={fetchAudioFiles}
            style={styles.refreshButton}
          >
            <FontAwesome6
              name="rotate-right"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
            {t("Loading your audio files...")}
          </Text>
        </View>
      ) : audios && audios.length > 0 ? (
        <FlatList
          data={audios}
          renderItem={renderSpeechItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="file-audio" size={40} color={theme.colors.secondaryText} />
          <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
            {favoritesOnly ? t("No favorite audio files yet") : t("No audio files yet")}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddVoice')}
          >
            <Text style={[styles.createButtonText, { color: theme.colors.primaryTextInverted }]}>
              {t("Create new audio")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Alternative with plus icon */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddVoice')}
      >
        <View style={styles.fabIconContainer}>
          <FontAwesome6
            name="microphone"
            size={20}
            color={theme.colors.primaryTextInverted}
          />
          <View style={[styles.plusIconOverlay, { backgroundColor: theme.colors.primary }]}>
            <FontAwesome6
              name="plus"
              size={14}
              color={theme.colors.primaryTextInverted}
            />
          </View>
        </View>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 10,
    marginRight: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  refreshButton: {
    padding: 10,
  },
  list: {
    padding: 10,
  },
  speechCard: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  speechTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
  },
  speechMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaIcon: {
    marginRight: 5,
  },
  metaText: {
    fontSize: 14,
  },
  speechFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transcriptPreview: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fabIconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIconOverlay: {
    position: 'absolute',
    right: -6,
    top: -6,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    right: 20,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 999,
  },
});

export default SpeechLibrary;