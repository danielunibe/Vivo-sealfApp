import { useState, useEffect } from 'react';
import { 
  safeGetItem, 
  safeSetItem,
  savePersistedSales,
  savePersistedMovements,
  savePersistedDevices 
} from '@/lib/storage';
import { loadCriticalDataFromBestAvailableStorage } from '@/lib/persistentStorage';
import { runDataMigrations } from '@/lib/migrations';
import { SectionType } from '@/types/navigation';
import { Device } from '@/types/device';
import { ChatMessage, NotificationItem, INITIAL_DEVICES, INITIAL_CHATS, INITIAL_NOTIFICATIONS } from '@/lib/constants';
import { Sale, Movement } from '@/types/sale';

export function useAppShellState() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionType>('register-sale');
  const [prevTab, setPrevTab] = useState<SectionType>('register-sale');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  const [activeCarouselIndex, setActiveCarouselIndex] = useState(3);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [prevCarouselIndex, setPrevCarouselIndex] = useState(activeCarouselIndex);
  
  if (activeCarouselIndex !== prevCarouselIndex) {
    setActiveColorIndex(0);
    setPrevCarouselIndex(activeCarouselIndex);
  }

  const today = new Date();
  
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [userName, setUserName] = useState('Promotor de Campo');
  const [userStore, setUserStore] = useState('Zona Centro');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHATS);
  const [chatInput, setChatInput] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [sales, setSales] = useState<Sale[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [showCoin, setShowCoin] = useState(false);
  const [coinFeedbackAmount, setCoinFeedbackAmount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      runDataMigrations();
      setTheme(safeGetItem<'light' | 'dark'>('vivo_theme', 'light'));
      setUserName(safeGetItem<string>('vivo_userName', 'Promotor de Campo'));
      setUserStore(safeGetItem<string>('vivo_userStore', 'Zona Centro'));
      setMessages(safeGetItem<ChatMessage[]>('vivo_messages', INITIAL_CHATS));
      setNotifications(safeGetItem<NotificationItem[]>('vivo_notifications', INITIAL_NOTIFICATIONS));

      const now = new Date();
      setSelectedDay(safeGetItem<number>('vivo_selectedDay', now.getDate()));
      setSelectedMonth(safeGetItem<number>('vivo_selectedMonth', now.getMonth()));
      setSelectedYear(safeGetItem<number>('vivo_selectedYear', now.getFullYear()));
      setActiveCarouselIndex(safeGetItem<number>('vivo_activeCarouselIndex', 3));

      const critical = await loadCriticalDataFromBestAvailableStorage();
      if (cancelled) return;

      setDevices(critical.devices);
      setSales(critical.sales);
      setMovements(critical.movements);
      setIsLoaded(true);
    };

    const timer = setTimeout(() => {
      void hydrate();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Clamp carousel index when devices are added/removed/deactivated
  const activeDevices = devices.filter(d => d.active !== false);
  useEffect(() => {
    if (isLoaded && activeCarouselIndex >= activeDevices.length && activeDevices.length > 0) {
      setActiveCarouselIndex(activeDevices.length - 1);
    }
  }, [devices, activeCarouselIndex, activeDevices.length, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    safeSetItem('vivo_theme', theme);
  }, [theme, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    savePersistedDevices(devices);
  }, [devices, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    safeSetItem('vivo_userName', userName);
  }, [userName, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    safeSetItem('vivo_userStore', userStore);
  }, [userStore, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    safeSetItem('vivo_messages', messages);
  }, [messages, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    safeSetItem('vivo_notifications', notifications);
  }, [notifications, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    savePersistedSales(sales);
  }, [sales, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    savePersistedMovements(movements);
  }, [movements, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    safeSetItem('vivo_selectedDay', selectedDay);
  }, [selectedDay, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    safeSetItem('vivo_selectedMonth', selectedMonth);
  }, [selectedMonth, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    safeSetItem('vivo_selectedYear', selectedYear);
  }, [selectedYear, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    safeSetItem('vivo_activeCarouselIndex', activeCarouselIndex);
  }, [activeCarouselIndex, isLoaded]);

  return {
    isLoaded, setIsLoaded,
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
  };
}
