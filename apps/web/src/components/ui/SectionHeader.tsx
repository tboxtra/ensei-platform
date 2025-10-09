export function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
    return (
        <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-white">
                <span className="text-xl">{icon}</span>
                <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );
}
