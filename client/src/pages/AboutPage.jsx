import MarketingLayout from '../components/MarketingLayout';

export default function AboutPage() {
  return (
    <MarketingLayout title="About Us" subtitle="Milestone is built to replace fragmented spreadsheets and disconnected review cycles.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-display text-2xl">Our Mission</h3>
          <p className="mt-3 text-sm text-muted">Help teams align individual work to organizational priorities with measurable, quarter-based execution.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-display text-2xl">Why Milestone</h3>
          <p className="mt-3 text-sm text-muted">Role-based workflows, transparent approvals, check-in visibility, and audit-ready data in one unified portal.</p>
        </article>
      </section>
    </MarketingLayout>
  );
}
