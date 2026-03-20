import { Fragment } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

type Crumb = {
  label: string;
  to?: string;
  isCurrent: boolean;
};

function toTitleCase(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getCrumbs(pathname: string): Crumb[] {
  // Special-case admin routes so "admin" segment doesn't become a clickable crumb
  // (there is no `/admin` route, so clicking it causes 404).
  if (pathname.startsWith('/admin/')) {
    const labelByAdminRoute: Record<string, string> = {
      '/admin/dashboard': 'Dashboard',
      '/admin/event-approval': 'Event Approval',
      '/admin/manage-clubs': 'Manage Clubs',
      '/admin/manage-users': 'Manage Users',
      '/admin/reports': 'Reports',
    };

    const label = labelByAdminRoute[pathname];
    if (label) {
      return [
        { label: 'Home', to: '/', isCurrent: false },
        { label, to: pathname, isCurrent: true },
      ];
    }
  }

  const rawSegments = pathname.split('/').filter(Boolean);

  const crumbs: Array<{ key: string; label: string; to: string }> = [];
  let cumulative = '';

  for (const seg of rawSegments) {
    cumulative += `/${seg}`;

    // Friendly labels for known routes. We match on cumulative path to handle nested routes.
    const labelByRoute: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/events': 'Events',
      '/calendar': 'Calendar',
      '/gallery': 'Gallery',
      '/leaderboard': 'Leaderboard',
      '/notifications': 'Notifications',
      '/clubs': 'Clubs',
      '/create-event': 'Create Event',
      '/my-events': 'My Events',

      // Admin routes are handled above (special-cased) to avoid `/admin` crumb links.
      '/admin/dashboard': 'Dashboard',
      '/admin/event-approval': 'Event Approval',
      '/admin/manage-clubs': 'Manage Clubs',
      '/admin/manage-users': 'Manage Users',
      '/admin/reports': 'Reports',
    };

    let label = labelByRoute[cumulative];

    // Dynamic routes
    // /clubs/:id
    if (!label && cumulative.startsWith('/clubs/')) {
      const parts = cumulative.split('/').filter(Boolean);
      if (parts.length === 2) label = 'Club Details';
    }

    if (!label) {
      label = toTitleCase(decodeURIComponent(seg));
    }

    crumbs.push({ key: cumulative, label, to: cumulative });
  }

  // Prepend "Home"
  return [
    { label: 'Home', to: '/', isCurrent: rawSegments.length === 0 },
    ...crumbs.map((c, idx) => ({
      label: c.label,
      to: c.to,
      isCurrent: idx === crumbs.length - 1,
    })),
  ];
}

export function BreadcrumbsBar() {
  const { pathname } = useLocation();

  // Avoid breadcrumbs on auth + home pages to keep forms clean.
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null;
  }

  const crumbs = getCrumbs(pathname);

  // If we're at home already (shouldn't happen because of guard above), don't render.
  if (crumbs.length === 0) return null;

  const uiCrumbs = crumbs.map((c, idx) => ({
    ...c,
    // Make sure only the final crumb shows as current.
    isCurrent: idx === crumbs.length - 1,
  }));

  return (
    <div className="px-4 py-3">
      <Breadcrumb>
        <BreadcrumbList>
          {uiCrumbs.map((crumb, idx) => (
            <Fragment key={crumb.label + idx}>
              <BreadcrumbItem>
                {crumb.isCurrent ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to || '/'}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {idx < uiCrumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

