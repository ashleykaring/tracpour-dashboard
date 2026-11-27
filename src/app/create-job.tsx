import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SurfaceCard } from "@/components/surface-card";
import { AccountMenu } from "@/components/account-menu";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { getActivePour, startPour } from "@/lib/api";

const SUPPLIER_PLANT_OPTIONS = [
  {
    supplierPlantId: "calportland-demo",
    supplierPlantName: "CalPortland - Demo Plant",
    supplierName: "CalPortland",
    supplierPlatform: "command_alkon_mock",
  },
  {
    supplierPlantId: "vulcan-demo",
    supplierPlantName: "Vulcan - Demo Plant",
    supplierName: "Vulcan",
    supplierPlatform: "command_alkon_mock",
  },
  {
    supplierPlantId: "cemex-demo",
    supplierPlantName: "CEMEX - Demo Plant",
    supplierName: "CEMEX",
    supplierPlatform: "cemex_go_mock",
  },
  {
    supplierPlantId: "other-manual",
    supplierPlantName: "Other / Manual",
    supplierName: "Other",
    supplierPlatform: "manual",
  },
] as const;
type SupplierPlantOption = (typeof SUPPLIER_PLANT_OPTIONS)[number];

export default function CreateJobScreen() {
  const [jobName, setJobName] = useState("");
  const [expectedYardage, setExpectedYardage] = useState("");
  const [supplierOrderNumber, setSupplierOrderNumber] = useState("");
  const [selectedSupplierPlant, setSelectedSupplierPlant] = useState<SupplierPlantOption>(
    SUPPLIER_PLANT_OPTIONS[0],
  );
  const [isSupplierPickerVisible, setIsSupplierPickerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActivePour, setHasActivePour] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleStartJob() {
    if (isSaving) {
      return;
    }

    const trimmedName = jobName.trim();
    const parsedYardage = Number(expectedYardage);

    if (!trimmedName) {
      setError("Enter a job name before starting the pour.");
      return;
    }

    if (!Number.isFinite(parsedYardage) || parsedYardage <= 0) {
      setError("Enter an expected yardage greater than zero.");
      return;
    }

    setError(null);
    setHasActivePour(false);
    setIsSaving(true);

    try {
      const activePour = await getActivePour();

      if (activePour) {
        setHasActivePour(true);
        setError("A pour is already active. End it before starting another one.");
        return;
      }

      await startPour({
        name: trimmedName,
        expectedYardage: parsedYardage,
        supplierOrderNumber: supplierOrderNumber.trim() || undefined,
        supplierPlantId: selectedSupplierPlant.supplierPlantId,
        supplierPlantName: selectedSupplierPlant.supplierPlantName,
        supplierName: selectedSupplierPlant.supplierName,
        supplierPlatform: selectedSupplierPlant.supplierPlatform,
      });

      router.replace("/live");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to start pour.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.accountBar}>
        <AccountMenu />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <ThemedText type="eyebrow">Start Pour</ThemedText>
          <ThemedText type="screenTitle" style={styles.title}>
            <ThemedText type="screenTitle" style={styles.titleTrack}>
              Trac
            </ThemedText>
            <ThemedText
              type="screenTitle"
              style={[styles.titleTrack, { color: Colors.light.brandBlue }]}
            >
              Pour
            </ThemedText>{" "}
            Setup
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Enter pour details to start tracking
          </ThemedText>
        </View>

        <SurfaceCard style={styles.card}>
          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Job / Pour Name</ThemedText>
            <TextInput
              accessibilityLabel="Job / Pour Name"
              value={jobName}
              onChangeText={setJobName}
              editable={!isSaving}
              placeholder="Name / Description"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Expected Yardage (CY)</ThemedText>
            <TextInput
              accessibilityLabel="Expected Yardage (CY)"
              value={expectedYardage}
              onChangeText={setExpectedYardage}
              editable={!isSaving}
              placeholder="Cubic Yards"
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Ready-Mix Supplier / Batch Plant</ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select ready-mix supplier or batch plant"
              disabled={isSaving}
              onPress={() => setIsSupplierPickerVisible(true)}
              style={styles.selectButton}
            >
              <ThemedText>{selectedSupplierPlant.supplierPlantName}</ThemedText>
              <ThemedText themeColor="textSecondary">Select</ThemedText>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Supplier Order #</ThemedText>
            <TextInput
              accessibilityLabel="Supplier Order Number"
              value={supplierOrderNumber}
              onChangeText={setSupplierOrderNumber}
              editable={!isSaving}
              placeholder="Optional order number"
              placeholderTextColor={Colors.light.textSecondary}
              autoCapitalize="characters"
              style={styles.input}
            />
          </View>

          {error ? (
            <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText>
          ) : null}
          {hasActivePour ? (
            <Pressable accessibilityRole="button" onPress={() => router.replace("/live")}>
              <ThemedText type="smallBold">Return to active pour</ThemedText>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => void handleStartJob()}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isSaving && styles.buttonDisabled,
            ]}
          >
            <ThemedText type="smallBold" style={styles.buttonText}>
              {isSaving ? "Starting Pour..." : "Start Tracking"}
            </ThemedText>
          </Pressable>
        </SurfaceCard>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent
        visible={isSupplierPickerVisible}
        onRequestClose={() => setIsSupplierPickerVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close supplier plant selector"
            style={styles.modalBackdrop}
            onPress={() => setIsSupplierPickerVisible(false)}
          />
          <SurfaceCard style={styles.pickerPanel}>
            <ThemedText type="sectionTitle">Ready-Mix Supplier / Batch Plant</ThemedText>
            {SUPPLIER_PLANT_OPTIONS.map((option) => (
              <Pressable
                key={option.supplierPlantId}
                accessibilityRole="button"
                accessibilityState={{ selected: option.supplierPlantId === selectedSupplierPlant.supplierPlantId }}
                onPress={() => {
                  setSelectedSupplierPlant(option);
                  setIsSupplierPickerVisible(false);
                }}
                style={[
                  styles.optionButton,
                  option.supplierPlantId === selectedSupplierPlant.supplierPlantId && styles.optionSelected,
                ]}
              >
                <ThemedText type="smallBold">{option.supplierPlantName}</ThemedText>
              </Pressable>
            ))}
          </SurfaceCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  accountBar: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    fontFamily: "BarlowCondensed_700Bold",
  },
  titleTrack: {
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
  selectButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  error: {
    color: "#B42318",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.three,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,33,45,0.58)",
  },
  pickerPanel: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: Spacing.two,
  },
  optionButton: {
    minHeight: 48,
    justifyContent: "center",
    padding: Spacing.three,
    borderRadius: 16,
  },
  optionSelected: {
    backgroundColor: Colors.light.backgroundSelected,
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.navNavy,
  },
  buttonPressed: {
    opacity: 0.84,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.light.navText,
  },
});
