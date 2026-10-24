import { useState } from "react";
import { Music, Leaf, Atom } from "lucide-react";
import EditableImageSlot from "@/components/EditableImageSlot";
import { colorExplorationData, colorExplorationFunctions } from "@/data/colorExplorationData";
import { colorExplorationLabels as labels } from "@/data/colorExplorationLabels";
import bannerMusic from "@/assets/banner_music.jpg";
import bannerNature from "@/assets/banner_nature.jpg";
import bannerPhysics from "@/assets/banner_physics.jpg";
import TopNav from "@/components/TopNav";

const domainIcons: Record<string, typeof Music> = {
  music: Music,
  living: Leaf,
  physics: Atom,
};

const domainImages: Record<string, string> = {
  music: bannerMusic,
  living: bannerNature,
  physics: bannerPhysics,
};

const domainAccentColors: Record<string, string> = {
  music: "#8E24AA",
  living: "#43A047",
  physics: "#1E88E5",
};

const { hero, domains } = colorExplorationData;

const HowColorsWork = () => {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  return (
    <div
      dir="rtl"
      className="newton-app min-h-screen"
      style={{
        background: "radial-gradient(circle at top, #1d2230 0%, #0f1115 45%, #0b0d11 100%)",
      }}
    >
      <TopNav />
      <div className="max-w-[960px] mx-auto p-6 pt-20 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "hsl(var(--newton-text))" }}>
            {hero.title}
          </h1>
        </div>

        {/* Hero intro */}
        <p
          className="text-base md:text-lg leading-relaxed text-center max-w-2xl mx-auto"
          style={{ color: "hsl(var(--newton-muted))" }}
        >
          {hero.intro}
        </p>

        {/* Domain banner cards */}
        <div className="space-y-5">
          {domains.map((domain) => {
            const Icon = domainIcons[domain.key] ?? Atom;
            const img = domainImages[domain.key];
            const accent = domainAccentColors[domain.key] ?? "hsl(var(--newton-accent))";
            const isExpanded = expandedDomain === domain.key;

            return (
              <div key={domain.key} className="space-y-4">
                {/* Banner card */}
                <div
                  className="newton-panel overflow-hidden cursor-pointer transition-transform hover:scale-[1.005]"
                  onClick={() => setExpandedDomain(isExpanded ? null : domain.key)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Text side */}
                    <div className="flex-1 p-6 md:p-8 space-y-3 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" style={{ color: accent }} />
                        <h2 className="text-xl font-bold" style={{ color: "hsl(var(--newton-text))" }}>
                          {domain.title}
                        </h2>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--newton-muted))" }}>
                        {domain.intro}
                      </p>
                      <button
                        className="self-start mt-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                        style={{
                          backgroundColor: accent,
                          color: "#fff",
                        }}
                      >
                        {isExpanded ? "סגור" : "למד עוד"}
                      </button>
                    </div>

                    {/* Image side */}
                    <div className="md:w-[45%] h-48 md:h-auto relative overflow-hidden">
                      <img
                        src={img}
                        alt={domain.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={1024}
                        height={512}
                      />
                      {/* Gradient fade into card */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "linear-gradient(to left, transparent 40%, rgba(15,17,21,0.95) 100%)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded examples */}
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
                    {domain.examples.map((ex) => (
                      <div key={ex.id} className="newton-panel p-5 space-y-3 flex flex-col">
                        <EditableImageSlot
                          storageKey={ex.id}
                          fallbackGradient={`linear-gradient(135deg, ${ex.colors[0]}44, ${ex.colors[1] ?? ex.colors[0]}22)`}
                          className="h-28"
                        />

                        <div className="space-y-1.5 flex-1">
                          <h3 className="text-sm font-bold" style={{ color: "hsl(var(--newton-text))" }}>
                            {ex.title}
                          </h3>
                          <p className="text-xs font-medium" style={{ color: accent }}>
                            {ex.subtitle}
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--newton-muted))" }}>
                            {ex.description}
                          </p>
                        </div>

                        {/* Footer */}
                        <div
                          className="flex items-center justify-between pt-2 border-t"
                          style={{ borderColor: "rgba(255,255,255,0.08)" }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px]" style={{ color: "hsl(var(--newton-muted))" }}>
                              {labels.colorsTitle}:
                            </span>
                            <div className="flex gap-1">
                              {ex.colors.map((c) => (
                                <div
                                  key={c}
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: c, borderColor: "rgba(255,255,255,0.15)" }}
                                />
                              ))}
                            </div>
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              color: accent,
                            }}
                          >
                            {colorExplorationFunctions.find((f) => f.key === ex.functionTag)?.label ?? ex.functionTag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HowColorsWork;
