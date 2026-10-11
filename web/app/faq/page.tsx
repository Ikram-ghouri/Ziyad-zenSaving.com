import { StaticPage, staticPageMetadata } from "@/components/legal-page";

export const generateMetadata = () => staticPageMetadata("faq");

export default function Page() {
  return <StaticPage route="faq" />;
}
