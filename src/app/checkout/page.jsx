import ClientProviders from '../../providers/ClientProviders';
import CheckoutForm from '../../components/Checkout/CheckoutForm';

export default function CheckoutPage() {
  return (
    <ClientProviders>
      <CheckoutForm />
    </ClientProviders>
  );
}
