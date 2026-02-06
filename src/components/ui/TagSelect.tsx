import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createStyles } from '@/theme';
import type { SelectItem } from './Select';

export interface TagSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  items: SelectItem[];
  selectedIds: (number | string)[];
  onChanged: (ids: (number | string)[]) => void;
  error?: string;
  disabled?: boolean;
  maxSelection?: number;
  minSelection?: number;
}

export function TagSelect({
  label,
  placeholder = 'Select interests',
  searchPlaceholder = 'Search...',
  items,
  selectedIds,
  onChanged,
  error,
  disabled = false,
  maxSelection = 4,
  minSelection = 0,
}: TagSelectProps) {
  const { colors, palette, shapes } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [tempSelected, setTempSelected] = useState<(number | string)[]>([]);

  const hasError = !!error;
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const selectedItems = useMemo(
    () => safeItems.filter((item) => selectedIds.includes(item.id)),
    [safeItems, selectedIds]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return safeItems;
    const lower = search.toLowerCase();
    return safeItems.filter((item) => item.name.toLowerCase().includes(lower));
  }, [safeItems, search]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setSearch('');
    setTempSelected([...selectedIds]);
    setVisible(true);
  }, [disabled, selectedIds]);

  const handleToggle = useCallback(
    (item: SelectItem) => {
      setTempSelected((prev) => {
        if (prev.includes(item.id)) {
          return prev.filter((id) => id !== item.id);
        }
        if (prev.length >= maxSelection) return prev;
        return [...prev, item.id];
      });
    },
    [maxSelection]
  );

  const handleDone = useCallback(() => {
    onChanged(tempSelected);
    setVisible(false);
  }, [onChanged, tempSelected]);

  const handleRemoveTag = useCallback(
    (id: number | string) => {
      onChanged(selectedIds.filter((sid) => sid !== id));
    },
    [onChanged, selectedIds]
  );

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

      {/* Selected tags display */}
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
        {selectedItems.length > 0 ? (
          <View style={styles.tagsContainer}>
            {selectedItems.map((item) => (
              <View
                key={String(item.id)}
                style={[
                  styles.tag,
                  {
                    backgroundColor: palette.primary[50],
                    borderColor: palette.primary[200],
                    borderRadius: shapes.radius.sm,
                  },
                ]}
              >
                <Text
                  style={[styles.tagText, { color: palette.primary[700] }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(item.id);
                  }}
                  hitSlop={6}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={palette.primary[400]}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.placeholderText, { color: colors.text.secondary }]}>
            {placeholder}
          </Text>
        )}
        <Ionicons name="chevron-down" size={18} color={colors.text.secondary} />
      </Pressable>

      {hasError && (
        <Text style={[styles.error, { color: colors.status.error }]}>{error}</Text>
      )}

      {/* Modal */}
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
            <Pressable onPress={() => setVisible(false)} style={styles.cancelButton}>
              <Text style={[styles.headerButton, { color: colors.text.secondary }]}>
                Cancel
              </Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              {label || 'Select'}
            </Text>
            <Pressable onPress={handleDone} style={styles.doneButton}>
              <Text style={[styles.headerButton, { color: palette.primary[500] }]}>
                Done
              </Text>
            </Pressable>
          </View>

          {/* Counter */}
          <View style={styles.counterRow}>
            <Text style={[styles.counterText, { color: colors.text.secondary }]}>
              {tempSelected.length} / {maxSelection} selected
              {minSelection > 0 ? ` (min ${minSelection})` : ''}
            </Text>
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
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
              </Pressable>
            )}
          </View>

          {/* Tags grid */}
          <ScrollView
            contentContainerStyle={[
              styles.tagsGrid,
              { paddingBottom: insets.bottom + 16 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                  No results found
                </Text>
              </View>
            ) : (
              <View style={styles.tagsWrap}>
                {filtered.map((item) => {
                  const isSelected = tempSelected.includes(item.id);
                  const isDisabled = !isSelected && tempSelected.length >= maxSelection;
                  return (
                    <Pressable
                      key={String(item.id)}
                      onPress={() => !isDisabled && handleToggle(item)}
                      style={[
                        styles.tagOption,
                        {
                          borderColor: isSelected
                            ? palette.primary[500]
                            : colors.border.default,
                          backgroundColor: isSelected
                            ? palette.primary[50]
                            : colors.background.secondary,
                          borderRadius: shapes.radius.md,
                        },
                        isDisabled && { opacity: 0.4 },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={palette.primary[500]}
                          style={styles.checkIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.tagOptionText,
                          {
                            color: isSelected
                              ? palette.primary[700]
                              : colors.text.primary,
                          },
                          isSelected && { fontWeight: '600' },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const useStyles = createStyles(({ spacing, typography, shapes }) => ({
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
    paddingVertical: spacing.sm,
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs * 1.5,
    marginRight: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs * 2.5,
    paddingVertical: spacing.xs * 1.25,
    borderWidth: 1,
    gap: spacing.xs,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    maxWidth: spacing.xs * 30,
  },
  placeholderText: {
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm * 1.5,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  cancelButton: {
    padding: spacing.xs,
  },
  doneButton: {
    padding: spacing.xs,
  },
  headerButton: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  counterRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs * 2.5,
    paddingBottom: spacing.xs,
  },
  counterText: {
    fontSize: typography.fontSize.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: spacing.xs * 11,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm * 1.5,
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
  tagsGrid: {
    paddingHorizontal: spacing.md,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs * 3.5,
    paddingVertical: spacing.xs * 2.5,
    borderWidth: spacing.xs * 0.375,
  },
  tagOptionText: {
    fontSize: typography.fontSize.sm,
  },
  checkIcon: {
    marginRight: spacing.xs,
  },
  emptyContainer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
  },
}));
