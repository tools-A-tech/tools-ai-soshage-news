(() => {
  "use strict";

  const blogData = window.BLOG_DATA || { posts: [] };
  const posts = Array.isArray(blogData.posts) ? blogData.posts : [];
  const rankingData = window.SALES_RANKING || { items: [] };
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

  function renderRanking() {
    const list = document.getElementById("rankingList");
    const message = document.getElementById("rankingMessage");
    const updated = document.getElementById("rankingUpdated");
    const source = document.getElementById("rankingSource");
    if (!list || !message || !updated || !source) return;

    const items = Array.isArray(rankingData.items)
      ? rankingData.items.slice(0, 10)
      : [];

    source.href = rankingData.source_url || "https://game-i.daa.jp/";

    if (rankingData.updated_at) {
      updated.textContent = `取得日時：${rankingData.updated_at}`;
    } else {
      updated.textContent = "";
    }

    if (!items.length) {
      list.innerHTML = "";
      message.hidden = false;
      message.textContent =
        rankingData.error || "セルランを取得できませんでした。次回更新時に再取得します。";
      return;
    }

    message.hidden = true;
    list.innerHTML = items
      .map(item => `<li>${escapeHtml(item.name)}</li>`)
      .join("");
  }

  function setupRankingModal() {
    const toggle = document.getElementById("rankingToggle");
    const modal = document.getElementById("salesRankingModal");
    const backdrop = document.getElementById("rankingBackdrop");
    const closeButton = document.getElementById("rankingClose");
    if (!toggle || !modal || !backdrop || !closeButton) return;

    const close = () => {
      modal.hidden = true;
      backdrop.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };

    const open = () => {
      renderRanking();
      modal.hidden = false;
      backdrop.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      closeButton.focus();
    };

    toggle.addEventListener("click", () => {
      if (modal.hidden) open();
      else close();
    });

    closeButton.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && !modal.hidden) close();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderPosts();
    setupRankingModal();
  });
})();
