import { StaticPage, staticPageMetadata } from "@/components/legal-page";

export const generateMetadata = () => staticPageMetadata("affiliate-disclosure");

export default function Page() {
  return <StaticPage route="affiliate-disclosure" />;
}
