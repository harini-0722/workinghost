// This is the content for: public/admin-gymkhana.js
const API_URL = '/api/gymkhana'; // Use relative path

document.addEventListener('DOMContentLoaded', () => {
    // Show dashboard on load
    showPage('dashboard');
    
    // Load all data
    loadDashboardStats();
    loadEvents();
    loadMembers();
    loadClubs();
    loadHeads();
    loadCandidates();
    loadSettings();

    // Add form listeners
    document.getElementById('add-event-form').addEventListener('submit', handleAdd);
    document.getElementById('add-member-form').addEventListener('submit', handleAdd);
    document.getElementById('add-club-form').addEventListener('submit', handleAdd);
    document.getElementById('add-head-form').addEventListener('submit', handleAdd);
    document.getElementById('add-candidate-form').addEventListener('submit', handleAdd);

    // Add settings form listeners
    document.getElementById('settings-about-form').addEventListener('submit', saveAboutSettings);
    document.getElementById('settings-election-form').addEventListener('submit', saveElectionSettings);

    // Add delete listeners (event delegation)
    document.getElementById('events-list').addEventListener('click', handleDelete);
    document.getElementById('members-list').addEventListener('click', handleDelete);
    document.getElementById('clubs-list').addEventListener('click', handleDelete);
    document.getElementById('heads-list').addEventListener('click', handleDelete);
    document.getElementById('candidates-list').addEventListener('click', handleDelete);
});

// --- Load Data Functions ---

async function loadDashboardStats() {
    try {
        const res = await fetch(`${API_URL}/dashboard-stats`);
        const { success, data } = await res.json();
        if (success) {
            document.getElementById('event-count').textContent = data.eventCount || 0;
            document.getElementById('member-count').textContent = data.memberCount || 0;
            document.getElementById('club-count').textContent = data.clubCount || 0;
            document.getElementById('head-count').textContent = data.headCount || 0;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadEvents() {
    const list = document.getElementById('events-list');
    list.innerHTML = '';
    const { data } = await (await fetch(`${API_URL}/events`)).json();
    data.forEach(item => {
        list.innerHTML += `
            <div class="bg-white p-4 rounded-lg shadow-md flex items-start space-x-4">
                <img src="${item.imageUrl}" alt="${item.name}" class="w-24 h-24 object-cover rounded-md flex-shrink-0">
                <div class="flex-grow">
                    <h3 class="font-bold text-gray-900">${item.name}</h3>
                    <p class="text-sm text-indigo-600">${item.dateTag}</p>
                    <p class="text-sm text-gray-600 mt-1">${item.description}</p>
                </div>
                <button data-id="${item._id}" data-type="event" class="delete-btn text-red-500 hover:text-red-700 flex-shrink-0">
                    <i class="fas fa-trash fa-lg"></i>
                </button>
            </div>`;
    });
}

async function loadMembers() {
    const list = document.getElementById('members-list');
    list.innerHTML = '';
    const { data } = await (await fetch(`${API_URL}/members`)).json();
    data.forEach(item => {
        list.innerHTML += `
            <div class="flex flex-col items-center text-center bg-white rounded-lg shadow-lg p-4 relative">
                <button data-id="${item._id}" data-type="member" class="delete-btn text-gray-400 hover:text-red-600 absolute top-2 right-2">
                    <i class="fas fa-trash"></i>
                </button>
                <img class="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-200" src="${item.imageUrl}" alt="${item.name}">
                <h3 class="mt-4 text-lg font-bold text-gray-900">${item.name}</h3>
                <p class="text-sm font-medium text-indigo-600">${item.position}</p>
                <p class="text-xs text-gray-500 mt-1">${item.description}</p>
            </div>`;
    });
}

async function loadClubs() {
    const list = document.getElementById('clubs-list');
    list.innerHTML = '';
    const { data } = await (await fetch(`${API_URL}/clubs`)).json();
    data.forEach(item => {
        list.innerHTML += `
            <div class="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg relative">
                <button data-id="${item._id}" data-type="club" class="delete-btn text-gray-400 hover:text-red-600 absolute top-2 right-2">
                    <i class="fas fa-trash fa-xs"></i>
                </button>
                <i class="${item.icon} text-indigo-600 fa-3x"></i>
                <h4 class="mt-4 text-sm font-bold text-gray-900 text-center">${item.name}</h4>
                <p class="text-xs text-gray-500 capitalize">${item.council}</p>
            </div>`;
    });
}

async function loadHeads() {
    const list = document.getElementById('heads-list');
    list.innerHTML = '';
    const { data } = await (await fetch(`${API_URL}/heads`)).json();
    data.forEach(item => {
        list.innerHTML += `
            <div class="flex items-center text-left bg-white rounded-lg shadow-lg p-4 relative">
                <button data-id="${item._id}" data-type="head" class="delete-btn text-gray-400 hover:text-red-600 absolute top-2 right-2">
                    <i class="fas fa-trash"></i>
                </button>
                <img class="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-200" src="${item.imageUrl}" alt="${item.name}">
                <div class="ml-4">
                    <h3 class="text-lg font-bold text-gray-900">${item.name}</h3>
                    <p class="text-sm font-medium text-indigo-600">${item.position}</p>
                    <p class="text-xs text-gray-500 mt-1 capitalize">Page: ${item.council}</p>
                </div>
            </div>`;
    });
}

async function loadCandidates() {
    const list = document.getElementById('candidates-list');
    list.innerHTML = '';
    const { data } = await (await fetch(`${API_URL}/candidates`)).json();
    data.forEach(item => {
        list.innerHTML += `
            <div class="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
                <img src="${item.imageUrl}" alt="${item.name}" class="w-20 h-20 rounded-full object-cover">
                <div class="flex-grow">
                    <p class="text-sm text-gray-500">${item.position}</p>
                    <h3 class="font-bold text-gray-900">${item.name}</h3>
                    <p class="text-sm text-gray-600 mt-1">${item.description}</p>
                </div>
                <button data-id="${item._id}" data-type="candidate" class="delete-btn text-red-500 hover:text-red-700 flex-shrink-0">
                    <i class="fas fa-trash fa-lg"></i>
                </button>
            </div>`;
    });
}

async function loadSettings() {
    try {
        const res = await fetch(`${API_URL}/settings`);
        const { success, data } = await res.json();
        if (success) {
            // About Text
            if(data.aboutUs) {
                document.getElementById('settings-about-text').value = data.aboutUs;
            }
            // Election Dates
            if(data.electionDates) {
                const dates = data.electionDates;
                document.getElementById('election-date-1-title').value = dates.d1_title || '';
                document.getElementById('election-date-1-date').value = dates.d1_date || '';
                document.getElementById('election-date-2-title').value = dates.d2_title || '';
                document.getElementById('election-date-2-date').value = dates.d2_date || '';
                document.getElementById('election-date-3-title').value = dates.d3_title || '';
                document.getElementById('election-date-3-date').value = dates.d3_dat
                e || '';
                document.getElementById('election-date-4-title').value = dates.d4_title || '';
                document.getElementById('election-date-4-date').value = dates.d4_date || '';
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// --- Handle Add/Delete ---

async function handleAdd(e) {
    e.preventDefault();
    const form = e.target;
    const type = form.id.split('-')[1]; // e.g., 'event'

    // Create FormData directly from the form.
    const formData = new FormData(form);

    // This part is for 'clubs' since it doesn't have an image
    if (type === 'club') {
        const data = Object.fromEntries(formData.entries());
        try {
            const res = await fetch(`${API_URL}/clubs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                alert(`Club added successfully!`);
                form.reset();
                loadClubs();
                loadDashboardStats();
            } else {
                alert(`Error adding club`);
            }
        } catch (error) {
            console.error(`Error adding club:`, error);
        }
        return; // Stop here for 'club'
    }

    // This is for all FORMS WITH IMAGES
    try {
        const res = await fetch(`${API_URL}/${type}s`, {
            method: 'POST',
            // DO NOT set Content-Type, browser does it with FormData
            body: formData,
        });

        if (res.ok) {
            alert(`${type} added successfully!`);
            form.reset();
            // Reload relevant data
            if (type === 'event') loadEvents();
            if (type === 'member') loadMembers();
            if (type === 'head') loadHeads();
            if (type === 'candidate') loadCandidates();
            loadDashboardStats(); // Refresh dashboard
        } else {
            const err = await res.json();
            alert(`Error adding ${type}: ${err.message}`);
        }
    } catch (error) {
        console.error(`Error adding ${type}:`, error);
        alert(`A network error occurred while adding ${type}.`);
    }
}


async function handleDelete(e) {
    const deleteBtn = e.target.closest('.delete-btn');
    if (!deleteBtn) return;

    const id = deleteBtn.dataset.id;
    const type = deleteBtn.dataset.type;

    if (confirm(`Are you sure you want to delete this ${type}?`)) {
        try {
            const res = await fetch(`${API_URL}/${type}s/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert(`${type} deleted!`);
                // Reload relevant data
                if (type === 'event') loadEvents();
                if (type === 'member') loadMembers();
                if (type === 'club') loadClubs();
                if (type === 'head') loadHeads();
                if (type === 'candidate') loadCandidates();
                loadDashboardStats(); // Refresh dashboard
            } else {
                alert(`Error deleting ${type}`);
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    }
}

// --- Handle Settings Save ---

async function saveAboutSettings(e) {
    e.preventDefault();
    const text = document.getElementById('settings-about-text').value;
    try {
        const res = await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'aboutUs', value: text }),
        });
        if (res.ok) alert('About Us saved!');
        else alert('Error saving settings');
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

async function saveElectionSettings(e) {
    e.preventDefault();
    const data = {
        d1_title: document.getElementById('election-date-1-title').value,
        d1_date: document.getElementById('election-date-1-date').value,
        d2_title: document.getElementById('election-date-2-title').value,
        d2_date: document.getElementById('election-date-2-date').value,
        d3_title: document.getElementById('election-date-3-title').value,
        d3_date: document.getElementById('election-date-3-date').value,
        d4_title: document.getElementById('election-date-4-title').value,
        d4_date: document.getElementById('election-date-4-date').value,
    };
    try {
        const res = await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'electionDates', value: data }),
        });
        if (res.ok) alert('Election Dates saved!');
        else alert('Error saving settings');
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}