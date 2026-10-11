import { StaticPage, staticPageMetadata } from "@/components/legal-page";

export const generateMetadata = () => staticPageMetadata("careers");

export default function Page() {
  return <StaticPage route="careers" />;
}
