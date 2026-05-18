// Mock Data & Initial State
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    id: 'NSR/0324/16',
    name: 'Sara J.',
    email: 'sara.j@example.com',
    department: 'Computer Science',
    year: 'Year 1',
    borrowed: 2,
    returned: 4,
    pending: 1
};

let books = JSON.parse(localStorage.getItem('libraryBooks')) || [
    { id: 1, title: 'Introduction to Algorithms', author: 'Cormen et al.', category: 'Textbook', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/41T07nqZneL._SX396_BO1,204,203,200_.jpg' },
    { id: 2, title: 'Clean Code', author: 'Robert C. Martin', category: 'Textbook', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg' },
    { id: 3, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Reference', status: 'Borrowed', cover: 'https://images-na.ssl-images-amazon.com/images/I/41HInlou71L._SX396_BO1,204,203,200_.jpg' },
    { id: 4, title: 'Design Patterns', author: 'Gang of Four', category: 'Textbook', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/51szD9HC9pL._SX395_BO1,204,203,200_.jpg' },
    { id: 5, title: 'The Art of Computer Programming', author: 'Donald Knuth', category: 'Research', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/41ms997OofL._SX355_BO1,204,203,200_.jpg' },
    { id: 6, title: 'Artificial Intelligence', author: 'Russell & Norvig', category: 'Textbook', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/517684-mKmL._SX388_BO1,204,203,200_.jpg' },
    { id: 7, title: 'You Don\'t Know JS', author: 'Kyle Simpson', category: 'E-Book', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/41-reA+C31L._SX331_BO1,204,203,200_.jpg' },
    { id: 8, title: 'The Rust Programming Language', author: 'Klabnik & Nichols', category: 'Textbook', status: 'Available', cover: 'https://images-na.ssl-images-amazon.com/images/I/416H7tK7rML._SX379_BO1,204,203,200_.jpg' }
];

let history = [
    { title: 'Introduction to Algorithms', borrowed: '2025-04-10', due: '2025-04-24', returned: '2025-04-22', status: 'Returned' },
    { title: 'Clean Code', borrowed: '2025-05-01', due: '2025-05-15', returned: '-', status: 'Pending' },
    { title: 'System Design Interview', borrowed: '2025-03-15', due: '2025-03-29', returned: '2025-03-30', status: 'Overdue' }
];

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    renderBooks(books);
    renderHistory();
    updateStats();

    // Scroll Effect for Navbar
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
});

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    // Show target section
    document.getElementById(sectionId).classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });

    // Close mobile menu if open
    if (window.innerWidth <= 1024) {
        document.getElementById('mainNav').classList.remove('open');
    }
}

function toggleMenu() {
    document.getElementById('mainNav').classList.toggle('open');
}

// User Profile
function loadUserProfile() {
    document.getElementById('userNameDisplay').textContent = currentUser.name;
    document.getElementById('userIdDisplay').textContent = currentUser.id;
    document.getElementById('heroUserName').textContent = currentUser.name.split(' ')[0];
    
    const savedImg = localStorage.getItem('userProfileImage');
    if (savedImg) {
        document.getElementById('userProfileImg').src = savedImg;
    }
}

// Book Catalog
function renderBooks(booksToRender) {
    const grid = document.getElementById('bookGrid');
    if (!grid) return;
    
    grid.innerHTML = booksToRender.map(book => `
        <div class="book-card">
            <div class="book-cover">
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x300?text=No+Cover'">
            </div>
            <div class="book-content">
                <span class="book-category">${book.category}</span>
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-footer">
                    <span class="status-badge ${book.status === 'Available' ? 'status-available' : 'status-unavailable'}">
                        ${book.status}
                    </span>
                    ${book.status === 'Available' ? `<button class="borrow-btn" onclick="borrowBook(${book.id})">Borrow</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function filterBooks() {
    const query = document.getElementById('bookSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    const filtered = books.filter(book => {
        const matchesQuery = book.title.toLowerCase().includes(query) || 
                             book.author.toLowerCase().includes(query);
        const matchesCategory = category === 'all' || book.category === category;
        return matchesQuery && matchesCategory;
    });
    
    renderBooks(filtered);
}

function borrowBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book && book.status === 'Available') {
        if (confirm(`Do you want to borrow "${book.title}"?`)) {
            book.status = 'Borrowed';
            currentUser.borrowed++;
            currentUser.pending++;
            
            // Add to history
            const today = new Date().toISOString().split('T')[0];
            const due = new Date();
            due.setDate(due.getDate() + 14);
            const dueStr = due.toISOString().split('T')[0];
            
            history.unshift({
                title: book.title,
                borrowed: today,
                due: dueStr,
                returned: '-',
                status: 'Pending'
            });
            
            // Save & Update
            localStorage.setItem('libraryBooks', JSON.stringify(books));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateStats();
            renderBooks(books);
            renderHistory();
            alert(`Request sent for "${book.title}". Please pick it up from the library.`);
        }
    }
}

// History
function renderHistory() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = history.map(item => `
        <tr>
            <td><strong>${item.title}</strong></td>
            <td>${item.borrowed}</td>
            <td>${item.due}</td>
            <td>${item.returned}</td>
            <td><span class="history-status ${item.status.toLowerCase()}">${item.status}</span></td>
        </tr>
    `).join('');
}

// Stats
function updateStats() {
    document.getElementById('statBorrowed').textContent = currentUser.borrowed;
    document.getElementById('statReturned').textContent = currentUser.returned;
    document.getElementById('statPending').textContent = currentUser.pending;
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userLoggedIn');
        window.location.href = 'login.html';
    }
}
