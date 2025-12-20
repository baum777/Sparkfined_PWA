import { PageContent, PageLayout } from '@/components/layout';
import SettingsPageContent from '@/features/settings/SettingsPage';

export default function SettingsPage() {
  return (
    <PageLayout className="py-6" maxWidth="7xl">
      <PageContent>
        <SettingsPageContent />
      </PageContent>
    </PageLayout>
  );
}
