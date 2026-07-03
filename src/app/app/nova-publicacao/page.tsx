import { NewPostWorkspace } from "@/components/new-post-workspace";
import { getConnectedAccounts, getMediaAssets } from "@/lib/app-data";

export default async function NewPublicationPage() {
  const [accounts, assets] = await Promise.all([getConnectedAccounts(), getMediaAssets()]);

  return <NewPostWorkspace connectedAccounts={accounts} initialAssets={assets} />;
}
