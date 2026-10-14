import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

export default function MobileShopScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    {
      id: 'zeytinyagi-750',
      title: 'Akhisar Domat Erken Hasat Sızma Zeytinyağı',
      producer: 'Ahmet Çiftçi (Akhisar)',
      price: '340 ₺',
      category: 'Zeytinyağı',
      emoji: '🫒',
    },
    {
      id: 'zeytin-siyah-500',
      title: 'Geleneksel Akhisar Uslu Siyah Sele Zeytin',
      producer: 'Ayşe Yılmaz (Kooperatif)',
      price: '195 ₺',
      category: 'Zeytin',
      emoji: '🫙',
    },
    {
      id: 'bal-cicek-1kg',
      title: 'Doğal Sındırgı Çiçek Balı',
      producer: 'Mehmet Arıcı (Sındırgı)',
      price: '280 ₺',
      category: 'Bal',
      emoji: '🍯',
    },
  ];

  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.producer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bilgi Barı */}
      <View style={styles.header}>
        <View>
          <Text style={styles.badge}>Köyden Sofraya Mobil</Text>
          <Text style={styles.title}>Doğal Lezzetler</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/auth/register' as any)}
          >
            <Text style={styles.authButtonText}>👤 Kayıt Ol</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.orderButton}
            onPress={() => router.push('/orders' as any)}
          >
            <Text style={styles.orderButtonText}>📦 Sipariş</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/cart' as any)}
          >
            <Text style={styles.cartText}>🛒 Sepet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün veya üretici ara (Örn: Zeytinyağı)..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Kategori Filtreleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {['Tümü', 'Zeytinyağı', 'Zeytin', 'Bal', 'Bakliyat'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.activeChip]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.activeCategoryText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ürün Listesi */}
      <ScrollView contentContainerStyle={styles.productList}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptySearch}>
            <Text style={{ fontSize: 30 }}>🔍</Text>
            <Text style={styles.emptySearchText}>Aradığınız kriterlere uygun ürün bulunamadı.</Text>
          </View>
        ) : (
          filteredProducts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              onPress={() => router.push(`/product/${item.id}` as any)}
            >
              <View style={styles.imagePlaceholder}>
                <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productCategory}>{item.category}</Text>
                <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
                <TouchableOpacity onPress={() => router.push('/producer/ahmet-ciftci' as any)}>
                  <Text style={styles.producerText}>Üretici: {item.producer} (İncele)</Text>
                </TouchableOpacity>
                <View style={styles.cardBottomRow}>
                  <Text style={styles.priceText}>{item.price}</Text>
                  <Text style={styles.detailLink}>Detay →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFECE6' },
  headerButtons: { flexDirection: 'row', gap: 6 },
  badge: { fontSize: 9, fontWeight: 'bold', color: '#2D4A22', backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 2 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2D4A22' },
  authButton: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#C8E6C9', justifyContent: 'center' },
  authButtonText: { fontSize: 10, fontWeight: 'bold', color: '#2D4A22' },
  orderButton: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#DCFCE7', justifyContent: 'center' },
  orderButtonText: { fontSize: 10, fontWeight: 'bold', color: '#166534' },
  cartButton: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A', justifyContent: 'center' },
  cartText: { fontSize: 10, fontWeight: 'bold', color: '#92400E' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 12 },
  searchInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 12, color: '#1F2937' },
  categoryScroll: { paddingHorizontal: 16, paddingVertical: 10, maxHeight: 55 },
  categoryChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB', height: 32, justifyContent: 'center' },
  activeChip: { backgroundColor: '#2D4A22', borderColor: '#2D4A22' },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  activeCategoryText: { color: '#E9C46A' },
  productList: { padding: 16, gap: 14 },
  productCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 14, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 2 },
  imagePlaceholder: { width: 85, height: 85, backgroundColor: '#F0FDF4', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DCFCE7' },
  productInfo: { flex: 1, justifyContent: 'space-between' },
  productCategory: { fontSize: 9, fontWeight: 'bold', color: '#166534', textTransform: 'uppercase' },
  productTitle: { fontSize: 13, fontWeight: 'bold', color: '#1F2937', marginVertical: 1 },
  producerText: { fontSize: 10, color: '#2D4A22', fontWeight: '600' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#E76F51' },
  detailLink: { fontSize: 11, fontWeight: 'bold', color: '#2D4A22' },
  emptySearch: { padding: 30, alignItems: 'center', gap: 8 },
  emptySearchText: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
});