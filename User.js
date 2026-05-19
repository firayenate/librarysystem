// --- Mock Data & Initial State ---
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    id: 'LIB123456789',
    name: 'Firaol Tadesse',
    email: 'firaol.tadesse@example.com',
    phone: '+2519356394',
    dob: 'January 15, 2002',
    gender: 'Male',
    department: 'Computer Science',
    address: {
        street: 'Bole Road, Near Edna Mall',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        country: 'Ethiopia',
        postal: '1000'
    },
    borrowed: 7,
    holds: 2,
    favorites: 5,
    recent: 3
};

function contactSupport() {
    document.getElementById('supportModal').style.display = 'flex';
}

function closeSupportModal() {
    document.getElementById('supportModal').style.display = 'none';
}

function submitSupportTicket(event) {
    event.preventDefault();
    const subject = document.getElementById('supportSubject').value.trim();
    const message = document.getElementById('supportMessage').value.trim();

    const ticket = {
        id: 'TKT' + Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        subject: subject,
        message: message,
        date: new Date().toLocaleString(),
        status: 'Pending'
    };

    // Save to global support list (simulated admin inbox)
    let tickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
    tickets.push(ticket);
    localStorage.setItem('supportTickets', JSON.stringify(tickets));

    alert('Your message has been sent to the admin team!');
    closeSupportModal();
    
    // Clear form
    document.getElementById('supportSubject').value = '';
    document.getElementById('supportMessage').value = '';
}

let books = JSON.parse(localStorage.getItem('libraryBooks')) || [
    { id: 1, title: 'Introduction to Algorithms', author: 'Cormen et al.', category: 'DAA', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/41T07nqZneL._SX396_BO1,204,203,200_.jpg' },
    { id: 2, title: 'Clean Code', author: 'Robert C. Martin', category: 'Web Development', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg' },
    { id: 3, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Web Development', status: 'Borrowed', cover: 'https://images-na.ssl-images-amazon.com/images/I/41HInlou71L._SX396_BO1,204,203,200_.jpg' },
    { id: 4, title: 'Design Patterns', author: 'Gang of Four', category: 'Web Development', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/51szD9HC9pL._SX395_BO1,204,203,200_.jpg' },
    { id: 5, title: 'OpenGL Programming Guide', author: 'Khronos Group', category: 'Computer Graphics', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/416H7tK7rML._SX379_BO1,204,203,200_.jpg' },
    { id: 6, title: 'Artificial Intelligence', author: 'Russell & Norvig', category: 'DAA', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/517684-mKmL._SX388_BO1,204,203,200_.jpg' },
    { id: 7, title: 'You Don\'t Know JS', author: 'Kyle Simpson', category: 'Web Development', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/41-reA+C31L._SX331_BO1,204,203,200_.jpg' },
    { id: 8, title: 'Computer Graphics: Principles', author: 'Hughes et al.', category: 'Computer Graphics', status: 'Available', cover: 'https://via.placeholder.com/100x140?text=Graphics' }
];

// --- Initialize Page ---
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    updateStats();
    renderBooks(books);
});

// --- User Profile ---
function loadUserProfile() {
    const safeSet = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    safeSet('userNameDisplay', currentUser.name);
    safeSet('userIdDisplay', currentUser.id);

    // Profile Image
    const profileImg = document.getElementById('profileImage');
    const avatarPlaceholder = document.querySelector('#userAvatar i');
    if (currentUser.profilePic) {
        if (profileImg) {
            profileImg.src = currentUser.profilePic;
            profileImg.style.display = 'block';
        }
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
    } else {
        if (profileImg) profileImg.style.display = 'none';
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'block';
    }

    // Fill the detailed info table and sections
    safeSet('infoFullName', currentUser.name);
    safeSet('infoEmail', currentUser.email);
    safeSet('infoPhone', currentUser.phone || '+251 92 654 478');
    safeSet('infoDOB', currentUser.dob || 'January 15, 2002');
    safeSet('infoGender', currentUser.gender || 'Male');
    safeSet('infoDept', currentUser.department || 'Computer Science');

    // Address Info
    if (currentUser.address) {
        safeSet('infoStreet', currentUser.address.street);
        safeSet('infoCity', currentUser.address.city);
        safeSet('infoRegion', currentUser.address.region);
        safeSet('infoCountry', currentUser.address.country);
        safeSet('infoPostal', currentUser.address.postal);
    }

    // Pre-fill settings form
    const ids = {
        'setDisplayName': currentUser.name,
        'setEmail': currentUser.email,
        'setPhone': currentUser.phone,
        'setDOB': currentUser.dob,
        'setGender': currentUser.gender,
        'setDept': currentUser.department,
        'setStreet': currentUser.address?.street,
        'setCity': currentUser.address?.city,
        'setRegion': currentUser.address?.region,
        'setCountry': currentUser.address?.country,
        'setPostal': currentUser.address?.postal
    };

    for (let id in ids) {
        const el = document.getElementById(id);
        if (el) el.value = ids[id] || '';
    }

    // Membership Card
    safeSet('membershipType', currentUser.membershipType || 'Regular Member');
    const statusBtn = document.getElementById('memberStatusBtn');
    if (statusBtn) statusBtn.textContent = (currentUser.status || 'Active') + ' Member';
}

// --- Profile Upload ---
function triggerProfileUpload() {
    document.getElementById('profileUpload').click();
}

function handleProfileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const result = e.target.result;
        currentUser.profilePic = result;
        saveState();
        loadUserProfile();
        alert('Profile picture updated successfully!');
    };
    reader.readAsDataURL(file);
}

// --- Settings & Password Logic ---
function saveUserSettings(event) {
    event.preventDefault();
    
    // Personal Info
    currentUser.name = document.getElementById('setDisplayName').value.trim();
    currentUser.email = document.getElementById('setEmail').value.trim();
    currentUser.phone = document.getElementById('setPhone').value.trim();
    currentUser.dob = document.getElementById('setDOB').value.trim();
    currentUser.gender = document.getElementById('setGender').value;
    currentUser.department = document.getElementById('setDept').value.trim();

    // Address Info
    if (!currentUser.address) currentUser.address = {};
    currentUser.address.street = document.getElementById('setStreet').value.trim();
    currentUser.address.city = document.getElementById('setCity').value.trim();
    currentUser.address.region = document.getElementById('setRegion').value.trim();
    currentUser.address.country = document.getElementById('setCountry').value.trim();
    currentUser.address.postal = document.getElementById('setPostal').value.trim();

    saveState();
    loadUserProfile();
    alert('Profile and address updated successfully!');
}

function changeUserPassword(event) {
    event.preventDefault();
    const curr = document.getElementById('currPass').value;
    const nPass = document.getElementById('newPass').value;
    const cPass = document.getElementById('confirmPass').value;

    const savedPassword = localStorage.getItem('userPassword') || 'student123'; // Default for demo

    if (curr !== savedPassword) {
        alert('Incorrect current password.');
        return;
    }

    if (nPass !== cPass) {
        alert('New passwords do not match.');
        return;
    }

    if (nPass.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }

    localStorage.setItem('userPassword', nPass);
    alert('Password updated successfully!');
    event.target.reset();
}

function toggleEditMode(sectionId) {
    // Simple toggle for demo - could swap P for INPUT tags
    const section = document.getElementById(sectionId);
    if (sectionId === 'personal-info') {
        const settingsSection = document.getElementById('settings');
        if (settingsSection) settingsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// --- Dashboard Stats ---
function updateStats() {
    const safeSet = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    safeSet('statBorrowed', currentUser.borrowed);
    safeSet('statPending', currentUser.holds);
    safeSet('statReturned', currentUser.favorites);
    // countRecent is for searches
}

// --- Book Catalog Rendering ---
function renderBooks(booksToRender) {
    const grid = document.getElementById('bookGrid');
    if (!grid) return;

    // Filter out any corrupted test data like 'zdzfvh'
    const validBooks = booksToRender.filter(b => b && b.title && b.title !== 'zdzfvh');

    if (validBooks.length === 0) {
        grid.innerHTML = '<div class="no-results" style="padding: 40px; text-align: center; width: 100%; color: #666;">No books found in the catalog.</div>';
        return;
    }

    grid.innerHTML = validBooks.map(book => {
        const isDigital = book.isDigitalResource;
        const status = isDigital ? book.status : (book.status || 'Available');
        const title = book.title || 'Untitled Book';
        const author = book.author || 'Unknown';
        const cover = book.cover || '';
        // An item is considered a book if it's NOT digital, OR if it's an E-Book
        const isBook = !isDigital || (book.type && book.type.toLowerCase().includes('book'));
        const currentStatus = isBook ? (book.status || 'Available') : book.status;
        const isAvailable = currentStatus === 'Available';
        const isBorrowedByMe = currentStatus === 'Borrowed' && book.borrowedBy === 'currentUser';
        const isBorrowedByOther = currentStatus === 'Borrowed' && book.borrowedBy !== 'currentUser';

        return `
        <div class="resource-card">
            <div class="resource-cover">
                <span class="resource-tag">${isBook ? 'Physical Book' : 'Study Material'}</span>
                <div class="cover-placeholder">
                    ${cover ? `<img src="${cover}" alt="${title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'fa-solid fa-book\'></i>'">` : `<i class="fa-solid ${isBook ? 'fa-book' : 'fa-file-pdf'}"></i>`}
                </div>
                ${isBook && currentStatus === 'Borrowed' ? `<div class="borrowed-badge">Borrowed</div>` : ''}
            </div>
            <div class="resource-card-info">
                <h4>${title}</h4>
                <p class="resource-author">${!isBook ? 'Course Material' : 'by ' + author}</p>
                <p class="resource-meta">
                    <i class="fa-solid ${!isBook ? 'fa-file-powerpoint' : (isAvailable ? 'fa-circle-check' : 'fa-circle-xmark')}"
                       style="color: ${!isBook ? '' : (isAvailable ? '#16a34a' : '#dc2626')}"></i>
                    ${!isBook ? (book.format || book.type || 'PPT') : currentStatus}
                </p>
                ${book.format === 'Video' || book.type === 'Video' ? `
                    <button class="resource-action-btn" onclick="viewResource(${book.id})" style="border-color: #8b5cf6; color: #7c3aed;">
                        <i class="fa-solid fa-circle-play" style="color: #8b5cf6;"></i> Watch Now
                    </button>
                ` : isAvailable ? `
                    <button class="resource-action-btn btn-borrow" onclick="borrowBook(${book.id})">
                        <i class="fa-solid fa-book-reader"></i> Borrow Book
                    </button>
                ` : isBorrowedByMe ? `
                    <button class="resource-action-btn btn-return" onclick="returnBook(${book.id})">
                        <i class="fa-solid fa-rotate-left"></i> Return Book
                    </button>
                ` : `
                    <button class="resource-action-btn btn-hold" onclick="placeHold(${book.id})">
                        <i class="fa-solid fa-bookmark"></i> Place Hold
                    </button>
                `}
            </div>

        </div>
    `}).join('');
}

function getCoverClass(category) {
    const cat = category ? category.toLowerCase() : '';
    if (cat.includes('e-book')) return 'ebook-cover';
    if (cat.includes('journal')) return 'journal-cover';
    if (cat.includes('textbook')) return 'study-cover';
    return 'web-cover';
}

function getTagClass(category) {
    const cat = category ? category.toLowerCase() : '';
    if (cat.includes('e-book')) return 'ebook-tag';
    if (cat.includes('journal')) return 'journal-tag';
    if (cat.includes('textbook')) return 'study-tag';
    return 'web-tag';
}

// --- Search Logic (The Core Fix) ---
function searchBook(context) {
    console.log("Universal search triggered for:", context);
    
    const typeEl = document.getElementById(context === 'Home' ? 'searchTypeHome' : 'categories');
    const inputEl = document.getElementById(context === 'Home' ? 'searchInputHome' : 'searchInputBooks');
    const resultsContainer = document.getElementById(context === 'Home' ? 'homeSearchResults' : 'bookGrid');

    if (!typeEl || !inputEl || !resultsContainer) return;

    const query = (inputEl.value || '').toLowerCase();
    const type = typeEl.value; 

    // 1. Filter Physical Books
    let bookResults = books.filter(b => {
        const matchesQuery = b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query);
        const matchesCategory = !type || type === 'all' || type === 'All' || b.category === type;
        return matchesQuery && matchesCategory;
    });

    // 2. Filter Digital Resources
    let resResults = resources.filter(res => {
        const matchesQuery = res.title.toLowerCase().includes(query) || res.author.toLowerCase().includes(query);
        const matchesModule = !type || type === 'all' || type === 'All' || res.module === type;
        return matchesQuery && matchesModule;
    }).map(res => ({
        id: res.id,
        title: res.title,
        author: res.author,
        category: res.module,
        status: res.status || 'Available',
        borrowedBy: res.borrowedBy || null,
        format: res.format,
        cover: '',
        isDigitalResource: true,
        type: res.type,
        path: res.path
    }));

    let combined = [...bookResults, ...resResults];

    // Handle 'Available' filter flag
    if (window._catalogFilterAvailable && context === 'Catalog') {
        combined = combined.filter(item => item.isDigitalResource || item.status === 'Available');
    }

    if (context === 'Home') {
        renderHomeResults(combined);
    } else {
        renderBooks(combined);
        const browseSection = document.getElementById('Browse');
        if (browseSection && query) browseSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function renderHomeResults(results) {
    const container = document.getElementById('homeSearchResults');
    if (!container) return;

    const query = document.getElementById('searchInputHome').value.trim();

    container.style.display = 'block';
    container.style.minHeight = '100px';
    container.style.zIndex = '1000';

    if (results.length === 0) {
        container.innerHTML = `
            <div class="home-no-results" style="margin-top: 20px; padding: 20px; background-color: #7f1d1d; color: white; border-radius: 12px; text-align: center; border: 2px solid white;">
                <i class="fa-solid fa-circle-exclamation"></i> Sorry, no book found matching "${query}"
            </div>`;
        return;
    }

    // Helper to highlight matching text
    const highlight = (text, q) => {
        if (!q) return text;
        const regex = new RegExp(`(${q})`, 'gi');
        return text.replace(regex, '<span style="background-color: #fef08a; color: #111; font-weight: bold; padding: 0 2px; border-radius: 2px;">$1</span>');
    };

    container.innerHTML = `
        <div class="home-results-grid" style="display: flex; flex-direction: column; gap: 15px; background: rgba(0, 0, 0, 0.7); padding: 25px; border-radius: 15px; backdrop-filter: blur(10px); margin-top: 20px; border: 1px solid rgba(255,255,255,0.2);">
            <h3 style="color: white; margin-bottom: 10px;">Books matching "${query}" (${results.length})</h3>
            ${results.map(book => `
                <div class="home-book-card" style="display: flex; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                    <img src="${book.cover}" alt="${book.title}" style="width: 100px; height: 140px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/100x140?text=No+Cover'">
                    <div class="home-book-details" style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <h4 style="margin: 0; color: #111; font-size: 18px;">${highlight(book.title, query)}</h4>
                            <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Author:</strong> ${highlight(book.author, query)}</p>
                            <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Category:</strong> ${book.category}</p>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                            <span style="font-weight: bold; font-size: 14px; color: ${book.status === 'Available' ? '#16a34a' : '#dc2626'}">${book.status}</span>
                            <button onclick="borrowBook(${book.id})" 
                                    style="padding: 8px 16px; background: #064e3b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;"
                                    ${book.status !== 'Available' ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>
                                ${book.status === 'Available' ? 'Borrow' : 'Borrowed'}
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// --- Borrowing Logic ---
function borrowBook(bookId) {
    let book = books.find(b => b.id === bookId);
    if (!book) book = resources.find(r => r.id === bookId);
    
    const currentStatus = book ? (book.status || 'Available') : null;
    if (!book || currentStatus !== 'Available') return;

    book.status = 'Borrowed';
    book.borrowedBy = 'currentUser';
    currentUser.borrowed = (currentUser.borrowed || 0) + 1;
    currentUser.recent = (currentUser.recent || 0) + 1;

    activityLog.unshift({
        type: 'Borrowed',
        book: book.title,
        author: book.author,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        due: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        icon: 'fa-book-open',
        statusClass: 'borrowed'
    });

    saveState();
    refreshAllUI();
    showToast(`✅ You borrowed "<strong>${book.title}</strong>" — Due in 14 days!`, 'success');
}

function returnBook(bookId) {
    let book = books.find(b => b.id === bookId);
    if (!book) book = resources.find(r => r.id === bookId);
    
    const currentStatus = book ? (book.status || 'Available') : null;
    if (!book || currentStatus !== 'Borrowed' || book.borrowedBy !== 'currentUser') return;

    book.status = 'Available';
    book.borrowedBy = null;
    currentUser.borrowed = Math.max(0, (currentUser.borrowed || 1) - 1);

    activityLog.unshift({
        type: 'Returned',
        book: book.title,
        author: book.author,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        due: '—',
        icon: 'fa-rotate-left',
        statusClass: 'returned'
    });

    saveState();
    refreshAllUI();
    showToast(`📚 "<strong>${book.title}</strong>" has been returned successfully!`, 'info');
}

function placeHold(bookId) {
    let book = books.find(b => b.id === bookId);
    if (!book) book = resources.find(r => r.id === bookId);
    
    if (!book) return;

    const alreadyOnHold = userHolds.find(h => h.bookId === bookId);
    if (alreadyOnHold) {
        showToast(`⚠️ You already have a hold on "<strong>${book.title}</strong>"`, 'warning');
        return;
    }

    userHolds.push({
        id: `H${Date.now()}`,
        bookId: book.id,
        title: book.title,
        author: book.author,
        status: 'In Queue',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        cover: book.cover || ''
    });

    activityLog.unshift({
        type: 'On Hold',
        book: book.title,
        author: book.author,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        due: '—',
        icon: 'fa-bookmark',
        statusClass: 'hold'
    });

    saveState();
    refreshAllUI();
    showToast(`🔖 Hold placed on "<strong>${book.title}</strong>". You'll be notified when available!`, 'info');
}

// --- Toast Notification ---
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; z-index: 9999;
            display: flex; flex-direction: column; gap: 12px;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        success: { bg: '#f0fdf4', border: '#16a34a', icon: '#16a34a' },
        info:    { bg: '#eff6ff', border: '#2563eb', icon: '#2563eb' },
        warning: { bg: '#fffbeb', border: '#d97706', icon: '#d97706' }
    };
    const c = colors[type] || colors.success;

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${c.bg}; border: 1.5px solid ${c.border}; color: #1e293b;
        padding: 16px 20px; border-radius: 14px; font-size: 14px; font-weight: 500;
        font-family: 'Inter', sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        max-width: 360px; animation: slideInToast 0.3s ease;
        display: flex; align-items: center; gap: 12px;
    `;
    toast.innerHTML = `<span style="color:${c.icon}; font-size:20px;">●</span><span>${message}</span>`;
    container.appendChild(toast);

    // Add animation keyframes once
    if (!document.getElementById('toastKeyframes')) {
        const style = document.createElement('style');
        style.id = 'toastKeyframes';
        style.textContent = `
            @keyframes slideInToast {
                from { opacity: 0; transform: translateX(40px); }
                to   { opacity: 1; transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}


// --- Navigation Logic ---
function navigateToSection(sectionId) {
    console.log("Navigating to section:", sectionId);

    // Update sidebar active state
    const buttons = document.querySelectorAll('.sidebar-buttons button');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${sectionId}'`)) {
            btn.classList.add('active-nav');
        } else {
            btn.classList.remove('active-nav');
        }
    });

    // Handle Tab switching for Profile Dashboard
    const panes = document.querySelectorAll('.tab-pane');
    let foundTab = false;
    panes.forEach(pane => {
        if (pane.id === `pane-${sectionId}` || (sectionId === 'myprofile' && pane.id === 'pane-myprofile')) {
            pane.classList.add('active');
            foundTab = true;
        } else {
            pane.classList.remove('active');
        }
    });

    // If it's a separate section on the page (not in tabs)
    const target = document.getElementById(sectionId);
    if (target && !foundTab) {
        target.scrollIntoView({ behavior: 'smooth' });
    } else if (foundTab) {
        // Scroll to top of middle section if we switched tabs
        document.querySelector('.middle').scrollIntoView({ behavior: 'smooth' });
    }
}

// --- Resource Data ---
let resources = [
    // DAA Category
    { id: 1, title: 'Introduction to DAA', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '327 KB', icon: 'fa-file-powerpoint', path: 'files/DAA/1 Intoduction (2).ppt', module: 'DAA' },
    { id: 2, title: 'Analysis of Algorithms', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '624 KB', icon: 'fa-file-powerpoint', path: 'files/DAA/2 Analysis of algorithm (2).ppt', module: 'DAA' },
    { id: 3, title: 'Graph Theory', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '438 KB', icon: 'fa-file-powerpoint', path: 'files/DAA/3 Graph.ppt', module: 'DAA' },
    { id: 4, title: 'Divide & Conquer', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '335 KB', icon: 'fa-file-powerpoint', path: 'files/DAA/4 Divide Conquer.ppt', module: 'DAA' },
    { id: 5, title: 'Greedy Algorithms', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '175 KB', icon: 'fa-file-powerpoint', path: 'files/DAA/5 Greedy.ppt', module: 'DAA' },
    { id: 6, title: 'Dynamic Programming', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '225 KB', icon: 'fa-file-powerpoint', path: 'files/DAA/6 Dynamic programming.ppt', module: 'DAA' },
    { id: 7, title: 'Backtracking', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '209 KB', icon: 'fa-file-powerpoint', path: 'files/DAA/7 BackTrack.ppt', module: 'DAA' },
    
    // Web Category
    { id: 8, title: 'Web Development Ch 1', author: 'Web Dept', type: 'Study Material', format: 'PPTX', size: '915 KB', icon: 'fa-file-powerpoint', path: 'files/web/Chapter 1.pptx', module: 'Web Development' },
    { id: 9, title: 'HTML Essentials', author: 'Web Dept', type: 'Study Material', format: 'PPTX', size: '745 KB', icon: 'fa-file-powerpoint', path: 'files/web/Ch 2 HTML.pptx', module: 'Web Development' },
    { id: 10, title: 'CSS Styling', author: 'Web Dept', type: 'Study Material', format: 'PPTX', size: '877 KB', icon: 'fa-file-powerpoint', path: 'files/web/Ch 3 CSS.pptx', module: 'Web Development' },
    { id: 11, title: 'JavaScript Logic', author: 'Web Dept', type: 'Study Material', format: 'PPT', size: '5.3 MB', icon: 'fa-file-powerpoint', path: 'files/web/Ch 4 JavaScript.ppt', module: 'Web Development' },
    { id: 12, title: 'Web Development Ch 5', author: 'Web Dept', type: 'Study Material', format: 'PPT', size: '1.8 MB', icon: 'fa-file-powerpoint', path: 'files/web/Chapter Five (2).ppt', module: 'Web Development' },
    { id: 13, title: 'Web Development Ch 6', author: 'Web Dept', type: 'Study Material', format: 'PPTX', size: '1.9 MB', icon: 'fa-file-powerpoint', path: 'files/web/Chapter 6 (2).pptx', module: 'Web Development' },
    { id: 14, title: 'Course Outline', author: 'Library Admin', type: 'E-Book', format: 'PDF', size: '185 KB', icon: 'fa-file-pdf', path: 'files/web/Course Outline.pdf', module: 'Web Development' },
    
    // Graphics Category
    { id: 15, title: 'Computer Graphics Ch 1', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '560 KB', icon: 'fa-file-powerpoint', path: 'files/graphics/chap1 (9).ppt', module: 'Computer Graphics' },
    { id: 16, title: 'Computer Graphics Ch 2', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '363 KB', icon: 'fa-file-powerpoint', path: 'files/graphics/chap2 (9).ppt', module: 'Computer Graphics' },
    { id: 17, title: 'Computer Graphics Ch 3', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '571 KB', icon: 'fa-file-powerpoint', path: 'files/graphics/chap3 (6).ppt', module: 'Computer Graphics' },
    { id: 18, title: 'Computer Graphics Ch 4', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '550 KB', icon: 'fa-file-powerpoint', path: 'files/graphics/chap4 (5).ppt', module: 'Computer Graphics' },
    { id: 19, title: 'Computer Graphics Ch 6', author: 'Course Material', type: 'Study Material', format: 'PPT', size: '454 KB', icon: 'fa-file-powerpoint', path: 'files/graphics/chap 6 (2).ppt', module: 'Computer Graphics' },
    { id: 20, title: 'OpenGL Programming Guide', author: 'Khronos Group', type: 'E-Book', format: 'PDF', size: '35.4 MB', icon: 'fa-file-pdf', path: 'files/graphics/opengl book (2).pdf', module: 'Computer Graphics' },
    { id: 21, title: 'Computer Graphics Tutorials', author: 'YouTube Series', type: 'Video', format: 'Video', size: 'Playlist', icon: 'fa-circle-play', path: 'https://www.youtube.com/watch?v=Jv52kWUUCng&list=PLzfVsIhtvVY2dCi7RK4VGhSbrFHzSPz6A&index=23', module: 'Computer Graphics' }
];

let userHolds = JSON.parse(localStorage.getItem('userHolds')) || [
    { id: 'H1', bookId: 3, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', status: 'In Queue', date: 'May 08, 2026', cover: 'https://images-na.ssl-images-amazon.com/images/I/41HInlou71L._SX396_BO1,204,203,200_.jpg' }
];

let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [
    { type: 'Borrowed', book: 'Atomic Habits', author: 'James Clear', date: 'May 10, 2026', due: 'May 24, 2026', icon: 'fa-book-open', statusClass: 'borrowed' },
    { type: 'On Hold', book: 'The Alchemist', author: 'Paulo Coelho', date: 'May 08, 2026', due: '—', icon: 'fa-bookmark', statusClass: 'hold' }
];

// --- Initialize Page ---
document.addEventListener('DOMContentLoaded', () => {
    // Data Cleanup & Migration: Ensure books match the new module categories
    let savedBooks = JSON.parse(localStorage.getItem('libraryBooks'));
    if (savedBooks) {
        // Migration: If any book has old categories (like Textbook), remap them
        books = savedBooks.filter(b => b.title && b.title !== 'zdzfvh' && !b.title.includes('zdzfvh')).map(b => {
            if (b.category === 'Textbook' || b.category === 'Reference' || b.category === 'Research') {
                if (b.title.toLowerCase().includes('algorithm')) b.category = 'DAA';
                else if (b.title.toLowerCase().includes('opengl') || b.title.toLowerCase().includes('graphics')) b.category = 'Computer Graphics';
                else b.category = 'Web Development'; // Default for others
            }
            return b;
        });
        localStorage.setItem('libraryBooks', JSON.stringify(books));
    }

    loadUserProfile();
    refreshAllUI();
});

function refreshAllUI() {
    updateStats();
    searchBook('Catalog'); // Use universal search for default view
    searchResources();     // Use universal search for resources
    updateHoldDisplay();
    renderRecentActivity();
}

function saveState() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('libraryBooks', JSON.stringify(books));
    localStorage.setItem('userHolds', JSON.stringify(userHolds));
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
}

function renderRecentActivity() {
    const tbody = document.getElementById('recentActivityBody');
    if (!tbody) return;

    tbody.innerHTML = activityLog.map(act => `
        <tr>
            <td>
                <div class="activity-icon-cell">
                    <i class="fa-solid ${act.icon}"></i>
                </div>
            </td>
            <td>
                <div class="book-title">${act.book}</div>
                <div class="book-author">${act.author}</div>
            </td>
            <td>${act.date}</td>
            <td>${act.due}</td>
            <td><span class="activity-badge ${act.statusClass}">${act.type}</span></td>
        </tr>
    `).join('');
}

// --- Catalog Filtering Logic ---
function filterCatalog(filterType) {
    // Update active button UI
    const buttons = document.querySelectorAll('.qf-btn');
    buttons.forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`'${filterType}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

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

    document.getElementById('searchInputBooks').value = '';
    searchBook('Catalog');
}

// --- Resources Logic ---
function renderResources(data) {
    const grid = document.getElementById('allResourcesGrid');
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = '<div class="no-results" style="grid-column: 1/-1; padding: 40px; text-align: center; color: #666;">No resources found matching your criteria.</div>';
        return;
    }

    grid.innerHTML = data.map(res => {
        // A physical book = has isCatalogBook flag OR type is 'Physical Book' OR type is 'E-Book'
        const isBook = res.isCatalogBook === true || res.type === 'Physical Book' || (res.type && res.type.toLowerCase().includes('book'));
        const status = res.status || 'Available';
        const isAvailable = status === 'Available';
        const isBorrowedByMe = status === 'Borrowed' && res.borrowedBy === 'currentUser';
        const isBorrowedByOther = status === 'Borrowed' && res.borrowedBy !== 'currentUser';

        return `
        <div class="resource-card">
            <div class="resource-cover">
                <span class="resource-tag">${isBook ? 'Physical Book' : 'Study Material'}</span>
                <div class="cover-placeholder">
                    <i class="fa-solid ${isBook ? 'fa-book' : (res.format === 'Video' ? 'fa-circle-play' : 'fa-file-pdf')}"></i>
                </div>
                ${isBook && status === 'Borrowed' ? `<div class="borrowed-badge">Borrowed</div>` : ''}
            </div>
            <div class="resource-card-info">
                <h4>${res.title}</h4>
                <p class="resource-author">${isBook ? 'by ' + res.author : 'Course Material'}</p>
                <p class="resource-meta">
                    <i class="fa-solid ${isBook ? (isAvailable ? 'fa-circle-check' : 'fa-circle-xmark') : 'fa-file-powerpoint'}"
                       style="color: ${isBook ? (isAvailable ? '#16a34a' : '#dc2626') : ''}"></i>
                    ${isBook ? status : res.format + ' ' + (res.size || '')}
                </p>
                ${res.format === 'Video' || res.type === 'Video' ? `
                    <button class="resource-action-btn" onclick="viewResource(${res.id})" style="border-color: #8b5cf6; color: #7c3aed;">
                        <i class="fa-solid fa-circle-play" style="color: #8b5cf6;"></i> Watch Now
                    </button>
                ` : isAvailable ? `
                    <button class="resource-action-btn btn-borrow" onclick="borrowBook(${res.id})">
                        <i class="fa-solid fa-book-reader"></i> Borrow Book
                    </button>
                ` : isBorrowedByMe ? `
                    <button class="resource-action-btn btn-return" onclick="returnBook(${res.id})">
                        <i class="fa-solid fa-rotate-left"></i> Return Book
                    </button>
                ` : `
                    <button class="resource-action-btn btn-hold" onclick="placeHold(${res.id})">
                        <i class="fa-solid fa-bookmark"></i> Place Hold
                    </button>
                `}
            </div>
        </div>
    `}).join('');
}

function searchResources() {
    const query = document.getElementById('resourceSearchInput').value.toLowerCase();
    const module = document.getElementById('resourceTypeSelect').value;
    const format = document.getElementById('resourceFormatSelect').value;
    const sort = document.getElementById('resourceSortSelect').value;

    // Filter digital resources
    let filteredRes = resources.filter(res => {
        const matchesQuery = res.title.toLowerCase().includes(query) || res.author.toLowerCase().includes(query);
        const matchesModule = module === 'All' || res.module === module;
        const matchesFormat = format === 'All' || res.format === format;
        return matchesQuery && matchesModule && matchesFormat;
    });

    // Always merge in catalog books that match the module/query (books always shown)
    let mappedBooks = books.filter(b => {
        const matchesQuery = !query || b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query);
        const matchesModule = module === 'All' || b.category === module;
        return matchesQuery && matchesModule;
    }).map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        type: 'Physical Book',
        format: 'Book',
        size: b.status,
        icon: 'fa-book',
        path: null,
        module: b.category,
        isCatalogBook: true,
        status: b.status
    }));

    // Books first, then digital resources
    let combined = [...mappedBooks, ...filteredRes];

    // Handle 'Available' filter toggle
    if (window._resourceFilterAvailable) {
        combined = combined.filter(item => !item.isCatalogBook || item.status === 'Available');
    }

    if (sort === 'popular') {
        combined.sort((a, b) => b.id - a.id);
    }

    renderResources(combined);
}

function filterResources(moduleName) {
    // Update button UI
    const buttons = document.querySelectorAll('.rf-btn');
    buttons.forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`'${moduleName}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const typeSelect = document.getElementById('resourceTypeSelect');
    if (typeSelect) {
        if (moduleName === 'All' || moduleName === 'Available') typeSelect.value = 'All';
        else if (moduleName.includes('DAA')) typeSelect.value = 'DAA';
        else if (moduleName.includes('Web')) typeSelect.value = 'Web Development';
        else if (moduleName.includes('Graphics')) typeSelect.value = 'Computer Graphics';
    }

    // Set flag for 'Available' filter
    window._resourceFilterAvailable = (moduleName === 'Available');
    
    document.getElementById('resourceSearchInput').value = '';
    searchResources();
}

function viewResource(id) {
    const res = resources.find(r => r.id === id);
    if (res && res.path) {
        window.open(res.path, '_blank');
    } else if (res) {
        alert(`Opening ${res.type}: ${res.title}`);
    }
}

// --- Hold Page Logic ---
function updateHoldDisplay() {
    const grid = document.getElementById('activeHoldsGrid');
    if (!grid) return;

    const countHeader = document.getElementById('holdCountHeader');
    const readyCountEl = document.getElementById('holdsReadyCount');
    const queueCountEl = document.getElementById('holdsQueueCount');

    if (countHeader) countHeader.textContent = userHolds.length;

    let readyCount = 0;
    let queueCount = 0;

    if (userHolds.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #666;">You have no active holds at the moment.</div>';
    } else {
        grid.innerHTML = userHolds.map(hold => {
            if (hold.status === 'Ready') readyCount++;
            else queueCount++;

            return `
                <div class="hold-item-card">
                    <div class="hold-item-cover">
                        <img src="${hold.cover}" alt="${hold.title}" onerror="this.src='https://via.placeholder.com/80x110?text=Book'">
                    </div>
                    <div class="hold-item-info">
                        <span class="hold-status-tag ${hold.status === 'Ready' ? 'ready' : 'queue'}">${hold.status}</span>
                        <h4>${hold.title}</h4>
                        <p>by ${hold.author}</p>
                        <button class="hold-cancel-btn" onclick="cancelHold('${hold.id}')">Cancel Hold</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (readyCountEl) readyCountEl.textContent = readyCount;
    if (queueCountEl) queueCountEl.textContent = queueCount;
}

function cancelHold(holdId) {
    if (confirm('Are you sure you want to cancel this hold?')) {
        userHolds = userHolds.filter(h => h.id !== holdId);
        localStorage.setItem('userHolds', JSON.stringify(userHolds));
        currentUser.holds = userHolds.length;
        saveState();
        updateStats();
        updateHoldDisplay();
        alert('Hold cancelled successfully.');
    }
}

function placeHold(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (userHolds.some(h => h.bookId === bookId)) {
        alert('You already have a hold on this book.');
        return;
    }

    const newHold = {
        id: 'H' + Date.now(),
        bookId: book.id,
        title: book.title,
        author: book.author,
        status: 'In Queue',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        cover: book.cover
    };

    userHolds.push(newHold);
    
    // Add to Activity Log
    activityLog.unshift({
        type: 'On Hold',
        book: book.title,
        author: book.author,
        date: newHold.date,
        due: '—',
        icon: 'fa-bookmark',
        statusClass: 'hold'
    });

    currentUser.holds = userHolds.length;
    saveState();
    refreshAllUI();
    alert(`Hold placed for "${book.title}". You are now in the queue.`);
}

// Add feedback effect to cards on click
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.dashboard-cards, .dashboard, .resource-card, .hold-item-card');
    cards.forEach(card => {
        card.addEventListener('mousedown', () => {
            card.style.transform = 'scale(0.95)';
        });
        card.addEventListener('mouseup', () => {
            card.style.transform = 'scale(1)';
        });
    });
});

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userLoggedIn');
        window.location.href = 'login.html';
    }
}

