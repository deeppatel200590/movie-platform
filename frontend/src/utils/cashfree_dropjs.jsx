import { useEffect } from "react";
import { Cashfree } from "cashfree-dropjs";

const CashfreeCheckout = ({ paymentSessionId }) => {

  useEffect(() => {
    if (!paymentSessionId) return;

    const cashfree = new Cashfree({
      mode: "sandbox",
    });

    cashfree.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: "_self",
    });

  }, [paymentSessionId]);

  return null;
};

export default CashfreeCheckout;