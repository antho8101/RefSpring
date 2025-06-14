
import { useState } from 'react';

interface ConfirmDialog {
  open: boolean;
  title: string;
  description: string;
  action: () => void;
  confirmText?: string;
  variant?: 'warning' | 'danger';
}

export const useCriticalActionConfirm = () => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  const showConfirmDialog = (
    title: string,
    description: string,
    action: () => void,
    confirmText?: string,
    variant?: 'warning' | 'danger'
  ) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      confirmText,
      variant,
      action,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  return {
    confirmDialog,
    showConfirmDialog,
    closeConfirmDialog,
  };
};
