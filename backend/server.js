const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Yeni kullanıcı adı ve şifre ile güncellenmiş bağlantı dizesi:
const MONGO_URI = 'mongodb://pazaristan_user:Pazaristan123@ac-usa0zxp-shard-00-00.ofgusq7.mongodb.net:27017,ac-usa0zxp-shard-00-01.ofgusq7.mongodb.net:27017,ac-usa0zxp-shard-00-02.ofgusq7.mongodb.net:27017/pazaristan?ssl=true&replicaSet=atlas-12arfo-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas bulut veritabanına başarıyla bağlanıldı! 🚀');
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor.`);
    });
  })
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err.message);
  });