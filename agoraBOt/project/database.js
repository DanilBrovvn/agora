// Имитация базы данных (в реальном проекте используйте MongoDB/PostgreSQL)

class Database {
  constructor() {
    this.users = new Map();
    this.ads = new Map();
    this.reviews = new Map();
    this.favorites = new Map();
    this.orders = new Map();
    this.nextAdId = 1;
  }

  // Пользователи
  getUser(userId) {
    return this.users.get(userId) || null;
  }

  createUser(userId, userData) {
    const user = {
      id: userId,
      state: 'main_menu',
      type: 'client',
      verified: false,
      trustBadge: false,
      rating: 0,
      reviewsCount: 0,
      balance: 0,
      subscription: null,
      createdAt: new Date(),
      ...userData
    };
    this.users.set(userId, user);
    return user;
  }

  updateUser(userId, updates) {
    const user = this.getUser(userId);
    if (user) {
      Object.assign(user, updates);
      this.users.set(userId, user);
    }
    return user;
  }

  // Объявления
  createAd(adData) {
    const ad = {
      id: this.nextAdId++,
      status: 'draft',
      views: 0,
      responses: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...adData
    };
    this.ads.set(ad.id, ad);
    return ad;
  }

  getAd(adId) {
    return this.ads.get(adId) || null;
  }

  updateAd(adId, updates) {
    const ad = this.getAd(adId);
    if (ad) {
      Object.assign(ad, { ...updates, updatedAt: new Date() });
      this.ads.set(adId, ad);
    }
    return ad;
  }

  getUserAds(userId) {
    return Array.from(this.ads.values()).filter(ad => ad.userId === userId);
  }

  searchAds(filters = {}) {
    let results = Array.from(this.ads.values()).filter(ad => ad.status === 'active');
    
    if (filters.category) {
      results = results.filter(ad => ad.category === filters.category);
    }
    
    if (filters.subcategory) {
      results = results.filter(ad => ad.subcategory === filters.subcategory);
    }
    
    if (filters.district) {
      results = results.filter(ad => 
        ad.districts && ad.districts.includes(filters.district)
      );
    }
    
    if (filters.verified) {
      results = results.filter(ad => {
        const user = this.getUser(ad.userId);
        return user && user.verified;
      });
    }
    
    return results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  // Избранное
  addToFavorites(userId, adId) {
    if (!this.favorites.has(userId)) {
      this.favorites.set(userId, new Set());
    }
    this.favorites.get(userId).add(adId);
  }

  removeFromFavorites(userId, adId) {
    if (this.favorites.has(userId)) {
      this.favorites.get(userId).delete(adId);
    }
  }

  getUserFavorites(userId) {
    if (!this.favorites.has(userId)) {
      return [];
    }
    const favoriteIds = Array.from(this.favorites.get(userId));
    return favoriteIds.map(id => this.getAd(id)).filter(Boolean);
  }

  // Заказы
  createOrder(orderData) {
    const order = {
      id: Date.now(),
      status: 'new',
      createdAt: new Date(),
      ...orderData
    };
    this.orders.set(order.id, order);
    return order;
  }

  getUserOrders(userId) {
    return Array.from(this.orders.values()).filter(order => 
      order.clientId === userId || order.providerId === userId
    );
  }
}

module.exports = new Database();