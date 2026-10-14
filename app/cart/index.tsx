import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function MobileShopScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

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
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bilgi Barı */}
      <View style={styles.header}>
        <View>
          <Text style={styles.badge}>Köyden Sofraya Mobil</Text>
          <Text style={styles.title}>Doğal Lezzetler</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart' as any)}
        >
          <Text style={styles.cartText}>🛒 Sepet</Text>
        </TouchableOpacity>
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
        {products.map((item) => (
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
              <Text style={styles.producerText}>Üretici: {item.producer}</Text>
              <View style={styles.cardBottomRow}>
                <Text style={styles.priceText}>{item.price}</Text>
                <Text style={styles.detailLink}>İncele →</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFECE6' },
  badge: { fontSize: 10, fontWeight: 'bold', color: '#2D4A22', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2D4A22' },
  cartButton: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A' },
  cartText: { fontSize: 12, fontWeight: 'bold', color: '#92400E' },
  categoryScroll: { paddingHorizontal: 20, paddingVertical: 12, maxHeight: 60 },
  categoryChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB', height: 36 },
  activeChip: { backgroundColor: '#2D4A22', borderColor: '#2D4A22' },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  activeCategoryText: { color: '#E9C46A' },
  productList: { padding: 20, gap: 16 },
  productCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', gap: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  imagePlaceholder: { width: 90, height: 90, backgroundColor: '#F0FDF4', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DCFCE7' },
  productInfo: { flex: 1, justifyContent: 'space-between' },
  productCategory: { fontSize: 10, fontWeight: 'bold', color: '#166534', textTransform: 'uppercase' },
  productTitle: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', marginVertical: 2 },
  producerText: { fontSize: 11, color: '#6B7280' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#E76F51' },
  detailLink: { fontSize: 12, fontWeight: 'bold', color: '#2D4A22' },
});