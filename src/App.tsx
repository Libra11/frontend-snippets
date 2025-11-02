import { AppShell } from "@/components/app-shell";
import { SnippetGallery } from "@/components/snippets/snippet-gallery";
import { snippets } from "@/features";

function App() {
  return (
    <AppShell>
      <SnippetGallery snippets={snippets} />
    </AppShell>
  );
}

export default App;
