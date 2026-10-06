import sanitizeHtml from "sanitize-html";
import { getPage } from "@/lib/data";

const copy = {
  about: {
    slug: "about",
    title: "About Zen Saving",
    intro:
      "We make finding useful savings feel calmer, clearer and more trustworthy.",
    sections: [
      [
        "Our purpose",
        "Zen Saving brings coupon codes, online deals and practical shopping advice into one easy place.",
      ],
      [
        "How we work",
        "We organize offers from stores and present the terms shoppers need to make an informed choice.",
      ],
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact us",
    intro:
      "Have a question, correction or partnership inquiry? We would like to hear from you.",
    sections: [
      [
        "Get in touch",
        "Use the contact method managed in WordPress to reach the Zen Saving team.",
      ],
      [
        "Coupon corrections",
        "Include the store, offer title and page URL when reporting an expired or incorrect coupon.",
      ],
    ],
  },
  privacy: {
    slug: "privacy-policy",
    title: "Privacy policy",
    intro:
      "Learn how Zen Saving handles visitor information, cookies and saved offers.",
    sections: [
      [
        "Information collected",
        "The live policy should explain analytics, form submissions, cookies and local saved offers.",
      ],
      [
        "Your choices",
        "Saved offers use browser storage. Visitors should be able to manage consent and contact the site about privacy requests.",
      ],
    ],
  },
  affiliate: {
    slug: "affiliate-disclosure",
    title: "Affiliate disclosure",
    intro:
      "Zen Saving may earn a commission when a shopper buys through some links on this website.",
    sections: [
      [
        "Editorial independence",
        "Compensation should not determine how offers, reviews or guides are described.",
      ],
      [
        "Price to shoppers",
        "Affiliate commissions generally do not increase the price paid by the shopper. Retailer terms always apply.",
      ],
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of use",
    intro: "Read the terms that apply when using Zen Saving.",
    sections: [
      [
        "Offer accuracy",
        "Coupon availability, prices and terms can change. Visitors should verify the final price and conditions with the retailer.",
      ],
      [
        "Use of the site",
        "The live terms should cover acceptable use, intellectual property, disclaimers and the applicable jurisdiction.",
      ],
    ],
  },
} as const;

export async function LegalPage({ kind }: { kind: keyof typeof copy }) {
  const item = copy[kind];
  const page = await getPage(item.slug);
  const html = page
    ? sanitizeHtml(page.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
          a: ["href", "target", "rel"],
          img: ["src", "alt", "width", "height"],
        },
      })
    : "";
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Zen Saving</span>
        <h1>{page?.title || item.title}</h1>
        <p>{page?.excerpt || item.intro}</p>
      </section>
      <div className="content-wrap prose legal">
        {page ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          item.sections.map(([h, p]) => (
            <section key={h}>
              <h2>{h}</h2>
              <p>{p}</p>
            </section>
          ))
        )}
      </div>
    </>
  );
}
