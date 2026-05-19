// --- Global State ---
let currentUser = {};
let books = [];
let issuedBooks = [];
let userHolds = [];
let activityLog = [];

// Hardcoded Resources for Digital Content (Now Dynamic)
let resources = [];

async function fetchUserResources() {
    try {
        const res = await fetch('../admin/api_resources.php');
        resources = await res.json();
        renderResources(resources);
    } catch (err) {
        console.error("Error fetching resources:", err);
    }
}
fetchUserResources();

document.addEventListener('DOMContentLoaded', async () => {
    await fetchDashboardData();
    refreshAllUI();
});

async function fetchDashboardData() {
    try {
        // Fetch Profile
        let res = await fetch('api_user_profile.php');
        currentUser = await res.json();

        // Fetch Books Catalog
        res = await fetch('../admin/api_books.php');
        books = await res.json();

        // Fetch User's Borrow History
        res = await fetch('../admin/api_borrow.php');
        issuedBooks = await res.json();

        // Fetch User's Holds
        res = await fetch('api_user_actions.php?action=holds');
        userHolds = await res.json();

        // Generate Activity Log
        activityLog = [];
        issuedBooks.forEach(ib => {
            activityLog.push({
                type: ib.status === 'Pending' ? 'Borrowed' : 'Returned',
                book: ib.bookTitle,
                author: 'Catalog Book',
                date: ib.borrowDate,
                due: ib.status === 'Pending' ? ib.dueDate : '—',
                icon: ib.status === 'Pending' ? 'fa-book-open' : 'fa-rotate-left',
                statusClass: ib.status === 'Pending' ? 'borrowed' : 'returned'
            });
        });
        userHolds.forEach(uh => {
            activityLog.push({
                type: 'On Hold',
                book: uh.title,
                author: uh.author,
                date: uh.date,
                due: '—',
                icon: 'fa-bookmark',
                statusClass: 'hold'
            });
        });

        // Sort activity log by date (simple string sort for demo, should be proper date parsing)
        activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Setup Stats
        currentUser.borrowed = issuedBooks.filter(ib => ib.status === 'Pending').length;
        currentUser.favorites = issuedBooks.filter(ib => ib.status === 'Returned').length;
        currentUser.holds = userHolds.length;

    } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
    }
}

function refreshAllUI() {
    loadUserProfile();
    updateStats();
    searchBook('Catalog'); // Default view
    searchResources();
    updateHoldDisplay();
    renderRecentActivity();
    renderBooksBySubject();
}

function renderBooksBySubject() {
    const catContainer = document.getElementById('categoryBreakdownContainer');
    if (!catContainer) return;

    let categoryCounts = {};
    books.forEach(b => {
        const cat = b.category || 'Uncategorized';
        const copies = parseInt(b.copies) || 1;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + copies;
    });

    let catHtml = '';
    for (const [cat, count] of Object.entries(categoryCounts)) {
        catHtml += `
            <div class="category-pill" onclick="filterCatalog('${cat}')" style="cursor: pointer; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); padding: 10px 20px; border-radius: 50px; color: white; display: flex; align-items: center; gap: 10px; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.transform='scale(1)'">
                <span style="font-weight: bold;">${cat}</span>
                <span style="background: #f0a500; color: #111; padding: 2px 8px; border-radius: 20px; font-size: 12px; font-weight: 800;">${count}</span>
            </div>
        `;
    }
    if (catHtml === '') catHtml = '<div style="color: #999;">No books categorized yet.</div>';
    catContainer.innerHTML = catHtml;
}

function loadUserProfile() {
    if (currentUser.error) return; // Not logged in

    const safeSet = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    safeSet('userNameDisplay', currentUser.name);
    safeSet('userIdDisplay', currentUser.id);

    safeSet('infoFullName', currentUser.name);
    safeSet('infoEmail', currentUser.email);
    safeSet('infoPhone', currentUser.phone || 'N/A');
    safeSet('infoDept', currentUser.department || 'N/A');

    // Pre-fill settings form
    const ids = {
        'setDisplayName': currentUser.name,
        'setEmail': currentUser.email,
        'setPhone': currentUser.phone,
        'setDept': currentUser.department
    };
    for (let id in ids) {
        const el = document.getElementById(id);
        if (el) el.value = ids[id] || '';
    }

    // Populate Navbar Badge
    safeSet('navUserName', currentUser.name);
    safeSet('navUserId', currentUser.id);

    // Profile Pictures (Main Profile & Navbar)
    const profImg = document.getElementById('profileImage');
    const navImg = document.getElementById('navProfileImage');
    const navIcon = document.getElementById('navProfileIcon');
    
    if (currentUser.profile_picture && currentUser.profile_picture !== '') {
        const imgPath = '../' + currentUser.profile_picture;
        
        if (profImg) {
            profImg.src = imgPath;
            profImg.style.display = 'block';
            const mainIcon = document.querySelector('.avatar .fa-user');
            if (mainIcon) mainIcon.style.display = 'none';
        }
        
        if (navImg && navIcon) {
            navImg.src = imgPath;
            navImg.style.display = 'block';
            navIcon.style.display = 'none';
        }
    }
}

async function saveUserSettings(event) {
    event.preventDefault();
    const payload = {
        action: 'updateProfile',
        name: document.getElementById('setDisplayName').value.trim(),
        email: document.getElementById('setEmail').value.trim(),
        phone: document.getElementById('setPhone').value.trim(),
        department: document.getElementById('setDept').value.trim()
    };

    try {
        const res = await fetch('api_user_profile.php', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            alert('Profile updated successfully!');
            await fetchDashboardData();
            loadUserProfile();
        } else alert('Error: ' + data.error);
    } catch (e) { console.error(e); }
}

async function changeUserPassword(event) {
    event.preventDefault();
    const payload = {
        action: 'changePassword',
        currentPassword: document.getElementById('currPass').value,
        newPassword: document.getElementById('newPass').value
    };

    if (document.getElementById('newPass').value !== document.getElementById('confirmPass').value) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const res = await fetch('api_user_profile.php', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            alert('Password changed successfully!');
            event.target.reset();
        } else alert('Error: ' + data.error);
    } catch (e) { console.error(e); }
}

function updateStats() {
    const safeSet = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    safeSet('statBorrowed', currentUser.borrowed);
    safeSet('statPending', currentUser.holds);
    safeSet('statReturned', currentUser.favorites);
}

function renderBooks(booksToRender) {
    const grid = document.getElementById('bookGrid');
    if (!grid) return;

    if (booksToRender.length === 0) {
        grid.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">No books found.</div>';
        return;
    }

    grid.innerHTML = booksToRender.map(book => {
        const isDigital = book.isDigitalResource;
        const currentStatus = isDigital ? book.status : (book.status || 'Available');
        const isAvailable = currentStatus === 'Available' && parseInt(book.copies) > 0;
        
        const isCurrentlyBorrowing = !isDigital && issuedBooks.some(ib => ib.bookTitle === book.title && ib.status === 'Pending');
        const isOnHold = !isDigital && userHolds.some(h => h.title === book.title);

        return `
        <div class="resource-card">
            <div class="resource-cover">
                <span class="resource-tag">${isDigital ? 'Study Material' : 'Physical Book'}</span>
                <div class="cover-placeholder">
                    <i class="fa-solid ${isDigital ? 'fa-file-pdf' : 'fa-book'}"></i>
                </div>
                ${!isDigital && currentStatus === 'Borrowed' ? `<div class="borrowed-badge">Out of Stock</div>` : ''}
            </div>
            <div class="resource-card-info">
                <h4>${book.title}</h4>
                <p class="resource-author">${isDigital ? 'Course Material' : 'by ' + book.author}</p>
                <p class="resource-meta">
                    <i class="fa-solid ${isDigital ? 'fa-file-powerpoint' : (isAvailable ? 'fa-circle-check' : 'fa-circle-xmark')}"
                       style="color: ${isDigital ? '' : (isAvailable ? '#16a34a' : '#dc2626')}"></i>
                    ${isDigital ? book.format : (isAvailable ? 'Available' : 'Out of Stock')}
                </p>
                ${isDigital ? `
                    <button class="resource-action-btn" onclick="viewResource(${book.id})" style="border-color: #8b5cf6; color: #7c3aed; transition: all 0.3s;">
                        <i class="fa-solid fa-eye" style="color: #8b5cf6;"></i> View File
                    </button>
                ` : isCurrentlyBorrowing ? `
                    <button class="resource-action-btn" disabled style="background: #e2e8f0; color: #64748b; border: 1px solid #cbd5e1; cursor: not-allowed; transition: all 0.3s;">
                        <i class="fa-solid fa-clock"></i> Currently Borrowing
                    </button>
                ` : isOnHold ? `
                    <button class="resource-action-btn" disabled style="background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; cursor: not-allowed; transition: all 0.3s;">
                        <i class="fa-solid fa-bookmark"></i> On Waitlist
                    </button>
                ` : isAvailable ? `
                    <button id="btn-borrow-${book.id}" class="resource-action-btn btn-borrow" onclick="borrowBook(${book.id}, this)" style="transition: all 0.3s;">
                        <i class="fa-solid fa-book-reader"></i> Request Borrow
                    </button>
                ` : `
                    <button id="btn-hold-${book.id}" class="resource-action-btn btn-hold" onclick="placeHold(${book.id}, this)" style="transition: all 0.3s;">
                        <i class="fa-solid fa-bookmark"></i> Place Hold
                    </button>
                `}
            </div>
        </div>
    `}).join('');
}

function searchBook(context) {
    const typeEl = document.getElementById(context === 'Home' ? 'searchTypeHome' : 'categories');
    const inputEl = document.getElementById(context === 'Home' ? 'searchInputHome' : 'searchInputBooks');
    if (!typeEl || !inputEl) return;

    const query = (inputEl.value || '').trim().toLowerCase();
    const type = typeEl.value;

    let bookResults = [];
    let resResults = [];

    if (context === 'Home') {
        // Physical books search
        bookResults = books.filter(b => {
            if (!query) return false;
            const val = b[type] ? b[type].toString().toLowerCase() : '';
            return val.includes(query);
        });

        // Digital resources search
        resResults = resources.filter(res => {
            if (!query) return false;
            let val = '';
            if (type === 'title') val = res.title || '';
            else if (type === 'author') val = res.author || '';
            else if (type === 'subject') val = res.module || '';
            return val.toLowerCase().includes(query);
        }).map(res => ({ ...res, isDigitalResource: true }));
    } else {
        // Catalog search
        bookResults = books.filter(b => {
            const matchesQuery = b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query);
            const matchesCategory = !type || type === 'all' || type === 'All' || b.category === type;
            return matchesQuery && matchesCategory;
        });

        resResults = resources.filter(res => {
            const matchesQuery = res.title.toLowerCase().includes(query) || res.author.toLowerCase().includes(query);
            const matchesModule = !type || type === 'all' || type === 'All' || res.module === type;
            return matchesQuery && matchesModule;
        }).map(res => ({ ...res, isDigitalResource: true }));
    }

    let combined = [...bookResults, ...resResults];

    if (window._catalogFilterAvailable && context === 'Catalog') {
        combined = combined.filter(item => item.isDigitalResource || item.status === 'Available');
    }

    if (context === 'Home') renderHomeResults(combined);
    else renderBooks(combined);
}

function renderHomeResults(results) {
    const container = document.getElementById('homeSearchResults');
    if (!container) return;
    const query = document.getElementById('searchInputHome').value.trim();
    
    if (!query) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';

    if (results.length === 0) {
        container.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 20px; border-radius: 12px; text-align: center; margin-top: 15px; backdrop-filter: blur(8px);">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                No match found for "${query}"
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="home-search-results" style="margin-top: 20px; border-radius: 16px; animation: fadeInSlideUp 0.3s ease forwards;">
            <div class="search-results-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <h3 style="color: #f8fafc; margin: 0; font-size:18px; font-weight:600;"><i class="fa-solid fa-magnifying-glass-chart" style="color:#f0a500; margin-right:8px;"></i> Search Results (${results.length})</h3>
                <button onclick="clearHomeSearch()" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size:11px; font-weight:600; transition:all 0.2s;"><i class="fa-solid fa-xmark"></i> Clear</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                ${results.map(book => {
                    const isDigital = !!book.isDigitalResource;
                    const isAvailable = isDigital || book.status === 'Available' || parseInt(book.copies) > 0;
                    const statusText = isAvailable ? 'Available' : 'Out of Stock';
                    const badgeClass = isAvailable ? 'status-available' : 'status-borrowed';
                    return `
                        <div class="search-result-card" style="background: rgba(30, 41, 59, 0.55); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 15px; display: flex; gap: 12px; position: relative; transition: all 0.3s;">
                            <span class="card-badge ${badgeClass}" style="position: absolute; top: 12px; right: 12px; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px;">
                                ${statusText}
                            </span>
                            <div class="card-icon" style="width: 36px; height: 36px; border-radius: 8px; background: rgba(240, 165, 0, 0.15); border: 1px solid rgba(240, 165, 0, 0.3); color: #f0a500; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">
                                <i class="fa-solid ${isDigital ? 'fa-laptop-code' : 'fa-book'}"></i>
                            </div>
                            <div class="card-details" style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                                <h4 style="margin: 0 50px 0 0; font-size: 14px; font-weight: 700; color: #f8fafc; line-height: 1.3;">${book.title}</h4>
                                <p style="margin: 0; font-size: 12px; color: #94a3b8;">by ${book.author}</p>
                                <div style="display:flex; flex-direction:column; gap:2px; font-size: 11px; color: #cbd5e1; margin-top: 4px;">
                                    <span><strong>Type:</strong> ${isDigital ? 'Digital' : 'Physical Book'}</span>
                                    ${book.subject ? `<span><strong>Subject:</strong> ${book.subject}</span>` : ''}
                                    ${book.isbn ? `<span><strong>ISBN:</strong> ${book.isbn}</span>` : ''}
                                </div>
                                <div style="margin-top: 10px; display: flex; gap: 6px;">
                                    ${isDigital ? `
                                        <button onclick="viewResource(${book.id})" style="flex:1; padding: 5px; background: rgba(240, 165, 0, 0.2); border: 1px solid rgba(240, 165, 0, 0.4); color: #f0a500; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s;"><i class="fa-solid fa-file-arrow-down"></i> View / Download</button>
                                    ` : `
                                        <button onclick="borrowBook(${book.id})" ${!isAvailable ? 'disabled' : ''} style="flex:1; padding: 5px; background: ${isAvailable ? '#16a34a' : 'rgba(239, 68, 68, 0.15)'}; border: 1px solid ${isAvailable ? 'transparent' : 'rgba(239, 68, 68, 0.3)'}; color: ${isAvailable ? '#ffffff' : '#f87171'}; border-radius: 6px; cursor: ${isAvailable ? 'pointer' : 'not-allowed'}; font-size: 11px; font-weight: 600; transition: all 0.2s;"><i class="fa-solid fa-hand-holding-hand"></i> ${isAvailable ? 'Borrow Book' : 'Unavailable'}</button>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function clearHomeSearch() {
    const input = document.getElementById('searchInputHome');
    if (input) input.value = '';
    const container = document.getElementById('homeSearchResults');
    if (container) {
        container.innerHTML = '';
        container.style.display = 'none';
    }
}

async function borrowBook(bookId, btn) {
    const isDigital = resources.some(r => r.id === bookId);
    if (isDigital) {
        viewResource(bookId);
        return;
    }

    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
    }

    // Attempt to borrow physical book via API
    const borrowDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const payload = {
        action: 'issue',
        studentId: currentUser.id,
        bookId: bookId,
        borrowDate: borrowDate,
        dueDate: dueDate
    };

    try {
        const res = await fetch('../admin/api_borrow.php', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Requested';
                btn.style.background = '#16a34a';
                btn.style.color = 'white';
                btn.style.borderColor = '#16a34a';
            }
            showToast('Borrow request successful!', 'success');
            setTimeout(async () => {
                await fetchDashboardData();
                refreshAllUI();
            }, 1000);
        } else {
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-book-reader"></i> Request Borrow';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
            showToast('Error: ' + data.error, 'warning');
        }
    } catch (e) { 
        console.error(e);
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-book-reader"></i> Request Borrow';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }
}

async function placeHold(bookId, btn) {
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
    }

    try {
        const res = await fetch('api_user_actions.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'placeHold', bookId: bookId }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Waitlisted';
                btn.style.background = '#d97706';
                btn.style.color = 'white';
                btn.style.borderColor = '#d97706';
            }
            showToast('Hold placed successfully!', 'success');
            setTimeout(async () => {
                await fetchDashboardData();
                refreshAllUI();
            }, 1000);
        } else {
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Place Hold';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
            showToast('Error: ' + data.error, 'warning');
        }
    } catch (e) { 
        console.error(e);
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Place Hold';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }
}

async function cancelHold(holdId) {
    if (!confirm('Are you sure you want to cancel this hold?')) return;
    try {
        const res = await fetch('api_user_actions.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'cancelHold', holdId: holdId }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            showToast('Hold cancelled.', 'info');
            await fetchDashboardData();
            refreshAllUI();
        } else {
            showToast('Error: ' + data.error, 'warning');
        }
    } catch (e) { console.error(e); }
}

async function submitSupportTicket(event) {
    event.preventDefault();
    const payload = {
        action: 'submitTicket',
        subject: document.getElementById('supportSubject').value,
        message: document.getElementById('supportMessage').value
    };

    try {
        const res = await fetch('api_user_actions.php', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            alert('Your message has been sent to the admin team!');
            document.getElementById('supportModal').style.display = 'none';
            event.target.reset();
        } else alert('Error: ' + data.error);
    } catch (e) { console.error(e); }
}

// --- UI Helpers ---
function filterCatalog(filterType) {
    const categorySelect = document.getElementById('categories');
    if (filterType === 'available') {
        window._catalogFilterAvailable = true;
        if (categorySelect) categorySelect.value = 'all';
    } else if (filterType === 'all') {
        window._catalogFilterAvailable = false;
        if (categorySelect) categorySelect.value = 'all';
    } else {
        window._catalogFilterAvailable = false;
        if (categorySelect) categorySelect.value = filterType;
    }
    searchBook('Catalog');
}

function searchResources() {
    // Just map over the hardcoded resources array since it's digital content
    const query = (document.getElementById('resourceSearchInput')?.value || '').toLowerCase();
    const combined = resources.filter(r => r.title.toLowerCase().includes(query));
    renderResources(combined);
}

function renderResources(data) {
    const grid = document.getElementById('allResourcesGrid');
    if (!grid) return;
    grid.innerHTML = data.map(res => `
        <div class="resource-card">
            <div class="resource-cover"><span class="resource-tag">Study Material</span><i class="fa-solid fa-file-pdf"></i></div>
            <div class="resource-card-info">
                <h4>${res.title}</h4><p>Course Material</p>
                <button class="resource-action-btn" onclick="viewResource(${res.id})" style="border-color:#8b5cf6; color:#7c3aed;">
                    <i class="fa-solid fa-eye"></i> View File
                </button>
            </div>
        </div>
    `).join('');
}

function viewResource(id) {
    const res = resources.find(r => r.id === id);
    if (res && res.path) window.open(res.path, '_blank');
    else alert('Viewing resource...');
}

function updateHoldDisplay() {
    const grid = document.getElementById('activeHoldsGrid');
    if (!grid) return;
    if (document.getElementById('holdCountHeader')) document.getElementById('holdCountHeader').textContent = userHolds.length;

    if (userHolds.length === 0) {
        grid.innerHTML = '<div style="padding:40px;text-align:center;">You have no active holds.</div>';
    } else {
        grid.innerHTML = userHolds.map(hold => `
            <div class="hold-item-card">
                <div class="hold-item-info">
                    <span class="hold-status-tag ${hold.status === 'Ready' ? 'ready' : 'queue'}">${hold.status}</span>
                    <h4>${hold.title}</h4>
                    <button class="hold-cancel-btn" onclick="cancelHold('${hold.id}')">Cancel Hold</button>
                </div>
            </div>
        `).join('');
    }
}

function renderRecentActivity() {
    const tbody = document.getElementById('recentActivityBody');
    if (!tbody) return;
    tbody.innerHTML = activityLog.map(act => `
        <tr>
            <td><i class="fa-solid ${act.icon}"></i></td>
            <td><div>${act.book}</div></td>
            <td>${act.date}</td>
            <td>${act.due}</td>
            <td><span class="activity-badge ${act.statusClass}">${act.type}</span></td>
        </tr>
    `).join('');
}

function navigateToSection(sectionId) {
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `pane-${sectionId}`) pane.classList.add('active');
    });
}

function contactSupport() { document.getElementById('supportModal').style.display = 'flex'; }
function closeSupportModal() { document.getElementById('supportModal').style.display = 'none'; }
function toggleMenu() { document.getElementById('sidebar').classList.toggle('active'); }

function showToast(message, type = 'success') {
    alert(message); // Simplified for integration script
}
