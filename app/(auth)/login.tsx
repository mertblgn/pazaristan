import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi } from '../../services/authService';
import Toast from '../../components/Toast';

export default function LoginScreen() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Toast State'leri
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('error');

  const triggerToast = (msg: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      triggerToast('Lütfen e-posta/telefon ve şifrenizi girin.', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await loginApi({ emailOrPhone, password });

      // Token ve kullanıcı bilgilerini AsyncStorage'a kaydediyoruz
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userRole', response.role);
      await AsyncStorage.setItem('fullName', response.fullName);

      triggerToast(`Giriş Başarılı! Hoş geldiniz, ${response.fullName}`, 'success');

      // Kullanıcı rolüne göre yönlendirme yapıyoruz
      setTimeout(() => {
        if (response.role === 'farmer') {
          router.replace('/farmer/dashboard' as any);
        } else if (response.role === 'coop' || response.role === 'cooperative') {
          router.replace('/cooperative/dashboard' as any); // Kooperatif paneline yönlendiriliyor
        } else {
          router.replace('/(tabs)' as any);
        }
      }, 1500);

    } catch (error: any) {
      triggerToast(error.message || 'Sunucu bağlantı hatası oluştu.', 'error');
    } finally {
      setLoading(false);
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
              <Text style={styles.brandSubtitle}>Aracısız Ekosisteme Giriş Yapın</Text>
            </View>

            {/* Form Alanları */}
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
              <Text style={styles.inputLabel}>Şifre</Text>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Şifremi Unuttum Bağlantısı */}
            <TouchableOpacity 
              style={{ alignSelf: 'flex-end', marginTop: -4, marginBottom: 4 }} 
              onPress={() => router.push('/(auth)/forgot-password' as any)}
            >
              <Text style={{ fontSize: 11, color: '#2D4A22', fontWeight: '600' }}>Şifremi Unuttum?</Text>
            </TouchableOpacity>

            {/* Giriş Yap Butonu */}
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Text>
            </TouchableOpacity>

            {/* Kayıt Ol Geçişi */}
            <TouchableOpacity style={styles.footerLinkRow} onPress={() => router.replace('/(auth)/register' as any)}>
              <Text style={styles.footerText}>Hesabınız yok mu? <Text style={styles.footerLink}>Kayıt Ol</Text></Text>
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
  card: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 500, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, gap: 14 },
  header: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12, gap: 2 },
  logoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2D4A22', justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  logoIcon: { fontSize: 20 },
  brandTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D4A22', letterSpacing: 0.8 },
  brandSubtitle: { fontSize: 11, color: '#6B7280' },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: '#374151' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 10, height: 38, fontSize: 11, color: '#1F2937' },
  button: { backgroundColor: '#2D4A22', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#E9C46A', fontSize: 12, fontWeight: 'bold' },
  footerLinkRow: { alignItems: 'center', marginTop: 4 },
  footerText: { fontSize: 11, color: '#6B7280' },
  footerLink: { color: '#2D4A22', fontWeight: 'bold' }
});