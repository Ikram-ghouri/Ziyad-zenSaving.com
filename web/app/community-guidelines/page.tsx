import { StaticPage, staticPageMetadata } from "@/components/legal-page";

export const generateMetadata = () => staticPageMetadata("community-guidelines");

export default function Page() {
  return <StaticPage route="community-guidelines" />;
}
