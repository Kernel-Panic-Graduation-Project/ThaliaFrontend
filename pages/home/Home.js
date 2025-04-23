import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, ActivityIndicator, Image, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";
import ExpandableButton from "../../components/ExpandableButton";
import { useTheme } from "../../context/ThemeContext";
import apiClient from '../../utils/Backend';
import { useUser } from '../../context/UserContext';
import { useWebSocket } from '../../utils/useWebSocket';
import { useViewStyle } from '../../hooks/useViewStyle';

const Home = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { userData } = useUser();
  const viewStyle = useViewStyle();
  const [storyDescription, setStoryDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [expandedSources, setExpandedSources] = useState({Disney: true});
  const [showThemes, setShowThemes] = useState(false);
  
  const createStoryHandler = async () => {
    if (!storyDescription || storyDescription.trim() === "") {
      Alert.alert(
        t("Error"),
        t("Please enter a description for your story."),
        [{ text: t("OK") }]
      );
      return;
    } else if (selectedCharacters.length < 2) {
      Alert.alert(
        t("Error"),
        t("Please select at least two characters."),
        [{ text: t("OK") }]
      );
      return;
    } else if (!selectedTheme) {
      Alert.alert(
        t("Error"),
        t("Please select a theme for your story."),
        [{ text: t("OK") }]
      );
      return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      description: storyDescription,
      theme: selectedTheme,
      characters: selectedCharacters.length > 0 ? selectedCharacters : undefined
    };
    
    try {
      const response = await apiClient.post("/api/create-story/", payload);
      
      // Clear the form after successful submission
      setStoryDescription("");
      setSelectedTheme(null);
      setSelectedCharacters([]);
      
      // Notify user
      Alert.alert(
        t("Success"),
        t("Your story is being created! You can track its progress below."),
        [{ text: t("OK") }]
      );
    } catch (error) {
      console.error(error.response?.data?.error);
      Alert.alert(
        t("Error"),
        t(error.response?.data?.error || t("Failed to create story. Please try again later.")),
        [{ text: t("OK") }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const characters = [
    { name: "Alice", source: "Disney", image: require('../../assets/characters/Profile_-_Alice.webp') },
    { name: "Anna", source: "Disney", image: require('../../assets/characters/Profile_-_Anna.webp') },
    { name: "Ariel", source: "Disney", image: require('../../assets/characters/Profile_-_Ariel.webp') },
    { name: "Asha", source: "Disney", image: require('../../assets/characters/Profile_-_Asha.webp') },
    { name: "Aurora", source: "Disney", image: require('../../assets/characters/Profile_-_Aurora.webp') },
    { name: "Belle", source: "Disney", image: require('../../assets/characters/Profile_-_Belle.webp') },
    { name: "Chel", source: "Disney", image: require('../../assets/characters/Profile_-_Chel.webp') },
    { name: "Cinderella", source: "Disney", image: require('../../assets/characters/Profile_-_Cinderella.webp') },
    { name: "Dolores Madrigal", source: "Disney", image: require('../../assets/characters/Profile_-_Dolores_Madrigal.webp') },
    { name: "Elsa", source: "Disney", image: require('../../assets/characters/Profile_-_Elsa.webp') },
    { name: "Esmeralda", source: "Disney", image: require('../../assets/characters/Profile_-_Esmeralda.webp') },
    { name: "Isabela Madrigal", source: "Disney", image: require('../../assets/characters/Profile_-_Isabela_Madrigal.webp') },
    { name: "Jane Porter", source: "Disney", image: require('../../assets/characters/Profile_-_Jane_Porter.webp') },
    { name: "Jasmine", source: "Disney", image: require('../../assets/characters/Profile_-_Jasmine.webp') },
    { name: "Kida Nedakh", source: "Disney", image: require('../../assets/characters/Profile_-_Kida_Nedakh.webp') },
    { name: "Megara", source: "Disney", image: require('../../assets/characters/Profile_-_Megara.webp') },
    { name: "Merida", source: "Disney", image: require('../../assets/characters/Profile_-_Merida.webp') },
    { name: "Mirabel Madrigal", source: "Disney", image: require('../../assets/characters/Profile_-_Mirabel_Madrigal.webp') },
    { name: "Moana", source: "Disney", image: require('../../assets/characters/Profile_-_Moana.webp') },
    { name: "Namaari", source: "Disney", image: require('../../assets/characters/Profile_-_Namaari.webp') },
    { name: "Pocahontas", source: "Disney", image: require('../../assets/characters/Profile_-_Pocahontas.webp') },
    { name: "Rapunzel", source: "Disney", image: require('../../assets/characters/Profile_-_Rapunzel.webp') },
    { name: "Raya", source: "Disney", image: require('../../assets/characters/Profile_-_Raya.webp') },
    { name: "Shank", source: "Disney", image: require('../../assets/characters/Profile_-_Shank.webp') },
    { name: "Snow White", source: "Disney", image: require('../../assets/characters/Profile_-_Snow_White.webp') },
    { name: "Tiana", source: "Disney", image: require('../../assets/characters/Profile_-_Tiana.webp') },
    { name: "Vanellope", source: "Disney", image: require('../../assets/characters/Profile_-_Vanellope_Von_schweetz.webp') },
  ];

  const themes = [
    "fantasy",
    "sci-fi",
    "medieval",
    "pirates",
    "space",
    "jungle",
    "underwater",
    "superheroes",
    "animals",
    "magic school",
    "circus",
    "haunted house",
    "fairy tale",
    "farm life",
    "outer space",
    "prehistoric",
    "robot world",
    "time travel",
    "winter wonderland",
    "desert adventure",
    "forest kingdom",
    "lost island",
    "dream world",
    "toy land",
    "sports",
    "music",
    "royalty",
    "travel",
    "holiday",
    "school life"
  ]

  // First, group characters by source
  const groupedCharacters = characters.reduce((groups, character) => {
    const { source } = character;
    if (!groups[source]) {
      groups[source] = [];
    }
    groups[source].push(character);
    return groups;
  }, {});

  // Convert to array format for rendering
  const characterSources = Object.keys(groupedCharacters).map(source => ({
    source,
    characters: groupedCharacters[source]
  }));

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

  const handleCharacterPress = (name) => {
    setSelectedCharacters((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name) // Deselect if already selected
        : [...prev, name] // Select if not selected
    );
  };

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme === selectedTheme ? null : theme);
  };

  // Add this function with your other handler functions
  const toggleSourceExpansion = (source) => {
    setExpandedSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={viewStyle} contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        <View>
          <Text style={[styles.title, { color: theme.colors.primaryText }]}>
            {t("Hello") + ", " + (userData?.username || t("Young Creator"))}
          </Text>
          <Text style={[styles.subtitleText, { color: theme.colors.secondaryText }]}>
            {t("Let's create an amazing story together!")}
          </Text>
          
          <View style={styles.formContainer}>
            <Text style={[styles.subtitle, { color: theme.colors.primaryText }]}>
              {t("What do you want the story to be like")}?
            </Text>
            <TextInput
              multiline={true}
              placeholder={t("Enter your story description here") + "..."}
              placeholderTextColor={theme.colors.secondaryText}
              style={[styles.input, styles.textArea, { 
                color: theme.colors.primaryText, 
                borderColor: theme.colors.border, 
                backgroundColor: theme.colors.surface 
              }]}
              onChangeText={setStoryDescription}
              value={storyDescription}
            />

            {/* Theme Selection Pane */}
            <Text style={[styles.subtitle, { color: theme.colors.primaryText, marginTop: 10 }]}>
              {t("Choose a story theme")}
            </Text>
            
            <View style={[styles.themeContainer, { borderColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={[
                  styles.themeTitleContainer, 
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                    borderBottomWidth: showThemes ? 0 : 1,
                    borderBottomLeftRadius: showThemes ? 0 : 8,
                    borderBottomRightRadius: showThemes ? 0 : 8
                  }
                ]}
                onPress={() => setShowThemes(!showThemes)}
              >
                <Text style={[styles.sourceTitle, { color: theme.colors.primaryText }]}>
                  {selectedTheme ? t(selectedTheme).charAt(0).toUpperCase() + t(selectedTheme).slice(1) : t("Choose a theme")}
                </Text>
                <FontAwesome6 
                  name={showThemes ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={theme.colors.secondaryText} 
                />
              </TouchableOpacity>
              
              {showThemes && (
                <View style={[
                  styles.themesGridContainer, 
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                    borderTopWidth: 0,
                  }
                ]}>
                  <View style={styles.themesGrid}>
                    {themes.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.themeItem,
                          { 
                            borderColor: selectedTheme === item ? theme.colors.primary : theme.colors.border,
                            backgroundColor: selectedTheme === item ? `${theme.colors.primary}20` : theme.colors.surface
                          }
                        ]}
                        onPress={() => handleThemeSelect(item)}
                      >
                        <Text style={[
                          styles.themeItemText, 
                          { 
                            color: selectedTheme === item ? theme.colors.primary : theme.colors.primaryText,
                            fontWeight: selectedTheme === item ? '700' : '500'
                          }
                        ]}>
                          {t(item).charAt(0).toUpperCase() + t(item).slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Character Selection Pane */}
            <Text style={[styles.subtitle, { color: theme.colors.primaryText, marginTop: 10 }]}>
              {t("Choose your characters")}
            </Text>
            
            {characterSources.map(sourceGroup => (
              <View key={sourceGroup.source} style={[styles.sourceContainer, { borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={[
                    styles.sourceTitleContainer, 
                    { 
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderWidth: 1,
                      borderBottomWidth: expandedSources[sourceGroup.source] ? 0 : 1,
                      borderBottomLeftRadius: expandedSources[sourceGroup.source] ? 0 : 8,
                      borderBottomRightRadius: expandedSources[sourceGroup.source] ? 0 : 8
                    }
                  ]}
                  onPress={() => toggleSourceExpansion(sourceGroup.source)}
                >
                  <Text style={[styles.sourceTitle, { color: theme.colors.primaryText }]}>
                    {sourceGroup.source}
                  </Text>
                  <FontAwesome6 
                    name={expandedSources[sourceGroup.source] ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={theme.colors.secondaryText} 
                  />
                </TouchableOpacity>
                
                {expandedSources[sourceGroup.source] && (
                  <View style={[
                    styles.charactersContainer, 
                    { 
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderWidth: 1,
                      borderTopWidth: 0,
                    }
                  ]}>
                    <FlatList
                      data={sourceGroup.characters}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.name}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.characterItem,
                            { 
                              borderColor: selectedCharacters.includes(item.name) ? theme.colors.primary : 'transparent',
                              backgroundColor: selectedCharacters.includes(item.name) ? `${theme.colors.primary}20` : 'transparent'
                            }
                          ]}
                          onPress={() => handleCharacterPress(item.name)}
                        >
                          <Image source={item.image} style={styles.characterImage} />
                          <Text style={[
                            styles.characterName, 
                            { 
                              color: selectedCharacters.includes(item.name) ? theme.colors.primary : theme.colors.primaryText,
                            }
                          ]}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={[styles.buttonContainer, { backgroundColor: theme.colors.background }]}>
        <ExpandableButton 
          style={[styles.createStoryButton, { backgroundColor: theme.colors.primary }]} 
          onPress={createStoryHandler}
        >
          <Text style={[styles.createStoryButtonText, { color: theme.colors.primaryTextInverted }]}>
            <FontAwesome6 name={"wand-magic-sparkles"} size={20} /> {isSubmitting ? t("Creating...") : t("Create My Story")}
          </Text>
        </ExpandableButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10
  },
  subtitleText: {
    fontSize: 16,
    marginBottom: 16
  },
  formContainer: {
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingBottom: 25,
  },
  createStoryButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  createStoryButtonText: {
    fontSize: 18,
    fontWeight: '600'
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
  jobContainer: {
    marginTop: 20,
  },
  jobCard: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
  },
  detail: {
    fontSize: 14,
    marginTop: 5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
  },
  sourceContainer: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sourceTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  charactersContainer: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 8,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  characterItem: {
    alignItems: 'center',
    padding: 6,
    marginHorizontal: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  characterImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  characterName: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeContainer: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  themeTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  themesGridContainer: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeItem: {
    width: '31%', // Slightly less than 1/3 to account for margins
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    margin: '1%',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 45,
    marginBottom: 10,
  },
  themeItemText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default Home;
