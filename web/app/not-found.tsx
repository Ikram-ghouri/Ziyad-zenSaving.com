import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <strong>404</strong>
      <h1>We couldn&apos;t find that page.</h1>
      <p>Return home to explore the latest guides and reviews.</p>
      <Link className="primary-link" href="/">
        Return home →
      </Link>
    </div>
  );
}
