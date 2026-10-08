import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page-hero">
      <p className="kicker">404</p>
      <h1>That page is not in the edit.</h1>
      <p>The piece may have moved. The shop has not.</p>
      <Link className="btn btn-ink" href="/shop">Shop the edit</Link>
    </div>
  );
}
