import { StaticPage, staticPageMetadata } from "@/components/legal-page";

export const generateMetadata = () => staticPageMetadata("about");

export default function Page() {
  return <StaticPage route="about" />;
}
