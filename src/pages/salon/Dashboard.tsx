import React from 'react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { OwnerDataProvider } from '../../context/OwnerDataContext';
import { ToastProvider } from '../../components/owner/ui/Toast';

export default function DashboardSalon() {
  return (
    <ToastProvider>
      <OwnerDataProvider role="salonera">
        <OwnerLayout role="salonera" />
      </OwnerDataProvider>
    </ToastProvider>
  );
}
