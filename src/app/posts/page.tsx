import Link from "next/link";

const REPO_NAME = "dev-portfolio-posts";
const BASE_RAW_URL = `https://raw.githubusercontent.com/AndyAshley/${REPO_NAME}/main/content/posts`;

async function fetchPosts() {
  const res = await fetch(`https://api.github.com/repos/AndyAshley/${REPO_NAME}/contents/content/posts`);
  if (!res.ok) throw new Error("Failed to fetch post list");
  const postFolders: { name: string }[] = await res.json();

  const posts = await Promise.all(
    postFolders.map(async (folder) => {
      const metaRes = await fetch(`${BASE_RAW_URL}/${folder.name}/postMeta.json`);
      if (!metaRes.ok) return null;
      const metadata = await metaRes.json();
      return { slug: folder.name, ...metadata };
    })
  );

  return posts.filter(Boolean);
}

export default async function BlogPage() {
  const posts = await fetchPosts();

  return (
    <div className="prose lg:prose-xl mx-auto">
      <h1>Blog Posts</h1>
      <ul>
        {posts.map(({ slug, author, title, date, category }) => (
          <li key={slug} className="mb-4">
            <Link href={`/posts/${slug}`} className="text-blue-600 hover:underline">
                    <h2>{title}</h2>
                    <p>{author}</p>
              <p className="text-gray-500">{date} - {category}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
