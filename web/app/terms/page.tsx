import { StaticPage, staticPageMetadata } from "@/components/legal-page";

export const generateMetadata = () => staticPageMetadata("terms");

export default function Page() {
  return <StaticPage route="terms" />;
}
