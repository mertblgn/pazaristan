const API_URL = 'http://localhost:5000/api';

export const loginApi = async (credentials: any) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Sunucu geçersiz yanıt döndü: ${text.substring(0, 50)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Giriş yapılamadı.');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Sunucuya bağlanılamadı.');
  }
};

export const registerApi = async (userData: any) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Sunucu geçersiz yanıt döndü: ${text.substring(0, 50)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Kayıt yapılamadı.');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Sunucuya bağlanılamadı.');
  }
};

export const forgotPasswordApi = async (emailOrPhone: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ emailOrPhone }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Sunucu geçersiz yanıt döndü: ${text.substring(0, 50)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Kod gönderilemedi.');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Sunucuya bağlanılamadı.');
  }
};

export const resetPasswordApi = async (payload: { emailOrPhone: string; code: string; newPassword: string }) => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Sunucu geçersiz yanıt döndü: ${text.substring(0, 50)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Şifre sıfırlanamadı.');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Sunucuya bağlanılamadı.');
  }
};