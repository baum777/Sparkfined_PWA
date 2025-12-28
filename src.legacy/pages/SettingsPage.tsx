import { PageContent, PageLayout } from '@/components/layout';
import SettingsContent from './SettingsContent';

export default function SettingsPage() {
  return (
    <PageLayout className="py-6" maxWidth="7xl">
      <PageContent>
        <SettingsContent
          wrapperClassName="mx-auto max-w-2xl space-y-6 p-4 pb-20 sm:p-6 sm:pb-8"
        />
      </PageContent>
    </PageLayout>
  );
}
