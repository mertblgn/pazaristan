const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pazaristan_super_secret_key';

// Şifre sıfırlama kodlarını geçici olarak tutmak için bellek alanı
const resetCodes = new Map();

exports.register = async (req, res) => {
  try {
    const { fullName, emailOrPhone, password, role, cksNumber, mernisNumber } = req.body;

    if (!fullName || !emailOrPhone || !password || !role) {
      return res.status(400).json({ message: 'Lütfen tüm zorunlu alanları doldurun.' });
    }

    if (role === 'farmer' && !cksNumber) {
      return res.status(400).json({ message: 'Üretici/Çiftçi kayıtları için ÇKS numarası zorunludur.' });
    }
    if (role === 'coop' && !mernisNumber) {
      return res.status(400).json({ message: 'Kooperatif kayıtları için MERNİS / Kurum Sicil numarası zorunludur.' });
    }

    const existingUser = await User.findOne({ emailOrPhone });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta veya telefon numarası zaten kullanımda.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      emailOrPhone,
      password: hashedPassword,
      role,
      cksNumber: role === 'farmer' ? cksNumber : undefined,
      mernisNumber: role === 'coop' ? mernisNumber : undefined,
    });

    await newUser.save();

    res.status(201).json({ 
      success: true, 
      message: 'Kayıt başarıyla oluşturuldu.' 
    });

  } catch (error) {
    console.error('Kayıt Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: 'Lütfen e-posta/telefon ve şifrenizi girin.' });
    }

    const user = await User.findOne({ emailOrPhone });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz e-posta/telefon veya şifre.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz e-posta/telefon veya şifre.' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      role: user.role,
      fullName: user.fullName,
      message: 'Giriş başarılı.'
    });

  } catch (error) {
    console.error('Giriş Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
};

// 1. Adım: Şifre Sıfırlama Kodu Gönder
exports.forgotPassword = async (req, res) => {
  try {
    const { emailOrPhone } = req.body;

    if (!emailOrPhone) {
      return res.status(400).json({ message: 'Lütfen e-posta veya telefon adresinizi girin.' });
    }

    const user = await User.findOne({ emailOrPhone });
    if (!user) {
      return res.status(400).json({ message: 'Bu bilgilere ait kayıtlı bir kullanıcı bulunamadı.' });
    }

    // 6 haneli rastgele kod üretimi
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Kodu eşleştirip belleğe kaydediyoruz
    resetCodes.set(emailOrPhone, code);

    // Geliştirme aşamasında terminalde kodu görmek için:
    console.log(`[ŞİFRE SIFIRLAMA KODU] ${emailOrPhone} için kod: ${code}`);

    res.status(200).json({
      success: true,
      message: 'Doğrulama kodu e-posta veya telefonunuza gönderildi.'
    });

  } catch (error) {
    console.error('Şifre Sıfırlama Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
};

// 2. Adım: Kodu Doğrula ve Yeni Şifreyi Kaydet
exports.resetPassword = async (req, res) => {
  try {
    const { emailOrPhone, code, newPassword } = req.body;

    if (!emailOrPhone || !code || !newPassword) {
      return res.status(400).json({ message: 'Lütfen tüm alanları eksiksiz doldurun.' });
    }

    const savedCode = resetCodes.get(emailOrPhone);
    if (!savedCode || savedCode !== code) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş doğrulama kodu.' });
    }

    const user = await User.findOne({ emailOrPhone });
    if (!user) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Yeni şifreyi hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Kullanılan tek kullanımlık kodu hafızadan temizle
    resetCodes.delete(emailOrPhone);

    res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi.'
    });

  } catch (error) {
    console.error('Şifre Güncelleme Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
};