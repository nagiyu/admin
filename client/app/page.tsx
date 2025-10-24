'use client';

import React from 'react';

import { PermissionLevel } from '@common/enums/PermissionLevel';

import FeatureGuard from '@client-common/components/authorization/FeatureGuard';
import HomePage, { HomePageButton } from '@client-common/pages/HomePage';

import { AdminFeature } from '@admin/consts/AdminConst';

export default function Home() {
  const buttons: HomePageButton[] = [
    {
      label: 'Error Notifications',
      url: '/error-notifications',
    }
  ];

  return (
    <FeatureGuard
      feature={AdminFeature.HOME}
      level={PermissionLevel.VIEW}
    >
      <HomePage buttons={buttons} />
    </FeatureGuard>
  );
}
