require('dotenv').config();
const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
    process.env.CF_ENV,
    process.env.CF_CLIENT_ID,
    process.env.CF_CLIENT_SECRET
);

// 🔹 Create Order
const createOrder = async (
    orderId,
    orderAmount,
    orderCurrency = "INR",
    customerId,
    customerPhone
) => {
    try {
        const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
        const formattedExpiryDate = expiryDate.toISOString();

        const request = {
            order_id: orderId,
            order_amount: orderAmount,
            order_currency: orderCurrency,
            customer_details: {
                customer_id: String(customerId),
                customer_phone: customerPhone
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL}/expense.html`,
                payment_methods: "cc, upi, nb", // NOTE: cc instead of ccc
            },
            order_expiry_time: formattedExpiryDate,
        };

        const response = await cashfree.PGCreateOrder(request);
        return response.data.payment_session_id;
    } catch (error) {
        console.error("Error setting up order request:", error.response?.data || error.message);
        throw error;
    }
};

// 🔹 Get Payment Status
const getPaymentStatus = async (orderId) => {
    try {
        const response = await cashfree.PGOrderFetchPayments(orderId);
        const paymentData = response.data;

        if (paymentData.some(txn => txn.payment_status === "SUCCESS")) {
            return "Success";
        } else if (paymentData.some(txn => txn.payment_status === "PENDING")) {
            return "Pending";
        } else {
            return "Failed";
        }
    } catch (error) {
        console.error("Error fetching payment status:", error.response?.data || error.message);
        return "Error"; // Or throw if you want to handle it at a higher level
    }
};

module.exports = {
    createOrder,
    getPaymentStatus
}