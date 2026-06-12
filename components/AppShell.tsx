'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Shared Layout Elements & Helpers
import MainContent from './sections/MainContent';
import SectionIconGrid from './SectionIconGrid';
import TopHeaderBar from './ui/TopHeaderBar';
import AppOverlays from './ui/AppOverlays';
import IntroSplash from './IntroSplash';

import { SectionType } from '@/types/navigation';
import { Device } from '@/types/device';
import { TAB_INDICES } from '@/lib/navigation';

import { getCampaignEvent } from '@/lib/constants';
import { useAppShellState } from './hooks/useAppShellState';
import { Sale, Movement } from '@/types/sale';
import { seedDemoData, clearDemoData, resetAppData } from '@/lib/demoData';
import { triggerFeedback } from '@/lib/nativeFeedback';
import { formatMovementDisplayDate, parseLocalDateKey } from '@/lib/dateUtils';

export default function AppShell() {
  const {
    activeTab, setActiveTab,
    prevTab, setPrevTab,
    theme, setTheme,
    submittedFeedback, setSubmittedFeedback,
    activeCarouselIndex, setActiveCarouselIndex,
    activeColorIndex, setActiveColorIndex,
    devices, setDevices,
    selectedDay, setSelectedDay,
    selectedMonth, setSelectedMonth,
    selectedYear, setSelectedYear,
    userName, setUserName,
    userStore, setUserStore,
    messages, setMessages,
    chatInput, setChatInput,
    notifications, setNotifications,
    sales, setSales,
    movements, setMovements,
    showCoin, setShowCoin,
    coinFeedbackAmount, setCoinFeedbackAmount
  } = useAppShellState();

  const [hasNewCalendarSale, setHasNewCalendarSale] = React.useState(false);
  const [activeTopNotification, setActiveTopNotification] = React.useState<{ deviceName: string; margin: number; colorName?: string } | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      (window as any).demoTools = { seedDemoData, clearDemoData, resetAppData };
    }
  }, []);

  const handleTabChange = (tab: SectionType) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
    void triggerFeedback('navigation');
    if (tab === 'calendar') {
      setHasNewCalendarSale(false);
    }
  };

  const direction = TAB_INDICES[activeTab] > TAB_INDICES[prevTab] ? 1 : -1;

  const handleConfirmSale = (device: Device, colorName: string | undefined, saleDate: string) => {
    const capturedAt = Date.now();
    const parsedSaleDate = parseLocalDateKey(saleDate);
    if (!parsedSaleDate) return;

    const saleId = `sale-${capturedAt}`;
    const formattedDate = formatMovementDisplayDate(saleDate, capturedAt);

    const newSale: Sale = {
      id: saleId,
      date: saleDate,
      deviceId: String(device.id),
      deviceName: device.name,
      deviceColor: colorName,
      amountEarned: device.margin,
      createdAt: capturedAt,
      day: parsedSaleDate.getDate()
    };

    const newMovement: Movement = {
      id: `mov-${Date.now()}`,
      type: 'income',
      source: 'sale',
      title: `Venta de ${device.name}`,
      amount: device.margin,
      date: formattedDate,
      effectiveDate: saleDate,
      createdAt: capturedAt,
      saleId: saleId
    };

    setSales(prev => [...prev, newSale]);
    setMovements(prev => [...prev, newMovement]);
    void triggerFeedback('success');

    setNotifications(prev => [
      {
        id: Date.now(),
        title: 'Venta Registrada',
        desc: `Comisión de $${device.margin} MXN abonada por registrar la venta de ${device.name}.`,
        time: 'Ahora mismo',
        active: true
      },
      ...prev
    ]);

    // Trigger golden coin slide trajectory animation
    setShowCoin(true);
    setCoinFeedbackAmount(device.margin);
    setTimeout(() => {
      setShowCoin(false);
      setCoinFeedbackAmount(null);
    }, 2000);

    setSubmittedFeedback(`+$${device.margin} MXN al Puerquito`);

    setSelectedDay(parsedSaleDate.getDate());
    setSelectedMonth(parsedSaleDate.getMonth());
    setSelectedYear(parsedSaleDate.getFullYear());
    
    // Set top announcement blinking banner and calendar marker states
    setHasNewCalendarSale(true);
    setActiveTopNotification({
      deviceName: device.name,
      margin: device.margin,
      colorName: colorName
    });

    // Automatically dismiss the blinking alert after 5.5 seconds
    setTimeout(() => {
      setActiveTopNotification(null);
    }, 5500);

    setTimeout(() => {
      setSubmittedFeedback(null);
    }, 4000);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden w-full flex items-center justify-center bg-neutral-950 font-sans relative select-none">
      <div 
        data-theme={theme}
        className="neo-app app-viewport h-[100dvh] max-h-[100dvh] overflow-hidden w-full max-w-[430px] min-w-0 flex flex-col relative select-none transition-colors duration-300"
      >
        <IntroSplash theme={theme} />

        {/* Top Header Bar */}
        <TopHeaderBar
          theme={theme}
          activeTab={activeTab}
        />

        {/* Main Viewport Container */}
        <MainContent
          theme={theme}
          setTheme={setTheme}
          activeTab={activeTab}
          direction={direction}
          devices={devices}
          setDevices={setDevices}
          activeCarouselIndex={activeCarouselIndex}
          setActiveCarouselIndex={setActiveCarouselIndex}
          activeColorIndex={activeColorIndex}
          setActiveColorIndex={setActiveColorIndex}
          handleConfirmSale={handleConfirmSale}
          userStore={userStore}
          setUserStore={setUserStore}
          userName={userName}
          setUserName={setUserName}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          getCampaignEvent={getCampaignEvent}
          sales={sales}
          setSales={setSales}
          movements={movements}
          setMovements={setMovements}
          handleTabChange={handleTabChange}
          hasNewCalendarSale={hasNewCalendarSale}
        />

        <AppOverlays
          theme={theme}
          activeTab={activeTab}
          devices={devices}
          activeCarouselIndex={activeCarouselIndex}
          setActiveCarouselIndex={setActiveCarouselIndex}
          showCoin={showCoin}
          submittedFeedback={submittedFeedback}
          activeColorIndex={activeColorIndex}
          activeTopNotification={activeTopNotification}
        />

        {/* ORIGINOS INSPIRED SYSTEM MODULAR ICON GRID LAUNCHER */}
        <SectionIconGrid 
          theme={theme}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          coinFeedbackAmount={coinFeedbackAmount}
          hasNewCalendarSale={hasNewCalendarSale}
        />
      </div>
    </div>
  );
}
