import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";

export type DebuggerMode = "hacker" | "dark-humor" | "corporate";

interface ModeSelectorProps {
  selectedMode: DebuggerMode;
  onModeChange: (mode: DebuggerMode) => void;
}

const modes = [
  {
    id: "hacker" as DebuggerMode,
    icon: "🕶",
    title: "Super Hacker",
    subtitle: "Elite Terminal Warrior",
    description: "Neon cyber-grid with matrix code rain",
    accent: "from-cyan-500 to-blue-600",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.5)]",
    bgGradient: "from-cyan-500/10 to-blue-600/10",
  },
  {
    id: "dark-humor" as DebuggerMode,
    icon: "⚰️",
    title: "Dark Humor",
    subtitle: "The Roastmaster Compiler",
    description: "Purple fog with roasting commentary",
    accent: "from-purple-500 to-pink-600",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    bgGradient: "from-purple-500/10 to-pink-600/10",
  },
  {
    id: "corporate" as DebuggerMode,
    icon: "🏢",
    title: "Evil Corporate AI",
    subtitle: "Profits > People",
    description: "Sleek glass with corporate overlays",
    accent: "from-amber-500 to-yellow-600",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.5)]",
    bgGradient: "from-amber-500/10 to-yellow-600/10",
  },
];

export const ModeSelector = ({ selectedMode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="px-6 py-4 border-b border-border bg-card/60 backdrop-blur-sm">
      <div className="mb-3">
        <h2 className="text-sm font-bold mb-1">Choose Your Debugger's Personality</h2>
        <p className="text-xs text-muted-foreground">
          Pick a vibe. Watch the UI transform. Debug with style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          
          return (
            <Card
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`
                relative p-4 cursor-pointer transition-all duration-300 
                hover:scale-[1.02] bg-gradient-to-br ${mode.bgGradient}
                border-2 overflow-hidden group
                ${isSelected 
                  ? `${mode.glow} border-transparent animate-pulse` 
                  : "border-border hover:border-muted-foreground/50"
                }
              `}
            >
              {/* Active Ribbon */}
              {isSelected && (
                <div className={`
                  absolute top-0 right-0 px-3 py-1 text-xs font-bold 
                  bg-gradient-to-r ${mode.accent} text-white
                  flex items-center gap-1 rounded-bl-lg
                `}>
                  <Check className="w-3 h-3" />
                  Active
                </div>
              )}

              {/* Icon */}
              <div className="text-4xl mb-2">{mode.icon}</div>

              {/* Title */}
              <h3 className={`
                text-lg font-bold mb-1 bg-gradient-to-r ${mode.accent} 
                bg-clip-text text-transparent
              `}>
                {mode.title}
              </h3>

              {/* Subtitle */}
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {mode.subtitle}
              </p>

              {/* Description */}
              <p className="text-xs text-muted-foreground/80">
                {mode.description}
              </p>

              {/* Hover Effect */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${mode.accent} 
                opacity-0 group-hover:opacity-5 transition-opacity duration-300
              `} />
            </Card>
          );
        })}
      </div>
    </div>
  );
};
