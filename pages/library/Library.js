import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useWebSocket } from '../../utils/useWebSocket';
import { useViewStyle } from '../../hooks/useViewStyle';

const Library = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const viewStyle = useViewStyle();
  const [isLoading, setIsLoading] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isConnected, stories, fetchStories } = useWebSocket('/jobs/');

  // Fetch stories when component mounts and when connection status changes
  useEffect(() => {
    if (isConnected) {
      fetchStories(favoritesOnly);
    } else {
      setIsLoading(true);
    }
  }, [isConnected, favoritesOnly]);
  
  useEffect(() => {
    if (stories !== undefined && isConnected) {
      setIsLoading(false);
    }
  }, [stories, isConnected]);

  const handleRefresh = () => {
    if (isConnected) {
      fetchStories(favoritesOnly);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    handleRefresh();
    setIsRefreshing(false);
  };

  const navigateToStoryDetail = (story) => {
    if (story.status === 'completed') {
      navigation.navigate('Story', { storyId: story.story_id });
    } else if (story.status === 'failed') {
      Alert.alert(
        t("Your story has failed"),
        t("Your story has failed. Please try again."),
        [{ text: t("OK") }]
      );
    } else if (story.status === 'queued') {
      Alert.alert(
        t("Your story is in queue"),
        t("Your story is still in the queue. Please wait until it's processed."),
        [{ text: t("OK") }]
      );
    } else {
      Alert.alert(
        t("Your story is not ready"),
        t("Your story is still being created. Please wait until it's completed."),
        [{ text: t("OK") }]
      );
    }
  };

  const renderStoryItem = ({ item }) => {
    const getStatusIcon = (status) => {
      switch (status) {
        case 'queued':
          return <FontAwesome6 name="clock" size={16} color={theme.colors.warning} />;
        case 'generating_story':
        case 'generating_image':
        case 'generating_audio':
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
          styles.storyCard, 
          { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            opacity: item.status === 'completed' ? 1 : 0.7
          }
        ]}
        onPress={() => navigateToStoryDetail(item)}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.storyTitle, { color: theme.colors.primaryText }]}>
            {item.title}
          </Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: theme.colors.secondaryText, marginLeft: 5 }]}>
              {t(item.status)}
            </Text>
          </View>
        </View>
        
        <Text 
          style={[styles.storyDescription, { color: theme.colors.secondaryText }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        
        <View style={styles.storyFooter}>
          <Text style={[styles.storyDate, { color: theme.colors.secondaryText }]}>
            {new Date(item.created_at).toLocaleString()}
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
            ? t("Your favorite stories") 
            : t("All your stories in one place")}
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
            onPress={handleRefresh} 
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
            {t("Loading your stories...")}
          </Text>
        </View>
      ) : stories && stories.length > 0 ? (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.job_id}
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
          <FontAwesome6 name="book" size={40} color={theme.colors.secondaryText} />
          <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
            {favoritesOnly ? t("No favorite stories yet") : t("No stories yet")}
          </Text>
          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]} 
            onPress={() => navigation.navigate(t("Home"))}
          >
            <Text style={[styles.createButtonText, { color: theme.colors.primaryTextInverted }]}>
              {t("Create a story")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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
  storyCard: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  storyDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyDate: {
    fontSize: 12,
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
  connectionStatus: {
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  connectionText: {
    color: 'white',
    fontSize: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
  },
});

export default Library;
