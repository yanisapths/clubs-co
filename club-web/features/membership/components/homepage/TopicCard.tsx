interface TopicCardProps {
  topic: string;
  dotColor?: string;
  onClick?: () => void;
}

export const TopicCard = ({
  topic,
  dotColor = "bg-white/40",
  onClick,
}: TopicCardProps) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full border border-white/14 bg-white/5 text-[13px] text-white/75 hover:bg-white/10 hover:border-white/30 hover:text-white transition-colors"
    >
      {topic}
    </button>
  );
};
