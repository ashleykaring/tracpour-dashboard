import { router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SurfaceCard } from "@/components/surface-card";
import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { startPour } from "@/lib/api";

const DEMO_SUPPLIER_ORDER_NUMBER = "RM-24817";
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
  const [selectedSupplierPlant, setSelectedSupplierPlant] = useState<SupplierPlantOption>(
    SUPPLIER_PLANT_OPTIONS[0],
  );
  const [isSupplierPickerVisible, setIsSupplierPickerVisible] = useState(false);
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

    await startPour({
      name: trimmedName,
      expectedYardage: parsedYardage,
      supplierOrderNumber: DEMO_SUPPLIER_ORDER_NUMBER,
      supplierPlantId: selectedSupplierPlant.supplierPlantId,
      supplierPlantName: selectedSupplierPlant.supplierPlantName,
      supplierName: selectedSupplierPlant.supplierName,
      supplierPlatform: selectedSupplierPlant.supplierPlatform,
    });

    router.replace("/live");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
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
              value={jobName}
              onChangeText={setJobName}
              placeholder="Name / Description"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Expected Yardage (CY)</ThemedText>
            <TextInput
              value={expectedYardage}
              onChangeText={setExpectedYardage}
              keyboardType="decimal-pad"
              placeholder="Cubic Yards"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Ready-Mix Supplier / Batch Plant</ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select ready-mix supplier or batch plant"
              onPress={() => setIsSupplierPickerVisible(true)}
              style={({ pressed }) => [styles.selectButton, pressed && styles.buttonPressed]}
            >
              <ThemedText style={styles.selectValue}>{selectedSupplierPlant.supplierPlantName}</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.selectChevron}>
                v
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold">Supplier Order #</ThemedText>
            <TextInput
              value={DEMO_SUPPLIER_ORDER_NUMBER}
              editable={false}
              selectTextOnFocus={false}
              placeholderTextColor={Colors.light.textSecondary}
              autoCapitalize="characters"
              style={styles.input}
            />
          </View>

          <Pressable
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
      </View>

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
          <View style={styles.pickerPanel}>
            <ThemedText type="sectionTitle">Ready-Mix Supplier / Batch Plant</ThemedText>
            <View style={styles.optionList}>
              {SUPPLIER_PLANT_OPTIONS.map((option) => {
                const isSelected = option.supplierPlantId === selectedSupplierPlant.supplierPlantId;

                return (
                  <Pressable
                    key={option.supplierPlantId}
                    onPress={() => {
                      setSelectedSupplierPlant(option);
                      setIsSupplierPickerVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <ThemedText type="smallBold">{option.supplierPlantName}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {option.supplierName}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
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
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  selectValue: {
    flex: 1,
    minWidth: 0,
  },
  selectChevron: {
    fontSize: 18,
    lineHeight: 22,
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
  modalRoot: {
    flex: 1,
    alignItems: "center",
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    gap: Spacing.three,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  optionList: {
    gap: Spacing.two,
  },
  optionButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  optionButtonSelected: {
    borderColor: Colors.light.accent,
    backgroundColor: Colors.light.backgroundSelected,
  },
});
