import sanitizeHtml from "sanitize-html";
import { getPage } from "@/lib/data";

const copy = {
  about: {
    slug: "about",
    title: "About Zen Saving",
    intro:
      "We publish clear, practical ideas that help readers make more confident everyday choices.",
    sections: [
      [
        "Our purpose",
        "Zen Saving brings thoughtful guides, reviews and practical advice into one easy place.",
      ],
      [
        "How we work",
        "We organize useful information, explain important details and keep every article easy to follow.",
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
        "Article corrections",
        "Include the article title and page URL when reporting information that needs to be reviewed.",
      ],
    ],
  },
  privacy: {
    slug: "privacy-policy",
    title: "Privacy policy",
    intro:
      "Learn how Zen Saving handles visitor information, cookies and website analytics.",
    sections: [
      [
        "Information collected",
        "The live policy should explain analytics, contact form submissions and cookies.",
      ],
      [
        "Your choices",
        "Visitors should be able to manage consent and contact the site about privacy requests.",
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
        "Compensation should not determine how reviews, recommendations or guides are described.",
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
        "Information accuracy",
        "Articles are provided for general information. Details can change, so readers should verify important information with the original source.",
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
