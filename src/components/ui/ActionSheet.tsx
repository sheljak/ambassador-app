import { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';

export interface ActionSheetOption {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

export interface ActionSheetRef {
  open: () => void;
  close: () => void;
}

interface ActionSheetProps {
  title?: string;
  options: ActionSheetOption[];
  onClose?: () => void;
}

export const ActionSheet = forwardRef<ActionSheetRef, ActionSheetProps>(
  ({ title, options, onClose }, ref) => {
    const { showActionSheetWithOptions } = useActionSheet();

    const open = useCallback(() => {
      const labels = [...options.map((o) => o.label), 'Cancel'];
      const cancelButtonIndex = labels.length - 1;
      const destructiveButtonIndex = options.findIndex((o) => o.destructive);

      showActionSheetWithOptions(
        {
          title,
          options: labels,
          cancelButtonIndex,
          destructiveButtonIndex: destructiveButtonIndex >= 0 ? destructiveButtonIndex : undefined,
        },
        (selectedIndex?: number) => {
          if (selectedIndex !== undefined && selectedIndex < options.length) {
            options[selectedIndex].onPress();
          } else {
            onClose?.();
          }
        },
      );
    }, [options, title, onClose, showActionSheetWithOptions]);

    useImperativeHandle(ref, () => ({
      open,
      close: () => {},
    }));

    return null;
  },
);

ActionSheet.displayName = 'ActionSheet';
