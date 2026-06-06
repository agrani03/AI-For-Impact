interface SkillBadgeProps {
  skill: string;
  type: "matched" | "missing" | "neutral";
}

const styles: Record<SkillBadgeProps["type"], string> = {
  matched:
    "bg-[#06d6a0]/10 text-[#06d6a0] border border-[#06d6a0]/30",
  missing:
    "bg-[#e94560]/10 text-[#e94560] border border-[#e94560]/30",
  neutral:
    "bg-[#560BAD]/10 text-[#560BAD] border border-[#560BAD]/30",
};

export default function SkillBadge({ skill, type }: SkillBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${styles[type]}`}
    >
      {skill}
    </span>
  );
}
