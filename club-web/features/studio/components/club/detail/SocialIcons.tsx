import { SiInstagram, SiFacebook, SiX } from "@icons-pack/react-simple-icons";
import { IconWorld } from "@tabler/icons-react";

export function SocialIcon({ platform }: { platform: string }) {
  const cls =
    "h-5 w-5 text-white hover:text-white/70 transition-colors cursor-pointer";
  switch (platform.toLowerCase()) {
    case "instagram":
      return <SiInstagram className={cls} />;
    case "facebook":
      return <SiFacebook className={cls} />;
    case "meta":
      return <SiFacebook className={cls} />;
    case "website":
      return <IconWorld className={cls} />;
    case "x":
    case "twitter":
      return <SiX className={cls} />;
    default:
      return null;
  }
}
