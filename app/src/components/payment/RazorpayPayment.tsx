import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { paymentAPI } from '@/services/api';
import { formatINR, toPaise } from '@/lib/currency';
import { toast } from 'sonner';

// Load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayPaymentProps {
  bookingId: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  buttonText?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  bookingId,
  amount,
  currency = 'INR',
  name = 'SnapCofriend India',
  description = 'Companion Booking Payment',
  prefill = {},
  onSuccess,
  onError,
  buttonText = 'Pay Now',
  buttonClassName = '',
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setScriptLoaded(loaded);
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please refresh the page.');
      }
    });
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast.error('Payment gateway not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent/order
      const orderResponse = await paymentAPI.createPaymentIntent(bookingId);
      const { orderId, keyId, demo } = orderResponse.data;

      // Demo mode - simulate payment
      if (demo) {
        toast.info('Demo Mode: Simulating payment...');
        
        // Simulate Razorpay response
        setTimeout(async () => {
          const mockResponse: RazorpayResponse = {
            razorpay_payment_id: 'demo_payment_' + Date.now(),
            razorpay_order_id: orderId,
            razorpay_signature: 'demo_signature'
          };

          try {
            // Confirm payment with backend
            await paymentAPI.confirmPayment(
              bookingId,
              mockResponse.razorpay_order_id
            );

            toast.success('Payment successful! (Demo Mode)');
            onSuccess?.(mockResponse);
          } catch (error) {
            toast.error('Payment confirmation failed');
            onError?.(error);
          } finally {
            setLoading(false);
          }
        }, 2000);
        return;
      }

      // Real Razorpay payment
      const options = {
        key: keyId,
        amount: toPaise(amount),
        currency,
        name,
        description,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment with backend
            await paymentAPI.confirmPayment(
              bookingId,
              response.razorpay_order_id
            );

            toast.success('Payment successful!');
            onSuccess?.(response);
          } catch (error) {
            toast.error('Payment verification failed');
            onError?.(error);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || ''
        },
        notes: {
          bookingId
        },
        theme: {
          color: '#F97316' // Orange theme matching SnapCofriend
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      // @ts-ignore - Razorpay is loaded from script
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        toast.error('Payment failed: ' + response.error.description);
        onError?.(response.error);
        setLoading(false);
      });

      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
      onError?.(error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading || !scriptLoaded}
      className={`w-full ${buttonClassName}`}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {buttonText} - {formatINR(amount)}
        </>
      )}
    </Button>
  );
};

// Payment status component
interface PaymentStatusProps {
  status: 'pending' | 'held' | 'released' | 'refunded' | 'failed';
  amount?: number;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, amount }) => {
  const statusConfig = {
    pending: {
      icon: <CreditCard className="h-4 w-4" />,
      color: 'text-yellow-600 bg-yellow-50',
      label: 'Payment Pending'
    },
    held: {
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600 bg-green-50',
      label: 'Payment Secured'
    },
    released: {
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-blue-600 bg-blue-50',
      label: 'Payment Released'
    },
    refunded: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'text-gray-600 bg-gray-50',
      label: 'Refunded'
    },
    failed: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'text-red-600 bg-red-50',
      label: 'Payment Failed'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
      {config.icon}
      <span>{config.label}</span>
      {amount && <span className="font-bold">- {formatINR(amount)}</span>}
    </div>
  );
};

// Price breakdown component
interface PriceBreakdownProps {
  hourlyRate: number;
  hours: number;
  platformFeePercent?: number;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  hourlyRate,
  hours,
  platformFeePercent = 25
}) => {
  const subtotal = hourlyRate * hours;
  const platformFee = Math.round(subtotal * (platformFeePercent / 100));
  const totalAmount = subtotal + platformFee;
  const friendEarnings = Math.round(subtotal * ((100 - platformFeePercent) / 100));

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">
          {formatINR(hourlyRate)} × {hours} hrs
        </span>
        <span>{formatINR(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Platform Fee ({platformFeePercent}%)</span>
        <span>{formatINR(platformFee)}</span>
      </div>
      <div className="border-t pt-2 flex justify-between font-semibold text-base">
        <span>Total</span>
        <span className="text-orange-600">{formatINR(totalAmount)}</span>
      </div>
      <p className="text-xs text-gray-500">
        Companion earns {formatINR(friendEarnings)} ({100 - platformFeePercent}%)
      </p>
    </div>
  );
};

export default RazorpayPayment;
