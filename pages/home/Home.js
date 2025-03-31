import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
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
  const [latestJob, setLatestJob] = useState(null);
  
  // Initialize WebSocket connection with tracking capabilities
  const { isConnected, currentJob, trackJob } = useWebSocket('/jobs/');
  
  // Update the latest job whenever the tracked job changes
  useEffect(() => {
    setLatestJob(currentJob);
  }, [currentJob]);

  const createStoryHandler = async () => {
    if (!storyDescription) {
      Alert.alert(
        t("Error"),
        t("Please enter a description for your story."),
        [{ text: t("OK") }]
      );
      return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      description: storyDescription
    };
    
    try {
      const response = await apiClient.post("/api/create-story/", payload);
      
      // Start tracking this job if we got a job ID back
      if (response.data && response.data.job_id) {
        trackJob(response.data.job_id);
      }
      
      // Clear the form after successful submission
      setStoryDescription("");
      
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

  // Render job information
  const renderJobInfo = () => {
    const isLoading = !isConnected && !latestJob;
    
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
            {t("Loading your stories...")}
          </Text>
        </View>
      );
    }

    if (!latestJob) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="book" size={40} color={theme.colors.secondaryText} />
          <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
            {t("No stories yet")}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.jobContainer}>
        <View style={[styles.jobCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.jobTitle, { color: theme.colors.primaryText }]}>{latestJob.title}</Text>
            <View style={styles.statusContainer}>
              {getStatusIcon(latestJob.status)}
              <Text style={[styles.statusText, { color: theme.colors.secondaryText, marginLeft: 5 }]}>
                {t(latestJob.status)}
              </Text>
            </View>
          </View>
          
          {latestJob.status === 'queued' && latestJob.position !== undefined && (
            <Text style={[styles.detail, { color: theme.colors.secondaryText }]}>
              {t("Position in queue")}: {latestJob.position}
            </Text>
          )}
          
          {latestJob.status === 'completed' && latestJob.result && (
            <Text style={[styles.detail, { color: theme.colors.primaryText }]}>
              {typeof latestJob.result === 'object' 
                ? JSON.stringify(latestJob.result) 
                : String(latestJob.result)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={viewStyle} contentContainerStyle={{ flexGrow: 1 }}>
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
            style={[styles.input, styles.textArea, { color: theme.colors.primaryText, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            onChangeText={setStoryDescription}
            value={storyDescription}
          />

          <ExpandableButton 
            style={[styles.createStoryButton, { backgroundColor: theme.colors.primary }]} 
            onPress={createStoryHandler}
          >
            <Text style={[styles.createStoryButtonText, { color: theme.colors.primaryTextInverted }]}>
              <FontAwesome6 name={"wand-magic-sparkles"} size={20} /> {isSubmitting ? t("Creating...") : t("Create My Story")}
            </Text>
          </ExpandableButton>
        </View>

        {/* Display the current story being created */}
        {latestJob && (
          <>
            <Text style={[styles.subtitle, { color: theme.colors.primaryText, marginTop: 20 }]}>
              {t("Current Story Creation in Progress")}
            </Text>
            {renderJobInfo()}
          </>
        )}
        
        {/* Display message when there's no story being created */}
        {!latestJob && (
          <>
            <Text style={[styles.subtitle, { color: theme.colors.primaryText, marginTop: 20 }]}>
              {t("No Story Creation in Progress")}
            </Text>
            <Text style={[styles.subtitleText, { color: theme.colors.secondaryText }]}>
              {t("Create a story using the form above. You can see your completed stories in the Library.")}
            </Text>
          </>
        )}
      </View>
    </ScrollView>
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
  createStoryButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
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
  // JobsList component styles integrated directly
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
  }
});

export default Home;
