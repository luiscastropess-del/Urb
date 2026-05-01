import { getPosts } from "@/app/actions.blog";
import { getUserSession } from "@/app/actions.auth";
import { redirect } from "next/navigation";
import BlogAdminClient from "./BlogAdminClient";

export default async function BlogAdminPage() {
  const session = await getUserSession();
  
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const posts = await getPosts();

  return <BlogAdminClient initialPosts={posts} />;
}
