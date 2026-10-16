import { Link } from "react-router-dom";
import { useTitle } from "../useTitle";
import { IconArrowRight } from "./icons";

export default function NotFound() {
  useTitle("Page not found");
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:py-36">
      <p className="sticker font-display text-5xl font-extrabold">404</p>
      <h1 className="font-display mt-10 text-4xl font-bold sm:text-5xl">This page doesn&apos;t exist</h1>
      <p className="mt-4 text-lg leading-8 text-muted">The link may be broken, or the page may have moved.</p>
      <Link to="/" className="btn btn-lg btn-primary mt-9">
        Back to Media Saver
        <IconArrowRight size={18} />
      </Link>
    </div>
  );
}
