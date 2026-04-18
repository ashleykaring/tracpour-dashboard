import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SurfaceCard } from "@/components/surface-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { createJob } from "@/lib/api";
import { defaultJobTemplate } from "@/lib/mock-data";

export default function CreateJobScreen() {
  const [jobName, setJobName] = useState(defaultJobTemplate.name);
  const [expectedYardage, setExpectedYardage] = useState(
    String(defaultJobTemplate.expectedYardage),
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleStartJob() {
    const trimmedName = jobName.trim();
    const parsedYardage = Number(expectedYardage);

    if (!trimmedName) {
      Alert.alert(
        "Job name required",
        "Enter a job name before starting the job.",
      );
      return;
    }

    if (!Number.isFinite(parsedYardage) || parsedYardage <= 0) {
      Alert.alert(
        "Expected yardage required",
        "Enter a valid expected yardage amount.",
      );
      return;
    }

    setIsSaving(true);

    await createJob({
      name: trimmedName,
      expectedYardage: parsedYardage,
    });

    router.replace("/live");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="eyebrow">Start Job</ThemedText>
          <ThemedText type="screenTitle" style={styles.title}>
            TracPour Setup
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Create a new job to start tracking
          </ThemedText>
        </View>

        <SurfaceCard style={styles.card}>
          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Job Name</ThemedText>
            <TextInput
              value={jobName}
              onChangeText={setJobName}
              placeholder="Riverside Bridge"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Expected Yardage</ThemedText>
            <TextInput
              value={expectedYardage}
              onChangeText={setExpectedYardage}
              keyboardType="decimal-pad"
              placeholder="118"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
            />
          </View>

          <Pressable
            onPress={() => void handleStartJob()}
            style={styles.button}
          >
            <ThemedText type="smallBold" style={styles.buttonText}>
              {isSaving ? "Starting Job..." : "Start Job"}
            </ThemedText>
          </Pressable>
        </SurfaceCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.five,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    fontFamily: "BarlowCondensed_700Bold",
  },
  card: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.three,
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.navNavy,
  },
  buttonText: {
    color: Colors.light.navText,
  },
});
