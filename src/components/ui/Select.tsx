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
import { useTheme } from '@/theme';

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
                    pressed && { backgroundColor: colors.background.tertiary },
                  ]}
                  onPress={handleAddCustom}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.interactive.default} style={{ marginRight: 8 }} />
                  <Text style={[styles.optionText, { color: colors.interactive.default }]}>
                    Add "{search.trim()}"
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
                    pressed && { backgroundColor: colors.background.tertiary },
                  ]}
                  onPress={handleAddCustom}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.interactive.default} style={{ marginRight: 8 }} />
                  <Text style={[styles.optionText, { color: colors.interactive.default }]}>
                    Add "{search.trim()}"
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 44,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  searchIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    paddingRight: 8,
  },
  clearButton: {
    paddingHorizontal: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
  addCustomItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
