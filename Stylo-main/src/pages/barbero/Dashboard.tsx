import React from 'react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { OwnerDataProvider } from '../../context/OwnerDataContext';
import { ToastProvider } from '../../components/owner/ui/Toast';

export default function DashboardBarbero() {
  return (
    <ToastProvider>
      <OwnerDataProvider role="barbero">
        <OwnerLayout role="barbero" />
      </OwnerDataProvider>
    </ToastProvider>
  );
}
