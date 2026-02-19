import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Booking from '../models/Booking';
import User from '../models/User';

// Razorpay import - will work if razorpay package is installed
let Razorpay: any;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.log('Razorpay package not installed, using mock mode');
}

// Initialize Razorpay if credentials are available
const getRazorpayInstance = () => {
  if (!Razorpay) return null;
  
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret || keyId === 'rzp_test_mock_key') {
    return null;
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

// Check if in demo mode
const isDemoMode = () => {
  return !process.env.RAZORPAY_KEY_ID || 
         process.env.RAZORPAY_KEY_ID === 'rzp_test_mock_key' ||
         !Razorpay;
};

// @desc    Create Razorpay order
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Convert amount to paise (₹1 = 100 paise)
    const amountInPaise = Math.round(booking.pricing.totalAmount * 100);

    const razorpay = getRazorpayInstance();

    if (isDemoMode() || !razorpay) {
      // Demo/Mock mode
      const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update booking with mock order ID
      booking.payment.razorpayOrderId = mockOrderId;
      await booking.save();

      res.json({
        success: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key',
        demo: true
      });
      return;
    }

    // Real Razorpay integration
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: booking._id.toString(),
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
        friendId: booking.friendId.toString()
      }
    });

    // Update booking with order ID
    booking.payment.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      demo: false
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Demo mode - skip signature verification
    if (isDemoMode()) {
      // Update booking
      booking.payment.status = 'held';
      booking.payment.razorpayOrderId = razorpayOrderId;
      booking.payment.razorpayPaymentId = razorpayPaymentId || 'demo_payment_' + Date.now();
      booking.payment.paidAt = new Date();
      booking.status = 'confirmed';
      await booking.save();

      res.json({
        success: true,
        message: 'Payment confirmed (Demo Mode)',
        data: booking
      });
      return;
    }

    // Real signature verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      res.status(500).json({ message: 'Razorpay configuration missing' });
      return;
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      res.status(400).json({ message: 'Invalid payment signature' });
      return;
    }

    // Update booking
    booking.payment.status = 'held';
    booking.payment.razorpayOrderId = razorpayOrderId;
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.paidAt = new Date();
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment methods (not used with Razorpay)
// @route   GET /api/payments/methods
// @access  Private
export const getPaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Razorpay doesn't store payment methods like Stripe
    // Users enter card details during checkout
    res.json({
      success: true,
      data: [],
      message: 'Razorpay handles payment methods during checkout'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add payment method (not used with Razorpay)
// @route   POST /api/payments/methods
// @access  Private
export const addPaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Payment methods are handled during checkout with Razorpay'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove payment method (not used with Razorpay)
// @route   DELETE /api/payments/methods/:methodId
// @access  Private
export const removePaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Payment method removed'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get earnings (for friends)
// @route   GET /api/payments/earnings
// @access  Private
export const getEarnings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await Booking.find({
      friendId: req.user._id,
      status: 'completed',
      'payment.status': 'released'
    });

    const totalEarnings = bookings.reduce(
      (sum, b) => sum + b.pricing.friendEarnings,
      0
    );

    const pendingEarnings = await Booking.aggregate([
      {
        $match: {
          friendId: req.user._id,
          status: 'completed',
          'payment.status': 'held'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.friendEarnings' }
        }
      }
    ]);

    const monthlyEarnings = await Booking.aggregate([
      {
        $match: {
          friendId: req.user._id,
          status: 'completed',
          'payment.status': 'released'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$pricing.friendEarnings' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        totalEarnings,
        pendingEarnings: pendingEarnings[0]?.total || 0,
        totalBookings: bookings.length,
        recentEarnings: bookings.slice(0, 5).map((b) => ({
          bookingId: b._id,
          amount: b.pricing.friendEarnings,
          date: b.createdAt
        })),
        monthlyEarnings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request payout
// @route   POST /api/payments/payout
// @access  Private
export const requestPayout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, accountDetails } = req.body;

    const user = await User.findById(req.user._id);
    if (!user?.isFriend) {
      res.status(400).json({ message: 'Only companions can request payouts' });
      return;
    }

    // Validate minimum payout amount (₹1000)
    if (amount < 1000) {
      res.status(400).json({ message: 'Minimum payout amount is ₹1000' });
      return;
    }

    // Check available earnings
    const earnings = await Booking.aggregate([
      {
        $match: {
          friendId: req.user._id,
          status: 'completed',
          'payment.status': 'released'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.friendEarnings' }
        }
      }
    ]);

    const totalEarnings = earnings[0]?.total || 0;
    
    if (amount > totalEarnings) {
      res.status(400).json({ message: 'Insufficient earnings for this payout' });
      return;
    }

    // TODO: Integrate with RazorpayX for payouts
    // For now, create a payout request record
    // In production, this would initiate a RazorpayX payout

    res.json({
      success: true,
      message: 'Payout request submitted successfully',
      data: {
        payoutId: 'payout_' + Date.now(),
        amount,
        status: 'pending',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 business days
        accountDetails: {
          accountNumber: accountDetails?.accountNumber?.slice(-4),
          ifsc: accountDetails?.ifsc
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public
export const webhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'] as string;

    // Skip verification in demo mode
    if (!isDemoMode() && secret && signature) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        res.status(400).json({ message: 'Invalid webhook signature' });
        return;
      }
    }

    const event = req.body;
    console.log('Razorpay webhook received:', event.event);

    // Handle events
    switch (event.event) {
      case 'payment.captured':
        const payment = event.payload.payment.entity;
        const bookingId = payment.notes?.bookingId;
        if (bookingId) {
          await Booking.findByIdAndUpdate(bookingId, {
            'payment.status': 'held',
            status: 'confirmed',
            'payment.razorpayPaymentId': payment.id
          });
          console.log('Payment captured for booking:', bookingId);
        }
        break;

      case 'payment.failed':
        const failedPayment = event.payload.payment.entity;
        const failedBookingId = failedPayment.notes?.bookingId;
        if (failedBookingId) {
          await Booking.findByIdAndUpdate(failedBookingId, {
            'payment.status': 'failed',
            status: 'payment_failed'
          });
          console.log('Payment failed for booking:', failedBookingId);
        }
        break;

      case 'refund.processed':
        const refund = event.payload.refund.entity;
        const refundBookingId = refund.notes?.bookingId;
        if (refundBookingId) {
          await Booking.findByIdAndUpdate(refundBookingId, {
            'payment.status': 'refunded'
          });
          console.log('Refund processed for booking:', refundBookingId);
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payout history
// @route   GET /api/payments/payouts
// @access  Private
export const getPayoutHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TODO: Implement payout history from database
    // For now, return empty array
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private (Admin only)
export const processRefund = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // In demo mode, just update the booking status
    if (isDemoMode()) {
      booking.payment.status = 'refunded';
      booking.status = 'cancelled';
      await booking.save();

      res.json({
        success: true,
        message: 'Refund processed (Demo Mode)',
        data: booking
      });
      return;
    }

    // Real refund via Razorpay
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      res.status(500).json({ message: 'Razorpay not configured' });
      return;
    }

    const refundAmount = amount ? amount * 100 : undefined; // Convert to paise if specified

    const refund = await razorpay.payments.refund(booking.payment.razorpayPaymentId, {
      amount: refundAmount,
      notes: {
        bookingId: booking._id.toString(),
        reason
      }
    });

    booking.payment.status = 'refunded';
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100, // Convert back to rupees
        status: refund.status
      }
    });
  } catch (error) {
    next(error);
  }
};
