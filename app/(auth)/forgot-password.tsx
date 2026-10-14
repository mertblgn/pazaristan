import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from '../../components/Toast';
import { forgotPasswordApi, resetPasswordApi } from '../../services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // 1: Kod iste, 2: Kod ve yeni şifre gir
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Yeni şifre tekrarı state'i
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

  // 1. Adım: Kod Gönderme İsteği
  const handleSendCode = async () => {
    if (!emailOrPhone) {
      triggerToast('Lütfen e-posta adresinizi veya telefonunuzu girin.', 'error');
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordApi(emailOrPhone);
      triggerToast('6 haneli doğrulama kodu gönderildi!', 'success');
      setStep(2); // 2. aşamaya (kod ve yeni şifre giriş ekranına) geç
    } catch (error: any) {
      triggerToast(error.message || 'Kod gönderilemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Adım: Kodu ve Yeni Şifreyi Onaylama
  const handleVerifyAndReset = async () => {
    if (!code || !newPassword || !confirmPassword) {
      triggerToast('Lütfen tüm alanları eksiksiz doldurun.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      triggerToast('Girdiğiniz şifreler birbiriyle eşleşmiyor!', 'error');
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi({ emailOrPhone, code, newPassword });
      triggerToast('Şifreniz başarıyla değiştirildi! Giriş yapılıyor...', 'success');
      
      setTimeout(() => {
        router.replace('/(auth)/login' as any);
      }, 2000);

    } catch (error: any) {
      triggerToast(error.message || 'Şifre sıfırlama başarısız.', 'error');
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
            
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoIcon}>🔑</Text>
              </View>
              <Text style={styles.brandTitle}>ŞİFREMİ UNUTTUM</Text>
              <Text style={styles.brandSubtitle}>
                {step === 1 
                  ? 'Kayıtlı e-posta veya telefonunuzu girin' 
                  : `${emailOrPhone} adresine gönderilen kodu girin`}
              </Text>
            </View>

            {step === 1 ? (
              <>
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

                <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Kod Gönderiliyor...' : 'Doğrulama Kodu Gönder'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>6 Haneli Doğrulama Kodu</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Örn: 482910" 
                    placeholderTextColor="#9CA3AF"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Yeni Şifre</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="••••••••" 
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Yeni Şifre (Tekrar)</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="••••••••" 
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleVerifyAndReset} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ alignSelf: 'center', marginTop: 6 }} 
                  onPress={() => setStep(1)}
                >
                  <Text style={{ fontSize: 11, color: '#6B7280' }}>
                    Kodu almadınız mı? <Text style={{ color: '#2D4A22', fontWeight: 'bold' }}>Tekrar Dene</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.footerLinkRow} onPress={() => router.replace('/(auth)/login' as any)}>
              <Text style={styles.footerText}>Giriş ekranına dön? <Text style={styles.footerLink}>Giriş Yap</Text></Text>
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
  brandSubtitle: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: '#374151' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 10, height: 38, fontSize: 11, color: '#1F2937' },
  button: { backgroundColor: '#2D4A22', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#E9C46A', fontSize: 12, fontWeight: 'bold' },
  footerLinkRow: { alignItems: 'center', marginTop: 4 },
  footerText: { fontSize: 11, color: '#6B7280' },
  footerLink: { color: '#2D4A22', fontWeight: 'bold' }
});