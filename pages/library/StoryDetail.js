import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import apiClient from '../../utils/Backend';
import { Audio } from 'expo-av';
import PagerView from 'react-native-pager-view';
import CustomHeaderButton from '../../components/CustomHeaderButton';
import { useViewStyle } from '../../hooks/useViewStyle';

const splitTextIntoWords = (text) => {
  return text.match(/\S+|\s+/g) || [];
};

// Create a memoized highlighted text component
const HighlightedText = React.memo(({ text, highlightedLetterCount, textStyle, highlightedTextStyle }) => {
  const words = splitTextIntoWords(text);
  let letterCount = 0;
  
  return (
    <Text style={textStyle}>
      {words.map((word, index) => {
        // Track the starting letter position of this word
        const wordStartsAt = letterCount;
        // Update the running letter count
        letterCount += word.length;
        
        // Highlight the word if its first letter is included in the highlighted range
        const shouldHighlight = wordStartsAt < highlightedLetterCount;
        
        return (
          <Text
            key={index}
            style={{
              backgroundColor: shouldHighlight ? highlightedTextStyle.backgroundColor : 'transparent',
              color: textStyle.color,
            }}
          >
            {word}
          </Text>
        );
      })}
    </Text>
  );
});

const StoryDetail = ({ route, navigation }) => {
  const { storyId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const viewStyle = useViewStyle();
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Audio related states
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [highlightedLetterCounts, setHighlightedLetterCounts] = useState({});
  
  // Track current playing section
  const [currentSectionIndex, setCurrentSectionIndex] = useState(null);
  const pagerRef = useRef(null);
    
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

  useEffect(() => {
    if (story?.title) {
      navigation.setOptions({
        title: story.title,
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <CustomHeaderButton onPress={toggleFavorite}>
              <FontAwesome6 
                name={isFavorite ? "heart" : "heart"} 
                solid={isFavorite}
                size={18} 
                color={isFavorite ? theme.colors.error : theme.colors.primaryText} 
              />
            </CustomHeaderButton>
            <CustomHeaderButton onPress={shareStory}>
              <FontAwesome6 name="share-nodes" size={18} color={theme.colors.primaryText} />
            </CustomHeaderButton>
          </View>
        ),
      });
    }
  }, [story?.title, isFavorite]);

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
      if (currentSectionIndex === sectionIndex && sound) {
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
      
      setCurrentSectionIndex(sectionIndex);

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
      const totalLetters = currentText.length;
      
      // Calculate proportion of audio played
      const proportion = status.positionMillis / (status.durationMillis || 1);
      
      // Calculate letters to highlight
      const highlightLetterCount = Math.floor(totalLetters * proportion);
      
      // Update state with the passed section index
      setHighlightedLetterCounts(prev => ({
        ...prev,
        [sectionIdx]: highlightLetterCount
      }));
    }
    
    if (status.didJustFinish) {
      setIsPlaying(false);

      if (currentSectionIndex !== null && story && currentSectionIndex < story.text_sections.length - 1) {
        goToNextSection();
      }
    }
  };

  // Function to navigate to the next section and play its audio
  const goToNextSection = () => {
    if (!story || currentSectionIndex === null || currentSectionIndex >= story.text_sections.length - 1) {
      return;
    }
    
    const nextSectionIndex = currentSectionIndex + 1;
    
    // Navigate to next section using PagerView
    if (pagerRef.current) {
      pagerRef.current.setPage(nextSectionIndex);
    }
    
    if (story.audios && story.audios[nextSectionIndex]) {
      setTimeout(() => {
        loadAndPlayAudio(story.audios[nextSectionIndex], nextSectionIndex);
      }, 600);
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
      
      // Unload current sound if any
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
      
      setCurrentSectionIndex(sectionIndex);
      
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
      Alert.alert(
        t("Error"),
        t("Failed to load audio."),
        [{ text: t("OK") }]
      );
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const onPageSelected = (e) => {
    const newIndex = e.nativeEvent.position;
    
    // Stop and unload current sound
    if (sound) {
      sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
    
    setCurrentSectionIndex(newIndex);
    setPlaybackPosition(0);
    
    // Reset highlighting for the new section
    setHighlightedLetterCounts(prev => ({
      ...prev,
      [newIndex]: 0
    }));
    
    // Automatically load the audio for this section
    if (story?.audios && story.audios[newIndex]) {
      // Small delay to ensure page transition completes first
      setTimeout(() => {
        loadAudioWithoutPlaying(story.audios[newIndex], newIndex);
      }, 200);
    }
  };

  return (
    <View style={[viewStyle, {padding: 0}]}>
      <View style={styles.progressBarWrapper}>
        {story.text_sections.map((_, i) => (
          <View 
            key={`progress-${i}`} 
            style={[styles.progressBarSegment, { 
              backgroundColor: i === currentSectionIndex 
                ? theme.colors.primary 
                : i < (currentSectionIndex ?? -1)
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
              <ScrollView style={styles.scrollView}>
                {/* Add image display if available for this section */}
                {story.images && story.images[index] && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ 
                        uri: `data:${story.images[index].image_mime_type || 'image/jpeg'};base64,${story.images[index].image}` 
                      }}
                      style={styles.sectionImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                <HighlightedText
                  text={textSection}
                  highlightedLetterCount={highlightedLetterCounts[index] || 0}
                  textStyle={{...styles.storyContent, color: theme.colors.primaryText}}
                  highlightedTextStyle={{ backgroundColor: theme.colors.primary }}
                />
              </ScrollView>
            </View>
          ))}
        </PagerView>
      </View>

      {story.audios && story.audios[currentSectionIndex ?? 0] && (
        <View style={[styles.audioPlayerContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.playerControls}>
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => loadAndPlayAudio(story.audios[currentSectionIndex ?? 0], currentSectionIndex ?? 0)}
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 32,
  },
  storyContent: {
    fontSize: 16,
    lineHeight: 24,
    paddingTop: 20,
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
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});

export default StoryDetail;