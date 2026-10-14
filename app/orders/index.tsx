import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function OrdersScreen() {
  const router = useRouter();

  // Örnek Aktif Siparişler
  const orders = [
    {
      id: 'SIP-2026-001',
      date: '6 Ekim 2026',
      total: '340 ₺',
      status: 'Kargoya Verildi',
      statusColor: '#166534',
      bgStatus: '#F0FDF4',
      items: '1x Akhisar Domat Erken Hasat Sızma Zeytinyağı',
      producer: 'Ahmet Çiftçi',
    },
    {
      id: 'SIP-2026-002',
      date: '2 Ekim 2026',
      total: '195 ₺',
      status: 'Teslim Edildi',
      statusColor: '#1E40AF',
      bgStatus: '#EFF6FF',
      items: '1x Geleneksel Akhisar Uslu Siyah Sele Zeytin',
      producer: 'Ayşe Yılmaz',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sipariş Takibi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>📦 Doğrudan üreticiden kapınıza gelen doğal gıda seyahati.</Text>
        </View>

        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeaderRow}>
              <Text style={styles.orderIdText}>{order.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: order.bgStatus }]}>
                <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
              </View>
            </View>

            <Text style={styles.itemDescription}>{order.items}</Text>
            <Text style={styles.producerText}>Üretici: {order.producer}</Text>

            <View style={styles.footerRow}>
              <Text style={styles.dateText}>📅 {order.date}</Text>
              <Text style={styles.priceText}>{order.total}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.actionButtonText}>Alışverişe Devam Et</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0' },
  headerBar: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFECE6', gap: 12 },
  backButton: { backgroundColor: '#2D4A22', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  backButtonText: { color: '#E9C46A', fontSize: 12, fontWeight: 'bold' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D4A22' },
  scrollContent: { padding: 16, gap: 16 },
  infoBanner: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A' },
  infoBannerText: { fontSize: 11, fontWeight: 'bold', color: '#92400E', textAlign: 'center' },
  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdText: { fontSize: 13, fontWeight: 'bold', color: '#1F2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  itemDescription: { fontSize: 12, fontWeight: '600', color: '#374151' },
  producerText: { fontSize: 11, color: '#6B7280' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, marginTop: 4 },
  dateText: { fontSize: 11, color: '#9CA3AF' },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#E76F51' },
  actionButton: { backgroundColor: '#2D4A22', padding: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#E9C46A', fontSize: 14, fontWeight: 'bold' },
});