import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MobileProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [added, setAdded] = useState(false);

  // Örnek Ürün Detay Verisi
  const product = {
    title: 'Akhisar Domat Erken Hasat Sızma Zeytinyağı',
    producer: 'Ahmet Çiftçi (Akhisar Köyü Aile İşletmesi)',
    location: 'Akhisar / Manisa',
    packageSize: '750 ml Koyu Renkli Cam Şişe',
    harvestSeason: '2026 Ekim Erken Hasat',
    acidity: '0.2 Asit (Polifenol: 480 mg/kg)',
    price: '340 ₺',
    emoji: '🫒',
    certificates: [
      { title: 'T.C. Tarım ve Orman Bakanlığı Organik Tarım Sertifikası', code: 'TR-OT-35-1982', date: '2026 Sezonu' },
      { title: 'Uluslararası Akredite Lab. Serbest Yağ Asitliği Raporu', code: 'LAB-2026-9941', date: 'Ekim 2026' },
      { title: 'Akhisar Yöresel Coğrafi İşaret Uygunluk Belgesi', code: 'Cİ-45-ZEY-01', date: 'Geçerli' }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Navigasyon (Geri Dön & Sepet) */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cartHeaderButton}
          onPress={() => Alert.alert("Sepet", "Sepet sayfasına yönlendiriliyorsunuz.")}
        >
          <Text style={styles.cartHeaderText}>🛒 Sepetim</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ürün Görsel / Emoji Kutusu */}
        <View style={styles.imageBox}>
          <Text style={{ fontSize: 70 }}>{product.emoji}</Text>
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>{product.location}</Text>
          </View>
        </View>

        {/* Ürün Temel Bilgileri */}
        <View style={styles.card}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.producerText}>Üretici: <Text style={{ fontWeight: 'bold', color: '#1F2937' }}>{product.producer}</Text></Text>

          <View style={styles.specsBox}>
            <Text style={styles.specItem}>• Ambalaj: {product.packageSize}</Text>
            <Text style={styles.specItem}>• Hasat: {product.harvestSeason}</Text>
            <Text style={styles.specItem}>• Analiz: {product.acidity}</Text>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Birim Fiyat</Text>
              <Text style={styles.priceValue}>{product.price}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onpress={() => {
                setAdded(true);
                Alert.alert("Başarılı", "Ürün sepete eklendi!");
              }}
            >
              <Text style={styles.addButtonText}>{added ? "✓ Sepette" : "🛒 Sepete Ekle"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sertifikalar ve Laboratuvar Raporları */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📜 Sertifikalar & Analiz Raporları</Text>
          <Text style={styles.sectionSub}>Ürünün güvenilirliğini kanıtlayan resmi belgeler.</Text>

          {product.certificates.map((cert, index) => (
            <View key={index} style={styles.certItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.certTitle}>{cert.title}</Text>
                <Text style={styles.certCode}>Belge No: {cert.code} ({cert.date})</Text>
              </View>
              <TouchableOpacity 
                style={styles.certButton}
                onPress={() => Alert.alert("Belge Görüntüleyici", `"${cert.title}" resmi belgesi açılıyor.`)}
              >
                <Text style={styles.certButtonText}>🔍 İncele</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFECE6' },
  backButton: { backgroundColor: '#2D4A22', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  backButtonText: { color: '#E9C46A', fontSize: 12, fontWeight: 'bold' },
  cartHeaderButton: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A' },
  cartHeaderText: { color: '#92400E', fontSize: 12, fontWeight: 'bold' },
  scrollContent: { padding: 16, gap: 16 },
  imageBox: { height: 180, backgroundColor: '#E8F5E9', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C8E6C9', position: 'relative' },
  locationBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#C8E6C9' },
  locationText: { fontSize: 10, fontWeight: 'bold', color: '#2D4A22' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D4A22' },
  producerText: { fontSize: 12, color: '#6B7280' },
  specsBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6', gap: 4 },
  specItem: { fontSize: 12, color: '#374151' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  priceLabel: { fontSize: 10, color: '#9CA3AF' },
  priceValue: { fontSize: 20, fontWeight: 'bold', color: '#E76F51' },
  addButton: { backgroundColor: '#2D4A22', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  addButtonText: { color: '#E9C46A', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#2D4A22' },
  sectionSub: { fontSize: 11, color: '#6B7280', marginTop: -8 },
  certItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#DCFCE7', gap: 8 },
  certTitle: { fontSize: 12, fontWeight: 'bold', color: '#166534' },
  certCode: { fontSize: 10, color: '#4B5563', marginTop: 2 },
  certButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#86EFAC' },
  certButtonText: { fontSize: 11, fontWeight: 'bold', color: '#166534' },
});