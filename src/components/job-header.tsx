import { StyleSheet, View } from "react-native";

import { Spacing } from "@/constants/theme";
import type { Job } from "@/lib/types";

import { StatusPill } from "./status-pill";
import { ThemedText } from "./themed-text";

type JobHeaderProps = {
  job: Job | null;
};

export function JobHeader({ job }: JobHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <ThemedText type="eyebrow">Job</ThemedText>
          <ThemedText type="screenTitle" style={styles.jobTitle}>
            {job?.name ?? "Loading active job"}
          </ThemedText>
        </View>
        <StatusPill label={job?.status ?? "active"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.three,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  jobTitle: {
    fontFamily: "BarlowCondensed_700Bold",
  },
});
