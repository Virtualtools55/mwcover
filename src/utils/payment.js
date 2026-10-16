// utils/payment.js
export async function startRazorpayPayment({ router }) {
  // 1. Load Razorpay Script Safely
  const scriptLoaded = await new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  if (!scriptLoaded) {
    alert("Razorpay SDK failed to load. Check your internet connection.");
    return;
  }

  try {
    // 2. Call backend order creation. 
    // NOTE: Amount ya Products client se bhejne ki zaroorat nahi hai. 
    // Backend khud authenticated user ka cart fetch karke secure server-side amount calculate karega!
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Server handles cart items & amount calculation securely
    });
    
    const data = await res.json();

    if (!data.success) {
      alert(data.error || "Could not initialize secure payment gateway.");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.order.amount, // Server verified amount in paise
      currency: "INR",
      name: "Caseo.in",
      description: "Secure Gen Z Tech & Accessories Checkout",
      order_id: data.order.id,
      handler: async function (response) {
        try {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              dbOrderId: data.dbOrderId, 
              status: "Paid",
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            router.push("/orders?success=true");
          } else {
            alert("Payment verification failed. Contact support.");
          }
        } catch (verifyErr) {
          console.error("Verification network error:", verifyErr);
          alert("Error verifying payment transaction.");
        }
      },
      modal: {
        ondismiss: async function () {
          try {
            await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: data.order.id,
                dbOrderId: data.dbOrderId,
                status: "Failed",
              }),
            });
          } catch (dismissErr) {
            console.error("Failed status sync error:", dismissErr);
          }
          router.push("/orders?failed=true");
        },
      },
      theme: { color: "#0a0a0a" }, // Caseo Gen Z black theme
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment flow execution error:", err);
    alert("Something went wrong with the secure payment gateway.");
  }
}