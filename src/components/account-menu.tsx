import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

import { SignOutButton } from './sign-out-button';

export function AccountMenu({ light = false }: { light?: boolean }) {
  const theme = useTheme();
  const { session } = useAuth();
  const { width } = useWindowDimensions();
  const triggerRef = useRef<View>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  function openMenu() {
    triggerRef.current?.measureInWindow((x, y, triggerWidth, triggerHeight) => {
      setPosition({ top: y + triggerHeight + 8, right: Math.max(16, width - x - triggerWidth) });
    });
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account menu"
          accessibilityState={{ expanded: position !== null }}
          onPress={openMenu}
          style={({ pressed }) => [
            styles.trigger,
            { borderColor: light ? theme.navBorder : theme.cardBorder, backgroundColor: light ? theme.navSelected : theme.backgroundElement },
            pressed && styles.pressed,
          ]}>
          <MaterialCommunityIcons name="account-outline" size={24} color={light ? theme.navText : theme.accent} />
        </Pressable>
      </View>

      <Modal transparent visible={position !== null} animationType="fade" statusBarTranslucent onRequestClose={() => setPosition(null)}>
        <View style={styles.modalRoot}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close account menu" style={StyleSheet.absoluteFill} onPress={() => setPosition(null)} />
          {position && (
            <View
              accessibilityViewIsModal
              style={[styles.menu, { top: position.top, right: position.right, maxWidth: Math.max(0, width - 32), backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder, shadowColor: theme.shadow }]}>
              <Text style={[styles.heading, { color: theme.text }]}>Account</Text>
              {session?.user.email && <Text style={[styles.email, { color: theme.textSecondary }]} numberOfLines={2}>{session.user.email}</Text>}
              <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
              <SignOutButton />
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  modalRoot: { flex: 1 },
  menu: { position: 'absolute', width: 260, padding: 16, borderWidth: 1, borderRadius: 16, shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  heading: { fontSize: 16, fontWeight: '700' },
  email: { fontSize: 14, marginTop: 4 },
  divider: { height: 1, marginVertical: 12 },
});
