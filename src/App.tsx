import { AppShell } from "@/components/app-shell";
import { Hero } from "@/components/hero";
import { SnippetGallery } from "@/components/snippets/snippet-gallery";
import { snippets } from "@/features";

function App() {
  const keywordCount = new Set(
    snippets.flatMap((snippet) => snippet.keywords)
  ).size;
  const newestSnippet = snippets[snippets.length - 1]?.title;

  return (
    <AppShell>
      <Hero
        snippetCount={snippets.length}
        keywordCount={keywordCount}
        freshestSnippet={newestSnippet}
      />
      <SnippetGallery snippets={snippets} />
    </AppShell>
  );
}

export default App;
