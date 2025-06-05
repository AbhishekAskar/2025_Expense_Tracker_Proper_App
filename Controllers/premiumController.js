const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    "TEST430329ae80e0f32e41a393d78b923034",
    "TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
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
                return_url: `http://localhost:3000/expense.html`,
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