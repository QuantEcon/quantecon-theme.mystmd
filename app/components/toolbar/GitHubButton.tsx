import { useBaseurl, useThemeSwitcher, withBaseurl } from '@myst-theme/providers';
import { usePage } from '~/components/PageProvider';
import { Tooltip } from './Tooltip';
import classNames from 'classnames';

export function GitHubButton({
  sizeClasses,
  showLabel,
}: {
  sizeClasses: string;
  showLabel?: boolean;
}) {
  const baseurl = useBaseurl();
  const { isDark } = useThemeSwitcher();
  const page = usePage();
  const editUrl = page?.frontmatter?.edit_url;

  const logo = (
    <>
      {isDark ? (
        <img
          src={withBaseurl('/logos/github-mark-white.svg', baseurl)}
          alt="Github Logo"
          className={classNames('opacity-90 hover:scale-110', sizeClasses)}
        />
      ) : (
        <img
          src={withBaseurl('/logos/github-mark.svg', baseurl)}
          alt="Github Logo"
          className={classNames('opacity-90 hover:scale-110', sizeClasses)}
        />
      )}
      {showLabel && <span className="ms-2">Edit</span>}
    </>
  );

  return (
    <div className={classNames('cursor-pointer', sizeClasses)}>
      {editUrl && (
        <Tooltip label="Edit on GitHub" asChild>
          <a href={editUrl}>{logo}</a>
        </Tooltip>
      )}
      {!editUrl && logo}
    </div>
  );
}
