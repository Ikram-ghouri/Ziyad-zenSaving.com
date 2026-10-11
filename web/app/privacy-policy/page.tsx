import { StaticPage, staticPageMetadata } from "@/components/legal-page";

export const generateMetadata = () => staticPageMetadata("privacy-policy");

export default function Page() {
  return <StaticPage route="privacy-policy" />;
}
