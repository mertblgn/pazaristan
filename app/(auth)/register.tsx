import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { registerApi } from '../../services/authService';
import Toast from '../../components/Toast';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'consumer' | 'farmer' | 'coop'>('consumer');
  
  // Rol Özel Alanlar (ÇKS ve MERNİS)
  const [cksNumber, setCksNumber] = useState('');
  const [mernisNumber, setMernisNumber] = useState('');

  // Sözleşme Onay State'leri
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  // Toast State'leri
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('error');

  const triggerToast = (msg: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handleRegister = async () => {
    if (!fullName || !emailOrPhone || !password) {
      triggerToast('Lütfen zorunlu alanları doldurun.', 'error');
      return;
    }

    if (selectedRole === 'farmer' && !cksNumber) {
      triggerToast('Üretici/Çiftçi kayıtları için ÇKS numarası zorunludur.', 'error');
      return;
    }

    if (selectedRole === 'coop' && !mernisNumber) {
      triggerToast('Kooperatif kayıtları için MERNİS / Kurum Sicil numarası zorunludur.', 'error');
      return;
    }

    if (!agreedTerms || !agreedPrivacy) {
      triggerToast('Kullanıcı Sözleşmesi ve Gizlilik Politikasını onaylamalısınız.', 'error');
      return;
    }

    try {
      // Backend API İsteği
      await registerApi({
        fullName,
        emailOrPhone,
        password,
        role: selectedRole,
        cksNumber: selectedRole === 'farmer' ? cksNumber : undefined,
        mernisNumber: selectedRole === 'coop' ? mernisNumber : undefined,
      });

      triggerToast('Kayıt Başarılı! Yönlendiriliyorsunuz...', 'success');

      setTimeout(() => {
        router.replace('/(auth)/login' as any);
      }, 1500);

    } catch (error: any) {
      triggerToast(error.message || 'Sunucu bağlantı hatası oluştu.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast 
        message={toastMessage} 
        type={toastType} 
        visible={toastVisible} 
        onHide={() => setToastVisible(false)} 
      />

      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            
            {/* Üst Kısım: Logo ve Başlık */}
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoIcon}>🌾</Text>
              </View>
              <Text style={styles.brandTitle}>PAZARİSTAN</Text>
              <Text style={styles.brandSubtitle}>Aracısız Ekosisteme Katılın</Text>
            </View>

            {/* Rol Seçimi */}
            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={[styles.roleBtn, selectedRole === 'consumer' && styles.roleActive]}
                onPress={() => setSelectedRole('consumer')}
              >
                <Text style={[styles.roleText, selectedRole === 'consumer' && styles.roleTextActive]}>Alıcı</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleBtn, selectedRole === 'farmer' && styles.roleActive]}
                onPress={() => setSelectedRole('farmer')}
              >
                <Text style={[styles.roleText, selectedRole === 'farmer' && styles.roleTextActive]}>Çiftçi</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleBtn, selectedRole === 'coop' && styles.roleActive]}
                onPress={() => setSelectedRole('coop')}
              >
                <Text style={[styles.roleText, selectedRole === 'coop' && styles.roleTextActive]}>Kooperatif</Text>
              </TouchableOpacity>
            </View>

            {/* Form Alanları */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad Soyad / Kurum Adı</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Adınızı veya işletme adını yazın" 
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Role Özel Dinamik Alanlar */}
            {selectedRole === 'farmer' && (
              <View style={[styles.inputGroup, styles.specialInputGroup]}>
                <Text style={styles.specialInputLabel}>🌱 ÇKS Numarası (Çiftçi Kayıt Sistemi)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Örn: 10 haneli ÇKS numaranız" 
                  placeholderTextColor="#9CA3AF"
                  value={cksNumber}
                  onChangeText={setCksNumber}
                  keyboardType="numeric"
                />
              </View>
            )}

            {selectedRole === 'coop' && (
              <View style={[styles.inputGroup, styles.specialInputGroup]}>
                <Text style={styles.specialInputLabel}>🏛️ MERNİS / Kurum Sicil Numarası</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Örn: Kurum sicil / MERNİS no" 
                  placeholderTextColor="#9CA3AF"
                  value={mernisNumber}
                  onChangeText={setMernisNumber}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta Adresi veya Telefon</Text>
              <TextInput 
                style={styles.input} 
                placeholder="ornek@mail.com veya 0532..." 
                placeholderTextColor="#9CA3AF"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre Belirleyin</Text>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Sözleşme Onay Kutucukları */}
            <View style={styles.termsContainer}>
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreedTerms(!agreedTerms)}>
                <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
                  {agreedTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>Kullanıcı sözleşmesini ve şartları onaylıyorum.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreedPrivacy(!agreedPrivacy)}>
                <View style={[styles.checkbox, agreedPrivacy && styles.checkboxChecked]}>
                  {agreedPrivacy && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>Gizlilik politikasını ve KVKK metnini kabul ediyorum.</Text>
              </TouchableOpacity>
            </View>

            {/* Kayıt Ol Butonu */}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </TouchableOpacity>

            {/* Giriş Yap Geçişi */}
            <TouchableOpacity style={styles.footerLinkRow} onPress={() => router.replace('/(auth)/login' as any)}>
              <Text style={styles.footerText}>Zaten hesabınız var mı? <Text style={styles.footerLink}>Giriş Yap</Text></Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F1EA' },
  mainContainer: { flex: 1, width: '100%', height: '100%', backgroundColor: '#F4F1EA', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16, width: '100%' },
  card: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 500, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, gap: 12 },
  header: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 10, gap: 2 },
  logoCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2D4A22', justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  logoIcon: { fontSize: 18 },
  brandTitle: { fontSize: 15, fontWeight: 'bold', color: '#2D4A22', letterSpacing: 0.8 },
  brandSubtitle: { fontSize: 10, color: '#6B7280' },
  roleContainer: { flexDirection: 'row', gap: 6 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  roleActive: { backgroundColor: '#2D4A22', borderColor: '#2D4A22' },
  roleText: { fontSize: 11, fontWeight: 'bold', color: '#4B5563' },
  roleTextActive: { color: '#E9C46A' },
  inputGroup: { gap: 3 },
  specialInputGroup: { backgroundColor: '#F4F6F3', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#C2D0BE' },
  inputLabel: { fontSize: 11, fontWeight: '600', color: '#374151' },
  specialInputLabel: { fontSize: 11, fontWeight: '700', color: '#2D4A22' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 10, height: 36, fontSize: 11, color: '#1F2937' },
  termsContainer: { gap: 6, backgroundColor: '#F9FAFB', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 14, height: 14, borderRadius: 3, borderWidth: 1, borderColor: '#9CA3AF', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  checkboxChecked: { backgroundColor: '#2D4A22', borderColor: '#2D4A22' },
  checkmark: { color: '#E9C46A', fontSize: 9, fontWeight: 'bold' },
  termsText: { fontSize: 10, color: '#4B5563', flex: 1 },
  button: { backgroundColor: '#2D4A22', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginTop: 2 },
  buttonText: { color: '#E9C46A', fontSize: 12, fontWeight: 'bold' },
  footerLinkRow: { alignItems: 'center', marginTop: 2 },
  footerText: { fontSize: 11, color: '#6B7280' },
  footerLink: { color: '#2D4A22', fontWeight: 'bold' }
});