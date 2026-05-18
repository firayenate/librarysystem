function goToLogin() {
    window.location.href = "login.html";
}

function goToHome() {
    window.location.href = "Admin.html";
}

function searchBook() {
    const type  = document.getElementById('searchType').value;
    const query = document.getElementById('searchInput').value;
    alert('Searching by ' + type + ': ' + query);
}

// Recalculate Total Books from all resource cards
function syncTotalBooks() {
    const resourceIds = ['ebooks-count', 'lectures-count', 'exams-count', 'tutorials-count'];
    let total = 0;
    resourceIds.forEach(function(rid) {
        const el = document.getElementById(rid);
        if (el) total += parseInt(el.textContent);
    });
    const totalEl = document.getElementById('total-books');
    if (totalEl) totalEl.textContent = total;
}

// + / − buttons on resource cards
function changeCount(id, amount) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = parseInt(el.textContent);
    let newVal = current + amount;
    if (newVal < 0) return;
    el.textContent = newVal;

    const resourceIds = ['ebooks-count', 'lectures-count', 'exams-count', 'tutorials-count'];
    if (resourceIds.includes(id)) {
        syncTotalBooks();
    }
}

// File uploader — opens file manager, adds to selected category
function openFileUploader() {
    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.epub,.doc,.docx,.ppt,.pptx,.mp4,.txt';
    fileInput.multiple = true; // allow selecting multiple files

    fileInput.onchange = function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Show category picker popup
        showCategoryPicker(files);
    };

    fileInput.click();
}

// Show a popup to pick which category to add the file to
function showCategoryPicker(files) {
    // Remove old popup if exists
    const old = document.getElementById('category-popup');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'category-popup';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
        background: white; border-radius: 16px; padding: 28px 32px;
        min-width: 320px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        font-family: 'Segoe UI', sans-serif;
    `;

    const categories = [
        { label: '📖 E-Books',       id: 'ebooks-count'   },
        { label: '📄 Lecture Notes', id: 'lectures-count' },
        { label: '📝 Past Exams',    id: 'exams-count'    },
        { label: '🎥 Tutorials',     id: 'tutorials-count'},
    ];

    let fileNames = files.map(f => `<li style="font-size:13px;color:#555;margin:3px 0;">📁 ${f.name}</li>`).join('');

    box.innerHTML = `
        <h3 style="margin:0 0 6px;font-size:17px;color:#111;">Add to Category</h3>
        <p style="font-size:13px;color:#888;margin:0 0 14px;">
            ${files.length} file(s) selected:
        </p>
        <ul style="list-style:none;padding:0;margin:0 0 18px;background:#f9f9f9;border-radius:8px;padding:10px 14px;">
            ${fileNames}
        </ul>
        <p style="font-size:13px;color:#555;margin:0 0 12px;font-weight:600;">Choose a category:</p>
        <div style="display:flex;flex-direction:column;gap:10px;" id="cat-buttons"></div>
        <button onclick="document.getElementById('category-popup').remove()"
            style="margin-top:16px;width:100%;padding:10px;border-radius:8px;
            border:1px solid #ddd;background:#f5f5f5;color:#555;
            font-size:13px;font-weight:600;cursor:pointer;">
            Cancel
        </button>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Add category buttons
    const btnContainer = box.querySelector('#cat-buttons');
    categories.forEach(function(cat) {
        const btn = document.createElement('button');
        btn.textContent = cat.label;
        btn.style.cssText = `
            width: 100%; padding: 11px; border-radius: 9px;
            border: 1.5px solid #e0e0e0; background: white;
            font-size: 14px; font-weight: 600; cursor: pointer;
            transition: background 0.15s, border-color 0.15s;
            text-align: left; color: #222;
        `;
        btn.onmouseover = function() { this.style.background = '#fff8ee'; this.style.borderColor = '#f0a500'; };
        btn.onmouseout  = function() { this.style.background = 'white';   this.style.borderColor = '#e0e0e0'; };

        btn.onclick = function() {
            // Add file count to chosen category
            const countEl = document.getElementById(cat.id);
            if (countEl) {
                countEl.textContent = parseInt(countEl.textContent) + files.length;
            }
            // Sync total books
            syncTotalBooks();

            // Also add to Total Books dashboard stat card directly
            const totalBooksEl = document.getElementById('total-books');

            // Show success message
            overlay.remove();
            showSuccess(files.length, cat.label.replace(/^.\s/, ''));
        };

        btnContainer.appendChild(btn);
    });
}

// Success toast
function showSuccess(count, category) {
    const old = document.getElementById('success-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'success-toast';
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background: #27ae60; color: white;
        padding: 14px 22px; border-radius: 12px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px; font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 9999; animation: slideIn 0.3s ease;
    `;
    toast.textContent = `✅ ${count} file(s) added to ${category}!`;
    document.body.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(function() { toast.remove(); }, 400);
    }, 3000);
}