import MarketingLayout from '../components/MarketingLayout';

export default function FeaturesPage() {
  const cards = [
    ['Goal Creation', 'Define goals with thrust area, UoM, target, and weightage with strict validation controls.'],
    ['Approval Workflow', 'Managers review, edit inline, approve, or return goals for rework with lock control.'],
    ['Quarterly Check-ins', 'Employees log achievements per quarter with status and progress score computation.'],
    ['Shared Goals', 'Push common departmental goals to multiple employees with recipient-side constraints.'],
    ['Completion Views', 'Track org check-in completion by role, department, and manager hierarchy.'],
    ['Audit & Export', 'Audit key updates and export structured report data for review and governance.']
  ];

  return (
    <MarketingLayout title="Features" subtitle="Everything needed to run transparent goal cycles from planning to quarterly execution.">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(([title, desc]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-2xl text-slate-900">{title}</h3>
            <p className="mt-3 text-sm text-muted">{desc}</p>
          </article>
        ))}
      </section>
    </MarketingLayout>
  );
}
