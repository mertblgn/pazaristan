import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ProducerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Örnek Üretici Verileri (Normalde ID'ye göre dinamik çekilir)
  const producerData = {
    name: 'Ahmet Çiftçi',
    location: 'Akhisar / Manisa',
    experience: '24 Yıllık Zeytin & Zeytinyağı Üreticisi',
    bio: 'Akhisar topraklarında ata tarım gelenekleriyle yetişen Domat ve Uslu zeytinlerini, hiçbir kimyasal katkı maddesi kullanmadan soğuk sıkım yöntemiyle sofralarınıza ulaştırıyoruz.',
    certificates: ['Erken Hasat Sertifikası', 'İyi Tarım Uygulamaları Belgesi', 'Laboratuvar Analiz Raporlu'],
    emoji: '👨‍🌾',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Üretici Hikayesi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Üretici Kartı */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={{ fontSize: 50 }}>{producerData.emoji}</Text>
          </View>
          <Text style={styles.nameText}>{producerData.name}</Text>
          <Text style={styles.locationText}>📍 {producerData.location}</Text>
          <Text style={styles.expBadge}>{producerData.experience}</Text>
        </View>

        {/* Biyografi / Felsefe */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Üretim Felsefemiz</Text>
          <Text style={styles.bioText}>{producerData.bio}</Text>
        </View>

        {/* Sertifikalar ve Güvence */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Kalite & Güvence Belgeleri</Text>
          {producerData.certificates.map((cert, index) => (
            <View key={index} style={styles.certRow}>
              <Text style={styles.certCheck}>✓</Text>
              <Text style={styles.certText}>{cert}</Text>
            </View>
          ))}
        </View>

        {/* Mağazaya Dön Butonu */}
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.actionButtonText}>Üreticinin Ürünlerini İncele</Text>
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
  profileCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  avatarBox: { width: 90, height: 90, backgroundColor: '#F0FDF4', borderRadius: 45, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DCFCE7', marginBottom: 4 },
  nameText: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  locationText: { fontSize: 12, color: '#6B7280' },
  expBadge: { fontSize: 10, fontWeight: 'bold', color: '#166534', backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4, overflow: 'hidden' },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#2D4A22' },
  bioText: { fontSize: 12, color: '#4B5563', lineHeight: 18 },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  certCheck: { color: '#166534', fontWeight: 'bold', fontSize: 14 },
  certText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  actionButton: { backgroundColor: '#2D4A22', padding: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#E9C46A', fontSize: 14, fontWeight: 'bold' },
});