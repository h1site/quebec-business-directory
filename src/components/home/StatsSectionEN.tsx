interface StatItemProps {
  value: string
  label: string
  icon: string
}

function StatItem({ value, label, icon }: StatItemProps) {
  return (
    <div className="text-center animate-fade-in-up">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500/10 rounded-2xl mb-4 text-3xl">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {value}
      </div>
      <div className="text-slate-400">{label}</div>
    </div>
  )
}

export default function StatsSectionEN() {
  return (
    <section className="py-20 bg-slate-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <StatItem icon="🏢" value="46,000+" label="Quality businesses" />
          <StatItem icon="🗺️" value="17" label="Quebec regions" />
          <StatItem icon="✨" value="100%" label="Free" />
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl" />
      </div>
    </section>
  )
}
