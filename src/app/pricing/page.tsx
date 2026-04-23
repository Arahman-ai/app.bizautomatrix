import Navbar from "@/components/Navbar";
import PricingCards from "@/components/PricingCards";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600">
              Start free. Upgrade when you&apos;re ready. Cancel anytime.
            </p>
          </div>
          <PricingCards />
        </div>
      </section>
    </div>
  );
}
