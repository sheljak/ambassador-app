import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createStyles } from '@/theme';

export interface SelectItem {
  id: number | string;
  name: string;
  [key: string]: unknown;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  items: SelectItem[];
  value?: number | string | null;
  onSelect: (item: SelectItem) => void;
  error?: string;
  disabled?: boolean;
  /** When true, shows an "Add <search>" option if no exact match is found */
  allowCustom?: boolean;
}

export function Select({
  label,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  items,
  value,
  onSelect,
  error,
  disabled = false,
  allowCustom = false,
}: SelectProps) {
  const { colors, shapes } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const hasError = !!error;
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const selectedItem = useMemo(
    () => {
      const found = safeItems.find((item) => item.id === value);
      // For custom values not in items list, show the value as name
      if (!found && value != null && allowCustom) {
        return { id: value, name: String(value) };
      }
      return found;
    },
    [safeItems, value, allowCustom]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return safeItems;
    const lower = search.toLowerCase();
    return safeItems.filter((item) => item.name.toLowerCase().includes(lower));
  }, [safeItems, search]);

  // Whether to show "Add custom" option
  const showAddCustom = useMemo(() => {
    if (!allowCustom || !search.trim()) return false;
    const lower = search.trim().toLowerCase();
    return !safeItems.some((item) => item.name.toLowerCase() === lower);
  }, [allowCustom, search, safeItems]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setSearch('');
    setVisible(true);
  }, [disabled]);

  const handleSelect = useCallback(
    (item: SelectItem) => {
      onSelect(item);
      setVisible(false);
    },
    [onSelect]
  );

  const handleAddCustom = useCallback(() => {
    const customName = search.trim();
    if (!customName) return;
    onSelect({ id: customName, name: customName });
    setVisible(false);
  }, [search, onSelect]);

  const borderColor = hasError ? colors.status.error : colors.border.default;

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: hasError ? colors.status.error : colors.text.secondary },
          ]}
        >
          {label}
        </Text>
      )}

      <Pressable
        style={[
          styles.trigger,
          {
            backgroundColor: disabled
              ? colors.background.tertiary
              : colors.background.secondary,
            borderColor,
            borderRadius: shapes.radius.md,
          },
        ]}
        onPress={handleOpen}
      >
        <Text
          style={[
            styles.triggerText,
            { color: selectedItem ? colors.text.primary : colors.text.secondary },
          ]}
          numberOfLines={1}
        >
          {selectedItem?.name || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.text.secondary} />
      </Pressable>

      {hasError && (
        <Text style={[styles.error, { color: colors.status.error }]}>{error}</Text>
      )}

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background.primary, paddingTop: insets.top || 16 },
          ]}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border.default }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              {label || 'Select'}
            </Text>
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          {/* Search */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
                borderRadius: shapes.radius.md,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={colors.text.secondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.text.disabled}
              value={search}
              onChangeText={setSearch}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
              </Pressable>
            )}
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            renderItem={({ item }) => {
              const isSelected = item.id === value;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.optionItem,
                    pressed && { backgroundColor: colors.background.tertiary },
                    isSelected && { backgroundColor: colors.background.secondary },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.text.primary },
                      isSelected && { fontWeight: '600' },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={colors.interactive.default} />
                  )}
                </Pressable>
              );
            }}
            ListFooterComponent={
              showAddCustom && filtered.length > 0 ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.optionItem,
                    styles.addCustomItem,
                    { borderTopColor: colors.border.default },
                    pressed && { backgroundColor: colors.background.tertiary },
                  ]}
                  onPress={handleAddCustom}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.interactive.default}
                    style={styles.addIcon}
                  />
                  <Text style={[styles.optionText, { color: colors.interactive.default }]}>
                    {`Add "${search.trim()}"`}
                  </Text>
                </Pressable>
              ) : null
            }
            ListEmptyComponent={
              showAddCustom ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.optionItem,
                    styles.addCustomItem,
                    { borderTopColor: colors.border.default },
                    pressed && { backgroundColor: colors.background.tertiary },
                  ]}
                  onPress={handleAddCustom}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.interactive.default}
                    style={styles.addIcon}
                  />
                  <Text style={[styles.optionText, { color: colors.interactive.default }]}>
                    {`Add "${search.trim()}"`}
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                    No results found
                  </Text>
                </View>
              )
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const useStyles = createStyles(({ spacing, typography }) => ({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    minHeight: spacing.xs * 12,
    paddingHorizontal: spacing.xs * 3.5,
    paddingVertical: spacing.sm * 1.5,
  },
  triggerText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    marginRight: spacing.sm,
  },
  error: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm * 1.5,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.sm * 1.5,
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: spacing.xs * 11,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm * 1.5,
    marginBottom: spacing.sm,
  },
  searchIcon: {
    paddingLeft: spacing.sm * 1.5,
    paddingRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    paddingVertical: spacing.xs * 2.5,
    paddingRight: spacing.sm,
  },
  clearButton: {
    paddingHorizontal: spacing.xs * 2.5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs * 3.5,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  addCustomItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addIcon: {
    marginRight: spacing.sm,
  },
  emptyContainer: {
    paddingVertical: spacing.xs * 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
  },
}));
