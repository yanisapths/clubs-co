import { SiInstagram, SiFacebook, SiX } from "@icons-pack/react-simple-icons";
import { IconWorld } from "@tabler/icons-react";

export function SocialIcon({ platform }: { platform: string }) {
  const cls = "text-white hover:text-white/70 transition-colors cursor-pointer";
  switch (platform.toLowerCase()) {
    case "instagram":
      return <SiInstagram className={cls} size={20} />;
    case "facebook":
      return <SiFacebook className={cls} size={20} />;
    case "meta":
      return <SiFacebook className={cls} size={20} />;
    case "website":
      return <IconWorld className={cls} size={24} />;
    case "x":
    case "twitter":
      return <SiX className={cls} size={20} />;
    default:
      return null;
  }
}
