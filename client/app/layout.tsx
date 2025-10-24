import type { Metadata } from 'next';

import CommonLayout from '@client-common/components/layout/CommonLayout';
import { MenuItemData } from '@client-common/components/navigations/Menus/LinkMenu';

import "./globals.css";

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Admin Application',
};

const menuItem: MenuItemData[] = [
  {
    title: 'Home',
    url: '/',
  },
  {
    title: 'Error Notifications',
    url: '/error-notifications',
  }
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CommonLayout
      title='Admin'
      menuItems={menuItem}
      enableAuthentication={true}
      enableNotification={true}
    >
      {children}
    </CommonLayout>
  );
}
