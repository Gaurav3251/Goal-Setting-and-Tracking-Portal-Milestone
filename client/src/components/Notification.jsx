export default function Notification({ title, desc }) {
  return <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"><strong>{title}</strong><div>{desc}</div></div>;
}
