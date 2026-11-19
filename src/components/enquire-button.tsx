// Yellow "Enquire" button for the orderable product sections. It opens a
// prefilled WhatsApp chat, so it is a plain external link (not a Next Link).
export default function EnquireButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-slate-950 shadow transition-transform hover:scale-[1.03]"
      style={{ backgroundColor: "#FFD60A" }}
    >
      {label}
    </a>
  );
}
