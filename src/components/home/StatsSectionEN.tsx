interface StatItemProps {
  value: string
  label: string
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="text-4xl md:text-5xl font-bold mb-2">
        {value}
      </div>
      <div className="text-blue-200">{label}</div>
    </div>
  )
}

export default function StatsSectionEN() {
  return (
    <section className="py-16 bg-blue-900 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <StatItem value="46,000+" label="Quality businesses" />
          <StatItem value="17" label="Quebec regions" />
          <StatItem value="100%" label="Free" />
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
      </div>
    </section>
  )
}
