import MaheHubApp from '../../components/MaheHubApp';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function Page() {
  return <MaheHubApp initialView="admin" />;
}
