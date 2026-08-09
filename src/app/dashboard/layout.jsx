export const metadata = {
  title: 'Admin Dashboard – Weather Notify',
  description: 'Internal admin dashboard for Weather Notify. Not a public-facing page.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function DashboardLayout({ children }) {
  return children;
}
