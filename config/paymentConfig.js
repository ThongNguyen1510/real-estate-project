require('dotenv').config();

// Cấu hình cho các cổng thanh toán
const paymentGateways = {
    // VNPay configuration
    vnpay: {
        tmnCode: process.env.VNPAY_TMN_CODE,
        secretKey: process.env.VNPAY_SECRET_KEY,
        vnpUrl: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:9000/api/advanced-payments/vnpay/callback'
    },
    
    // Momo configuration
    momo: {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        accessKey: process.env.MOMO_ACCESS_KEY,
        secretKey: process.env.MOMO_SECRET_KEY,
        apiEndpoint: process.env.MOMO_API_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
        returnUrl: process.env.MOMO_RETURN_URL || 'http://localhost:9000/api/advanced-payments/momo/callback',
        notifyUrl: process.env.MOMO_NOTIFY_URL || 'http://localhost:9000/api/advanced-payments/momo/ipn'
    },
    
    // PayPal configuration
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.PAYPAL_MODE || 'sandbox',
        returnUrl: process.env.PAYPAL_RETURN_URL || 'http://localhost:9000/api/advanced-payments/paypal/success',
        cancelUrl: process.env.PAYPAL_CANCEL_URL || 'http://localhost:9000/api/advanced-payments/paypal/cancel'
    },
    
    // Stripe configuration 
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        currency: process.env.STRIPE_CURRENCY || 'vnd'
    }
};

module.exports = paymentGateways; 