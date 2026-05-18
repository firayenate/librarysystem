// ============================================================
//  USER.JS — LibriNet Library Portal
//  Built to match user.html exactly
// ============================================================


// ── 1. DATA ──────────────────────────────────────────────────

const books = [
  { id: 1,  title: 'Introduction to Algorithms',      author: 'Cormen et al.',     category: 'Technology', format: 'Physical', status: 'Available' },
  { id: 2,  title: 'Clean Code',                      author: 'Robert C. Martin',  category: 'Technology', format: 'Physical', status: 'Available' },
  { id: 3,  title: 'The Pragmatic Programmer',         author: 'Andrew Hunt',       category: 'Technology', format: 'E-Book',   status: 'Borrowed'  },
  { id: 4,  title: 'Design Patterns',                  author: 'Gang of Four',      category: 'Technology', format: 'Physical', status: 'Available' },
  { id: 5,  title: 'The Art of Computer Programming',  author: 'Donald Knuth',      category: 'Education',  format: 'Physical', status: 'Available' },
  { id: 6,  title: 'Artificial Intelligence',          author: 'Russell & Norvig',  category: 'Science',    format: 'Physical', status: 'Available' },
  { id: 7,  title: "You Don't Know JS",                author: 'Kyle Simpson',      category: 'Technology', format: 'E-Book',   status: 'Available' },
  { id: 8,  title: 'The Rust Programming Language',    author: 'Klabnik & Nichols', category: 'Technology', format: 'E-Book',   status: 'Available' },
  { id: 9,  title: 'Atomic Habits',                    author: 'James Clear',       category: 'Business',   format: 'Physical', status: 'Borrowed'  },
  { id: 10, title: 'Sapiens',                          author: 'Yuval Noah Harari', category: 'Education',  format: 'Physical', status: 'Available' },
  { id: 11, title: 'Deep Work',                        author: 'Cal Newport',       category: 'Business',   format: 'Physical', status: 'Available' },
  { id: 12, title: 'The Alchemist',                    author: 'Paulo Coelho',      category: 'Fiction',    format: 'Physical', status: 'Available' },
];

// Glance stats (linked to real borrow actions)
let glanceStats = JSON.parse(localStorage.getItem('glanceStats')) || {
  borrowed: 7,
  onHold:   2,
  favorites: 5,
  searches: 3
};

// Hold list
let holds = JSON.parse(localStorage.getItem('holds')) || [];

// Favorites list
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Activity log
let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [
  { icon: 'fa-book-open',           title: 'Atomic Habits',  author: 'James Clear',       date: 'May 10, 2026', due: 'May 24, 2026', status: 'Borrowed' },
  { icon: 'fa-bookmark',            title: 'The Alchemist',  author: 'Paulo Coelho',      date: 'May 8, 2026',  due: '—',            status: 'On Hold'  },
  { icon: 'fa-rotate-left',         title: 'Deep Work',      author: 'Cal Newport',       date: 'May 5, 2026',  due: '—',            status: 'Returned' },
  { icon: 'fa-triangle-exclamation',title: 'Sapiens',        author: 'Yuval Noah Harari', date: 'Apr 20, 2026', due: 'May 4, 2026',  status: 'Overdue'  },
];


// ── 2. INIT ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupNavScroll();
  setupNavLinks();
  setupSidebarButtons();
  populateCatalogDropdowns();
  setupCatalogSearch();
  setupQuickFilters();
  setupCategoryCards();
  setupResourceFilters();
  setupResourceSearch();
  setupResourceViewToggle();
  setupResourcePagination();
  setupResourceActionButtons();
  setupEditProfile();
  updateGlanceStats();
  renderActivityTable();
  setupHomeSearch();
  setupHomeDashboardCards();
  setupLogout();
  setupContactSupport();
  setupSortBy();
});


// ── 3. NAVBAR ────────────────────────────────────────────────

function setupNavScroll() {
  const navbar = document.querySelector('.container .nav-bar');
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 60) {
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      navbar.style.background = 'rgb(5, 6, 9)';
    } else {
      navbar.style.boxShadow = 'none';
      navbar.style.background = 'rgb(15, 16, 19)';
    }
  });
}

// Make nav links smoothly scroll AND highlight active section
function setupNavLinks() {
  const links = document.querySelectorAll('.nav-bar nav li a');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      links.forEach(l => l.style.color = 'white');
      link.style.color = '#4ade80'; // green highlight
    });
  });

  // Highlight nav link based on scroll position
  const sections = ['home', 'myprofile', 'Browse', 'resource'];
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    links.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color = href === current ? '#4ade80' : 'white';
    });
  });
}


// ── 4. HOME PAGE ─────────────────────────────────────────────

function setupHomeSearch() {
  const btn = document.querySelector('.search-box button');
  const input = document.getElementById('searchInputHome');
  if (!btn || !input) return;

  btn.addEventListener('click', runHomeSearch);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') runHomeSearch(); });

  // Live results as user types
  input.addEventListener('input', debounce(() => {
    if (input.value.trim().length > 0) runHomeSearch();
    else closeHomeResults();
  }, 300));
}

function runHomeSearch() {
  const type  = document.getElementById('searchTypeHome').value;
  const query = document.getElementById('searchInputHome').value.trim().toLowerCase();

  if (!query) { closeHomeResults(); return; }

  // Filter books by selected type
  const results = books.filter(b => {
    if (type === 'title')   return b.title.toLowerCase().includes(query);
    if (type === 'author')  return b.author.toLowerCase().includes(query);
    if (type === 'subject') return b.category.toLowerCase().includes(query);
    return b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query);
  });

  glanceStats.searches++;
  saveStats();
  updateGlanceStats();

  showHomeResults(results, query);
}

function showHomeResults(results, query) {
  // Create or reuse the results panel inside .upper-home, right below the search box
  let panel = document.getElementById('homeSearchResults');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'homeSearchResults';
    // Insert it right after .search-box inside .upper-home
    const searchBox = document.querySelector('.search-box');
    searchBox.insertAdjacentElement('afterend', panel);
  }

  if (results.length === 0) {
    panel.innerHTML = `
      <div style="padding:20px 90px;">
        <div style="background:white;border-radius:12px;padding:20px 24px;
          box-shadow:0 4px 20px rgba(0,0,0,0.10);display:flex;align-items:center;gap:12px;">
          <i class="fa-solid fa-magnifying-glass" style="font-size:20px;color:#9ca3af;background:none;padding:0;margin:0;"></i>
          <span style="font-size:15px;color:#6b7280;">No books found for "<strong>${escHtml(query)}</strong>"</span>
        </div>
      </div>`;
    return;
  }

  panel.innerHTML = `
    <div style="padding:20px 90px 30px;">
      <div style="background:white;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,0.12);overflow:hidden;">

        <!-- Header -->
        <div style="padding:16px 24px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:16px;font-weight:700;color:#0b2e13;">
            <i class="fa-solid fa-magnifying-glass" style="background:none;padding:0;margin:0 8px 0 0;font-size:14px;color:#0b2e13;"></i>
            ${results.length} result${results.length !== 1 ? 's' : ''} for "<strong>${escHtml(query)}</strong>"
          </span>
          <button onclick="closeHomeResults()"
            style="background:none;border:none;cursor:pointer;font-size:18px;color:#9ca3af;line-height:1;">✕</button>
        </div>

        <!-- Results list -->
        <div style="max-height:380px;overflow-y:auto;">
          ${results.map(b => `
            <div style="display:flex;align-items:center;justify-content:space-between;
              padding:16px 24px;border-bottom:1px solid #f3f4f6;transition:background 0.2s;"
              onmouseenter="this.style.background='#f9fafb'"
              onmouseleave="this.style.background='white'">

              <!-- Book icon + info -->
              <div style="display:flex;align-items:center;gap:16px;">
                <div style="width:44px;height:44px;border-radius:10px;background:#e8f5e9;
                  display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <i class="fa-solid fa-book-open" style="font-size:18px;color:#0b2e13;background:none;padding:0;margin:0;"></i>
                </div>
                <div>
                  <div style="font-weight:700;font-size:15px;color:#111827;">${escHtml(b.title)}</div>
                  <div style="font-size:13px;color:#6b7280;margin-top:2px;">by ${escHtml(b.author)}</div>
                  <div style="font-size:12px;color:#9ca3af;margin-top:2px;">${b.category} · ${b.format}</div>
                </div>
              </div>

              <!-- Status + actions -->
              <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
                <span style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;
                  background:${b.status === 'Available' ? '#d1fae5' : '#fee2e2'};
                  color:${b.status === 'Available' ? '#065f46' : '#991b1b'};">
                  ${b.status}
                </span>
                ${b.status === 'Available' ? `
                  <button onclick="borrowBookFromHome(${b.id})"
                    style="padding:7px 16px;background:#0b2e13;color:white;border:none;
                    border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">
                    Borrow
                  </button>` : ''}
                <button onclick="toggleFavoriteFromHome(${b.id}, this)"
                  style="padding:7px 14px;border:1px solid #d1d5db;border-radius:8px;
                  cursor:pointer;font-size:13px;background:white;color:#374151;">
                  ♥
                </button>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    </div>`;
}

function closeHomeResults() {
  const panel = document.getElementById('homeSearchResults');
  if (panel) panel.innerHTML = '';
}

// Borrow directly from home search results
function borrowBookFromHome(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book || book.status !== 'Available') return;

  showConfirm(`Borrow "${book.title}"?`, () => {
    book.status = 'Borrowed';
    glanceStats.borrowed++;
    saveStats();
    updateGlanceStats();

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 14);
    const due = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    activityLog.unshift({ icon: 'fa-book-open', title: book.title, author: book.author, date: today, due, status: 'Borrowed' });
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    renderActivityTable();

    // Refresh results panel to show updated status
    runHomeSearch();
    showToast(`"${book.title}" borrowed! Pick it up from the library.`);
  });
}

// Favorite directly from home search results
function toggleFavoriteFromHome(bookId, btn) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;
  const idx = favorites.findIndex(f => f.id === bookId);
  if (idx === -1) {
    favorites.push(book);
    glanceStats.favorites++;
    btn.style.color = '#ef4444';
    btn.style.borderColor = '#ef4444';
    showToast(`"${book.title}" added to favorites ♥`);
  } else {
    favorites.splice(idx, 1);
    glanceStats.favorites = Math.max(0, glanceStats.favorites - 1);
    btn.style.color = '#374151';
    btn.style.borderColor = '#d1d5db';
    showToast(`"${book.title}" removed from favorites`);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  saveStats();
  updateGlanceStats();
}

// Dashboard cards on home page → scroll to matching section
function setupHomeDashboardCards() {
  const cards = document.querySelectorAll('.lower-home .dashboard-cards');
  const targets = ['Browse', 'myprofile', 'resource', 'Browse', 'myprofile'];
  cards.forEach((card, i) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const target = document.getElementById(targets[i]);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
    // Hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform   = 'translateY(-6px)';
      card.style.boxShadow   = '0 8px 24px rgba(0,0,0,0.12)';
      card.style.transition  = '0.3s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}


// ── 5. PROFILE SIDEBAR ───────────────────────────────────────

function setupSidebarButtons() {
  const buttons = document.querySelectorAll('.sidebar-buttons button');
  // Map button index to action
  const actions = [
    () => scrollToMiddle(),                        // Profile Overview
    () => scrollToMiddle(),                        // Personal Information
    () => showBorrowingHistoryModal(),             // Borrowing History
    () => showHoldsModal(),                        // Holds
    () => showFavoritesModal(),                    // Favorites
    () => showSettingsModal(),                     // Settings
    () => showNotificationsModal(),                // Notifications
    () => showChangePasswordModal(),               // Change Password
    () => logout(),                                // Logout
  ];
  buttons.forEach((btn, i) => {
    if (actions[i]) btn.addEventListener('click', actions[i]);
  });
}

function scrollToMiddle() {
  document.querySelector('.middle')?.scrollIntoView({ behavior: 'smooth' });
}

// Edit Profile button
function setupEditProfile() {
  const editBtn = document.querySelector('.profile-right button');
  if (!editBtn) return;
  editBtn.addEventListener('click', () => {
    showModal('Edit Profile', `
      <div class="modal-form">
        <label>Full Name</label>
        <input type="text" id="editName" value="Firaol Tadesse" />
        <label>Email</label>
        <input type="email" id="editEmail" value="firaol.tadesse@example.com" />
        <label>Phone</label>
        <input type="text" id="editPhone" value="+251 92 654 478" />
      </div>
    `, () => {
      const name  = document.getElementById('editName').value;
      const email = document.getElementById('editEmail').value;
      const phone = document.getElementById('editPhone').value;
      // Update displayed name
      document.querySelector('.info h3').textContent          = name;
      document.querySelector('.info p').textContent           = email;
      document.querySelector('.meta span:first-child').innerHTML = `<i class="fa-solid fa-phone"></i> ${phone}`;
      showToast('Profile updated successfully!');
    });
  });
}


// ── 6. BROWSE CATALOG ────────────────────────────────────────

function populateCatalogDropdowns() {
  // Categories
  const cats = [...new Set(books.map(b => b.category))];
  const catSel = document.getElementById('categories');
  if (catSel) {
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      catSel.appendChild(opt);
    });
  }

  // Formats
  const fmts = [...new Set(books.map(b => b.format))];
  const fmtSel = document.getElementById('formats');
  if (fmtSel) {
    fmts.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f; opt.textContent = f;
      fmtSel.appendChild(opt);
    });
  }

  // Availability
  const avSel = document.getElementById('availability');
  if (avSel) {
    ['Available', 'Borrowed'].forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      avSel.appendChild(opt);
    });
  }
}

function setupCatalogSearch() {
  // Search button inside .finding
  const searchBtn = document.querySelector('.finding #btn');
  if (searchBtn) searchBtn.addEventListener('click', runCatalogFilter);

  // Also search on Enter
  const inp = document.getElementById('searchInputBooks');
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') runCatalogFilter(); });
  if (inp) inp.addEventListener('input', debounce(runCatalogFilter, 300));
}

function runCatalogFilter() {
  const query    = (document.getElementById('searchInputBooks')?.value || '').toLowerCase().trim();
  const category = document.getElementById('categories')?.value    || '';
  const format   = document.getElementById('formats')?.value       || '';
  const avail    = document.getElementById('availability')?.value  || '';

  const results = books.filter(b => {
    const matchQ = !query    || b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query);
    const matchC = !category || b.category === category;
    const matchF = !format   || b.format === format;
    const matchA = !avail    || b.status === avail;
    return matchQ && matchC && matchF && matchA;
  });

  // Track search in glance stats
  if (query) { glanceStats.searches++; saveStats(); updateGlanceStats(); }

  showCatalogResults(results, query || 'all');
}

function showCatalogResults(results, query) {
  // Remove old results panel if exists
  let panel = document.getElementById('catalogResultsPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'catalogResultsPanel';
    panel.style.cssText = 'margin:20px 50px;background:white;border-radius:12px;padding:25px;box-shadow:0 2px 12px rgba(0,0,0,0.08);';
    document.getElementById('Browse').appendChild(panel);
  }

  if (results.length === 0) {
    panel.innerHTML = `<p style="color:#6b7280;font-size:16px;">No books found matching your search.</p>`;
    panel.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  panel.innerHTML = `
    <h3 style="font-size:20px;font-weight:800;margin-bottom:16px;color:#0b2e13;">
      ${results.length} result${results.length > 1 ? 's' : ''} found
    </h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
      ${results.map(b => `
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:18px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:700;font-size:15px;color:#111827;">${escHtml(b.title)}</div>
            <div style="font-size:13px;color:#6b7280;margin:4px 0;">by ${escHtml(b.author)}</div>
            <div style="font-size:12px;color:#374151;">${b.category} · ${b.format}</div>
          </div>
          <div style="text-align:right;">
            <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;
              background:${b.status === 'Available' ? '#d1fae5' : '#fee2e2'};
              color:${b.status === 'Available' ? '#065f46' : '#991b1b'};">
              ${b.status}
            </span>
            ${b.status === 'Available' ? `
              <br><button onclick="borrowBook(${b.id})"
                style="margin-top:8px;padding:6px 14px;background:#0b2e13;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
                Borrow
              </button>
            ` : ''}
            <br><button onclick="toggleFavorite(${b.id})"
              style="margin-top:6px;padding:5px 12px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-size:12px;background:white;">
              ♥ Favorite
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  panel.scrollIntoView({ behavior: 'smooth' });
}

// Quick filter buttons (All Books, Available Now, E-Books, Most Borrowed, New Arrivals)
function setupQuickFilters() {
  const btns = document.querySelectorAll('#btns');
  const labels = ['All Books', 'Available Now', 'E-Books', 'Most Borrowed', 'New Arrivals'];

  btns.forEach((btn, i) => {
    btns.forEach(b => b.style.background = 'white');
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.style.background = 'white'; b.style.color = '#111827'; });
      btn.style.background = '#0b2e13';
      btn.style.color = 'white';

      let filtered = [...books];
      if (labels[i] === 'Available Now') filtered = books.filter(b => b.status === 'Available');
      if (labels[i] === 'E-Books')       filtered = books.filter(b => b.format === 'E-Book');
      if (labels[i] === 'Most Borrowed') filtered = books.filter(b => b.status === 'Borrowed');
      if (labels[i] === 'New Arrivals')  filtered = books.slice(-4); // last 4 = newest

      showCatalogResults(filtered, labels[i]);
    });
  });
}

// Category cards (Fiction, Science, Education, Technology, Health, Business, Arts & Design)
function setupCategoryCards() {
  const cards = document.querySelectorAll('.dashboards .dashboard');
  const catMap = ['Fiction', 'Science', 'Education', 'Technology', 'Health', 'Business', 'Arts & Design'];

  cards.forEach((card, i) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const cat = catMap[i];
      const filtered = books.filter(b => b.category === cat);
      // Also set the dropdown
      const sel = document.getElementById('categories');
      if (sel) sel.value = cat;
      showCatalogResults(filtered.length ? filtered : [], cat);
      showToast(`Showing ${cat} books`);
    });
    card.addEventListener('mouseenter', () => {
      card.style.background   = '#0b2e13';
      card.style.color        = 'white';
      card.style.transition   = '0.3s';
      card.querySelectorAll('h3, h4, i').forEach(el => el.style.color = 'white');
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '#e6e9e6';
      card.style.color      = '';
      card.querySelectorAll('h3, h4, i').forEach(el => el.style.color = '');
    });
  });
}

// Borrow a book
function borrowBook(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book || book.status !== 'Available') return;

  showConfirm(`Borrow "${book.title}"?`, () => {
    book.status = 'Borrowed';
    glanceStats.borrowed++;
    saveStats();
    updateGlanceStats();

    // Add to activity log
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 14);
    const due = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    activityLog.unshift({ icon: 'fa-book-open', title: book.title, author: book.author, date: today, due, status: 'Borrowed' });
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    renderActivityTable();

    // Re-render results
    runCatalogFilter();
    showToast(`"${book.title}" borrowed! Pick it up from the library.`);
  });
}

// Favorite a book
function toggleFavorite(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;
  const idx = favorites.findIndex(f => f.id === bookId);
  if (idx === -1) {
    favorites.push(book);
    glanceStats.favorites++;
    showToast(`"${book.title}" added to favorites ♥`);
  } else {
    favorites.splice(idx, 1);
    glanceStats.favorites = Math.max(0, glanceStats.favorites - 1);
    showToast(`"${book.title}" removed from favorites`);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  saveStats();
  updateGlanceStats();
}


// ── 7. ACTIVITY TABLE ────────────────────────────────────────

function renderActivityTable() {
  const tbody = document.querySelector('.activity-table tbody');
  if (!tbody) return;

  tbody.innerHTML = activityLog.map(item => {
    const badgeClass = item.status.toLowerCase().replace(' ', '-');
    return `
      <tr>
        <td><div class="activity-icon-cell"><i class="fa-solid ${item.icon}"></i></div></td>
        <td>
          <div class="book-title">${escHtml(item.title)}</div>
          <div class="book-author">${escHtml(item.author)}</div>
        </td>
        <td>${item.date}</td>
        <td>${item.due}</td>
        <td><span class="activity-badge ${badgeClass}">${item.status}</span></td>
      </tr>
    `;
  }).join('');
}


// ── 8. GLANCE STATS ──────────────────────────────────────────

function updateGlanceStats() {
  const counts = document.querySelectorAll('.glance-info .count');
  if (counts[0]) counts[0].textContent = glanceStats.borrowed;
  if (counts[1]) counts[1].textContent = glanceStats.onHold;
  if (counts[2]) counts[2].textContent = glanceStats.favorites;
  if (counts[3]) counts[3].textContent = glanceStats.searches;
}

function saveStats() {
  localStorage.setItem('glanceStats', JSON.stringify(glanceStats));
}


// ── 9. RESOURCES PAGE ────────────────────────────────────────

// Quick filter buttons in Resources
function setupResourceFilters() {
  const rfBtns = document.querySelectorAll('.rf-btn');
  rfBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rfBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const label = btn.textContent.trim();
      filterResourceCards(label);
    });
  });
}

function filterResourceCards(filter) {
  const cards = document.querySelectorAll('.resource-card');
  cards.forEach(card => {
    const tag = card.querySelector('.resource-tag')?.textContent.trim() || '';
    const show =
      filter.includes('All') ||
      (filter.includes('E-Book')   && tag === 'E-Book')  ||
      (filter.includes('Journal')  && tag === 'Journal') ||
      (filter.includes('Study')    && tag === 'Study Material') ||
      (filter.includes('Video')    && tag === 'Video')   ||
      (filter.includes('Web')      && tag === 'Web Resource');
    card.style.display = show ? '' : 'none';
  });
}

// Resource search bar
function setupResourceSearch() {
  const btn = document.querySelector('.resource-search-btn');
  const inp = document.querySelector('.resource-input-wrap input');
  if (!btn || !inp) return;

  btn.addEventListener('click', () => runResourceSearch());
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') runResourceSearch(); });
}

function runResourceSearch() {
  const inp    = document.querySelector('.resource-input-wrap input');
  const type   = document.querySelector('.resource-search-group select');
  const query  = inp?.value.trim().toLowerCase() || '';

  const cards = document.querySelectorAll('.resource-card');
  let found = 0;
  cards.forEach(card => {
    const title  = card.querySelector('h4')?.textContent.toLowerCase() || '';
    const author = card.querySelector('.resource-author')?.textContent.toLowerCase() || '';
    const match  = !query || title.includes(query) || author.includes(query);
    card.style.display = match ? '' : 'none';
    if (match) found++;
  });

  showToast(query ? `Found ${found} resource${found !== 1 ? 's' : ''} for "${query}"` : 'Showing all resources');
}

// View toggle (grid / list)
function setupResourceViewToggle() {
  const viewBtns = document.querySelectorAll('.view-btn');
  const grid     = document.querySelector('.resource-cards');
  viewBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (!grid) return;
      if (i === 0) {
        // Grid view
        grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
      } else {
        // List view
        grid.style.gridTemplateColumns = '1fr';
        grid.querySelectorAll('.resource-card').forEach(c => {
          c.style.display      = 'flex';
          c.style.flexDirection = 'row';
        });
      }
    });
  });
}

// Pagination
function setupResourcePagination() {
  const pageNums = document.querySelectorAll('.page-num');
  const arrows   = document.querySelectorAll('.page-arrow');
  let current    = 1;
  const total    = pageNums.length ? parseInt(pageNums[pageNums.length - 1].textContent) : 20;

  function setPage(n) {
    current = Math.max(1, Math.min(n, total));
    pageNums.forEach(btn => {
      const num = parseInt(btn.textContent);
      btn.classList.toggle('active', num === current);
    });
    showToast(`Page ${current}`);
  }

  pageNums.forEach(btn => {
    btn.addEventListener('click', () => setPage(parseInt(btn.textContent)));
  });

  arrows[0]?.addEventListener('click', () => setPage(current - 1)); // prev
  arrows[1]?.addEventListener('click', () => setPage(current + 1)); // next
}

// Resource action buttons (View / Watch / Visit)
function setupResourceActionButtons() {
  document.querySelectorAll('.resource-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.resource-card');
      const title = card?.querySelector('h4')?.textContent || 'this resource';
      const type  = btn.textContent.trim();
      if (type.includes('Visit')) {
        showToast(`Opening ${title} in a new tab...`);
        // In real usage: window.open(url, '_blank')
      } else {
        showToast(`${type === 'Watch' ? 'Playing' : 'Opening'}: ${title}`);
      }
    });
  });
}

// Sort by
function setupSortBy() {
  const sortSel = document.querySelector('.sort-wrap select');
  if (!sortSel) return;
  sortSel.addEventListener('change', () => {
    showToast(`Sorted by: ${sortSel.value}`);
    // In a real app, re-fetch/sort resource-cards here
  });
}


// ── 10. SIDEBAR MODAL PANELS ─────────────────────────────────

function showBorrowingHistoryModal() {
  const rows = activityLog.map(item => `
    <tr>
      <td>${escHtml(item.title)}</td>
      <td>${item.date}</td>
      <td>${item.due}</td>
      <td><span class="activity-badge ${item.status.toLowerCase().replace(' ','-')}">${item.status}</span></td>
    </tr>
  `).join('');

  showModal('Borrowing History', `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:10px;text-align:left;">Book</th>
        <th style="padding:10px;text-align:left;">Borrowed</th>
        <th style="padding:10px;text-align:left;">Due</th>
        <th style="padding:10px;text-align:left;">Status</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="4" style="padding:16px;color:#6b7280;">No history yet.</td></tr>'}</tbody>
    </table>
  `);
}

function showHoldsModal() {
  const list = holds.length
    ? holds.map(b => `<li style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${escHtml(b.title)} <span style="color:#6b7280;">by ${escHtml(b.author)}</span></li>`).join('')
    : '<li style="color:#6b7280;padding:8px 0;">No holds placed yet.</li>';
  showModal('My Holds', `<ul style="list-style:none;font-size:15px;">${list}</ul>`);
}

function showFavoritesModal() {
  const list = favorites.length
    ? favorites.map(b => `
        <li style="padding:10px 0;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
          <span>${escHtml(b.title)} <span style="color:#6b7280;font-size:13px;">by ${escHtml(b.author)}</span></span>
          <button onclick="toggleFavorite(${b.id});closeModal();" style="padding:4px 12px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-size:12px;">Remove</button>
        </li>`)
      .join('')
    : '<li style="color:#6b7280;padding:8px 0;">No favorites yet. Search books and click ♥ Favorite.</li>';
  showModal('My Favorites', `<ul style="list-style:none;font-size:15px;">${list}</ul>`);
}

function showSettingsModal() {
  showModal('Settings', `
    <div class="modal-form">
      <label>Language</label>
      <select><option>English</option><option>Amharic</option></select>
      <label style="margin-top:16px;">Theme</label>
      <select><option>Light</option><option>Dark</option></select>
      <label style="margin-top:16px;">Email Notifications</label>
      <label style="display:flex;align-items:center;gap:10px;font-weight:400;cursor:pointer;">
        <input type="checkbox" checked /> Receive email reminders for due dates
      </label>
    </div>
  `, () => showToast('Settings saved!'));
}

function showNotificationsModal() {
  showModal('Notifications', `
    <ul style="list-style:none;font-size:15px;">
      <li style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
        <strong>📚 Reminder:</strong> "Atomic Habits" is due on May 24, 2026.
      </li>
      <li style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
        <strong>⚠️ Overdue:</strong> "Sapiens" was due May 4, 2026. Please return it.
      </li>
      <li style="padding:12px 0;color:#6b7280;">
        No more notifications.
      </li>
    </ul>
  `);
}

function showChangePasswordModal() {
  showModal('Change Password', `
    <div class="modal-form">
      <label>Current Password</label>
      <input type="password" placeholder="Enter current password" />
      <label>New Password</label>
      <input type="password" id="newPass" placeholder="Enter new password" />
      <label>Confirm New Password</label>
      <input type="password" id="confirmPass" placeholder="Confirm new password" />
    </div>
  `, () => {
    const np = document.getElementById('newPass')?.value;
    const cp = document.getElementById('confirmPass')?.value;
    if (!np) { showToast('Please enter a new password.'); return; }
    if (np !== cp) { showToast('Passwords do not match!'); return; }
    showToast('Password changed successfully!');
  });
}

function setupContactSupport() {
  const btn = document.getElementById('btn');
  // The last #btn in the sidebar is Contact Support
  const allBtns = document.querySelectorAll('#btn');
  allBtns.forEach(b => {
    if (b.textContent.trim() === 'Contact Support') {
      b.addEventListener('click', () => {
        showModal('Contact Support', `
          <div class="modal-form">
            <label>Subject</label>
            <input type="text" placeholder="Describe your issue briefly" />
            <label>Message</label>
            <textarea rows="4" placeholder="Write your message here..." style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;resize:none;font-size:14px;"></textarea>
          </div>
        `, () => showToast('Support message sent! We will get back to you within 24 hours.'));
      });
    }
  });
}


// ── 11. LOGOUT ───────────────────────────────────────────────

function logout() {
  showConfirm('Are you sure you want to logout?', () => {
    localStorage.removeItem('userLoggedIn');
    showToast('Logging out...');
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
  });
}


// ── 12. MODAL SYSTEM ─────────────────────────────────────────

/*
  Add this HTML just before </body> in user.html:

  <!-- Toast -->
  <div id="toastNotification" style="
    display:none;position:fixed;bottom:28px;right:28px;
    background:#1e293b;color:#fff;padding:14px 22px;
    border-radius:10px;font-size:15px;z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,0.25);
    max-width:360px;line-height:1.4;
  "></div>

  <!-- Confirm / Info Modal -->
  <div id="appModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);
    z-index:9998;display:none;align-items:center;justify-content:center;">
    <div style="background:#fff;border-radius:14px;padding:32px;max-width:540px;width:92%;
      max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
      <h3 id="modalTitle" style="font-size:22px;font-weight:800;margin-bottom:18px;color:#0b2e13;"></h3>
      <div id="modalBody"></div>
      <div id="modalActions" style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;"></div>
    </div>
  </div>
*/

function showModal(title, bodyHtml, onOk = null) {
  const modal   = document.getElementById('appModal');
  const mTitle  = document.getElementById('modalTitle');
  const mBody   = document.getElementById('modalBody');
  const mActs   = document.getElementById('modalActions');
  if (!modal) return;

  mTitle.textContent = title;
  mBody.innerHTML    = bodyHtml;
  mActs.innerHTML    = '';

  if (onOk) {
    const okBtn = document.createElement('button');
    okBtn.textContent = 'Save';
    okBtn.style.cssText = 'padding:10px 28px;background:#0b2e13;color:white;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;';
    okBtn.addEventListener('click', () => { onOk(); closeModal(); });
    mActs.appendChild(okBtn);
  }

  const closeBtn = document.createElement('button');
  closeBtn.textContent = onOk ? 'Cancel' : 'Close';
  closeBtn.style.cssText = 'padding:10px 28px;background:#e5e7eb;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;';
  closeBtn.addEventListener('click', closeModal);
  mActs.appendChild(closeBtn);

  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('appModal');
  if (modal) modal.style.display = 'none';
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('appModal');
  if (modal && e.target === modal) closeModal();
});

function showConfirm(message, onOk) {
  showModal('Confirm', `<p style="font-size:16px;color:#374151;">${escHtml(message)}</p>`, onOk);
}

let _toastTimer = null;
function showToast(message, duration = 3500) {
  const toast = document.getElementById('toastNotification');
  if (!toast) { console.info('[Toast]', message); return; }
  toast.textContent = message;
  toast.style.display = 'block';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { toast.style.display = 'none'; }, duration);
}


// ── 13. HELPERS ──────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}


// ── 14. MODAL CSS (injected automatically) ───────────────────
// Injects .modal-form styles so the edit/settings forms look clean
(function injectModalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .modal-form { display:flex; flex-direction:column; gap:8px; }
    .modal-form label { font-size:13px; font-weight:600; color:#374151; margin-top:6px; }
    .modal-form input, .modal-form select, .modal-form textarea {
      padding:10px 14px; border:1px solid #d1d5db; border-radius:8px;
      font-size:14px; outline:none; width:100%;
    }
    .modal-form input:focus, .modal-form select:focus, .modal-form textarea:focus {
      border-color:#0b2e13; box-shadow:0 0 0 2px rgba(11,46,19,0.1);
    }
    .on-hold { background:#fef3c7 !important; color:#92400e !important; }
  `;
  document.head.appendChild(style);
})();