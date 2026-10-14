import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function FarmerProfileScreen() {
  const router = useRouter();

  // Çiftçi Profil Bilgileri ve Puan Sistemi
  const [profile, setProfile] = useState({
    name: 'Ahmet Çiftçi',
    location: 'Akhisar / Manisa',
    bio: '24 yıldır ata topraklarımızda zeytin yetiştiriyorum. Soğuk sıkım, saf ve katkısız üretim.',
    cksNo: 'TR-45-8821',
    score: 4.85,
    successfulSalesCount: 142,
    penaltyCommissionRate: '%12',
  });

  // Gelen Siparişler (24 Saat Kuralı)
  const [orders, setOrders] = useState([
    {
      id: 'SIP-9841',
      customer: 'Mehmet Y. (İstanbul)',
      items: '2x Akhisar Domat Erken Hasat Sızma Zeytinyağı',
      total: '680 ₺',
      status: 'Onay Bekliyor',
      timeLeft: '18 Saat Kaldı',
    },
  ]);

  // Hasat Öncesi Ön Satış Başvuruları Listesi
  const [preSales, setPreSales] = useState([
    {
      id: 'PS-501',
      cropName: 'Akhisar Domat Zeytini (Hasat Öncesi)',
      estimatedAmount: '1.2 Ton',
      pricePerKg: '95 ₺ / Kg',
      harvestDate: 'Kasım 2026',
      landInfo: 'Manisa / Akhisar - Ada: 142, Parsel: 8',
      status: 'Yönetici Onayında (Beklemede)', // Admin onayı bekliyor
    },
  ]);

  // Ön Satış Formu State'leri
  const [cropName, setCropName] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [landInfo, setLandInfo] = useState('');

  // Normal Ürün Formu State'leri
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [processStory, setProcessStory] = useState('');
  const [products, setProducts] = useState([
    {
      id: '1',
      title: 'Akhisar Domat Erken Hasat Sızma Zeytinyağı',
      price: '340 ₺',
      processStory: 'Ekim ayının ilk haftası erken hasat edilen zeytinlerimiz, 4 saat içinde soğuk sıkım tesisine alınmıştır.',
      stock: '45 Şişe',
    },
  ]);

  // Sipariş Onaylama
  const handleApproveOrder = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Onaylandı / Kargoya Hazırlanıyor', timeLeft: 'Tamamlandı' } : o));
    setProfile(prev => ({
      ...prev,
      score: Math.min(5.0, Number((prev.score + 0.03).toFixed(2))),
      successfulSalesCount: prev.successfulSalesCount + 1
    }));
    Alert.alert("Sipariş Onaylandı", "Güven Puanınız yükseltildi!");
  };

  // Süre Aşımı / İptal
  const handleSimulateTimeout = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Otomatik İptal Edildi', timeLeft: 'Süre Aşımı' } : o));
    setProfile(prev => ({
      ...prev,
      score: Math.max(1.0, Number((prev.score - 0.25).toFixed(2))),
      penaltyCommissionRate: '%15'
    }));
    Alert.alert("Süre Aşımı", "Sipariş iptal edildi, komisyon cezası uygulandı ve puanınız düştü.");
  };

  // Hasat Öncesi Ön Satış Başvurusu Gönder
  const handleCreatePreSale = () => {
    if (!cropName || !estimatedAmount || !pricePerKg || !harvestDate || !landInfo) {
      Alert.alert("Eksik Bilgi", "Lütfen ada/parsel ve rekolte dahil tüm ön satış alanlarını doldurun.");
      return;
    }

    const newPreSale = {
      id: `PS-${Math.floor(100 + Math.random() * 900)}`,
      cropName,
      estimatedAmount: `${estimatedAmount} Ton/Kg`,
      pricePerKg: `${pricePerKg} ₺ / Kg`,
      harvestDate,
      landInfo,
      status: 'Yönetici Onayında (Beklemede)',
    };

    setPreSales([newPreSale, ...preSales]);
    setCropName('');
    setEstimatedAmount('');
    setPricePerKg('');
    setHarvestDate('');
    setLandInfo('');
    Alert.alert("Başvuru Alındı", "Hasat öncesi ön satış talebiniz sistem yöneticisi onayına gönderildi. Onaylandığında pazarda yayınlanacaktır.");
  };

  // Normal Ürün Ekle
  const handleAddProductWithStory = () => {
    if (!title || !price || !stock || !processStory) {
      Alert.alert("Eksik Bilgi", "Lütfen ürün detaylarını doldurun.");
      return;
    }
    const newItem = { id: Date.now().toString(), title, price: `${price} ₺`, stock, processStory };
    setProducts([newItem, ...products]);
    setTitle(''); setPrice(''); setStock(''); setProcessStory('');
    Alert.alert("Başarılı", "Ürün yayınlandı!");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backButtonText}>← Pazar Yeri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Çiftçi Operasyon Paneli</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profil Kartı ve Puan */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}><Text style={{ fontSize: 36 }}>👨‍🌾</Text></View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileLocation}>📍 {profile.location}</Text>
            <Text style={styles.cksBadge}>🌾 ÇKS No: {profile.cksNo}</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreText}>⭐ {profile.score} / 5.0</Text>
              <Text style={styles.salesText}>({profile.successfulSalesCount} Satış)</Text>
              <Text style={styles.commissionText}>Komisyon: {profile.penaltyCommissionRate}</Text>
            </View>
          </View>
        </View>

        {/* 1. Gelen Siparişler (24 Saat Kuralı) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Gelen Siparişler (24 Saat Kuralı)</Text>
          <Text style={styles.cardSubtitle}>Zamanında onaylanmayan siparişler puan düşürür ve komisyonu artırır.</Text>
          {orders.map((ord) => (
            <View key={ord.id} style={styles.orderBox}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderIdText}>{ord.id} - {ord.customer}</Text>
                <Text style={[styles.orderStatus, ord.status.includes('İptal') ? styles.textRed : styles.textGreen]}>{ord.status}</Text>
              </View>
              <Text style={styles.orderItemText}>{ord.items}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.timeLeftText}>⏱️ {ord.timeLeft}</Text>
                <Text style={styles.orderTotal}>{ord.total}</Text>
              </View>
              {ord.status === 'Onay Bekliyor' && (
                <View style={styles.orderActions}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveOrder(ord.id)}>
                    <Text style={styles.approveBtnText}>Siparişi Onayla (+Puan)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.timeoutBtn} onPress={() => handleSimulateTimeout(ord.id)}>
                    <Text style={styles.timeoutBtnText}>[Simüle Et] Süre Aşımı</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 2. YENİ: Hasat Öncesi Ön Satış Başvuru Alanı */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌾 Hasat Öncesi Ön Satış Başvurusu</Text>
          <Text style={styles.cardSubtitle}>Tarladaki mahsulünüzü henüz toplamadan ön satışa çıkarın, malınız tarlada kalmasın. (Admin Onaylı)</Text>

          <TextInput style={styles.input} placeholder="Ürün Cinsi (Örn: Domat Zeytini Mahsulü)" placeholderTextColor="#9CA3AF" value={cropName} onChangeText={setCropName} />
          
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Tahmini Miktar (Örn: 1.5 Ton)" placeholderTextColor="#9CA3AF" value={estimatedAmount} onChangeText={setEstimatedAmount} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ön Satış Fiyatı (₺/Kg)" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={pricePerKg} onChangeText={setPricePerKg} />
          </View>

          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Tahmini Hasat (Örn: Kasım 2026)" placeholderTextColor="#9CA3AF" value={harvestDate} onChangeText={setHarvestDate} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ada / Parsel Bilgisi" placeholderTextColor="#9CA3AF" value={landInfo} onChangeText={setLandInfo} />
          </View>

          <TouchableOpacity style={styles.publishPreSaleButton} onPress={handleCreatePreSale}>
            <Text style={styles.publishButtonText}>Yönetici Onayına Gönder</Text>
          </TouchableOpacity>

          {/* Başvuru Listesi */}
          <View style={{ marginTop: 10, gap: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4B5563' }}>Ön Satış Başvuru Geçmişiniz:</Text>
            {preSales.map((ps) => (
              <View key={ps.id} style={styles.preSaleItemBox}>
                <View style={styles.postHeader}>
                  <Text style={styles.postTitle}>{ps.cropName}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#D97706' }}>{ps.status}</Text>
                </View>
                <Text style={styles.postStock}>Miktar: {ps.estimatedAmount} | Fiyat: {ps.pricePerKg}</Text>
                <Text style={styles.postStock}>Konum/Tapu: {ps.landInfo}</Text>
                <Text style={styles.postStock}>Hasat Dönemi: {ps.harvestDate}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. Normal Ürün ve Süreç Ekleme Formu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌱 Normal Ürün ve Üretim Süreci Ekle</Text>
          <TextInput style={styles.input} placeholder="Ürün Adı (Örn: Akhisar Uslu Sele Zeytin)" placeholderTextColor="#9CA3AF" value={title} onChangeText={setTitle} />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Fiyat (₺)" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={price} onChangeText={setPrice} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Stok (Örn: 50 Adet)" placeholderTextColor="#9CA3AF" value={stock} onChangeText={setStock} />
          </View>
          <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} placeholder="Üretim Süreci Hikayesi..." placeholderTextColor="#9CA3AF" multiline value={processStory} onChangeText={setProcessStory} />
          <TouchableOpacity style={styles.publishButton} onPress={handleAddProductWithStory}>
            <Text style={styles.publishButtonText}>Hikayesiyle Birlikte Yayınla</Text>
          </TouchableOpacity>
        </View>

        {/* Vitrinimdeki Ürünler */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vitrinimdeki Ürünler</Text>
          {products.map((item) => (
            <View key={item.id} style={styles.productPostCard}>
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postPrice}>{item.price}</Text>
              </View>
              <Text style={styles.postStock}>Stok: {item.stock}</Text>
              <View style={styles.storyBox}>
                <Text style={styles.storyTitle}>🌿 Üretim Süreci Hikayesi:</Text>
                <Text style={styles.storyText}>{item.processStory}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0' },
  headerBar: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFECE6', gap: 12 },
  backButton: { backgroundColor: '#2D4A22', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  backButtonText: { color: '#E9C46A', fontSize: 11, fontWeight: 'bold' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#2D4A22' },
  scrollContent: { padding: 16, gap: 16 },
  profileHeaderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  avatarContainer: { width: 60, height: 60, backgroundColor: '#F0FDF4', borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DCFCE7' },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  profileLocation: { fontSize: 11, color: '#6B7280' },
  cksBadge: { fontSize: 9, fontWeight: 'bold', color: '#166534', backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', overflow: 'hidden' },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, alignItems: 'center' },
  scoreText: { fontSize: 10, fontWeight: 'bold', color: '#D97706' },
  salesText: { fontSize: 10, color: '#4B5563' },
  commissionText: { fontSize: 10, fontWeight: 'bold', color: '#DC2626' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2D4A22' },
  cardSubtitle: { fontSize: 10, color: '#6B7280', marginBottom: 4, lineHeight: 14 },
  orderBox: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', gap: 6 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdText: { fontSize: 11, fontWeight: 'bold', color: '#1F2937' },
  orderStatus: { fontSize: 10, fontWeight: 'bold' },
  textGreen: { color: '#166534' },
  textRed: { color: '#DC2626' },
  orderItemText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  timeLeftText: { fontSize: 10, color: '#D97706', fontWeight: 'bold' },
  orderTotal: { fontSize: 13, fontWeight: 'bold', color: '#E76F51' },
  orderActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  approveBtn: { flex: 1, backgroundColor: '#166534', padding: 8, borderRadius: 8, alignItems: 'center' },
  approveBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  timeoutBtn: { flex: 1, backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FCA5A5' },
  timeoutBtnText: { color: '#991B1B', fontSize: 9, fontWeight: 'bold' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: '#1F2937' },
  row: { flexDirection: 'row', gap: 10 },
  publishButton: { backgroundColor: '#2D4A22', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  publishPreSaleButton: { backgroundColor: '#D97706', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  publishButtonText: { color: '#E9C46A', fontSize: 12, fontWeight: 'bold' },
  productPostCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', gap: 6, marginTop: 6 },
  preSaleItemBox: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#FDE68A', gap: 4 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postTitle: { fontSize: 11, fontWeight: 'bold', color: '#92400E', flex: 1 },
  postStock: { fontSize: 10, color: '#78350F' },
  storyBox: { backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A', gap: 2, marginTop: 4 },
  storyTitle: { fontSize: 10, fontWeight: 'bold', color: '#92400E' },
  storyText: { fontSize: 11, color: '#78350F', lineHeight: 16 },
});