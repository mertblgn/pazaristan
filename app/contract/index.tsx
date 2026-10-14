import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function ContractScreen() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const handleComplete = () => {
    if (!accepted) {
      Alert.alert("Onay Gerekli", "Devam etmek için lütfen dijital sözleşme şartlarını onaylayınız.");
      return;
    }
    Alert.alert("Başarılı", "Sözleşme onaylandı! Alışveriş adımına dönülüyor.");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dijital Sözleşme</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bilgi Kartı */}
        <View style={styles.card}>
          <Text style={styles.badge}>Hukuki Güvence & Şeffaflık</Text>
          <Text style={styles.title}>Doğrudan Üretici ve Tüketici Hakları Sözleşmesi</Text>
          <Text style={styles.dateText}>Son Güncelleme: Ekim 2026</Text>

          <View style={styles.contractBox}>
            <Text style={styles.paragraph}>
              1. <Text style={styles.bold}>Taraflar ve Amaç:</Text> İş bu sözleşme, Köyden Sofraya ekosisteminde yer alan yerel üreticiler ile tüketiciler arasında aracısız, şeffaf ve güvenilir bir doğrudan gıda tedarik köprüsü kurmak amacıyla düzenlenmiştir.
            </Text>
            <Text style={styles.paragraph}>
              2. <Text style={styles.bold}>Ürün Kalitesi ve Analizler:</Text> Platformda listelenen tüm zeytinyağı, zeytin ve yöresel ürünler beyan edilen coğrafi işaret ve laboratuvar analiz raporu koşullarını (erken hasat, asit oranı vb.) birebir karşılamak zorundadır.
            </Text>
            <Text style={styles.paragraph}>
              3. <Text style={styles.bold}>Doğrudan Üretici Beyanı:</Text> Üretici, satışa sunulan gıda ürünlerinin kendi tarımsal işletmesinde veya yöresel kooperatif havuzunda üretildiğini, tağşiş (hileli katkı) yapılmadığını taahhüt eder.
            </Text>
            <Text style={styles.paragraph}>
              4. <Text style={styles.bold}>Cayma ve İade:</Text> Gıda maddelerinin bozulabilir nitelikte olması nedeniyle, ambalajı açılmış veya tüketilmiş ürünlerde iade süreçleri tüketici hakları ve kooperatif kalite kontrol heyeti denetiminde yürütülür.
            </Text>
          </View>
        </View>

        {/* Onay Kutusu */}
        <TouchableOpacity 
          style={styles.checkboxRow} 
          activeOpacity={0.8}
          onPress={() => setAccepted(!accepted)}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Yukarıdaki dijital sözleşme şartlarını, üretici taahhütlerini ve kalite standartlarını okudum, anladım ve onaylıyorum.
          </Text>
        </TouchableOpacity>

        {/* Devam Et Butonu */}
        <TouchableOpacity 
          style={[styles.actionButton, !accepted && styles.actionButtonDisabled]}
          onPress={handleComplete}
        >
          <Text style={styles.actionButtonText}>Sözleşmeyi Onayla ve İlerle</Text>
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
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  badge: { fontSize: 10, fontWeight: 'bold', color: '#166534', backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', overflow: 'hidden' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2D4A22' },
  dateText: { fontSize: 10, color: '#9CA3AF', marginBottom: 4 },
  contractBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6', gap: 8 },
  paragraph: { fontSize: 11, color: '#374151', lineHeight: 16 },
  bold: { fontWeight: 'bold', color: '#1F2937' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#2D4A22', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  checkboxChecked: { backgroundColor: '#2D4A22' },
  checkmark: { color: '#E9C46A', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 11, color: '#4B5563', lineHeight: 15 },
  actionButton: { backgroundColor: '#2D4A22', padding: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonDisabled: { backgroundColor: '#9CA3AF' },
  actionButtonText: { color: '#E9C46A', fontSize: 14, fontWeight: 'bold' },
});