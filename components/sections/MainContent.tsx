'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'motion/react';
import { SectionType } from '@/types/navigation';
import { Device } from '@/types/device';
import ScreenTransition from '../ScreenTransition';

import RegisterSaleSection from './RegisterSaleSection';
import { Sale, Movement } from '@/types/sale';

const SectionLoading = () => (
  <div className="flex min-h-[220px] w-full flex-1 items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-neutral-400/30 border-t-[var(--neo-text)] animate-spin" />
  </div>
);

const CalendarSection = dynamic(() => import('./CalendarSection'), {
  ssr: false,
  loading: SectionLoading,
});

const CatalogSection = dynamic(() => import('./CatalogSection'), {
  ssr: false,
  loading: SectionLoading,
});

const PiggyBankSection = dynamic(() => import('./PiggyBankSection'), {
  ssr: false,
  loading: SectionLoading,
});

const SettingsSection = dynamic(() => import('./SettingsSection'), {
  ssr: false,
  loading: SectionLoading,
});

interface MainContentProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  activeTab: SectionType;
  direction: number;
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  activeCarouselIndex: number;
  setActiveCarouselIndex: (idx: number) => void;
  activeColorIndex: number;
  setActiveColorIndex: (idx: number) => void;
  handleConfirmSale: (device: Device, colorName: string | undefined, saleDate: string) => void;
  userStore: string;
  setUserStore: (val: string) => void;
  userName: string;
  setUserName: (val: string) => void;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  getCampaignEvent: (day: number) => string;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  movements: Movement[];
  setMovements: React.Dispatch<React.SetStateAction<Movement[]>>;
  handleTabChange: (tab: SectionType) => void;
  hasNewCalendarSale?: boolean;
}

export default function MainContent({
  theme,
  setTheme,
  activeTab,
  direction,
  devices,
  setDevices,
  activeCarouselIndex,
  setActiveCarouselIndex,
  activeColorIndex,
  setActiveColorIndex,
  handleConfirmSale,
  userStore,
  setUserStore,
  userName,
  setUserName,
  selectedDay,
  setSelectedDay,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  getCampaignEvent,
  sales,
  setSales,
  movements,
  setMovements,
  handleTabChange,
  hasNewCalendarSale
}: MainContentProps) {
  return (
    <main className={`flex-1 w-full max-w-xl mx-auto flex flex-col overflow-hidden justify-start min-h-0 transition-all duration-300 ${activeTab === 'catalog' ? 'px-0 pt-2 pb-0' : 'px-4 xs:px-6'} ${activeTab === 'register-sale' ? 'pt-2 xs:pt-4 pb-24 xs:pb-28' : ''} ${activeTab === 'calendar' ? 'pb-0 pt-2' : ''} ${activeTab === 'settings' ? 'pb-0 pt-2' : ''} ${activeTab !== 'catalog' && activeTab !== 'register-sale' && activeTab !== 'calendar' && activeTab !== 'settings' ? 'pb-24 xs:pb-28' : ''}`}>
      <AnimatePresence custom={direction} mode="wait">
        
        {/* SECTION: REGISTER SALE */}
        {activeTab === 'register-sale' && (
          <ScreenTransition key="register-sale" direction={direction} activeKey="register-sale" className="w-full flex-1 flex flex-col justify-start">
            <RegisterSaleSection
              theme={theme}
              devices={devices.filter(d => d.active !== false)}
              activeCarouselIndex={activeCarouselIndex}
              setActiveCarouselIndex={setActiveCarouselIndex}
              onConfirmSale={handleConfirmSale}
              activeColorIndex={activeColorIndex}
              setActiveColorIndex={setActiveColorIndex}
            />
          </ScreenTransition>
        )}

        {/* SECTION: CALENDAR */}
        {activeTab === 'calendar' && (
          <ScreenTransition key="calendar" direction={direction} activeKey="calendar" className="w-full flex-1 flex flex-col min-h-0">
            <CalendarSection
              theme={theme}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              getCampaignEvent={getCampaignEvent}
              sales={sales}
              hasNewCalendarSale={hasNewCalendarSale}
            />
          </ScreenTransition>
        )}

        {/* SECTION: CATALOG */}
        {activeTab === 'catalog' && (
          <ScreenTransition key="catalog" direction={direction} activeKey="catalog" className="w-full flex-1 flex flex-col min-h-0">
            <CatalogSection
              theme={theme}
              devices={devices}
              onNavigateToSale={(idx) => {
                setActiveCarouselIndex(idx);
                handleTabChange('register-sale');
              }}
            />
          </ScreenTransition>
        )}

        {/* SECTION: PIGGY BANK */}
        {activeTab === 'piggy-bank' && (
          <ScreenTransition key="piggy-bank" direction={direction} activeKey="piggy-bank" className="w-full flex-1 flex flex-col min-h-0">
            <PiggyBankSection
              theme={theme}
              movements={movements}
              sales={sales}
            />
          </ScreenTransition>
        )}

        {/* SECTION: SETTINGS */}
        {activeTab === 'settings' && (
          <ScreenTransition key="settings" direction={direction} activeKey="settings" className="w-full flex-1 flex flex-col min-h-0">
          <SettingsSection
              theme={theme}
              setTheme={setTheme}
              userName={userName}
              setUserName={setUserName}
              userStore={userStore}
              setUserStore={setUserStore}
              devices={devices}
              setDevices={setDevices}
              sales={sales}
              movements={movements}
              setSales={setSales}
              setMovements={setMovements}
            />
          </ScreenTransition>
        )}

      </AnimatePresence>
    </main>
  );
}
