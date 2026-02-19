// Demo Mode Configuration
// This allows the app to work without backend/environment variables for demonstration

export const isDemoMode = (): boolean => {
  return !import.meta.env.VITE_API_URL || import.meta.env.VITE_DEMO_MODE === 'true';
};

// Demo user data
export const demoUser = {
  _id: 'demo-user-123',
  email: 'demo@snapcofriend.com',
  firstName: 'Demo',
  lastName: 'User',
  phone: '+91-98765-43210',
  isFriend: false,
  isVerified: true,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  createdAt: new Date().toISOString()
}};

// Demo friend data
export const demoFriends = [
  {
    _id: 'friend-1',
    userId: {
      _id: 'user-1',
      firstName: 'Priya',
      lastName: 'Sharma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'
    },
    headline: 'Professional Event Companion',
    bio: 'I love attending social events and making people feel comfortable. Great conversationalist!',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    languages: ['Hindi', 'English', 'Marathi'],
    interests: ['Music', 'Dancing', 'Travel', 'Food'],
    personalityTraits: ['Outgoing', 'Funny', 'Caring'],
    occasions: ['wedding', 'party', 'event', 'travel'],
    packages: [
      {
        _id: 'pkg-1',
        name: 'Basic Companion',
        hourlyRate: 800,
        description: 'Perfect for casual outings and events',
        minHours: 2
      },
      {
        _id: 'pkg-2',
        name: 'Premium Experience',
        hourlyRate: 1500,
        description: 'VIP treatment for special occasions',
        minHours: 3
      }
    ],
    rating: 4.8,
    totalBookings: 45,
    isAvailable: true,
    verificationStatus: 'verified'
  },
  {
    _id: 'friend-2',
    userId: {
      _id: 'user-2',
      firstName: 'Rahul',
      lastName: 'Verma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul'
    },
    headline: 'Travel Buddy & Adventure Partner',
    bio: 'Adventure enthusiast who loves exploring new places. Great at photography too!',
    location: {
      city: 'Delhi',
      state: 'Delhi'
    },
    languages: ['Hindi', 'English', 'Punjabi'],
    interests: ['Travel', 'Photography', 'Hiking', 'Movies'],
    personalityTraits: ['Adventurous', 'Creative', 'Easy-going'],
    occasions: ['travel', 'movie', 'outdoor', 'sports'],
    packages: [
      {
        _id: 'pkg-3',
        name: 'Travel Companion',
        hourlyRate: 1000,
        description: 'Your perfect travel partner',
        minHours: 4
      }
    ],
    rating: 4.9,
    totalBookings: 32,
    isAvailable: true,
    verificationStatus: 'verified'
  },
  {
    _id: 'friend-3',
    userId: {
      _id: 'user-3',
      firstName: 'Ananya',
      lastName: 'Patel',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya'
    },
    headline: 'Dinner Date & Conversation Expert',
    bio: 'Love deep conversations over good food. Great listener and engaging companion.',
    location: {
      city: 'Bangalore',
      state: 'Karnataka'
    },
    languages: ['English', 'Kannada', 'Hindi'],
    interests: ['Food', 'Reading', 'Yoga', 'Art'],
    personalityTraits: ['Calm', 'Intellectual', 'Warm'],
    occasions: ['dinner', 'coffee', 'event', 'movie'],
    packages: [
      {
        _id: 'pkg-4',
        name: 'Dinner Companion',
        hourlyRate: 1200,
        description: 'Perfect dinner date experience',
        minHours: 2
      }
    ],
    rating: 4.7,
    totalBookings: 28,
    isAvailable: true,
    verificationStatus: 'verified'
  }
];

// Demo bookings
export const demoBookings = [
  {
    _id: 'booking-1',
    userId: 'demo-user-123',
    friendId: {
      _id: 'friend-1',
      userId: {
        firstName: 'Priya',
        lastName: 'Sharma',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'
      }
    },
    occasion: {
      type: 'wedding',
      description: 'Cousin\'s wedding reception'
    },
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: {
      hours: 4,
      startTime: '18:00'
    },
    location: {
      address: 'Taj Lands End, Mumbai',
      city: 'Mumbai',
      type: 'venue'
    },
    pricing: {
      hourlyRate: 800,
      totalHours: 4,
      subtotal: 3200,
      platformFee: 800,
      totalAmount: 4000,
      friendEarnings: 2400
    },
    payment: {
      status: 'held',
      method: 'razorpay'
    },
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
];

// Demo stats
export const demoStats = {
  totalBookings: 12,
  totalSpent: 48500,
  upcomingBookings: 1,
  favoriteCompanions: 3
};

// Demo Razorpay configuration
export const demoRazorpayConfig = {
  keyId: 'rzp_test_demo_key',
  keySecret: 'demo_secret',
  currency: 'INR',
  name: 'SnapCofriend India',
  description: 'Companion Booking Payment',
  image: 'https://your-logo-url.com/logo.png',
  prefill: {
    name: 'Demo User',
    email: 'demo@snapcofriend.com',
    contact: '+919876543210'
  },
  theme: {
    color: '#F97316'
  }
};
