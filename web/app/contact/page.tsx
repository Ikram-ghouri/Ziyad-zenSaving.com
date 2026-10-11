import { StaticPage, staticPageMetadata } from "@/components/legal-page";

export const generateMetadata = () => staticPageMetadata("contact");

export default function Page() {
  return <StaticPage route="contact" />;
}
