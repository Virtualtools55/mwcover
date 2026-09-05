export async function startRazorpayPayment({ products, amount, router }) {
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
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, products }), // Pass products here
    });
    const data = await res.json();

    if (!data.success) {
      alert("Could not initialize secure payment gateway.");
      return;
    }

    const options = {
      key: process.env.RAZORPAY_KEY_ID,
      amount: data.order.amount,
      currency: "INR",
      name: "Kairi.in",
      description: "Secure Luxury Checkout",
      order_id: data.order.id,
      handler: async function (response) {
        const verifyRes = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            dbOrderId: data.dbOrderId, // Pass database order reference if available
            status: "Paid",
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          router.push("/orders?success=true");
        } else {
          alert("Payment verification failed.");
        }
      },
      modal: {
        ondismiss: async function () {
          await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: data.order.id,
              status: "Failed",
            }),
          });
          router.push("/orders?failed=true");
        },
      },
      theme: { color: "#0a0a0a" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment flow error:", err);
  }
}