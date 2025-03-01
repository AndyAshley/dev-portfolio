import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const REPO_NAME = "dev-portfolio-posts";
const BASE_RAW_URL = `https://raw.githubusercontent.com/AndyAshley/${REPO_NAME}/main/content/posts`;

export async function generateStaticParams() {
  const res = await fetch(`https://api.github.com/repos/AndyAshley/${REPO_NAME}/contents/content/posts`);
  const postFolders = await res.json();

  return postFolders.map((folder: any) => ({
    slug: folder.name,
  }));
}

async function fetchPost(slug: string) {
  if (!slug) return { metadata: null, content: "Invalid post slug." };

  try {
    const metaRes = await fetch(`${BASE_RAW_URL}/${slug}/postMeta.json`);
    if (!metaRes.ok) throw new Error(`Failed to fetch metadata for ${slug}`);
    const metadata = await metaRes.json();

    const contentRes = await fetch(`${BASE_RAW_URL}/${slug}/post.md`);
    if (!contentRes.ok) throw new Error(`Failed to fetch markdown for ${slug}`);
    const content = await contentRes.text();

    return { metadata, content };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { metadata: null, content: "Error loading content." };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    return (
      <div className="prose lg:prose-xl mx-auto">
        <h1>Error: Post Not Found</h1>
      </div>
    );
  }

  const { metadata, content } = await fetchPost(slug);

  if (!metadata) {
    return (
      <div className="prose lg:prose-xl mx-auto">
        <h1>Error: Could not load post.</h1>
      </div>
    );
    }

  return (
    <div className="prose lg:prose-xl mx-auto">
      <h1>{metadata.title}</h1>
      <p className="text-gray-500">
        {metadata.date} | {metadata.category} | {metadata.author}
      </p>
      {metadata.thumbnail && (
        <img src={metadata.thumbnail} alt={metadata.title} className="w-full rounded-md mb-4" />
      )}
      <div>
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
    </div>
  );
}
