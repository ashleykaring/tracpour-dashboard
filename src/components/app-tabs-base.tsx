import { router, usePathname } from "expo-router";
import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ThemedText } from "./themed-text";

const HEADER_HEIGHT = 108;
const CONTENT_TOP_GAP = Spacing.two;

export default function AppTabsBase({ children }: PropsWithChildren) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <SafeAreaView
        edges={["top"]}
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.three,
            backgroundColor: theme.navNavy,
            borderBottomColor: theme.navBorder,
          },
        ]}
      >
        <View style={styles.navInner}>
          <View style={styles.brandRow}>
            <ThemedText type="screenTitle" style={styles.title}>
              <ThemedText type="screenTitle" style={styles.titleTrack}>
                Trac
              </ThemedText>
              <ThemedText
                type="screenTitle"
                style={[styles.titleTrack, { color: theme.brandBlue }]}
              >
                Pour
              </ThemedText>
            </ThemedText>

            <QrCodeButton />
          </View>

          <View
            style={[
              styles.tabBar,
              {
                backgroundColor: "transparent",
                borderColor: theme.navBorder,
              },
            ]}
          >
            <TabButton
              label="Live"
              isFocused={pathname === "/live" || pathname === "/"}
              onPress={() => router.replace("/live")}
            />
            <TabButton
              label="Tickets"
              isFocused={pathname === "/tickets"}
              onPress={() => router.replace("/tickets")}
            />
            <TabButton
              label="History"
              isFocused={pathname === "/history"}
              onPress={() => router.replace("/history")}
            />
          </View>
        </View>
      </SafeAreaView>

      <View
        style={[
          styles.content,
          { paddingTop: HEADER_HEIGHT + insets.top + CONTENT_TOP_GAP },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

type TabButtonProps = {
  label: string;
  isFocused: boolean;
  onPress: () => void;
};

function TabButton({ label, isFocused, onPress }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.tabButtonInner,
          {
            backgroundColor: isFocused ? theme.navSelected : "transparent",
          },
        ]}
      >
        <ThemedText
          type="smallBold"
          style={[
            styles.tabLabel,
            { color: isFocused ? theme.navText : theme.navMutedText },
          ]}
        >
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function QrCodeButton() {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Download and QR Code"
      onPress={() => undefined}
      style={({ pressed }) => [
        styles.qrButton,
        {
          backgroundColor: theme.background,
          borderColor: "rgba(255,255,255,0.72)",
          shadowColor: theme.shadow,
        },
        pressed && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons name="qrcode" size={27} color={theme.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  navInner: {
    width: "100%",
    maxWidth: MaxContentWidth,
    gap: Spacing.two,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  title: {
    flexShrink: 1,
    textAlign: "left",
    fontFamily: "BarlowCondensed_700Bold",
    color: "#F5F7FA",
  },
  titleTrack: {
    fontFamily: "BarlowCondensed_700Bold",
    color: "#F5F7FA",
  },
  tabBar: {
    flexDirection: "row",
    gap: Spacing.one,
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.one,
  },
  tabButton: {
    flex: 1,
  },
  tabButtonInner: {
    minHeight: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  tabLabel: {
    fontFamily: "Barlow_600SemiBold",
  },
  qrButton: {
    flexDirection: "row",
    minHeight: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    marginBottom: 5,
  },
  pressed: {
    opacity: 0.4,
  },
  content: {
    flex: 1,
  },
});
