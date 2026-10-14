import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../../components/Toast';

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: number;
  emoji: string;
}

interface Story {
  id: string;
  title: string;
  duration: string;
  date: string;
  emoji: string;
}

interface PreHarvestOffer {
  id: string;
  buyerName: string;
  offeredPrice: string;
  requestedQuantity: string;
  offerDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterPrice?: string;
}

interface PreHarvestListing {
  id: string;
  title: string;
  landLocation: string;
  estimatedHarvestDate: string;
  estimatedQuantity: string;
  startingPrice: string;
  features: string;
  adminApprovalStatus: 'pending_approval' | 'approved' | 'rejected';
  status: 'active' | 'completed';
  offers: PreHarvestOffer[];
}

interface CostItem {
  id: string;
  type: 'expense' | 'income';
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface CropCostLedger {
  id: string;
  cropName: string;
  season: string;
  items: CostItem[];
}

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  note: string;
  isAlarmActive: boolean;
}

interface NewsItem {
  id: string;
  source: 'Tarım Bakanlığı' | 'TZOB' | 'TÜİK' | 'Tarım Haber';
  sourceBadgeColor: string;
  title: string;
  summary: string;
  date: string;
  url: string;
}

export default function CooperativeDashboardScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'products' | 'preharvest' | 'complaints' | 'finances' | 'stories' | 'calendar' | 'news'>('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profil İçi Sekmeler (Sadece Aktif Ürünler ve Stoğu Bitenler)
  const [profileSubTab, setProfileSubTab] = useState<'active-products' | 'out-of-stock'>('active-products');

  // Hasat Öncesi İçi Sekmeler ve Form State'leri
  const [preharvestSubTab, setPreharvestSubTab] = useState<'active-preharvest' | 'pending-preharvest' | 'completed-preharvest'>('active-preharvest');
  const [isNewPreharvestFormOpen, setIsNewPreharvestFormOpen] = useState(false);
  const [phTitle, setPhTitle] = useState('');
  const [phLandLocation, setPhLandLocation] = useState('');
  const [phHarvestDate, setPhHarvestDate] = useState('');
  const [phQuantity, setPhQuantity] = useState('');
  const [phPrice, setPhPrice] = useState('');
  const [phFeatures, setPhFeatures] = useState('');

  // Karşı Teklif State'leri
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState('');

  // Yeni Ürün Form State'leri
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('10');
  const [productCategory, setProductCategory] = useState('Zeytin & Zeytinyağı');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Ürün Düzenleme Modal State'leri
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  // Hikaye Ekleme State'leri
  const [storyTitle, setStoryTitle] = useState('');
  const [selectedVideoName, setSelectedVideoName] = useState<string | null>(null);

  // Ürün Bazlı Maliyet & Gelir Defteri State'leri
  const [cropLedgers, setCropLedgers] = useState<CropCostLedger[]>([
    {
      id: '1',
      cropName: 'Kooperatif Erken Hasat Sızma Zeytinyağı',
      season: '2026 Sezonu',
      items: [
        { id: '101', type: 'expense', title: 'Ortak Tesis Sıkım Gideri', amount: 15000, category: 'İşçilik', date: '10 Mayıs' },
        { id: '102', type: 'expense', title: 'Ambalaj ve Teneke Maliyeti', amount: 8000, category: 'Diğer Gider', date: '15 Mayıs' },
        { id: '103', type: 'income', title: 'Toptan Kooperatif Satışı', amount: 85400, category: 'Mahsul Satışı', date: '20 Mayıs' },
      ]
    }
  ]);

  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [isNewCropFormOpen, setIsNewCropFormOpen] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [newCropSeason, setNewCropSeason] = useState('2026 Sezonu');

  // Kalem Ekleme / Düzenleme Formu
  const [isNewItemFormOpen, setIsNewItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemType, setItemType] = useState<'expense' | 'income'>('expense');
  const [itemTitle, setItemTitle] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemCategory, setItemCategory] = useState('Gübre');
  const [isItemCatOpen, setIsItemCatOpen] = useState(false);

  // Takvim, Not ve Alarm State'leri
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: '1', date: '2026-10-20', time: '09:00', title: 'Ortaklar Toplantısı', note: 'Kooperatif binasında aylık değerlendirme yapılacak.', isAlarmActive: true },
    { id: '2', date: '2026-10-25', time: '14:30', title: 'Gübre Dağıtımı', note: 'Ortaklara sezonluk gübre sevkiyatı kontrolü.', isAlarmActive: true }
  ]);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [eventDate, setEventDate] = useState('2026-10-20');
  const [eventTime, setEventTime] = useState('10:00');
  const [eventTitle, setEventTitle] = useState('');
  const [eventNote, setEventNote] = useState('');

  // Haber Akışı State'leri
  const [selectedNewsFilter, setSelectedNewsFilter] = useState<'all' | 'Tarım Bakanlığı' | 'TZOB' | 'TÜİK' | 'Tarım Haber'>('all');
  const [newsList] = useState<NewsItem[]>([
    {
      id: '1',
      source: 'Tarım Bakanlığı',
      sourceBadgeColor: '#166534',
      title: '2026 Yılı Tarımsal Destekleme Ödemeleri Başladı',
      summary: 'Mazot, gübre ve sertifikalı tohum desteği ödemelerinin üreticilerin hesaplarına aktarılmaya başlandığı duyuruldu.',
      date: 'Bugün, 11:30',
      url: 'https://www.tarimorman.gov.tr'
    },
    {
      id: '2',
      source: 'TZOB',
      sourceBadgeColor: '#1D4ED8',
      title: 'Bayraktar: "Zeytin ve Zeytinyağı Üreticisine Taban Fiyat Desteği Şart"',
      summary: 'Türkiye Ziraat Odaları Birliği (TZOB) Genel Başkanı Şemsi Bayraktar, yeni sezon rekolte tahminleri ve üretici maliyetlerine ilişkin basın açıklaması düzenledi.',
      date: 'Bugün, 09:15',
      url: 'https://www.tzob.org.tr'
    },
    {
      id: '3',
      source: 'TÜİK',
      sourceBadgeColor: '#B45309',
      title: 'TÜİK Tarımsal Girdi Fiyat Endeksi Açıklandı',
      summary: '2026 yılı tarımsal girdi fiyat endeksi (Tarım-GFE) yıllık bazdaki değişim oranları açıklandı.',
      date: 'Dün, 14:00',
      url: 'https://www.tuik.gov.tr'
    },
    {
      id: '4',
      source: 'Tarım Haber',
      sourceBadgeColor: '#7C3AED',
      title: 'Akhisar Bölgesinde Erken Hasat Zeytinyağı Verimi Yüz Güldürüyor',
      summary: 'Manisa ve çevresindeki zeytin üreticileri bu sezon soğuk sıkım sızma zeytinyağında yüksek kalite ve rekolte bekliyor.',
      date: '2 gün önce',
      url: 'https://www.tarimhaber.com'
    }
  ]);

  const expenseCategories = ['Gübre', 'Mazot & Yakıt', 'Tohum & Fide', 'İlaçlama', 'İşçilik', 'Sulama', 'Diğer Gider'];
  const incomeCategories = ['Mahsul Satışı', 'Hasat Öncesi Avans', 'Destekleme / Hibe', 'Diğer Gelir'];

  // Kategoriler
  const categories = [
    'Zeytin & Zeytinyağı',
    'Tahıl & Bakliyat',
    'İşlenmiş Ürünler',
    'Direkt Tarladan',
    'Sıvı yağlar',
    'Un & Unlu Mamuller',
    'Konserveler',
    'Et & Et Ürünleri',
    'Süt & Süt Ürünleri',
    'Diğer'
  ];

  // Örnek Kooperatif Hasat Öncesi İlanlar
  const [preharvestListings, setPreharvestListings] = useState<PreHarvestListing[]>([
    {
      id: 'PH-301',
      title: '2026 Kooperatif Ortak Üretim Domat Zeytin Ön Sipariş',
      landLocation: 'Manisa / Akhisar Tarımsal Kalkınma Kooperatifi Arazileri',
      estimatedHarvestDate: 'Kasım 2026',
      estimatedQuantity: '25.000 kg',
      startingPrice: '90 TL / kg',
      features: 'Kooperatif denetiminde damlama sulama, %100 doğal ve sertifikalı üretim.',
      adminApprovalStatus: 'approved',
      status: 'active',
      offers: [
        { id: 'OFF-1', buyerName: 'Gıda A.Ş.', offeredPrice: '87 TL / kg', requestedQuantity: '5.000 kg', offerDate: 'Bugün 10:15', status: 'pending' }
      ]
    }
  ]);

  // Örnek Hikayeler
  const [storiesList, setStoriesList] = useState<Story[]>([
    { id: '1', title: 'Ortak Hasat Vakti', duration: '0:42', date: 'Bugün', emoji: '🏢' },
    { id: '2', title: 'Kooperatif Tesisimiz', duration: '0:55', date: 'Dün', emoji: '🚜' },
    { id: '3', title: 'Dolum ve Ambalaj', duration: '0:30', date: '3 gün önce', emoji: '🫙' },
  ]);

  // Örnek Ürün Listesi
  const [productsList, setProductsList] = useState<Product[]>([
    { id: '1', name: 'Kooperatif Erken Hasat Sızma Zeytinyağı', price: '340 TL', category: 'Zeytin & Zeytinyağı', stock: 150, emoji: '🫒' },
    { id: '2', name: 'Ortak Üretim Siyah Sele Zeytin', price: '195 TL', category: 'Zeytin & Zeytinyağı', stock: 0, emoji: '🫙' },
    { id: '3', name: 'Kooperatif Balı', price: '280 TL', category: 'İşlenmiş Ürünler', stock: 45, emoji: '🍯' },
  ]);

  // Toast State'leri
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('success');

  const triggerToast = (msg: string, type: 'error' | 'success' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const name = await AsyncStorage.getItem('fullName');
    if (name) setFullName(name);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/(auth)/login' as any);
  };

  // Takvim Notu / Alarm Ekleme
  const handleSaveCalendarEvent = () => {
    if (!eventTitle.trim() || !eventDate || !eventTime) {
      triggerToast('Lütfen başlık, tarih ve saat giriniz.', 'error');
      return;
    }

    const newEvt: CalendarEvent = {
      id: Date.now().toString(),
      date: eventDate,
      time: eventTime,
      title: eventTitle,
      note: eventNote || 'Not eklenmedi',
      isAlarmActive: true
    };

    setCalendarEvents([newEvt, ...calendarEvents]);
    triggerToast('Not ve alarm başarıyla oluşturuldu! Zamanı gelince bildirilecektir.', 'success');
    setEventTitle('');
    setEventNote('');
    setIsEventFormOpen(false);
  };

  const handleDeleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    triggerToast('Takvim Notu ve Alarmı silindi.', 'info');
  };

  const handleAddCropLedger = () => {
    if (!newCropName.trim()) {
      triggerToast('Lütfen mahsul/ürün adı giriniz.', 'error');
      return;
    }
    const newLedger: CropCostLedger = {
      id: Date.now().toString(),
      cropName: newCropName,
      season: newCropSeason || '2026 Sezonu',
      items: []
    };
    setCropLedgers([newLedger, ...cropLedgers]);
    setNewCropName('');
    setIsNewCropFormOpen(false);
    triggerToast('Yeni kooperatif ürün defteri oluşturuldu!', 'success');
  };

  const handleSaveCostItem = () => {
    if (!selectedCropId) return;
    if (!itemTitle.trim() || !itemAmount) {
      triggerToast('Lütfen açıklama ve tutar giriniz.', 'error');
      return;
    }
    const numAmount = parseFloat(itemAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      triggerToast('Geçerli bir tutar giriniz.', 'error');
      return;
    }

    if (editingItemId) {
      setCropLedgers(prev => prev.map(crop => {
        if (crop.id === selectedCropId) {
          return {
            ...crop,
            items: crop.items.map(item => item.id === editingItemId ? {
              ...item,
              type: itemType,
              title: itemTitle,
              amount: numAmount,
              category: itemCategory
            } : item)
          };
        }
        return crop;
      }));
      triggerToast('Kalem başarıyla güncellendi!', 'success');
    } else {
      const newItem: CostItem = {
        id: Date.now().toString(),
        type: itemType,
        title: itemTitle,
        amount: numAmount,
        category: itemCategory,
        date: 'Bugün'
      };

      setCropLedgers(prev => prev.map(crop => {
        if (crop.id === selectedCropId) {
          return { ...crop, items: [newItem, ...crop.items] };
        }
        return crop;
      }));
      triggerToast(itemType === 'income' ? 'Gelir kalemi eklendi!' : 'Maliyet kalemi eklendi!', 'success');
    }

    setItemTitle('');
    setItemAmount('');
    setEditingItemId(null);
    setIsNewItemFormOpen(false);
  };

  const handleEditCostItem = (item: CostItem) => {
    setEditingItemId(item.id);
    setItemType(item.type);
    setItemTitle(item.title);
    setItemAmount(item.amount.toString());
    setItemCategory(item.category);
    setIsNewItemFormOpen(true);
  };

  const handleDeleteCostItem = (itemId: string) => {
    setCropLedgers(prev => prev.map(crop => {
      if (crop.id === selectedCropId) {
        return {
          ...crop,
          items: crop.items.filter(i => i.id !== itemId)
        };
      }
      return crop;
    }));
    triggerToast('Kalem defterden silindi.', 'info');
  };

  const handleCreatePreharvestListing = () => {
    if (!phTitle || !phLandLocation || !phHarvestDate || !phPrice) {
      triggerToast('Lütfen zorunlu alanları doldurunuz.', 'error');
      return;
    }

    const newListing: PreHarvestListing = {
      id: `PH-${Date.now().toString().slice(-3)}`,
      title: phTitle,
      landLocation: phLandLocation,
      estimatedHarvestDate: phHarvestDate,
      estimatedQuantity: phQuantity || 'Belirtilmedi',
      startingPrice: `${phPrice} TL / kg`,
      features: phFeatures || 'Kooperatif standartlarında üretim',
      adminApprovalStatus: 'pending_approval',
      status: 'active',
      offers: []
    };

    setPreharvestListings([newListing, ...preharvestListings]);
    triggerToast('Kooperatif ilanınız yönetici onayına sunuldu!', 'info');
    setPhTitle('');
    setPhLandLocation('');
    setPhHarvestDate('');
    setPhQuantity('');
    setPhPrice('');
    setPhFeatures('');
    setIsNewPreharvestFormOpen(false);
  };

  const handleOfferAction = (listingId: string, offerId: string, action: 'accept' | 'reject' | 'counter') => {
    if (action === 'counter' && !counterPriceInput) {
      triggerToast('Lütfen karşı teklif fiyatı giriniz.', 'error');
      return;
    }

    setPreharvestListings(prev => prev.map(listing => {
      if (listing.id === listingId) {
        return {
          ...listing,
          offers: listing.offers.map(o => {
            if (o.id === offerId) {
              if (action === 'accept') return { ...o, status: 'accepted' };
              if (action === 'reject') return { ...o, status: 'rejected' };
              if (action === 'counter') return { ...o, status: 'countered', counterPrice: `${counterPriceInput} TL / kg` };
            }
            return o;
          })
        };
      }
      return listing;
    }));

    if (action === 'accept') triggerToast('Teklif kooperatif tarafından kabul edildi.', 'success');
    if (action === 'reject') triggerToast('Teklif reddedildi.', 'info');
    if (action === 'counter') {
      triggerToast('Karşı teklif alıcıya iletildi.', 'success');
      setCounteringOfferId(null);
      setCounterPriceInput('');
    }
  };

  const handleAddProduct = () => {
    if (!productName || !productPrice) {
      triggerToast('Lütfen ürün adı ve fiyatı giriniz.', 'error');
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productName,
      price: `${productPrice} TL`,
      category: productCategory,
      stock: parseInt(productStock) || 0,
      emoji: '🏛️'
    };

    setProductsList([newProduct, ...productsList]);
    triggerToast('Kooperatif ürünü vitrine eklendi!', 'success');
    setProductName('');
    setProductPrice('');
    setProductStock('10');
    setActiveTab('profile');
    setProfileSubTab('active-products');
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.replace(' TL', '').trim());
    setEditStock(product.stock.toString());
    setEditCategory(product.category);
    setIsEditModalVisible(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    if (!editName || !editPrice) {
      triggerToast('Ürün adı ve fiyatı boş bırakılamaz.', 'error');
      return;
    }

    setProductsList(prev => prev.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          name: editName,
          price: editPrice.includes('TL') ? editPrice : `${editPrice} TL`,
          stock: parseInt(editStock) || 0,
          category: editCategory
        };
      }
      return p;
    }));

    triggerToast('Ürün bilgileri başarıyla güncellendi!', 'success');
    setIsEditModalVisible(false);
    setEditingProduct(null);
  };

  const handleUploadStory = () => {
    if (!storyTitle) {
      triggerToast('Lütfen hikayenize kısa bir başlık yazın.', 'error');
      return;
    }

    const newStory: Story = {
      id: Date.now().toString(),
      title: storyTitle,
      duration: '0:45',
      date: 'Şimdi',
      emoji: '🎥'
    };

    setStoriesList([newStory, ...storiesList]);
    triggerToast('Kooperatif tanıtım videonuz eklendi!', 'success');
    setStoryTitle('');
    setSelectedVideoName(null);
    setActiveTab('profile');
  };

  const selectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    if (tab === 'finances') {
      setSelectedCropId(null);
    }
  };

  const activeProducts = productsList.filter(p => p.stock > 0);
  const outOfStockProducts = productsList.filter(p => p.stock === 0);

  const approvedListings = preharvestListings.filter(l => l.adminApprovalStatus === 'approved' && l.status === 'active');
  const pendingApprovalListings = preharvestListings.filter(l => l.adminApprovalStatus === 'pending_approval');
  const completedListings = preharvestListings.filter(l => l.status === 'completed');

  const selectedCrop = cropLedgers.find(c => c.id === selectedCropId);

  const filteredNews = selectedNewsFilter === 'all' 
    ? newsList 
    : newsList.filter(n => n.source === selectedNewsFilter);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast 
        message={toastMessage} 
        type={toastType} 
        visible={toastVisible} 
        onHide={() => setToastVisible(false)} 
      />

      <View style={styles.container}>
        {/* Üst Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pazarıstan Kooperatif</Text>
          <TouchableOpacity style={styles.logoutBtnSmall} onPress={handleLogout}>
            <Text style={styles.logoutTextSmall}>Çıkış</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainLayout}>
          {/* Açılır / Kapanır Sol Panel */}
          {isSidebarOpen && (
            <View style={styles.sidebar}>
              <Text style={styles.sidebarHeader}>Menü</Text>
              
              <TouchableOpacity 
                style={[styles.sidebarItem, activeTab === 'profile' && styles.sidebarItemActive]} 
                onPress={() => selectTab('profile')}
              >
                <Text style={[styles.sidebarText, activeTab === 'profile' && styles.sidebarTextActive]}>🏛️ Kooperatif Profili</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarItem, activeTab === 'preharvest' && styles.sidebarItemActive]} 
                onPress={() => selectTab('preharvest')}
              >
                <Text style={[styles.sidebarText, activeTab === 'preharvest' && styles.sidebarTextActive]}>🌾 Hasat Öncesi Satış</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarItem, activeTab === 'products' && styles.sidebarItemActive]} 
                onPress={() => selectTab('products')}
              >
                <Text style={[styles.sidebarText, activeTab === 'products' && styles.sidebarTextActive]}>📦 Yeni Ürün Ekle</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarItem, activeTab === 'stories' && styles.sidebarItemActive]} 
                onPress={() => selectTab('stories')}
              >
                <Text style={[styles.sidebarText, activeTab === 'stories' && styles.sidebarTextActive]}>🎥 Tanıtım / Video Paylaş</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarItem, activeTab === 'complaints' && styles.sidebarItemActive]} 
                onPress={() => selectTab('complaints')}
              >
                <Text style={[styles.sidebarText, activeTab === 'complaints' && styles.sidebarTextActive]}>⚠️ Şikayetler & Talepler</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarItem, activeTab === 'finances' && styles.sidebarItemActive]} 
                onPress={() => selectTab('finances')}
              >
                <Text style={[styles.sidebarText, activeTab === 'finances' && styles.sidebarTextActive]}>💰 Ürün Maliyet Defteri</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarItem, activeTab === 'calendar' && styles.sidebarItemActive]} 
                onPress={() => selectTab('calendar')}
              >
                <Text style={[styles.sidebarText, activeTab === 'calendar' && styles.sidebarTextActive]}>📅 Takvim & Alarmlar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sidebarItem, activeTab === 'news' && styles.sidebarItemActive]} 
                onPress={() => selectTab('news')}
              >
                <Text style={[styles.sidebarText, activeTab === 'news' && styles.sidebarTextActive]}>📰 Tarım Haber Gündemi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* İçerik Alanı */}
          <ScrollView contentContainerStyle={styles.contentArea} showsVerticalScrollIndicator={false}>
            
            {/* 1. KOOPERATİF PROFİL SEKMESİ */}
            {activeTab === 'profile' && (
              <View style={styles.profileContainer}>
                
                <View style={styles.instaHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarEmoji}>🏛️</Text>
                  </View>
                  
                  <View style={styles.instaStatsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{productsList.length}</Text>
                      <Text style={styles.statLabel}>Ürün</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>1.240</Text>
                      <Text style={styles.statLabel}>Takipçi</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>₺85.400</Text>
                      <Text style={styles.statLabel}>Bu Ay Satış</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.instaBio}>
                  <Text style={styles.instaName}>{fullName || 'Akhisar S.S. Tarımsal Kalkınma Kooperatifi'}</Text>
                  
                  <View style={styles.ratingRow}>
                    <Text style={styles.stars}>★ ★ ★ ★ ★</Text>
                    <Text style={styles.ratingText}>4.9</Text>
                    <Text style={styles.ratingCount}>(340 Değerlendirme)</Text>
                  </View>

                  <Text style={styles.instaCategory}>🏛️ Onaylı Kooperatif • Akhisar / Manisa</Text>
                  <Text style={styles.instaDesc}>Bölge üreticilerinin güç birliği. Doğal, tescilli ve doğrudan üreticiden halka ürünler.</Text>
                </View>

                <View style={styles.storiesSection}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyScroll}>
                    <TouchableOpacity style={styles.addStoryBubble} onPress={() => selectTab('stories')}>
                      <View style={styles.addStoryCircle}>
                        <Text style={{ fontSize: 20, color: '#2D4A22', fontWeight: 'bold' }}>+</Text>
                      </View>
                      <Text style={styles.storyBubbleText}>Ekle</Text>
                    </TouchableOpacity>

                    {storiesList.map((story) => (
                      <TouchableOpacity key={story.id} style={styles.storyBubble}>
                        <View style={styles.storyRing}>
                          <View style={styles.storyInnerCircle}>
                            <Text style={{ fontSize: 20 }}>{story.emoji}</Text>
                          </View>
                        </View>
                        <Text style={styles.storyBubbleText} numberOfLines={1}>{story.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.instaActionRow}>
                  <TouchableOpacity style={styles.instaEditButton} onPress={() => selectTab('products')}>
                    <Text style={styles.instaEditText}>+ Ürün Ekle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.instaEditButton} onPress={() => selectTab('stories')}>
                    <Text style={styles.instaEditText}>🎥 Video Paylaş</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.profileTabsRow}>
                  <TouchableOpacity 
                    style={[styles.profileTabBtn, profileSubTab === 'active-products' && styles.profileTabBtnActive]}
                    onPress={() => setProfileSubTab('active-products')}
                  >
                    <Text style={[styles.profileTabText, profileSubTab === 'active-products' && styles.profileTabTextActive]}>
                      📦 Aktif Ürünler ({activeProducts.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.profileTabBtn, profileSubTab === 'out-of-stock' && styles.profileTabBtnActive]}
                    onPress={() => setProfileSubTab('out-of-stock')}
                  >
                    <Text style={[styles.profileTabText, profileSubTab === 'out-of-stock' && styles.profileTabTextActive]}>
                      ⏳ Stoğu Bitenler ({outOfStockProducts.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                {profileSubTab === 'active-products' && (
                  <View style={styles.productGrid}>
                    {activeProducts.length > 0 ? activeProducts.map(item => (
                      <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => handleOpenEditModal(item)}>
                        <Text style={styles.gridEmoji}>{item.emoji}</Text>
                        <Text style={styles.gridTitle} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.gridCategory}>{item.category}</Text>
                        <Text style={styles.gridPrice}>{item.price}</Text>
                        <Text style={styles.stockInfo}>Stok: {item.stock} adet (Düzenle)</Text>
                      </TouchableOpacity>
                    )) : (
                      <Text style={styles.emptySubText}>Aktif satışta ürün bulunmuyor.</Text>
                    )}
                  </View>
                )}

                {profileSubTab === 'out-of-stock' && (
                  <View style={styles.productGrid}>
                    {outOfStockProducts.length > 0 ? outOfStockProducts.map(item => (
                      <TouchableOpacity key={item.id} style={[styles.gridItem, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]} onPress={() => handleOpenEditModal(item)}>
                        <Text style={styles.gridEmoji}>⚠️</Text>
                        <Text style={styles.gridTitle} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.gridCategory}>{item.category}</Text>
                        <Text style={[styles.gridPrice, { color: '#DC2626' }]}>Tükendi (Stok Ekle)</Text>
                      </TouchableOpacity>
                    )) : (
                      <Text style={styles.emptySubText}>Stoğu biten ürün yok.</Text>
                    )}
                  </View>
                )}

              </View>
            )}

            {/* 2. HASAT ÖNCESİ SATIŞ SEKMESİ */}
            {activeTab === 'preharvest' && (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.cardTitle}>🌾 Hasat Öncesi Satış & Pazarlık</Text>
                  <TouchableOpacity style={styles.smallAddBtn} onPress={() => setIsNewPreharvestFormOpen(!isNewPreharvestFormOpen)}>
                    <Text style={styles.smallAddBtnText}>{isNewPreharvestFormOpen ? '✕ Kapat' : '+ İlan Aç'}</Text>
                  </TouchableOpacity>
                </View>

                {isNewPreharvestFormOpen && (
                  <View style={styles.preharvestFormBox}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>🌱 Yeni Kooperatif İlanı (Yönetici Onaylı)</Text>

                    <TextInput style={styles.input} placeholder="İlan Başlığı" placeholderTextColor="#9CA3AF" value={phTitle} onChangeText={setPhTitle} />
                    <TextInput style={styles.input} placeholder="Kooperatif Arazisi / Parsel Bilgileri" placeholderTextColor="#9CA3AF" value={phLandLocation} onChangeText={setPhLandLocation} />
                    <TextInput style={styles.input} placeholder="Tahmini Hasat Tarihi (Örn: Kasım 2026)" placeholderTextColor="#9CA3AF" value={phHarvestDate} onChangeText={setPhHarvestDate} />
                    <TextInput style={styles.input} placeholder="Tahmini Toplam Rekolte (Örn: 20.000 kg)" placeholderTextColor="#9CA3AF" value={phQuantity} onChangeText={setPhQuantity} />
                    <TextInput style={styles.input} placeholder="Taban Fiyat (TL / kg)" keyboardType="numeric" placeholderTextColor="#9CA3AF" value={phPrice} onChangeText={setPhPrice} />
                    <TextInput style={[styles.input, { height: 45, textAlignVertical: 'top', paddingTop: 6 }]} multiline placeholder="Kooperatif Kalite Şartları ve Özellikleri..." placeholderTextColor="#9CA3AF" value={phFeatures} onChangeText={setPhFeatures} />

                    <TouchableOpacity style={styles.actionButton} onPress={handleCreatePreharvestListing}>
                      <Text style={styles.actionButtonText}>Yönetici Onayına Gönder</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.profileTabsRow}>
                  <TouchableOpacity style={[styles.profileTabBtn, preharvestSubTab === 'active-preharvest' && styles.profileTabBtnActive]} onPress={() => setPreharvestSubTab('active-preharvest')}>
                    <Text style={[styles.profileTabText, preharvestSubTab === 'active-preharvest' && styles.profileTabTextActive]}>🟢 Yayındakiler ({approvedListings.length})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.profileTabBtn, preharvestSubTab === 'pending-preharvest' && styles.profileTabBtnActive]} onPress={() => setPreharvestSubTab('pending-preharvest')}>
                    <Text style={[styles.profileTabText, preharvestSubTab === 'pending-preharvest' && styles.profileTabTextActive]}>⏳ Onay Bekleyen ({pendingApprovalListings.length})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.profileTabBtn, preharvestSubTab === 'completed-preharvest' && styles.profileTabBtnActive]} onPress={() => setPreharvestSubTab('completed-preharvest')}>
                    <Text style={[styles.profileTabText, preharvestSubTab === 'completed-preharvest' && styles.profileTabTextActive]}>📦 Tamamlanan ({completedListings.length})</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ gap: 10, marginTop: 8 }}>
                  {(preharvestSubTab === 'active-preharvest' ? approvedListings : preharvestSubTab === 'pending-preharvest' ? pendingApprovalListings : completedListings).map(listing => (
                    <View key={listing.id} style={styles.preharvestCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.phTitleText}>{listing.title}</Text>
                        <Text style={styles.phPriceBadge}>{listing.startingPrice}</Text>
                      </View>

                      {listing.adminApprovalStatus === 'pending_approval' && (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingBadgeText}>⏳ Yönetici Onayı Bekliyor (Doğrulama Aşamasında)</Text>
                        </View>
                      )}

                      <View style={styles.phMetaBox}>
                        <Text style={styles.phMetaText}>📍 Arazi: {listing.landLocation}</Text>
                        <Text style={styles.phMetaText}>📅 Hasat: {listing.estimatedHarvestDate} • ⚖️ Rekolte: {listing.estimatedQuantity}</Text>
                      </View>

                      {listing.adminApprovalStatus === 'approved' && (
                        <View style={{ gap: 4, marginTop: 4 }}>
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#166534' }}>🔒 Gizli Fiyat Teklifleri (Sadece Kooperatif Görür):</Text>
                          {listing.offers.length > 0 ? (
                            listing.offers.map(offer => (
                              <View key={offer.id} style={styles.offerRow}>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1F2937' }}>{offer.buyerName} • Miktar: {offer.requestedQuantity}</Text>
                                  <Text style={{ fontSize: 10, color: '#4B5563' }}>
                                    Teklif: <Text style={{ fontWeight: 'bold', color: '#15803D' }}>{offer.offeredPrice}</Text>
                                  </Text>
                                  {offer.status === 'countered' && (
                                    <Text style={{ fontSize: 9, color: '#B45309', fontWeight: 'bold' }}>Karşı Teklifiniz: {offer.counterPrice}</Text>
                                  )}
                                </View>

                                {offer.status === 'pending' ? (
                                  <View style={{ gap: 3 }}>
                                    {counteringOfferId === offer.id ? (
                                      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                                        <TextInput 
                                          style={[styles.input, { height: 26, width: 70, fontSize: 10 }]} 
                                          placeholder="Fiyat TL" 
                                          keyboardType="numeric"
                                          value={counterPriceInput}
                                          onChangeText={setCounterPriceInput}
                                        />
                                        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleOfferAction(listing.id, offer.id, 'counter')}>
                                          <Text style={styles.acceptBtnText}>Gönder</Text>
                                        </TouchableOpacity>
                                      </View>
                                    ) : (
                                      <View style={{ flexDirection: 'row', gap: 3 }}>
                                        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleOfferAction(listing.id, offer.id, 'accept')}>
                                          <Text style={styles.acceptBtnText}>✓ Kabul</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.counterBtn} onPress={() => setCounteringOfferId(offer.id)}>
                                          <Text style={styles.counterBtnText}>🔄 Karşı Teklif</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleOfferAction(listing.id, offer.id, 'reject')}>
                                          <Text style={styles.rejectBtnText}>✕ Reddet</Text>
                                        </TouchableOpacity>
                                      </View>
                                    )}
                                  </View>
                                ) : offer.status === 'accepted' ? (
                                  <Text style={{ fontSize: 10, color: '#15803D', fontWeight: 'bold' }}>✓ Kabul Edildi</Text>
                                ) : offer.status === 'countered' ? (
                                  <Text style={{ fontSize: 10, color: '#B45309', fontWeight: 'bold' }}>🔄 Karşı Teklifte</Text>
                                ) : (
                                  <Text style={{ fontSize: 10, color: '#DC2626', fontWeight: 'bold' }}>✕ Reddedildi</Text>
                                )}
                              </View>
                            ))
                          ) : (
                            <Text style={{ fontSize: 10, color: '#6B7280' }}>Henüz fiyat teklifi gelmedi.</Text>
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 3. YENİ ÜRÜN EKLEME SEKMESİ */}
            {activeTab === 'products' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>📦 Kooperatif Ürün Kataloğuna Ekle</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ürün Adı</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Örn: Akhisar Kooperatif Soğuk Sıkım Yağ" 
                    placeholderTextColor="#9CA3AF"
                    value={productName}
                    onChangeText={setProductName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Fiyat (TL)</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="0.00" 
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={productPrice}
                    onChangeText={setProductPrice}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Stok Adedi</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="100" 
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={productStock}
                    onChangeText={setProductStock}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kategori Seçin</Text>
                  <TouchableOpacity style={styles.dropdownSelector} onPress={() => setIsCategoryOpen(!isCategoryOpen)}>
                    <Text style={styles.dropdownSelectorText}>{productCategory}</Text>
                    <Text style={{ fontSize: 10 }}>▼</Text>
                  </TouchableOpacity>

                  {isCategoryOpen && (
                    <View style={styles.dropdownList}>
                      <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                        {categories.map((cat, index) => (
                          <TouchableOpacity 
                            key={index} 
                            style={styles.dropdownItem} 
                            onPress={() => {
                              setProductCategory(cat);
                              setIsCategoryOpen(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{cat}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={handleAddProduct}>
                  <Text style={styles.actionButtonText}>Ürünü Vitrine Ekle</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 4. HİKAYE & KISA VİDEO YÜKLEME SEKMESİ */}
            {activeTab === 'stories' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🎥 Kooperatif Tanıtım Videosu Yükle</Text>
                <Text style={styles.cardSubtitle}>Üretim tesislerinizden, ortak hasatlardan max 1 dakikalık kısa tanıtım videoları ekleyin.</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hikaye / Video Başlığı</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Örn: Kooperatif tesisimizde dolum aşaması" 
                    placeholderTextColor="#9CA3AF"
                    value={storyTitle}
                    onChangeText={setStoryTitle}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.videoPickerBtn} 
                  onPress={() => {
                    setSelectedVideoName('kooperatif_tanitim.mp4');
                    triggerToast('Video seçildi! (Süre: 0:50)', 'info');
                  }}
                >
                  <Text style={styles.videoPickerText}>
                    {selectedVideoName ? `📁 Seçilen: ${selectedVideoName}` : '📁 Cihazdan Kısa Video Seç (Max 60 sn)'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleUploadStory}>
                  <Text style={styles.actionButtonText}>Hikayeyi Paylaş</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 5. ŞİKAYETLER SEKMESİ */}
            {activeTab === 'complaints' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>⚠️ Şikayetler ve Destek Talepleri</Text>
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Henüz aktif bir şikayet bulunmuyor.</Text>
                </View>
              </View>
            )}

            {/* 6. ÜRÜN BAZLI MALİYET & GELİR DEFTERİ SEKMESİ */}
            {activeTab === 'finances' && (
              <View style={styles.card}>
                {!selectedCropId ? (
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={styles.cardTitle}>💰 Ürün Bazlı Maliyet ve Gelir Defteri</Text>
                      <TouchableOpacity style={styles.smallAddBtn} onPress={() => setIsNewCropFormOpen(!isNewCropFormOpen)}>
                        <Text style={styles.smallAddBtnText}>{isNewCropFormOpen ? '✕ Kapat' : '+ Ürün Defteri Aç'}</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cardSubtitle}>Maliyetlerini ve satış gelirlerini takip etmek istediğiniz ürüne tıklayın.</Text>

                    {isNewCropFormOpen && (
                      <View style={styles.preharvestFormBox}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>🌱 Yeni Kooperatif Ürün Defteri Tanımla</Text>
                        <TextInput style={styles.input} placeholder="Ürün / Mahsul Adı (Örn: Sızma Zeytinyağı)" placeholderTextColor="#9CA3AF" value={newCropName} onChangeText={setNewCropName} />
                        <TextInput style={styles.input} placeholder="Sezon (Örn: 2026 Sezonu)" placeholderTextColor="#9CA3AF" value={newCropSeason} onChangeText={setNewCropSeason} />
                        <TouchableOpacity style={styles.actionButton} onPress={handleAddCropLedger}>
                          <Text style={styles.actionButtonText}>Defter Oluştur</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <View style={{ gap: 10, marginTop: 8 }}>
                      {cropLedgers.map(crop => {
                        const cropExpense = crop.items.filter(i => i.type === 'expense').reduce((acc, i) => acc + i.amount, 0);
                        const cropIncome = crop.items.filter(i => i.type === 'income').reduce((acc, i) => acc + i.amount, 0);
                        const cropProfit = cropIncome - cropExpense;

                        return (
                          <TouchableOpacity 
                            key={crop.id} 
                            style={styles.cropLedgerCard}
                            onPress={() => setSelectedCropId(crop.id)}
                          >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1F2937' }}>🏛️ {crop.cropName}</Text>
                              <Text style={{ fontSize: 10, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>{crop.season}</Text>
                            </View>

                            <View style={styles.cropStatsRow}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 9, color: '#6B7280' }}>Toplam Maliyet</Text>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#DC2626' }}>₺{cropExpense.toLocaleString()}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 9, color: '#6B7280' }}>Toplam Gelir</Text>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#15803D' }}>₺{cropIncome.toLocaleString()}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 9, color: '#6B7280' }}>Net Kar/Zarar</Text>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', color: cropProfit >= 0 ? '#1D4ED8' : '#DC2626' }}>₺{cropProfit.toLocaleString()}</Text>
                              </View>
                            </View>
                            <Text style={{ fontSize: 10, color: '#2D4A22', fontWeight: 'bold', textAlign: 'right', marginTop: 2 }}>Detayları Gör ve Kalem Ekle →</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <TouchableOpacity onPress={() => { setSelectedCropId(null); setIsNewItemFormOpen(false); setEditingItemId(null); }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2D4A22' }}>← Ürün Listesine Dön</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.smallAddBtn} onPress={() => { 
                        if (isNewItemFormOpen) {
                          setIsNewItemFormOpen(false);
                          setEditingItemId(null);
                        } else {
                          setEditingItemId(null);
                          setItemTitle('');
                          setItemAmount('');
                          setIsNewItemFormOpen(true);
                        }
                      }}>
                        <Text style={styles.smallAddBtnText}>{isNewItemFormOpen ? '✕ Kapat' : '+ Kalem Ekle'}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cropDetailHeader}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1F2937' }}>🏛️ {selectedCrop?.cropName}</Text>
                      <Text style={{ fontSize: 10, color: '#6B7280' }}>Sezon: {selectedCrop?.season}</Text>
                    </View>

                    {(() => {
                      const exp = selectedCrop?.items.filter(i => i.type === 'expense').reduce((a, b) => a + b.amount, 0) || 0;
                      const inc = selectedCrop?.items.filter(i => i.type === 'income').reduce((a, b) => a + b.amount, 0) || 0;
                      const net = inc - exp;
                      return (
                        <View style={styles.financeSummaryRow}>
                          <View style={[styles.financeSummaryCard, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                            <Text style={{ fontSize: 9, color: '#991B1B', fontWeight: 'bold' }}>Maliyet</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#DC2626' }}>₺{exp.toLocaleString()}</Text>
                          </View>
                          <View style={[styles.financeSummaryCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                            <Text style={{ fontSize: 9, color: '#166534', fontWeight: 'bold' }}>Gelir</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#15803D' }}>₺{inc.toLocaleString()}</Text>
                          </View>
                          <View style={[styles.financeSummaryCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                            <Text style={{ fontSize: 9, color: '#1E40AF', fontWeight: 'bold' }}>Net Kar</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: net >= 0 ? '#1D4ED8' : '#DC2626' }}>₺{net.toLocaleString()}</Text>
                          </View>
                        </View>
                      );
                    })()}

                    {isNewItemFormOpen && (
                      <View style={[styles.preharvestFormBox, { marginTop: 8 }]}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>
                          {editingItemId ? '✏️ Kalemi Düzenle' : '📝 Bu Ürüne Yeni Kalem Ekle'}
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
                          <TouchableOpacity 
                            style={[styles.typeSelectBtn, itemType === 'expense' && { backgroundColor: '#DC2626', borderColor: '#B91C1C' }]}
                            onPress={() => { setItemType('expense'); setItemCategory('Gübre'); }}
                          >
                            <Text style={[styles.typeSelectText, itemType === 'expense' && { color: '#FFFFFF' }]}>Gider / Maliyet</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.typeSelectBtn, itemType === 'income' && { backgroundColor: '#15803D', borderColor: '#166534' }]}
                            onPress={() => { setItemType('income'); setItemCategory('Mahsul Satışı'); }}
                          >
                            <Text style={[styles.typeSelectText, itemType === 'income' && { color: '#FFFFFF' }]}>Gelir</Text>
                          </TouchableOpacity>
                        </View>

                        <TextInput style={styles.input} placeholder="Açıklama (Örn: Tesis Sıkım Gideri)" placeholderTextColor="#9CA3AF" value={itemTitle} onChangeText={setItemTitle} />
                        <TextInput style={styles.input} placeholder="Tutar (TL)" keyboardType="numeric" placeholderTextColor="#9CA3AF" value={itemAmount} onChangeText={setItemAmount} />

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Kategori</Text>
                          <TouchableOpacity style={styles.dropdownSelector} onPress={() => setIsItemCatOpen(!isItemCatOpen)}>
                            <Text style={styles.dropdownSelectorText}>{itemCategory}</Text>
                            <Text style={{ fontSize: 10 }}>▼</Text>
                          </TouchableOpacity>

                          {isItemCatOpen && (
                            <View style={styles.dropdownList}>
                              <ScrollView style={{ maxHeight: 120 }} nestedScrollEnabled={true}>
                                {(itemType === 'expense' ? expenseCategories : incomeCategories).map((cat, index) => (
                                  <TouchableOpacity 
                                    key={index} 
                                    style={styles.dropdownItem} 
                                    onPress={() => {
                                      setItemCategory(cat);
                                      setIsItemCatOpen(false);
                                    }}
                                  >
                                    <Text style={styles.dropdownItemText}>{cat}</Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>

                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                          <TouchableOpacity style={[styles.actionButton, { flex: 1, backgroundColor: '#6B7280' }]} onPress={() => { setIsNewItemFormOpen(false); setEditingItemId(null); }}>
                            <Text style={styles.actionButtonText}>İptal</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionButton, { flex: 1, marginTop: 0 }]} onPress={handleSaveCostItem}>
                            <Text style={styles.actionButtonText}>{editingItemId ? 'Güncelle' : 'Kalemi Kaydet'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View style={{ gap: 6, marginTop: 10 }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#374151' }}>📋 Ürüne Ait Gelir ve Gider Kalemleri:</Text>
                      {selectedCrop && selectedCrop.items.length > 0 ? (
                        selectedCrop.items.map(item => (
                          <View key={item.id} style={styles.transactionRowWithActions}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1F2937' }}>{item.title}</Text>
                              <Text style={{ fontSize: 9, color: '#6B7280' }}>{item.category} • {item.date}</Text>
                              <Text style={{ fontSize: 11, fontWeight: 'bold', color: item.type === 'income' ? '#15803D' : '#DC2626', marginTop: 2 }}>
                                {item.type === 'income' ? '+' : '-'}₺{item.amount.toLocaleString()}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 4 }}>
                              <TouchableOpacity style={styles.itemEditBtn} onPress={() => handleEditCostItem(item)}>
                                <Text style={styles.itemEditText}>✏️ Düzenle</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.itemDeleteBtn} onPress={() => handleDeleteCostItem(item.id)}>
                                <Text style={styles.itemDeleteText}>🗑️ Sil</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyText}>Bu ürün için henüz gelir veya gider kalemi girilmemiş.</Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 7. TAKVİM, NOT VE ALARM SEKMESİ */}
            {activeTab === 'calendar' && (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.cardTitle}>📅 Takvim, Notlar ve Alarmlar</Text>
                  <TouchableOpacity style={styles.smallAddBtn} onPress={() => setIsEventFormOpen(!isEventFormOpen)}>
                    <Text style={styles.smallAddBtnText}>{isEventFormOpen ? '✕ Kapat' : '+ Not / Alarm Ekle'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardSubtitle}>Tarih seçerek etkinlik planlayın, alarm kurun ve zamanı gelince bildirim alın.</Text>

                {isEventFormOpen && (
                  <View style={styles.preharvestFormBox}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>⏰ Yeni Takvim Notu ve Alarmı</Text>

                    <TextInput style={styles.input} placeholder="Tarih (YYYY-MM-DD) Örn: 2026-11-15" placeholderTextColor="#9CA3AF" value={eventDate} onChangeText={setEventDate} />
                    <TextInput style={styles.input} placeholder="Saat (HH:MM) Örn: 10:30" placeholderTextColor="#9CA3AF" value={eventTime} onChangeText={setEventTime} />
                    <TextInput style={styles.input} placeholder="Etkinlik / Alarm Başlığı" placeholderTextColor="#9CA3AF" value={eventTitle} onChangeText={setEventTitle} />
                    <TextInput style={[styles.input, { height: 45, textAlignVertical: 'top', paddingTop: 6 }]} multiline placeholder="Not Detayı..." placeholderTextColor="#9CA3AF" value={eventNote} onChangeText={setEventNote} />

                    <TouchableOpacity style={styles.actionButton} onPress={handleSaveCalendarEvent}>
                      <Text style={styles.actionButtonText}>Alarm Kur ve Kaydet</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ gap: 8, marginTop: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#374151' }}>🔔 Kurulan Alarmlar ve Planlı Notlar:</Text>
                  {calendarEvents.length > 0 ? (
                    calendarEvents.map(evt => (
                      <View key={evt.id} style={styles.calendarEventCard}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1F2937' }}>📅 {evt.date} - ⏰ {evt.time}</Text>
                            <Text style={styles.alarmActiveBadge}>🔔 Aktif Alarm</Text>
                          </View>
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2D4A22', marginTop: 2 }}>{evt.title}</Text>
                          <Text style={{ fontSize: 10, color: '#4B5563', marginTop: 2 }}>{evt.note}</Text>
                        </View>
                        <TouchableOpacity style={styles.itemDeleteBtn} onPress={() => handleDeleteCalendarEvent(evt.id)}>
                          <Text style={styles.itemDeleteText}>🗑️ Sil</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>Planlanmış takvim notu veya alarm bulunmuyor.</Text>
                  )}
                </View>
              </View>
            )}

            {/* 8. TARIM HABERLERİ SEKMESİ */}
            {activeTab === 'news' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>📰 Tarım Gündemi & Haber Akışı</Text>
                <Text style={styles.cardSubtitle}>Tarım ve Orman Bakanlığı, TZOB, TÜİK ve Tarım Haber kaynaklı son gelişmeler.</Text>

                {/* Filtre Butonları */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginVertical: 4 }}>
                  {(['all', 'Tarım Bakanlığı', 'TZOB', 'TÜİK', 'Tarım Haber'] as const).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterChip,
                        selectedNewsFilter === filter && styles.filterChipActive
                      ]}
                      onPress={() => setSelectedNewsFilter(filter)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedNewsFilter === filter && styles.filterChipTextActive
                      ]}>
                        {filter === 'all' ? '🌐 Tüm Haberler' : filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Haber Listesi */}
                <View style={{ gap: 10, marginTop: 6 }}>
                  {filteredNews.length > 0 ? (
                    filteredNews.map(news => (
                      <View key={news.id} style={styles.newsCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.newsSourceBadge, { backgroundColor: news.sourceBadgeColor }]}>
                            {news.source}
                          </Text>
                          <Text style={{ fontSize: 9, color: '#6B7280' }}>{news.date}</Text>
                        </View>

                        <Text style={styles.newsTitle}>{news.title}</Text>
                        <Text style={styles.newsSummary}>{news.summary}</Text>

                        <TouchableOpacity 
                          style={styles.newsLinkBtn}
                          onPress={() => Linking.openURL(news.url).catch(() => triggerToast('Bağlantı açılamadı.', 'error'))}
                        >
                          <Text style={styles.newsLinkText}>Haberin Devamını Oku →</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>Bu kategoride henüz haber bulunmuyor.</Text>
                  )}
                </View>
              </View>
            )}

          </ScrollView>
        </View>

        {/* ÜRÜN DÜZENLEME MODALI */}
        <Modal
          visible={isEditModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.cardTitle}>✏️ Kooperatif Ürün Bilgilerini Güncelle</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6B7280' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ürün Adı</Text>
                <TextInput 
                  style={styles.input} 
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fiyat (TL)</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric"
                  value={editPrice}
                  onChangeText={setEditPrice}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Stok Adedi</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric"
                  value={editStock}
                  onChangeText={setEditStock}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kategori</Text>
                <TouchableOpacity style={styles.dropdownSelector} onPress={() => setIsEditCategoryOpen(!isEditCategoryOpen)}>
                  <Text style={styles.dropdownSelectorText}>{editCategory}</Text>
                  <Text style={{ fontSize: 10 }}>▼</Text>
                </TouchableOpacity>

                {isEditCategoryOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled={true}>
                      {categories.map((cat, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={styles.dropdownItem} 
                          onPress={() => {
                            setEditCategory(cat);
                            setIsEditCategoryOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={[styles.actionButton, { flex: 1, backgroundColor: '#6B7280' }]} onPress={() => setIsEditModalVisible(false)}>
                  <Text style={styles.actionButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { flex: 1, marginTop: 0 }]} onPress={handleUpdateProduct}>
                  <Text style={styles.actionButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F1EA' },
  container: { flex: 1, maxWidth: 700, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  menuButton: { padding: 6 },
  menuIcon: { fontSize: 22, color: '#2D4A22', fontWeight: 'bold' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#2D4A22' },
  logoutBtnSmall: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  logoutTextSmall: { color: '#991B1B', fontSize: 10, fontWeight: 'bold' },
  
  mainLayout: { flex: 1, flexDirection: 'row', position: 'relative' },
  sidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 220, backgroundColor: '#FFFFFF', zIndex: 10, padding: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB', gap: 6, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  sidebarHeader: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 8, paddingHorizontal: 6 },
  sidebarItem: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 6 },
  sidebarItemActive: { backgroundColor: '#2D4A22' },
  sidebarText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  sidebarTextActive: { color: '#E9C46A' },

  contentArea: { flexGrow: 1, padding: 16 },
  
  profileContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 14 },
  instaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 32 },
  instaStatsRow: { flexDirection: 'row', gap: 16, flex: 1, justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
  statLabel: { fontSize: 10, color: '#6B7280' },
  
  instaBio: { gap: 3 },
  instaName: { fontSize: 15, fontWeight: 'bold', color: '#2D4A22' },
  
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold' },
  ratingText: { fontSize: 11, fontWeight: 'bold', color: '#1F2937' },
  ratingCount: { fontSize: 10, color: '#6B7280' },

  instaCategory: { fontSize: 11, fontWeight: '600', color: '#4B5563', marginTop: 2 },
  instaDesc: { fontSize: 11, color: '#6B7280' },

  storiesSection: { marginVertical: 4 },
  storyScroll: { gap: 12, paddingVertical: 4 },
  addStoryBubble: { alignItems: 'center', gap: 4 },
  addStoryCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#2D4A22', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FDF4' },
  storyBubble: { alignItems: 'center', gap: 4 },
  storyRing: { width: 54, height: 54, borderRadius: 27, padding: 2, backgroundColor: '#E9C46A' },
  storyInnerCircle: { flex: 1, borderRadius: 25, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  storyBubbleText: { fontSize: 10, color: '#374151', maxWidth: 56, textAlign: 'center' },

  instaActionRow: { flexDirection: 'row', gap: 8 },
  instaEditButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB' },
  instaEditText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  
  profileTabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginTop: 4 },
  profileTabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  profileTabBtnActive: { borderBottomColor: '#2D4A22' },
  profileTabText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  profileTabTextActive: { color: '#2D4A22', fontWeight: 'bold' },

  productGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  gridItem: { width: '48%', backgroundColor: '#F9FAFB', borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', gap: 3 },
  gridEmoji: { fontSize: 22 },
  gridTitle: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },
  gridCategory: { fontSize: 9, color: '#6B7280', textAlign: 'center' },
  gridPrice: { fontSize: 11, fontWeight: 'bold', color: '#2D4A22', marginTop: 2 },
  stockInfo: { fontSize: 9, color: '#4B5563' },
  emptySubText: { fontSize: 11, color: '#6B7280', textAlign: 'center', padding: 16, width: '100%' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#2D4A22' },
  cardSubtitle: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  inputGroup: { gap: 4, position: 'relative', zIndex: 5 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: '#374151' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 10, height: 38, fontSize: 11, color: '#1F2937' },
  
  videoPickerBtn: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB', borderStyle: 'dashed', borderRadius: 6, padding: 16, alignItems: 'center', marginVertical: 4 },
  videoPickerText: { fontSize: 11, fontWeight: '600', color: '#374151' },

  dropdownSelector: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 10, height: 38, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownSelectorText: { fontSize: 11, color: '#1F2937' },
  
  dropdownList: { position: 'absolute', top: 62, left: 0, right: 0, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, zIndex: 99, elevation: 5, maxHeight: 160 },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemText: { fontSize: 11, color: '#374151' },

  actionButton: { backgroundColor: '#2D4A22', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  actionButtonText: { color: '#E9C46A', fontSize: 12, fontWeight: 'bold' },
  emptyBox: { padding: 24, backgroundColor: '#F9FAFB', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  emptyText: { fontSize: 11, color: '#6B7280', textAlign: 'center', padding: 8 },

  cropLedgerCard: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', padding: 12, borderRadius: 8, gap: 6 },
  cropStatsRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 4 },
  cropDetailHeader: { backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0', gap: 2, marginTop: 4 },

  financeSummaryRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  financeSummaryCard: { flex: 1, padding: 8, borderRadius: 6, borderWidth: 1, alignItems: 'center', gap: 2 },
  typeSelectBtn: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, alignItems: 'center', backgroundColor: '#F3F4F6' },
  typeSelectText: { fontSize: 10, fontWeight: 'bold', color: '#374151' },

  transactionRowWithActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  itemEditBtn: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#F59E0B' },
  itemEditText: { fontSize: 9, fontWeight: 'bold', color: '#B45309' },
  itemDeleteBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#FCA5A5' },
  itemDeleteText: { fontSize: 9, fontWeight: 'bold', color: '#DC2626' },

  calendarEventCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  alarmActiveBadge: { backgroundColor: '#DCFCE7', color: '#166534', fontSize: 9, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  // Haber Akışı Stilleri
  filterChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#D1D5DB' },
  filterChipActive: { backgroundColor: '#2D4A22', borderColor: '#2D4A22' },
  filterChipText: { fontSize: 10, fontWeight: '600', color: '#374151' },
  filterChipTextActive: { color: '#E9C46A', fontWeight: 'bold' },
  newsCard: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', padding: 12, borderRadius: 8, gap: 6 },
  newsSourceBadge: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  newsTitle: { fontSize: 12, fontWeight: 'bold', color: '#1F2937' },
  newsSummary: { fontSize: 10, color: '#4B5563', lineHeight: 14 },
  newsLinkBtn: { alignSelf: 'flex-start', marginTop: 2 },
  newsLinkText: { fontSize: 10, fontWeight: 'bold', color: '#2D4A22' },

  // Modal Stilleri
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 400, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },

  // Hasat Öncesi Stilleri
  smallAddBtn: { backgroundColor: '#E9C46A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  smallAddBtnText: { color: '#2D4A22', fontSize: 10, fontWeight: 'bold' },
  preharvestFormBox: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0', gap: 8 },
  preharvestCard: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', padding: 12, borderRadius: 8, gap: 6 },
  phTitleText: { fontSize: 12, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  phPriceBadge: { fontSize: 11, fontWeight: 'bold', color: '#166534', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  phMetaBox: { backgroundColor: '#FFFFFF', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB', gap: 2 },
  phMetaText: { fontSize: 10, color: '#4B5563' },
  pendingBadge: { backgroundColor: '#FEF3C7', padding: 6, borderRadius: 6, borderWidth: 1, borderColor: '#F59E0B', marginVertical: 2 },
  pendingBadgeText: { fontSize: 10, color: '#B45309', fontWeight: 'bold', textAlign: 'center' },
  offerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 4 },
  acceptBtn: { backgroundColor: '#2D4A22', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 },
  acceptBtnText: { color: '#E9C46A', fontSize: 9, fontWeight: 'bold' },
  counterBtn: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#F59E0B' },
  counterBtnText: { color: '#B45309', fontSize: 9, fontWeight: 'bold' },
  rejectBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 },
  rejectBtnText: { color: '#DC2626', fontSize: 9, fontWeight: 'bold' }
});