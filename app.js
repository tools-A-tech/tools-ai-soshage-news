(() => {
  "use strict";

  const blogData = window.BLOG_DATA || { posts: [] };
  const posts = Array.isArray(blogData.posts) ? blogData.posts : [];
  const base = String(window.SITE_BASE || "./");

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderPosts() {
    const list = document.getElementById("postList");
    if (!list) return;

    if (!posts.length) {
      list.innerHTML =
        '<div class="empty-state">記事はまだありません。最初の日報が公開されると、ここに表示されます。</div>';
      return;
    }

    list.innerHTML = posts.map(post => `
      <article class="post-card">
        <div class="post-meta">
          <span class="ai-label">Ollama要約</span>
        </div>
        <h2 class="post-title">
          <a href="${base}${escapeHtml(post.url)}">${escapeHtml(post.title)}</a>
        </h2>
        <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
        <a class="read-more" href="${base}${escapeHtml(post.url)}">
          続きを読む <span aria-hidden="true">→</span>
        </a>
      </article>`).join("");
  }

  document.addEventListener("DOMContentLoaded", renderPosts);
})();
