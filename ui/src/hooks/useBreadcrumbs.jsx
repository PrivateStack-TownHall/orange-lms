/**
 * Returns the breadcrumb trail for the current page.
 *
 * List pages call this with no arguments and get no trail (list pages show
 * just a big title per the design, no breadcrumb).
 *
 * Detail pages call this with an explicit array of `{ label, to }` crumbs
 * (e.g. the parent Classes link) - the page itself knows the human-readable
 * names (class name, meeting title, etc.), which a generic URL-based
 * breadcrumb can never know since URLs only contain raw ids.
 */
const useBreadcrumbs = (items = []) => items;

export default useBreadcrumbs;
