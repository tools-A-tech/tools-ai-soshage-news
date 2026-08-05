(() => {
  "use strict";

  const data = window.BLOG_DATA || { posts: [] };
  const posts = Array.isArray(data.posts) ? data.posts : [];
  const base = String(window.SITE_BASE || "./");

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function query() {
    return new URLSearchParams(window.location.search);
  }

  function countTags() {
    const result = new Map();
    for (const post of posts) {
      for (const tag of post.tags || []) {
        result.set(tag, (result.get(tag) || 0) + 1);
      }
    }
    return [...result.entries()].sort((a, b) =>
      b[1] - a[1] || a[0].localeCompare(b[0], "ja")
    );
  }

  function countMonths() {
    const result = new Map();
    for (const post of posts) {
      const month = String(post.date || "").slice(0, 7);
      if (month) result.set(month, (result.get(month) || 0) + 1);
    }
    return [...result.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }

  function monthLabel(month) {
    const [year, numericMonth] = String(month).split("-");
    return `${year}年${Number(numericMonth)}月`;
  }

  function renderNavigation(container) {
    if (!container) return;
    const selectedTag = query().get("tag");
    const selectedMonth = query().get("month");

    const tags = countTags();
    const months = countMonths();

    const tagItems = tags.length
      ? tags.map(([tag, count]) => `
          <li>
            <a href="${base}index.html?tag=${encodeURIComponent(tag)}"
               class="${selectedTag === tag ? "active" : ""}">
              <span>${escapeHtml(tag)}</span>
              <span class="count-badge">${count}</span>
            </a>
          </li>`).join("")
      : '<li><span class="side-note">タグはまだありません</span></li>';

    const monthItems = months.length
      ? months.map(([month, count]) => `
          <li>
            <a href="${base}index.html?month=${encodeURIComponent(month)}"
               class="${selectedMonth === month ? "active" : ""}">
              <span>${escapeHtml(monthLabel(month))}</span>
              <span class="count-badge">${count}</span>
            </a>
          </li>`).join("")
      : '<li><span class="side-note">記事はまだありません</span></li>';

    container.innerHTML = `
      <section class="side-panel">
        <h2 class="side-heading">ゲームタグ</h2>
        <ul class="side-list">${tagItems}</ul>
      </section>
      <section class="side-panel">
        <h2 class="side-heading">月別アーカイブ</h2>
        <ul class="side-list">${monthItems}</ul>
      </section>
      <section class="side-panel">
        <p class="side-note">ゲーム公式Xの投稿を収集し、ローカルAIが毎日タイトル別に要約します。</p>
      </section>`;
  }

  function renderPosts() {
    const list = document.getElementById("postList");
    if (!list) return;

    const params = query();
    const selectedTag = params.get("tag");
    const selectedMonth = params.get("month");
    let filtered = [...posts];

    if (selectedTag) {
      filtered = filtered.filter(post => (post.tags || []).includes(selectedTag));
    }
    if (selectedMonth) {
      filtered = filtered.filter(post => String(post.date || "").startsWith(selectedMonth));
    }

    const heading = document.getElementById("filterHeading");
    if (heading) {
      if (selectedTag) heading.textContent = `タグ「${selectedTag}」の記事`;
      else if (selectedMonth) heading.textContent = `${monthLabel(selectedMonth)}の記事`;
      else heading.textContent = "新着記事";
    }

    if (!filtered.length) {
      list.innerHTML = '<div class="empty-state">記事はまだありません。最初の日報が公開されると、ここに表示されます。</div>';
      return;
    }

    list.innerHTML = filtered.map(post => `
      <article class="post-card">
        <div class="post-meta">
          <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.display_date)}</time>
          <span class="ai-label">Ollama要約</span>
        </div>
        <h2 class="post-title">
          <a href="${base}${escapeHtml(post.url)}">${escapeHtml(post.title)}</a>
        </h2>
        <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="tag-list">
          ${(post.tags || []).map(tag => `
            <a class="tag-link" href="${base}index.html?tag=${encodeURIComponent(tag)}">
              # ${escapeHtml(tag)}
            </a>`).join("")}
        </div>
        <a class="read-more" href="${base}${escapeHtml(post.url)}">
          続きを読む <span aria-hidden="true">→</span>
        </a>
      </article>`).join("");
  }

  function setupDrawer() {
    const openButton = document.getElementById("mobileMenuButton");
    const closeButton = document.getElementById("drawerClose");
    const drawer = document.getElementById("mobileDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    if (!openButton || !closeButton || !drawer || !backdrop) return;

    const close = () => {
      drawer.classList.remove("open");
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
      openButton.setAttribute("aria-expanded", "false");
    };

    const open = () => {
      drawer.classList.add("open");
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
      openButton.setAttribute("aria-expanded", "true");
    };

    openButton.addEventListener("click", open);
    closeButton.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    drawer.addEventListener("click", event => {
      if (event.target.closest("a")) close();
    });
    window.addEventListener("keydown", event => {
      if (event.key === "Escape") close();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderPosts();
    document.querySelectorAll("[data-navigation]").forEach(renderNavigation);
    setupDrawer();
  });
})();