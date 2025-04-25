import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Share,
  Alert,
  Image,
  StatusBar,
  BackHandler,
} from 'react-native';
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import apiClient from '../../utils/Backend';
import { Audio } from 'expo-av';
import PagerView from 'react-native-pager-view';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useUI } from '../../context/UIContext';

// Add this function at the top level (after other utility functions)
const splitTextIntoSentences = (text) => {
  const words = text.split(' ').filter(word => word.trim() !== '');
  
  const sentences = [];
  const wordsPerSentence = 10;
  
  for (let i = 0; i < words.length; i += wordsPerSentence) {
    const chunk = words.slice(i, i + wordsPerSentence).join(' ');
    if (chunk.trim() !== '') {
      sentences.push(chunk);
    }
  }
  
  return sentences;
};

// Update the SubtitleText component to show 3 sentences with current in middle
const SubtitleText = React.memo(({ text, currentSentenceIndex, textStyle }) => {
  const sentences = splitTextIntoSentences(text);
  
  if (currentSentenceIndex === null || currentSentenceIndex >= sentences.length) {
    return null;
  }
  
  // Get previous, current, and next sentences
  const prevSentence = currentSentenceIndex > 0 ? sentences[currentSentenceIndex - 1] : null;
  const currentSentence = sentences[currentSentenceIndex];
  const nextSentence = currentSentenceIndex < sentences.length - 1 ? sentences[currentSentenceIndex + 1] : null;
  
  return (
    <View style={styles.subtitleTextGroup}>
      {prevSentence && (
        <Text style={[textStyle, styles.subtitleText, styles.nonCurrentSubtitle]}>
          {prevSentence}
        </Text>
      )}
      
      <Text style={[textStyle, styles.subtitleText, styles.currentSubtitle]}>
        {currentSentence}
      </Text>
      
      {nextSentence && (
        <Text style={[textStyle, styles.subtitleText, styles.nonCurrentSubtitle]}>
          {nextSentence}
        </Text>
      )}
    </View>
  );
});

const StoryDetail = ({ route, navigation }) => {
  const { storyId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const { isTabBarVisible, setTabBarVisible } = useUI();
  const [currentSentenceIndices, setCurrentSentenceIndices] = useState({});

  // Audio related states
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Track current playing section
  const currentSectionIndex = useRef(null);
  const pagerRef = useRef(null);
  
  useEffect(() => {
    setTabBarVisible(false);
    return () => setTabBarVisible(true);
  }, [setTabBarVisible]);
    
  // Clean up sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    fetchStoryDetails();
  }, [storyId]);

  const fetchStoryDetails = () => {
    setIsLoading(true);
    apiClient.get(`/api/story/${storyId}/`).then((response) => {
      setStory(response.data);
      setIsFavorite(response.data.favorited || false);
    }).catch((error) => {
      console.error('Failed to fetch story details:', error);
      Alert.alert(
        t("Error"),
        t("Failed to load story details."),
        [{ text: t("OK") }]
      );
    }).finally(() => {
      setIsLoading(false);
    });
  };

  // Function to load and play audio
  const loadAndPlayAudio = async (audioBase64, sectionIndex) => {
    if (!audioBase64) return;
    
    try {
      // Check if we're dealing with the same section that's currently playing
      if (currentSectionIndex.current === sectionIndex && sound) {
        // If audio is already playing, pause it
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          // Resume playing
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // If different section or no sound loaded yet, start fresh
      setIsLoadingAudio(true);
      
      // Unload current sound if any
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
      
      currentSectionIndex.current = sectionIndex;

      // Load the new sound
      // Pass the sectionIndex as a parameter to the onPlaybackStatusUpdate
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${audioBase64}` },
        { shouldPlay: true },
        (status) => onPlaybackStatusUpdate(status, sectionIndex)
      );
      
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert(
        t("Error"),
        t("Failed to play audio."),
        [{ text: t("OK") }]
      );
    } finally {
      setIsLoadingAudio(false);
    }
  };
  
  // Handle playback status updates
  const onPlaybackStatusUpdate = (status, sectionIdx) => {
    if (!status.isLoaded) return;
    
    setPlaybackPosition(status.positionMillis);
    setPlaybackDuration(status.durationMillis || 0);
    
    // Use the passed section index parameter instead of the state variable
    if (sectionIdx !== undefined && story?.text_sections[sectionIdx]) {
      const currentText = story.text_sections[sectionIdx];
      const sentences = splitTextIntoSentences(currentText);
      const totalSentences = sentences.length;
      
      // Calculate proportion of audio played
      const proportion = status.positionMillis / (status.durationMillis || 1);
      
      // Calculate current sentence
      const currentSentenceIndex = Math.min(
        Math.floor(proportion * totalSentences),
        totalSentences - 1
      );

      // Update state with current sentence index
      setCurrentSentenceIndices(prev => ({
        ...prev,
        [sectionIdx]: currentSentenceIndex
      }));
    }
    
    if (status.didJustFinish) {
      setIsPlaying(false);

      if (currentSectionIndex.current !== null && story && currentSectionIndex.current < story.text_sections.length - 1) {
        goToNextSection();
      }
    }
  };

  // Function to navigate to the next section and play its audio
  const goToNextSection = () => {
    const nextSectionIndex = currentSectionIndex.current + 1;
    
    // Navigate to next section using PagerView
    if (pagerRef.current) {
      currentSectionIndex.current = nextSectionIndex;
      pagerRef.current.setPage(nextSectionIndex);
    }
};

  // Format time in MM:SS
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleFavorite = async () => {
    try {
      setIsFavorite(!isFavorite);
      const endpoint = isFavorite ? '/api/unlike-story/' : '/api/like-story/';
      await apiClient.post(endpoint, { story_id: storyId });
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  const shareStory = async () => {
    if (!story) return;
    
    try {
      await Share.share({
        message: `${story.title}\n\n${story.text_sections.join('\n\n')}\n\nShared from Thalia`,
      });
    } catch (error) {
      console.error('Failed to share story:', error);
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      // Exit fullscreen mode
      StatusBar.setHidden(false);
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
      navigation.setOptions({
        headerShown: true,
      });
      navigation.goBack();
    } else {
      // Enter fullscreen mode
      StatusBar.setHidden(true);
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
      navigation.setOptions({
        headerShown: false,
      });
    }
    setIsFullscreen(!isFullscreen);
  };

  // Control screen orientation on mount and unmount
  useEffect(() => {
    const enterFullscreen = async () => {
      // Hide status bar
      StatusBar.setHidden(true);
      
      // Set orientation to landscape
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
      
      // Hide header through navigation options
      navigation.setOptions({
        headerShown: false,
      });
    };
    
    const exitFullscreen = async () => {
      // Show status bar again
      StatusBar.setHidden(false);
      
      // Return to portrait orientation
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
    };
    
    enterFullscreen();
    
    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      toggleFullscreen();
      return true;
    });
    
    // Cleanup on unmount
    return () => {
      exitFullscreen();
      backHandler.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
          {t("Loading story...")}
        </Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {t("Story not found")}
        </Text>
      </View>
    );
  }

  const loadAudioWithoutPlaying = async (audioBase64, sectionIndex) => {
    if (!audioBase64) return;
    
    try {
      setIsLoadingAudio(true);
      
      // Check if we're attempting to load audio for the current page
      if (currentSectionIndex.current !== sectionIndex) {
        return;
      }
      
      // Unload current sound if any
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (unloadError) {
          console.error('Error unloading audio:', unloadError);
        }
        setSound(null);
        setIsPlaying(false);
      }
      
      // Add a small delay before creating a new sound object
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check again if page changed during the delay
      if (currentSectionIndex.current !== sectionIndex) {
        return;
      }
      
      currentSectionIndex.current = sectionIndex;
      
      // Pass sectionIndex to the callback
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${audioBase64}` },
        { shouldPlay: false },
        (status) => onPlaybackStatusUpdate(status, sectionIndex)
      );
      
      setSound(newSound);
      
      // Get and set the duration immediately
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setPlaybackDuration(status.durationMillis || 0);
        setPlaybackPosition(0);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      // Only show alert if we're still on the same page
      if (currentSectionIndex.current === sectionIndex) {
        Alert.alert(
          t("Error"),
          t("Failed to load audio."),
          [{ text: t("OK") }]
        );
      }
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const onPageSelected = async (e) => {
    const newIndex = e.nativeEvent.position;
    
    // Stop current audio playback first
    if (sound && isPlaying) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
    
    // Set the current section index immediately
    currentSectionIndex.current = newIndex;
    setPlaybackPosition(0);
    
    // Unload previous sound with a small delay to avoid resource conflicts
    if (sound) {
      try {
        setTimeout(async () => {
          await sound.unloadAsync();
          setSound(null);
          
          // Only attempt to load new audio if we're still on the same page
          if (currentSectionIndex.current === newIndex && story?.audios && story.audios[newIndex]) {
            loadAudioWithoutPlaying(story.audios[newIndex], newIndex);
          }
        }, 300);
      } catch (error) {
        console.error('Error unloading audio:', error);
        setSound(null);
      }
    } else {
      // If no sound is currently loaded, we can load the new audio directly
      if (story?.audios && story.audios[newIndex]) {
        // Small delay to ensure page transition completes first
        setTimeout(() => {
          loadAudioWithoutPlaying(story.audios[newIndex], newIndex);
        }, 300);
      }
    }
  };

  return (
    <View style={[styles.fullscreenContainer, {backgroundColor: theme.colors.background}]}>
      {/* Exit button */}
      <TouchableOpacity 
        style={styles.exitButton}
        onPress={toggleFullscreen}
      >
        <FontAwesome6 
          name="arrow-left" 
          size={20} 
          color={"#FFF"} 
        />
      </TouchableOpacity>
      
      {/* Add these new buttons */}
      <View style={styles.topRightButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={toggleFavorite}
        >
          <FontAwesome6 
            name="heart"
            solid={isFavorite}
            size={20} 
            color={isFavorite ? theme.colors.error : "#FFF"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={shareStory}
        >
          <FontAwesome6 
            name="share-nodes" 
            size={20} 
            color={"#FFF"} 
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
            {t("Loading story...")}
          </Text>
        </View>
      ) : !story ? (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {t("Story not found")}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.progressBarWrapper}>
            {story.text_sections.map((_, i) => (
              <View 
                key={`progress-${i}`} 
                style={[styles.progressBarSegment, { 
                  backgroundColor: i === currentSectionIndex.current
                    ? theme.colors.primary 
                    : i < (currentSectionIndex.current ?? -1)
                      ? theme.colors.secondary 
                      : theme.colors.border
                }]}
              />
            ))}
          </View>

          <View style={styles.contentContainer}>
            <PagerView
              ref={pagerRef}
              style={styles.pagerView}
              initialPage={0}
              orientation="horizontal"
              onPageSelected={onPageSelected}
            >
              {story.text_sections.map((textSection, index) => (
                <View key={`section-${index}`} style={styles.pageContainer}>
                  {/* Image as background */}
                  {story.images && story.images[index] && (
                    <View style={styles.imageBackgroundContainer}>
                      <Image
                        source={{
                          uri: `data:${story.images[index].image_mime_type || 'image/jpeg'};base64,${story.images[index].image}` 
                        }}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  
                  {/* Subtitle container at the bottom */}
                  <View style={styles.subtitleContainer}>
                    <SubtitleText
                      text={textSection}
                      currentSentenceIndex={currentSentenceIndices[index] || 0}
                      textStyle={{
                        color: "#FFF",
                      }}
                    />
                  </View>
                </View>
              ))}
            </PagerView>
          </View>

          {story.audios && story.audios[currentSectionIndex.current ?? 0] && (
            <View style={[styles.audioPlayerContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.playerControls}>
                <TouchableOpacity 
                  style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => loadAndPlayAudio(story.audios[currentSectionIndex.current ?? 0], currentSectionIndex.current ?? 0)}
                  disabled={isLoadingAudio}
                >
                  {isLoadingAudio ? (
                    <ActivityIndicator size="small" color={theme.colors.primaryTextInverted} />
                  ) : (
                    <FontAwesome6 
                      name={isPlaying ? "pause" : "play"} 
                      size={20} 
                      color={theme.colors.primaryTextInverted} 
                    />
                  )}
                </TouchableOpacity>
                
                <View style={styles.audioProgressContainer}>
                  <View 
                    style={[styles.progressBar, 
                      { backgroundColor: theme.colors.border }
                    ]}
                  >
                    <View 
                      style={[styles.progressFilled, 
                        { 
                          backgroundColor: theme.colors.primary,
                          width: playbackDuration > 0 ? `${(playbackPosition / playbackDuration) * 100}%` : '0%' 
                        }
                      ]} 
                    />
                  </View>
                  
                  <View style={styles.timeContainer}>
                    <Text style={[styles.timeText, { color: theme.colors.secondaryText }]}>
                      {formatTime(playbackPosition)}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.secondaryText }]}>
                      {formatTime(playbackDuration)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioProgressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFilled: {
    height: '100%',
    borderRadius: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
  },
  contentContainer: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    position: 'relative',
  },
  // New background image styles
  imageBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 80,
    zIndex: 3,
  },
  scrollViewWithImage: {
    backgroundColor: 'transparent',
  },
  textContentContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    marginTop: 60,
  },
  storyContent: {
    fontSize: 18,
    // Text color will be applied inline based on theme
  },
  audioPlayerContainer: {
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  sectionImage: {
    borderRadius: 8,
  },
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  exitButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightButtons: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  subtitleTextGroup: {
    width: '100%',
  },
  subtitleText: {
    fontSize: 22,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  currentSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
  },
  nonCurrentSubtitle: {
    fontSize: 18,
    opacity: 0.8,
  },
  subtitleContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
});

export default StoryDetail;