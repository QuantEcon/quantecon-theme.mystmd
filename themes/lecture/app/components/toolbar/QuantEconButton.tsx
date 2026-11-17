import { useBaseurl, useLinkProvider, withBaseurl } from '@myst-theme/providers';

export function QuantEconButton() {
  const baseurl = useBaseurl();
  const Link = useLinkProvider();
  return (
    <Link to="https://quantecon.org/">
      <img
        className="duration-300 cursor-pointer transition-scale hover:scale-110 h-7 dark:invert"
        src={withBaseurl('/logos/qemb-logo.png', baseurl)}
        alt="QuantEcon Logo"
      />
    </Link>
  );
}
