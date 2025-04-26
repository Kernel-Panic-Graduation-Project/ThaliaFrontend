import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome6 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useViewStyle } from '../../hooks/useViewStyle';
import apiClient from '../../utils/Backend';
import ExpandableButton from "../../components/ExpandableButton";

const AddVoice = ({ navigation }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const viewStyle = useViewStyle();

    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [hasRecording, setHasRecording] = useState(false);
    const [voiceName, setVoiceName] = useState('');
    const [audioUri, setAudioUri] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Hard-coded text for users to read
    const displayText = "The quick brown fox jumps over the lazy dog. This pangram contains all the letters of the English alphabet.";

    // Timer for recording duration
    useEffect(() => {
        let interval = null;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else if (!isRecording && recordingDuration !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRecording, recordingDuration]);

    // Format time in MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Start recording function
    const startRecording = async () => {
        try {
            console.log('Starting recording...');
            // Request permissions
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    t("Permission Required"),
                    t("Microphone permission is required to record audio."),
                    [{ text: t("OK") }]
                );
                return;
            }

            console.log('Cleaning up previous recording...');
            // clean up previous recording
            if (recording) {
                try {
                    await recording.stopAndUnloadAsync();
                } catch (error) {
                    console.log('Error stopping existing recording:', error);
                }
            }

            // Unload any existing sound
            if (sound) {
                try {
                    await sound.unloadAsync();
                    setSound(null);
                } catch (error) {
                    console.log('Error unloading sound:', error);
                }
            }

            setRecording(null);
            setAudioUri(null);
            setHasRecording(false);
            setIsPlaying(false);
            console.log('Previous recording cleaned up.');

            // Configure audio
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
            });

            // Create and start recording
            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
            setRecordingDuration(0);

        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert(
                t("Error"),
                t("Failed to start recording. Please try again."),
                [{ text: t("OK") }]
            );
        }
    };

    // Stop recording function
    const stopRecording = async () => {
        if (!recording) return;

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setAudioUri(uri);
            setIsPlaying(false);
            setHasRecording(true);
            setIsRecording(false);
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }

        setRecording(null);
    };

    // Play recorded audio
    const playRecording = async () => {
        if (!audioUri) return;

        try {
            if (sound) {
                // If already playing, stop it
                if (isPlaying) {
                    await sound.stopAsync();
                    setIsPlaying(false);
                    return;
                }

                // Otherwise play it
                await sound.playAsync();
                setIsPlaying(true);
            } else {
                // Load sound for the first time
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );

                setSound(newSound);
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Failed to play recording:', error);
            // Reset sound state in case of error
            setSound(null);
            setIsPlaying(false);
        }
    };

    // Handle playback status updates
    const onPlaybackStatusUpdate = (status) => {
        if (status.didJustFinish) {
            setSound(null);
            setIsPlaying(false);
        }
    };

    // Submit voice recording
    const submitVoice = async () => {
        if (!audioUri || !voiceName.trim()) {
            Alert.alert(
                t("Missing Information"),
                t("Please provide a name for your voice recording and ensure you have recorded audio."),
                [{ text: t("OK") }]
            );
            return;
        }

        setIsSubmitting(true);

        try {
            // Create form data for upload
            const formData = new FormData();
            formData.append('name', voiceName);
            formData.append('transcript', displayText); // Using the hard-coded text

            // Add audio file
            const uriParts = audioUri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('file', {
                uri: audioUri,
                name: `recording.${fileType}`,
                type: `audio/${fileType}`
            });

            // Send to backend
            const response = await apiClient.post('/api/upload-audio/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            Alert.alert(
                t("Success"),
                t("Your voice recording has been uploaded successfully!"),
                [{
                    text: t("OK"),
                    onPress: () => navigation.navigate('SpeechLibrary')
                }]
            );

        } catch (error) {
            console.error('Failed to upload voice recording:', error);
            Alert.alert(
                t("Error"),
                t("Failed to upload your voice recording. Please try again."),
                [{ text: t("OK") }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView
            style={viewStyle}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                    {t("Add New Voice Recording")}
                </Text>
                <Text style={[styles.sectionText, { color: theme.colors.secondaryText }]}>
                    {t("Record your voice to create custom voice content.")}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.primaryText }]}>
                    {t("Name")}*
                </Text>
                <TextInput
                    style={[styles.input, {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        color: theme.colors.primaryText
                    }]}
                    placeholder={t("Enter a name for your recording")}
                    placeholderTextColor={theme.colors.secondaryText}
                    value={voiceName}
                    onChangeText={setVoiceName}
                />

                <Text style={[styles.label, { color: theme.colors.primaryText, marginTop: 16 }]}>
                    {t("Text to Read")}
                </Text>
                <View style={[styles.textDisplay, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                }]}>
                    <Text style={[styles.displayText, { color: theme.colors.primaryText }]}>
                        {displayText}
                    </Text>
                </View>
            </View>

            <View style={[styles.recordingSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.durationContainer}>
                    <FontAwesome6 name="microphone" size={20} color={isRecording ? theme.colors.error : theme.colors.secondaryText} />
                    <Text style={[styles.durationText, { color: theme.colors.primaryText }]}>
                        {formatTime(recordingDuration)}
                    </Text>
                </View>

                <View style={styles.recordingControls}>
                    {hasRecording && (
                        <TouchableOpacity
                            style={[styles.controlButton, { backgroundColor: theme.colors.secondary }]}
                            onPress={playRecording}
                        >
                            <FontAwesome6
                                name={isPlaying ? "pause" : "play"}
                                size={20}
                                color={theme.colors.primaryTextInverted}
                            />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.recordButton,
                            {
                                backgroundColor: isRecording ? theme.colors.error : theme.colors.primary,
                                width: isRecording ? 60 : 70,
                                height: isRecording ? 60 : 70,
                            }
                        ]}
                        onPress={isRecording ? stopRecording : startRecording}
                    >
                        <FontAwesome6
                            name={isRecording ? "stop" : "microphone"}
                            size={isRecording ? 24 : 30}
                            color={theme.colors.primaryTextInverted}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ExpandableButton
                style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                onPress={submitVoice}
                disabled={isSubmitting || !hasRecording}
            >
                <Text style={[styles.submitButtonText, { color: theme.colors.primaryTextInverted }]}>
                    {isSubmitting ?
                        t("Uploading...") :
                        t("Save Voice Recording")
                    }
                </Text>
            </ExpandableButton>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    textDisplay: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        minHeight: 100,
    },
    displayText: {
        fontSize: 16,
        lineHeight: 24,
    },
    recordingSection: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    durationText: {
        fontSize: 24,
        fontWeight: '700',
        marginLeft: 12,
    },
    recordingControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    recordButton: {
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 20,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
});

export default AddVoice;