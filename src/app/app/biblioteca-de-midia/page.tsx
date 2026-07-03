import { MediaLibrary } from "@/components/media-library";
import { Card } from "@/components/ui/card";
import { getMediaAssets } from "@/lib/app-data";

export default async function MediaLibraryPage() {
  const assets = await getMediaAssets();

  return (
    <div className="space-y-6">
      <Card className="border-brand-500/20 bg-brand-950/20">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Biblioteca de midia</p>
          <h2 className="text-3xl font-semibold text-white">Storage do Supabase com validacao de upload</h2>
          <p className="max-w-3xl text-sm text-zinc-300">
            Organize imagens e videos para usar nas publicacoes. Os metadados ficam em `media_assets` e
            os arquivos no bucket `social-media-assets`.
          </p>
        </div>
      </Card>
      <MediaLibrary initialAssets={assets} />
    </div>
  );
}
