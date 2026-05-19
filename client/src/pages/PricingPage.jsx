import MarketingLayout from '../components/MarketingLayout';

function inr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export default function PricingPage() {
  const plans = [
    {
      name: 'Team',
      price: 249,
      billed: 'per active user / month',
      desc: 'For SMEs scaling goal planning, approvals, and quarterly execution.'
    },
    {
      name: 'Enterprise',
      price: 399,
      billed: 'per active user / month',
      desc: 'For larger organizations requiring governance, advanced analytics, and SLA-backed support.'
    }
  ];

  const examples = [
    { label: '100 users on Team', monthly: 249 * 100, annualDiscount: 0.15 },
    { label: '500 users on Team', monthly: 249 * 500, annualDiscount: 0.2 },
    { label: '1000 users on Enterprise', monthly: 399 * 1000, annualDiscount: 0.22 }
  ];

  return (
    <MarketingLayout
      title="Pricing"
      subtitle="Transparent INR pricing with volume discounts and practical scale economics."
    >
      <section className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-2xl">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold text-brand-700">{inr(plan.price)}</p>
            <p className="text-sm text-muted">{plan.billed}</p>
            <p className="mt-3 text-sm text-muted">{plan.desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="font-display text-3xl text-brand-900">Scale Cost Calculator</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Scenario</th>
                <th className="p-2 text-left">Monthly</th>
                <th className="p-2 text-left">Annual (after discount)</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((row) => {
                const annual = row.monthly * 12;
                const finalAnnual = Math.round(annual * (1 - row.annualDiscount));
                return (
                  <tr key={row.label} className="border-t">
                    <td className="p-2">{row.label}</td>
                    <td className="p-2">{inr(row.monthly)}</td>
                    <td className="p-2 font-semibold text-emerald-700">{inr(finalAnnual)} ({Math.round(row.annualDiscount * 100)}% off)</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </MarketingLayout>
  );
}
