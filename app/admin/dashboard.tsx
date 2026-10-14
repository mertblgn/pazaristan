import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';

// 1. Bekleyen Çiftçi Başvuruları
const INITIAL_FARMERS = [
  { id: '1', name: 'Mustafa Çiftçi', location: 'Akhisar, Manisa', product: 'Zeytinyağı & Sele Zeytin', date: '06.10.2026' },
  { id: '2', name: 'Fatma Ana', location: 'Sındırgı, Balıkesir', product: 'Çiçek Balı & Reçel', date: '05.10.2026' },
];

// 2. Hasat Öncesi Satış Formu Başvuruları
const INITIAL_HARVEST_FORMS = [
  { id: 'h1', producer: 'Akhisar Tarımsal Kalkınma Koop.', region: 'Akhisar/Manisa', crop: 'Trilye Zeytin (Hasat Öncesi Bağlantı)', tonnage: '15 Ton', targetDate: 'Kasım 2026', status: 'İncelemede' },
  { id: 'h2', producer: 'Hasan Aksoy (Üretici)', region: 'Soma/Manisa', crop: 'Yerli Ceviz İç', tonnage: '2.5 Ton', targetDate: 'Ekim 2026', status: 'İncelemede' },
];

// 3. Şikayet Edilenler
const INITIAL_COMPLAINTS = [
  { 
    id: 'c1', 
    target: 'Gölmarmara Yöresel Gıda (Satıcı)', 
    targetType: 'Satıcı',
    reason: 'Ürün ambalajında sızdırma ve geç kargo şikayeti', 
    description: 'Kargo 5 gün gecikti ve teneke ambalaj patlak olduğu için zeytinyağı koliye akmış durumda.',
    evidenceImage: 'sızdırma_kargo_kaniti.jpg',
    date: '04.10.2026', 
    status: 'Açık' 
  },
  { 
    id: 'c2', 
    target: 'Ege Birlik Kooperatifi', 
    targetType: 'Kooperatif',
    reason: 'Vaat edilen zeytinyağı asit oranında uyuşmazlık', 
    description: '0.8 asit diye aldığımız erken hasat yağ, laboratuvar testinde 1.8 asit çıktı.',
    evidenceImage: 'lab_raporu_asit.png',
    date: '01.10.2026', 
    status: 'İnceleniyor' 
  },
];

// 4. Cezalı İşletmeler & Tüketiciler Listesi
const INITIAL_PUNISHED_LIST = [
  { id: 'p1', name: 'Gediz Tarım Market', city: 'Manisa', type: 'Çiftçi/Satıcı', reason: 'Sahte etiket ve standart dışı ürün', penaltyType: 'Satış Durdurma', duration: '14 Gün', remaining: '9 Gün kaldı', date: '2026-10-01' },
  { id: 'p2', name: 'Soma Yöresel Koop.', city: 'Manisa', type: 'Kooperatif', reason: 'Sözleşmeli hasat tonaj eksikliği', penaltyType: 'Komisyon Arttırımı', duration: '30 Gün', remaining: '18 Gün kaldı', date: '2026-09-25' },
  { id: 'p3', name: 'Ahmet Yılmaz', city: 'İzmir', type: 'Tüketici', reason: 'Sürekli sahte iade talebi ve hakaret', penaltyType: 'Para Cezası', duration: '₺1,500', remaining: 'Ödeme Bekleniyor', date: '2026-10-03' },
];

// 5. Hakediş Dağıtım Listesi
const INITIAL_PAYOUT_LIST = [
  { id: 'pay1', name: 'Mustafa Çiftçi (Akhisar)', type: 'Çiftçi', amount: '₺14,500', date: '10.10.2026 (Otomatik)', isPunished: false, penaltyInfo: '' },
  { id: 'pay2', name: 'Soma Yöresel Koop.', type: 'Kooperatif', amount: '₺32,000', date: '10.10.2026 (Otomatik)', isPunished: true, penaltyInfo: 'Komisyon Arttırımı (%8) Cezası Aktif' },
  { id: 'pay3', name: 'Hasan Aksoy (Soma)', type: 'Çiftçi', amount: '₺8,900', date: '10.10.2026 (Otomatik)', isPunished: false, penaltyInfo: '' },
];

// Sisteme Kayıtlı Tüm Firma / Alıcı / Çiftçi Veritabanı
const ALL_SYSTEM_ENTITIES = [
  { id: 'e1', name: 'Gediz Tarım Market', type: 'Satıcı/Çiftçi', city: 'Manisa' },
  { id: 'e2', name: 'Soma Yöresel Koop.', type: 'Kooperatif', city: 'Manisa' },
  { id: 'e3', name: 'Ahmet Yılmaz', type: 'Tüketici', city: 'İzmir' },
  { id: 'e4', name: 'Mustafa Çiftçi', type: 'Çiftçi', city: 'Akhisar' },
  { id: 'e5', name: 'Gölmarmara Yöresel Gıda', type: 'Satıcı', city: 'Manisa' },
  { id: 'e6', name: 'Ege Birlik Kooperatifi', type: 'Kooperatif', city: 'İzmir' },
  { id: 'e7', name: 'Hasan Aksoy', type: 'Çiftçi', city: 'Soma' },
  { id: 'e8', name: 'Fatma Ana', type: 'Çiftçi/Üretici', city: 'Balıkesir' }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'farmers' | 'harvest' | 'complaints' | 'punished' | 'reports' | 'traffic' | 'finances'>('reports');

  // State Yönetimleri
  const [farmers, setFarmers] = useState(INITIAL_FARMERS);
  const [harvestForms, setHarvestForms] = useState(INITIAL_HARVEST_FORMS);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [punishedList, setPunishedList] = useState(INITIAL_PUNISHED_LIST);
  const [payoutList, setPayoutList] = useState(INITIAL_PAYOUT_LIST);

  // Arama ve Filtreleme State'leri (Cezalılar Sekmesi İçin)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'az' | 'za' | 'date' | 'penaltyType'>('az');
  const [filterPenaltyType, setFilterPenaltyType] = useState<string>('Hepsi');

  // Raporlar Sekmesi State'leri
  const [reportType, setReportType] = useState<'sales' | 'members' | 'complaints' | 'penalties' | 'finances'>('sales');
  const [reportStartDate, setReportStartDate] = useState('2026-10-01');
  const [reportEndDate, setReportEndDate] = useState('2026-10-07');
  const [reportSearch, setReportSearch] = useState('');

  // Red/Bildirim Modalı
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'farmer_reject' | 'harvest_reject' | 'complaint_reject' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Şikayet Detay Modalı
  const [complaintDetailVisible, setComplaintDetailVisible] = useState(false);
  const [activeComplaintDetail, setActiveComplaintDetail] = useState<any>(null);

  // Ceza Uygulama Modalı
  const [penaltyModalVisible, setPenaltyModalVisible] = useState(false);
  const [entitySearchQuery, setEntitySearchQuery] = useState('');
  const [selectedTargetEntity, setSelectedTargetEntity] = useState<any>(null);
  const [selectedPenaltyType, setSelectedPenaltyType] = useState<'Satış Durdurma' | 'Komisyon Arttırımı' | 'Para Cezası' | 'Uyarı Cezası'>('Satış Durdurma');
  const [penaltyValue, setPenaltyValue] = useState('');
  const [penaltyDescription, setPenaltyDescription] = useState('');

  // Komisyon & Hakediş Dağıtım Modalı
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [newPayoutName, setNewPayoutName] = useState('');
  const [newPayoutAmount, setNewPayoutAmount] = useState('');

  // Ceza İçeriği Görüntüleme Modalı
  const [penaltyInfoModalVisible, setPenaltyInfoModalVisible] = useState(false);
  const [activePenaltyInfo, setActivePenaltyInfo] = useState('');

  // Komisyon Oranları
  const [commFarmer, setCommFarmer] = useState('4');
  const [commCoop, setCommCoop] = useState('3');
  const [commConsumerBulk, setCommConsumerBulk] = useState('2');

  const openReasonModal = (type: 'farmer_reject' | 'harvest_reject' | 'complaint_reject', item: any) => {
    setModalType(type);
    setSelectedItem(item);
    setRejectionReasonText('');
    setReasonModalVisible(true);
  };

  const handleReasonSubmit = () => {
    if (!rejectionReasonText.trim()) {
      Alert.alert('Hata', 'Lütfen bir gerekçe/açıklama yazın.');
      return;
    }

    if (modalType === 'farmer_reject') {
      setFarmers(farmers.filter(f => f.id !== selectedItem.id));
    } else if (modalType === 'harvest_reject') {
      setHarvestForms(harvestForms.filter(h => h.id !== selectedItem.id));
    } else if (modalType === 'complaint_reject') {
      setComplaints(complaints.filter(c => c.id !== selectedItem.id));
    }

    setReasonModalVisible(false);
    setSelectedItem(null);
    Alert.alert('İşlem Başarılı', 'İlgili kayıt reddedildi ve bildirim iletildi.');
  };

  const openPenaltyModal = (prefilledTarget?: any) => {
    setEntitySearchQuery('');
    setSelectedTargetEntity(prefilledTarget || null);
    setSelectedPenaltyType('Satış Durdurma');
    setPenaltyValue('7');
    setPenaltyDescription('');
    setPenaltyModalVisible(true);
  };

  const handleApplyPenalty = () => {
    if (!selectedTargetEntity) {
      Alert.alert('Eksik Bilgi', 'Lütfen listeden ceza verilecek firma, alıcı veya çiftçiyi seçiniz.');
      return;
    }
    if (!penaltyDescription.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ceza açıklamasını/gerekçesini yazınız.');
      return;
    }
    if (selectedPenaltyType !== 'Uyarı Cezası' && !penaltyValue.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen süre veya miktar değerini giriniz.');
      return;
    }

    let detailText = selectedPenaltyType;
    if (selectedPenaltyType === 'Satış Durdurma') detailText = `Satış Durdurma (${penaltyValue} Gün)`;
    else if (selectedPenaltyType === 'Komisyon Arttırımı') detailText = `Komisyon Arttırımı (%${penaltyValue})`;
    else if (selectedPenaltyType === 'Para Cezası') detailText = `Para Cezası (₺${penaltyValue})`;

    const newPunished = {
      id: Date.now().toString(),
      name: selectedTargetEntity.name,
      city: selectedTargetEntity.city || 'Manisa',
      type: selectedTargetEntity.type || selectedTargetEntity.targetType || 'Üretici/Tüketici',
      reason: penaltyDescription,
      penaltyType: detailText,
      duration: selectedPenaltyType === 'Uyarı Cezası' ? 'Tek Seferlik' : `${penaltyValue} Gün / Süresiz`,
      remaining: 'Aktif Cezalı',
      date: new Date().toISOString().split('T')[0]
    };

    setPunishedList([newPunished, ...punishedList]);
    setPenaltyModalVisible(false);
    Alert.alert('Ceza Başarıyla Uygulandı', `${selectedTargetEntity.name} adlı üyeye ceza tanımlandı ve bildirim gönderildi.`);
  };

  const handleRemovePenalty = (id: string, name: string) => {
    setPunishedList(punishedList.filter(p => p.id !== id));
    Alert.alert('Ceza Kaldırıldı', `${name} adlı işletme/tüketicinin cezası kaldırıldı.`);
  };

  const getFilteredAndSortedPunishedList = () => {
    let result = punishedList.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterPenaltyType === 'Hepsi' || item.penaltyType.includes(filterPenaltyType);
      return matchSearch && matchType;
    });

    result.sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      if (sortBy === 'za') return b.name.localeCompare(a.name);
      if (sortBy === 'date') return b.date.localeCompare(a.date);
      if (sortBy === 'penaltyType') return a.penaltyType.localeCompare(b.penaltyType);
      return 0;
    });

    return result;
  };

  const filteredEntitiesForModal = ALL_SYSTEM_ENTITIES.filter(e => 
    e.name.toLowerCase().includes(entitySearchQuery.toLowerCase()) ||
    e.city.toLowerCase().includes(entitySearchQuery.toLowerCase()) ||
    e.type.toLowerCase().includes(entitySearchQuery.toLowerCase())
  );

  // Rapor Verilerini Hazırlama Fonksiyonu
  const getReportData = () => {
    if (reportType === 'sales') {
      return [
        { id: 's1', title: 'Akhisar Trilye Zeytinyağı Sezon Satışı', detail: '14.5 Ton - Tutar: ₺1.450.000', date: '2026-10-05', status: 'Tamamlandı' },
        { id: 's2', title: 'Soma Yöresel Bal Dağıtımı', detail: '2.1 Ton - Tutar: ₺420.000', date: '2026-10-03', status: 'Tamamlandı' },
      ];
    } else if (reportType === 'members') {
      return [
        { id: 'm1', title: 'Mustafa Çiftçi (Akhisar)', detail: 'Çiftçi / Üretici - Manisa', date: '2026-10-06', status: 'Onaylandı' },
        { id: 'm2', title: 'Fatma Ana (Sındırgı)', detail: 'Çiftçi / Üretici - Balıkesir', date: '2026-10-05', status: 'Onaylandı' },
      ];
    } else if (reportType === 'complaints') {
      return complaints.map(c => ({ id: c.id, title: c.target, detail: `${c.reason} (${c.targetType})`, date: c.date, status: c.status }));
    } else if (reportType === 'penalties') {
      return punishedList.map(p => ({ id: p.id, title: p.name, detail: `${p.penaltyType} - Gerekçe: ${p.reason}`, date: p.date, status: p.remaining }));
    } else {
      return payoutList.map(pay => ({ id: pay.id, title: pay.name, detail: `Hakediş: ${pay.amount} (${pay.type})`, date: '2026-10-10', status: pay.isPunished ? 'Cezalı Kesintili' : 'Normal' }));
    }
  };

  const filteredReportData = getReportData().filter(item => 
    item.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
    item.detail.toLowerCase().includes(reportSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bilgi Barı */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛡 Pazaristan Yönetim & Denetim Merkezi</Text>
          <Text style={styles.headerSubtitle}>Kooperatif, Üretici, Disiplin ve Komisyon Paneli</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/auth/login' as any)} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {/* Genel İstatistik Kartları */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>98</Text>
          <Text style={styles.statLabel}>Kayıtlı Çiftçi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>44</Text>
          <Text style={styles.statLabel}>Kayıtlı Koop</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1,850</Text>
          <Text style={styles.statLabel}>Aktif Alıcı</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
          <TouchableOpacity onPress={() => setActiveTab('punished')}>
            <Text style={[styles.statNumber, { color: '#991B1B', textAlign: 'center' }]}>{punishedList.length}</Text>
            <Text style={[styles.statLabel, { color: '#991B1B', textDecorationLine: 'underline' }]}>Cezalılar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sekme Butonları */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'farmers' && styles.tabActive]} onPress={() => setActiveTab('farmers')}>
            <Text style={[styles.tabText, activeTab === 'farmers' && styles.tabTextActive]}>👨‍🌾 Üye Onayları ({farmers.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'harvest' && styles.tabActive]} onPress={() => setActiveTab('harvest')}>
            <Text style={[styles.tabText, activeTab === 'harvest' && styles.tabTextActive]}>🌾 Hasat Formları ({harvestForms.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'complaints' && styles.tabActive]} onPress={() => setActiveTab('complaints')}>
            <Text style={[styles.tabText, activeTab === 'complaints' && styles.tabTextActive]}>⚠️ Şikayetler ({complaints.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'punished' && styles.tabActive]} onPress={() => setActiveTab('punished')}>
            <Text style={[styles.tabText, activeTab === 'punished' && styles.tabTextActive]}>🚨 Cezalılar ({punishedList.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'reports' && styles.tabActive]} onPress={() => setActiveTab('reports')}>
            <Text style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}>📊 Raporlar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'traffic' && styles.tabActive]} onPress={() => setActiveTab('traffic')}>
            <Text style={[styles.tabText, activeTab === 'traffic' && styles.tabTextActive]}>📈 Trafik & Hacim</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'finances' && styles.tabActive]} onPress={() => setActiveTab('finances')}>
            <Text style={[styles.tabText, activeTab === 'finances' && styles.tabTextActive]}>💰 Komisyon & Ödemeler</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* İçerik Alanı */}
      <ScrollView style={styles.content}>
        
        {/* 1. ÇİFTÇİ / ÜYE ONAYLARI */}
        {activeTab === 'farmers' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yeni Üretici & Kooperatif Başvuruları</Text>
            {farmers.length === 0 ? (
              <Text style={styles.emptyText}>Bekleyen başvuru bulunmuyor.</Text>
            ) : (
              farmers.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSub}>📍 Konum: {item.location}</Text>
                    <Text style={styles.cardSub}>🌾 Ürün Grubu: {item.product}</Text>
                    <Text style={styles.cardDate}>Başvuru Tarihi: {item.date}</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => {
                      setFarmers(farmers.filter(f => f.id !== item.id));
                      Alert.alert('Onaylandı', `${item.name} sisteme üretici olarak eklendi.`);
                    }}>
                      <Text style={styles.btnText}>Onayla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => openReasonModal('farmer_reject', item)}>
                      <Text style={styles.rejectText}>Reddet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 2. HASAT ÖNCESİ SATIŞ BAŞVURULARI */}
        {activeTab === 'harvest' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hasat Öncesi Mahsul & Kooperatif Satış Sözleşmeleri</Text>
            {harvestForms.length === 0 ? (
              <Text style={styles.emptyText}>İncelenecek hasat formu bulunmuyor.</Text>
            ) : (
              harvestForms.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View>
                    <Text style={styles.cardTitle}>{item.producer}</Text>
                    <Text style={styles.cardSub}>🌾 Mahsul / Plan: {item.crop}</Text>
                    <Text style={styles.cardSub}>📍 Bölge: {item.region} | Miktar: {item.tonnage}</Text>
                    <Text style={styles.cardDate}>Hedef Sezon: {item.targetDate}</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => {
                      setHarvestForms(harvestForms.filter(h => h.id !== item.id));
                      Alert.alert('Hasat Formu Onaylandı', `"${item.crop}" ilanı pazarda ön satışa açıldı.`);
                    }}>
                      <Text style={styles.btnText}>Ön Satışa Aç</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => openReasonModal('harvest_reject', item)}>
                      <Text style={styles.rejectText}>Reddet & Gerekçe Yaz</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 3. ŞİKAYETLER */}
        {activeTab === 'complaints' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tüketici Şikayetleri & Disiplin Denetimi</Text>
            <Text style={styles.sectionDesc}>Şikayetin üzerine tıklayarak detaylı açıklamayı ve kanıt görselini inceleyebilir, cezai işlem uygulayabilirsiniz.</Text>
            
            {complaints.length === 0 ? (
              <Text style={styles.emptyText}>Çözülmemiş aktif şikayet bulunmuyor.</Text>
            ) : (
              complaints.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.card, { borderColor: '#FCA5A5' }]} onPress={() => {
                  setActiveComplaintDetail(item);
                  setComplaintDetailVisible(true);
                }}>
                  <View>
                    <View style={styles.badgeRow}>
                      <Text style={styles.cardTitle}>{item.target} <Text style={{fontSize: 10, color: '#E76F51'}}>({item.targetType})</Text></Text>
                      <Text style={styles.statusBadge}>Durum: {item.status}</Text>
                    </View>
                    <Text style={styles.complaintReason}>📝 Şikayet Nedeni: {item.reason}</Text>
                    <Text style={styles.cardDate}>Bildirim Tarihi: {item.date} (Detay için tıkla)</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#B91C1C' }]} onPress={(e) => {
                      e.stopPropagation();
                      openPenaltyModal({ name: item.target, type: item.targetType, city: 'Manisa' });
                    }}>
                      <Text style={styles.btnText}>⚖️️ Ceza Uygula</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={(e) => {
                      e.stopPropagation();
                      openReasonModal('complaint_reject', item);
                    }}>
                      <Text style={styles.rejectText}>Şikayeti Reddet</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* 4. CEZALILAR SEKMESİ */}
        {activeTab === 'punished' && (
          <View style={styles.section}>
            <View style={styles.badgeRow}>
              <Text style={styles.sectionTitle}>🚨 Cezalı Tüketici / Koop / Çiftçi Listesi</Text>
              <TouchableOpacity style={styles.smallAddBtn} onPress={() => openPenaltyModal()}>
                <Text style={styles.smallAddText}>+ Ceza Ekle</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionDesc}>Ceza almış tüm üyeleri inceleyin, arama yapın veya filtreleyin.</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Ad veya şehir ile arama yapın (Örn: Manisa, Ahmet...)"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <View style={styles.filterBox}>
              <Text style={styles.filterLabel}>Sırala:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{gap: 6}}>
                <TouchableOpacity style={[styles.filterChip, sortBy === 'az' && styles.filterChipActive]} onPress={() => setSortBy('az')}><Text style={[styles.filterChipText, sortBy === 'az' && styles.filterChipTextActive]}>A-Z</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.filterChip, sortBy === 'za' && styles.filterChipActive]} onPress={() => setSortBy('za')}><Text style={[styles.filterChipText, sortBy === 'za' && styles.filterChipTextActive]}>Z-A</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.filterChip, sortBy === 'date' && styles.filterChipActive]} onPress={() => setSortBy('date')}><Text style={[styles.filterChipText, sortBy === 'date' && styles.filterChipTextActive]}>Tarih</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.filterChip, sortBy === 'penaltyType' && styles.filterChipActive]} onPress={() => setSortBy('penaltyType')}><Text style={[styles.filterChipText, sortBy === 'penaltyType' && styles.filterChipTextActive]}>Ceza Türü</Text></TouchableOpacity>
              </ScrollView>
            </View>

            <View style={styles.filterBox}>
              <Text style={styles.filterLabel}>Ceza Türü:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{gap: 6}}>
                {['Hepsi', 'Satış Durdurma', 'Komisyon Arttırımı', 'Para Cezası'].map((type) => (
                  <TouchableOpacity key={type} style={[styles.filterChip, filterPenaltyType === type && styles.filterChipActive]} onPress={() => setFilterPenaltyType(type)}>
                    <Text style={[styles.filterChipText, filterPenaltyType === type && styles.filterChipTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {getFilteredAndSortedPunishedList().length === 0 ? (
              <Text style={styles.emptyText}>Aranan kriterlere uygun cezalı kayıt bulunamadı.</Text>
            ) : (
              getFilteredAndSortedPunishedList().map((item) => (
                <View key={item.id} style={styles.punishedCardFull}>
                  <View style={{flex: 1, gap: 3}}>
                    <Text style={styles.cardTitle}>{item.name} <Text style={{fontSize: 10, color: '#991B1B'}}>({item.type} - {item.city})</Text></Text>
                    <Text style={styles.cardSub}>📝 Gerekçe: {item.reason}</Text>
                    <Text style={styles.cardSub}>⚖️ Ceza: {item.penaltyType} ({item.duration})</Text>
                    <Text style={[styles.cardDate, { color: '#B91C1C', fontWeight: 'bold' }]}>⏳ Durum: {item.remaining} | Tarih: {item.date}</Text>
                  </View>
                  <View style={{gap: 6, justifyContent: 'center'}}>
                    <TouchableOpacity style={styles.cancelPenaltyBtn} onPress={() => handleRemovePenalty(item.id, item.name)}>
                      <Text style={styles.cancelPenaltyText}>Ceza Kaldır</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addMorePenaltyBtn} onPress={() => openPenaltyModal({ name: item.name, type: item.type, city: item.city })}>
                      <Text style={styles.addMorePenaltyText}>Ceza Ekle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 5. RAPORLAR SEKMESİ (YENİ) */}
        {activeTab === 'reports' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Detaylı Raporlama & İndirme Merkezi</Text>
            <Text style={styles.sectionDesc}>İstediğiniz kategori ve tarih aralığında verileri süzerek inceleyebilir, rapor çıktısı alabilirsiniz.</Text>

            {/* Rapor Kategorisi Seçimi */}
            <Text style={styles.filterLabel}>Rapor Türü:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{gap: 6, marginBottom: 6}}>
              {[
                { key: 'sales', label: 'Satış Raporları' },
                { key: 'members', label: 'Üye/Kayıt Raporu' },
                { key: 'complaints', label: 'Şikayet Raporu' },
                { key: 'penalties', label: 'Disiplin/Cezalar' },
                { key: 'finances', label: 'Finans & Hakediş' },
              ].map((item) => (
                <TouchableOpacity 
                  key={item.key} 
                  style={[styles.filterChip, reportType === item.key && styles.filterChipActive]}
                  onPress={() => setReportType(item.key as any)}
                >
                  <Text style={[styles.filterChipText, reportType === item.key && styles.filterChipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tarih Aralığı Seçim Alanı */}
            <View style={styles.reportDateRow}>
              <View style={{flex: 1}}>
                <Text style={styles.inputLabel}>Başlangıç Tarihi:</Text>
                <TextInput style={styles.textInput} value={reportStartDate} onChangeText={setReportStartDate} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.inputLabel}>Bitiş Tarihi:</Text>
                <TextInput style={styles.textInput} value={reportEndDate} onChangeText={setReportEndDate} />
              </View>
            </View>

            {/* Rapor İçi Arama Çubuğu */}
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Rapor içinde kelime ara..."
              placeholderTextColor="#9CA3AF"
              value={reportSearch}
              onChangeText={setReportSearch}
            />

            {/* Rapor Verileri Listesi */}
            <View style={styles.reportResultContainer}>
              <View style={styles.reportResultHeader}>
                <Text style={styles.reportResultTitle}>Rapor Sonuçları ({filteredReportData.length} Kayıt)</Text>
                <TouchableOpacity style={styles.downloadExcelBtn} onPress={() => Alert.alert('Rapor İndirildi', `Seçilen kriterlere ait ${reportType} raporu Excel/PDF olarak başarıyla indirildi.`)}>
                  <Text style={styles.downloadExcelText}>📥 Raporu İndir</Text>
                </TouchableOpacity>
              </View>

              {filteredReportData.length === 0 ? (
                <Text style={styles.emptyText}>Bu tarih aralığında ve kriterde rapor verisi bulunamadı.</Text>
              ) : (
                filteredReportData.map((row) => (
                  <View key={row.id} style={styles.reportItemCard}>
                    <View style={{flex: 1, gap: 2}}>
                      <Text style={styles.cardTitle}>{row.title}</Text>
                      <Text style={styles.cardSub}>{row.detail}</Text>
                      <Text style={styles.cardDate}>Tarih: {row.date}</Text>
                    </View>
                    <View style={styles.reportStatusBadgeBox}>
                      <Text style={styles.reportStatusText}>{row.status}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* 6. TRAFİK & HACİM */}
        {activeTab === 'traffic' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Canlı Platform Trafiği & Özet Veriler</Text>
            <View style={styles.trafficBox}>
              <Text style={styles.trafficTitle}>📊 Alışveriş & Ziyaretçi İstatistikleri</Text>
              <View style={styles.trafficRow}><Text style={styles.trafficLabel}>Günlük Tekil Ziyaretçi:</Text><Text style={styles.trafficValue}>3,420</Text></View>
              <View style={styles.trafficRow}><Text style={styles.trafficLabel}>Tamamlanan Sipariş (Bu Ay):</Text><Text style={styles.trafficValue}>612 Adet</Text></View>
              <View style={styles.trafficRow}><Text style={styles.trafficLabel}>Aktif Sepet Oranı:</Text><Text style={styles.trafficValue}>%18.4</Text></View>
              <View style={styles.trafficRow}><Text style={styles.trafficLabel}>Toplam Kayıtlı Alıcı (Tüketici):</Text><Text style={styles.trafficValue}>1,850</Text></View>
              <View style={styles.trafficRow}><Text style={styles.trafficLabel}>Kayıtlı Bağımsız Çiftçi:</Text><Text style={[styles.trafficValue, { color: '#2D4A22' }]}>98 İşletme</Text></View>
              <View style={styles.trafficRow}><Text style={styles.trafficLabel}>Kayıtlı Tarımsal Kooperatif:</Text><Text style={[styles.trafficValue, { color: '#2D4A22' }]}>44 Kurum</Text></View>
              
              <TouchableOpacity style={styles.punishedLinkRow} onPress={() => setActiveTab('punished')}>
                <Text style={styles.punishedLinkText}>🚨 Cezalı Listesini İncele &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 7. KOMİSYON VE ÖDEMELER */}
        {activeTab === 'finances' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Komisyon Oranları & Hakediş Ödemeleri Dağıtımı</Text>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>⚙️ Platform Kesinti Oranları (%)</Text>
              <View style={styles.commissionInputRow}><Text style={styles.commLabel}>Çiftçi Satış Komisyonu (%):</Text><TextInput style={styles.commInput} value={commFarmer} onChangeText={setCommFarmer} keyboardType="numeric" /></View>
              <View style={styles.commissionInputRow}><Text style={styles.commLabel}>Kooperatif Satış Komisyonu (%):</Text><TextInput style={styles.commInput} value={commCoop} onChangeText={setCommCoop} keyboardType="numeric" /></View>
              <View style={styles.commissionInputRow}><Text style={styles.commLabel}>Alıcı Toplu Komisyon (%):</Text><TextInput style={styles.commInput} value={commConsumerBulk} onChangeText={setCommConsumerBulk} keyboardType="numeric" /></View>
              <TouchableOpacity style={[styles.btn, styles.approveBtn, { marginTop: 10 }]} onPress={() => Alert.alert('Güncellendi', 'Komisyon oranları kaydedildi.')}>
                <Text style={styles.btnText}>Komisyon Oranlarını Kaydet</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.card, { marginTop: 12 }]}>
              <View style={styles.badgeRow}>
                <Text style={styles.cardTitle}>💸 Üretici & Kooperatif Hakediş Dağıtım Listesi</Text>
                <TouchableOpacity style={styles.smallAddBtn} onPress={() => setPayoutModalVisible(true)}>
                  <Text style={styles.smallAddText}>+ Kişi Ekle</Text>
                </TouchableOpacity>
              </View>

              {payoutList.map((payout, idx) => (
                <View key={payout.id} style={[styles.payoutItemCard, payout.isPunished && { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                  <View style={{flex: 1}}>
                    <Text style={[styles.cardTitle, payout.isPunished && { color: '#991B1B' }]}>
                      {idx + 1}. {payout.name} ({payout.type}) - <Text style={{fontWeight: 'bold'}}>{payout.amount}</Text>
                    </Text>
                    <Text style={styles.cardSub}>📅 Ödeme Tarihi: {payout.date}</Text>

                    {payout.isPunished && (
                      <TouchableOpacity style={styles.penaltyInfoBtn} onPress={() => {
                        setActivePenaltyInfo(payout.penaltyInfo);
                        setPenaltyInfoModalVisible(true);
                      }}>
                        <Text style={styles.penaltyInfoBtnText}>⚠️ Ceza İçeriğini Gör</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.payoutActionCol}>
                    <TouchableOpacity style={styles.tinyBtn} onPress={() => Alert.alert('Düzenle', `${payout.name} ödeme bilgisi düzenleme ekranı.`)}>
                      <Text style={styles.tinyBtnText}>Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tinyBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => {
                      setPayoutList(payoutList.filter(item => item.id !== payout.id));
                    }}>
                      <Text style={[styles.tinyBtnText, { color: '#991B1B' }]}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={[styles.btn, styles.approveBtn, { marginTop: 14 }]} onPress={() => Alert.alert('Ödemeler Dağıtıldı', 'Hakedişler IBAN hesaplarına aktarıldı.')}>
                <Text style={styles.btnText}>Üretici Ödemelerini Şimdi Dağıt</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* ---------------- MODALLAR ---------------- */}

      {/* 1. REDDEDERKEN GEREKÇE YAZMA MODALI */}
      <Modal visible={reasonModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reddetme Gerekçesi Bildirimi</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Gerekçe veya açıklama yazın..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={rejectionReasonText}
              onChangeText={setRejectionReasonText}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => setReasonModalVisible(false)}>
                <Text style={styles.rejectText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={handleReasonSubmit}>
                <Text style={styles.btnText}>Reddet & Bildir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. ŞİKAYET DETAY İNCELEME MODALI */}
      <Modal visible={complaintDetailVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔍 Şikayet Detay İncelemesi</Text>
            {activeComplaintDetail && (
              <View style={{ gap: 8 }}>
                <Text style={styles.cardTitle}>Şikayet Edilen: {activeComplaintDetail.target}</Text>
                <Text style={styles.cardSub}>🏷 Tür: {activeComplaintDetail.targetType}</Text>
                <Text style={styles.cardSub}>📌 Şikayet Konusu: {activeComplaintDetail.reason}</Text>
                <View style={styles.evidenceBox}>
                  <Text style={styles.evidenceTitle}>📝 Açıklama:</Text>
                  <Text style={styles.evidenceText}>{activeComplaintDetail.description}</Text>
                </View>
                <View style={styles.evidenceBox}>
                  <Text style={styles.evidenceTitle}>📷 Kanıt Belge:</Text>
                  <Text style={[styles.evidenceText, { color: '#2D4A22', fontWeight: 'bold' }]}>📄 {activeComplaintDetail.evidenceImage}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={[styles.btn, styles.approveBtn, { marginTop: 10 }]} onPress={() => setComplaintDetailVisible(false)}>
              <Text style={styles.btnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. CEZA EKLEME MODALI */}
      <Modal visible={penaltyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>⚖️ Disiplin Cezası Ekle</Text>
            
            {selectedTargetEntity ? (
              <View style={styles.selectedTargetBox}>
                <Text style={styles.selectedTargetTitle}>Seçilen Üye/Firma:</Text>
                <Text style={styles.selectedTargetName}>{selectedTargetEntity.name} ({selectedTargetEntity.type} - {selectedTargetEntity.city})</Text>
                <TouchableOpacity onPress={() => setSelectedTargetEntity(null)}>
                  <Text style={styles.changeTargetText}>🔄 Başkasını Seç</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 6 }}>
                <Text style={styles.inputLabel}>Firma, Alıcı veya Çiftçi Ara ve Seç:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="🔍 İsim veya şehir yazarak arayın..."
                  placeholderTextColor="#9CA3AF"
                  value={entitySearchQuery}
                  onChangeText={setEntitySearchQuery}
                />
                <ScrollView style={styles.entityDropdownList} nestedScrollEnabled={true}>
                  {filteredEntitiesForModal.length === 0 ? (
                    <Text style={styles.emptyText}>Kayıt bulunamadı.</Text>
                  ) : (
                    filteredEntitiesForModal.map((entity) => (
                      <TouchableOpacity 
                        key={entity.id} 
                        style={styles.entityItemRow} 
                        onPress={() => setSelectedTargetEntity(entity)}
                      >
                        <Text style={styles.entityItemText}>{entity.name} <Text style={{fontSize: 10, color: '#6B7280'}}>({entity.type} - {entity.city})</Text></Text>
                        <Text style={styles.selectActionText}>Seç &gt;</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            <Text style={styles.labelTitle}>Ceza Türü Seçiniz:</Text>
            <View style={styles.chipContainer}>
              {(['Satış Durdurma', 'Komisyon Arttırımı', 'Para Cezası', 'Uyarı Cezası'] as const).map((type) => (
                <TouchableOpacity 
                  key={type} 
                  style={[styles.chip, selectedPenaltyType === type && styles.chipActive]}
                  onPress={() => setSelectedPenaltyType(type)}
                >
                  <Text style={[styles.chipText, selectedPenaltyType === type && styles.chipTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedPenaltyType !== 'Uyarı Cezası' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {selectedPenaltyType === 'Satış Durdurma' ? 'Süre (Gün):' : selectedPenaltyType === 'Komisyon Arttırımı' ? 'Oran (%):' : 'Tutar (₺):'}
                </Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={penaltyValue} onChangeText={setPenaltyValue} placeholder="Değer giriniz" placeholderTextColor="#9CA3AF" />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ceza Gerekçesi / Açıklaması:</Text>
              <TextInput 
                style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]} 
                multiline 
                placeholder="Örn: Denetimde standart dışı ürün tespit edildi..." 
                placeholderTextColor="#9CA3AF"
                value={penaltyDescription} 
                onChangeText={setPenaltyDescription} 
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => setPenaltyModalVisible(false)}>
                <Text style={styles.rejectText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#B91C1C' }]} onPress={handleApplyPenalty}>
                <Text style={styles.btnText}>Cezayı Kaydet & Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. HAKEDİŞ LİSTESİNE EKLEME MODALI */}
      <Modal visible={payoutModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>+ Hakediş Listesine Ekleme</Text>
            <TextInput style={styles.textInput} placeholder="Ad Soyad / Kurum Adı" placeholderTextColor="#9CA3AF" value={newPayoutName} onChangeText={setNewPayoutName} />
            <TextInput style={[styles.textInput, { marginTop: 8 }]} placeholder="Tutar (Örn: ₺12,000)" placeholderTextColor="#9CA3AF" value={newPayoutAmount} onChangeText={setNewPayoutAmount} keyboardType="numeric" />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => setPayoutModalVisible(false)}>
                <Text style={styles.rejectText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => {
                if (!newPayoutName.trim() || !newPayoutAmount.trim()) {
                  Alert.alert('Hata', 'Tüm alanları doldurun.');
                  return;
                }
                setPayoutList([...payoutList, { id: Date.now().toString(), name: newPayoutName, type: 'Üretici/Koop', amount: newPayoutAmount, date: '10.10.2026', isPunished: false, penaltyInfo: '' }]);
                setNewPayoutName('');
                setNewPayoutAmount('');
                setPayoutModalVisible(false);
              }}>
                <Text style={styles.btnText}>Listeye Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. CEZA İÇERİĞİ GÖRÜNTÜLEME MODALI */}
      <Modal visible={penaltyInfoModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Aktif Disiplin Cezası Detayı</Text>
            <Text style={[styles.cardSub, { fontSize: 13, color: '#991B1B', marginVertical: 10 }]}>{activePenaltyInfo}</Text>
            <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => setPenaltyInfoModalVisible(false)}>
              <Text style={styles.btnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#2D4A22' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 10, color: '#E9C46A' },
  logoutBtn: { backgroundColor: '#E76F51', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  logoutText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', padding: 10, gap: 6 },
  statCard: { flex: 1, backgroundColor: '#FFF', padding: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  statNumber: { fontSize: 14, fontWeight: 'bold', color: '#2D4A22' },
  statLabel: { fontSize: 9, color: '#6B7280', marginTop: 2, textAlign: 'center' },
  tabScrollContainer: { maxHeight: 50, paddingHorizontal: 10, marginBottom: 6 },
  tabContainer: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  tabButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#E5E7EB', borderRadius: 8, height: 36, justifyContent: 'center' },
  tabActive: { backgroundColor: '#2D4A22' },
  tabText: { fontSize: 11, fontWeight: 'bold', color: '#4B5563' },
  tabTextActive: { color: '#E9C46A' },
  content: { padding: 12 },
  section: { gap: 10, paddingBottom: 30 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
  sectionDesc: { fontSize: 11, color: '#6B7280', marginTop: -6, marginBottom: 4 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', gap: 6 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#1F2937' },
  cardSub: { fontSize: 11, color: '#4B5563' },
  cardDate: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { fontSize: 10, backgroundColor: '#FEF3C7', color: '#B45309', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' },
  complaintReason: { fontSize: 11, color: '#B91C1C', fontWeight: '500', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  approveBtn: { backgroundColor: '#2D4A22' },
  rejectBtn: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
  btnText: { color: '#E9C46A', fontSize: 11, fontWeight: 'bold' },
  rejectText: { color: '#991B1B', fontSize: 11, fontWeight: 'bold' },
  trafficBox: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  trafficTitle: { fontSize: 13, fontWeight: 'bold', color: '#2D4A22', marginBottom: 4 },
  trafficRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  trafficLabel: { fontSize: 12, color: '#4B5563' },
  trafficValue: { fontSize: 12, fontWeight: 'bold', color: '#1F2937' },
  punishedLinkRow: { marginTop: 4, marginBottom: 4, padding: 10, backgroundColor: '#FEF2F2', borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5', alignItems: 'center' },
  punishedLinkText: { fontSize: 11, fontWeight: 'bold', color: '#991B1B', textAlign: 'center' },
  emptyText: { fontSize: 12, color: '#6B7280', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  commissionInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  commLabel: { fontSize: 11, color: '#4B5563', flex: 1 },
  commInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, width: 60, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#1F2937' },
  searchInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 12, color: '#1F2937', marginBottom: 4 },
  filterBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 },
  filterLabel: { fontSize: 11, fontWeight: 'bold', color: '#4B5563', width: 65 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#E5E7EB', borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB' },
  filterChipActive: { backgroundColor: '#2D4A22', borderColor: '#2D4A22' },
  filterChipText: { fontSize: 10, fontWeight: '500', color: '#374151' },
  filterChipTextActive: { color: '#E9C46A', fontWeight: 'bold' },
  punishedCardFull: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FCA5A5', flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  cancelPenaltyBtn: { backgroundColor: '#991B1B', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  cancelPenaltyText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  addMorePenaltyBtn: { backgroundColor: '#D97706', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  addMorePenaltyText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, gap: 10 },
  modalTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  textArea: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, height: 90, textAlignVertical: 'top', fontSize: 12, color: '#1F2937' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  labelTitle: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginTop: 6 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#F3F4F6', borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#2D4A22', borderColor: '#2D4A22' },
  chipText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },
  chipTextActive: { color: '#E9C46A', fontWeight: 'bold' },
  inputGroup: { gap: 4, marginVertical: 4 },
  inputLabel: { fontSize: 11, color: '#4B5563', fontWeight: '500' },
  textInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 10, height: 38, fontSize: 12, color: '#1F2937' },
  evidenceBox: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', gap: 4 },
  evidenceTitle: { fontSize: 11, fontWeight: 'bold', color: '#374151' },
  evidenceText: { fontSize: 11, color: '#4B5563' },
  smallAddBtn: { backgroundColor: '#2D4A22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  smallAddText: { color: '#E9C46A', fontSize: 10, fontWeight: 'bold' },
  payoutItemCard: { backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  payoutActionCol: { gap: 4, width: 70 },
  tinyBtn: { backgroundColor: '#F3F4F6', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB' },
  tinyBtnText: { fontSize: 9, fontWeight: 'bold', color: '#374151' },
  penaltyInfoBtn: { backgroundColor: '#FEE2E2', padding: 4, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#FCA5A5' },
  penaltyInfoBtnText: { fontSize: 9, fontWeight: 'bold', color: '#991B1B' },
  entityDropdownList: { maxHeight: 110, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, backgroundColor: '#F9FAFB' },
  entityItemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'center' },
  entityItemText: { fontSize: 11, color: '#1F2937', fontWeight: '500' },
  selectActionText: { fontSize: 10, color: '#2D4A22', fontWeight: 'bold' },
  selectedTargetBox: { backgroundColor: '#F0FDF4', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#BBF7D0', gap: 2 },
  selectedTargetTitle: { fontSize: 10, color: '#166534', fontWeight: 'bold' },
  selectedTargetName: { fontSize: 12, color: '#14532D', fontWeight: 'bold' },
  changeTargetText: { fontSize: 10, color: '#B91C1C', fontWeight: 'bold', marginTop: 2 },
  // Raporlar sekmesine özel stiller
  reportDateRow: { flexDirection: 'row', gap: 8, marginVertical: 4 },
  reportResultContainer: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', gap: 8, marginTop: 4 },
  reportResultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportResultTitle: { fontSize: 12, fontWeight: 'bold', color: '#2D4A22' },
  downloadExcelBtn: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  downloadExcelText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  reportItemCard: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', gap: 8 },
  reportStatusBadgeBox: { backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  reportStatusText: { fontSize: 10, fontWeight: 'bold', color: '#374151' }
});