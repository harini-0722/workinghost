// =========================================================================
// GLOBAL DATA STORE
// =========================================================================

let g_student = null;
let g_room = null;
let g_block = null;
let g_roommates = []; 
let g_attendance = [];
let g_complaints = [];
let g_visitorRequests = []; 
let g_clubActivities = []; 
let g_leaveHistory = []; 

let g_attendanceStatus = { status: 'Checked Out', lastActionTime: null };
let g_foundItems = []; // NEW GLOBAL: To store found items dynamically

const mockAnnouncements = [
    {
        id: 1,
        date: '2025-10-24',
        title: 'Mandatory Hostel Meeting - Oct 25th',
        short_desc: 'All residents are required to attend a mandatory meeting regarding...',
        full_desc: '<p>All residents are required to attend a mandatory meeting regarding new security protocols.</p><p><strong>Date:</strong> October 25th, 2025<br><strong>Time:</strong> 7:00 PM<br><strong>Location:</strong> Mess Hall</p><p>Attendance will be taken. Please be on time.</p>'
    }
];

// =========================================================================
// DATA LOADING & REFRESH
// =========================================================================

async function loadStudentData() {
    const studentId = localStorage.getItem('currentStudentId');
    
    if (!studentId) {
        alert('No student ID found. Please log in.');
        logout();    
        return false;    
    }

    try {
        // Fetch student profile, room, roommates, attendance, complaints
        const response = await fetch(`/api/student/${studentId}`);
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `Error: ${response.status}`);
        }
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        console.log('📦 Server response:', data); 

        g_student = data.student;
        
        // Logic for finding room data
        if (data.room && typeof data.room === 'object') {
            g_room = data.room;
        } else if (data.student.room && typeof data.student.room === 'object') {
            g_room = data.student.room;
        } else {
            g_room = { roomNumber: data.roomNumber || 'N/A', floor: 'N/A', capacity: 2, imageUrl: null };
        }
        if (data.roomNumber) {
            g_room.roomNumber = data.roomNumber;
        }
        
        g_block = { blockName: data.blockName };
        g_roommates = data.roommates || [];    
        g_attendance = data.attendance || [];
        g_complaints = data.complaints || [];
        
        // Fetch Visitor History explicitly
        try {
            const vRes = await fetch(`/api/visitor-request/history/${studentId}`);
            const vData = await vRes.json();
            if(vData.success) {
                g_visitorRequests = vData.visitorRequests;
            }
        } catch(err) { console.error("Visitor history fetch failed", err); }

        // Fetch Leave History explicitly
        try {
            const lRes = await fetch(`/api/leave/history/${studentId}`);
            const lData = await lRes.json();
            if(lData.success) {
                g_leaveHistory = lData.leaves;
            }
        } catch(err) { console.error("Leave history fetch failed", err); }

        // Get current attendance status
        const statusResponse = await fetch(`/api/attendance/status/${studentId}`);
        if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.success) {
                g_attendanceStatus.status = statusData.status;
                g_attendanceStatus.lastActionTime = statusData.lastActionTime;
            }
        }
        
        // NEW: Initial load of found items (stores globally)
        try {
            const lfRes = await fetch('/api/lost-found/found-items');
            const lfData = await lfRes.json();
            if (lfData.success) {
                g_foundItems = lfData.foundItems;
            }
        } catch (err) { console.error("Found items initial fetch failed", err); }


        console.log('✅ Student data loaded');
        return true;    
    } catch (error) {
        console.error('❌ Failed to load student data:', error);
        alert(`Error loading your data: ${error.message}. Please try logging in again.`);
        logout();
        return false;    
    }
}

// =========================================================================
// NEW: FEEDBACK & LOST/FOUND API FUNCTIONS
// =========================================================================

// 1. Submit Feedback
async function submitFeedback() {
    // Check if g_student is null to prevent immediate error if data load failed
    if (!g_student || !g_student._id) {
        alert('Student data not available. Please try logging in again.');
        return;
    }
    const studentId = g_student._id;
    const form = document.getElementById('feedback-form');
    const category = document.getElementById('feedback-category').value;
    const description = document.getElementById('feedback-description').value;
    const isAnonymous = document.getElementById('feedback-anonymous').checked;

    if (!category || !description.trim()) {
        alert('Please fill out all required fields.');
        return;
    }
    
    if (description.length > 500) {
        alert('Feedback description cannot exceed 500 characters.');
        return;
    }

    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId, category, description, isAnonymous }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(result.message);
            form.reset();
        } else {
            // This handles the non-JSON error (404 response is NOT OK and not JSON)
            throw new Error(result.message || `Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Check server console for 404/Network errors.');
    }
}

// 2. Submit Lost Item Report
async function submitLostItemReport() {
    if (!g_student || !g_student._id) {
        alert('Student data not available. Please try logging in again.');
        return;
    }
    const studentId = g_student._id;
    const form = document.getElementById('lost-item-form');
    const itemName = document.getElementById('lost-item-name').value;
    const lastSeenLocation = document.getElementById('lost-item-location').value;

    if (!itemName.trim()) {
        alert('Please enter the name of the lost item.');
        return;
    }

    try {
        const response = await fetch('/api/lost-found/report-lost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId, itemName, lastSeenLocation }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(result.message);
            form.reset();
            // Reload the list of Found Items so the user can see updated data if any
            fetchFoundItems(); 
        } else {
            throw new Error(result.message || `Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error reporting lost item:', error);
        alert('Failed to submit lost item report. Check server console for 404/Network errors.');
    }
}

// 3. Fetch and Display Found Items
async function fetchFoundItems() {
    const lostFoundBody = document.getElementById('lost-found-body');
    if (!lostFoundBody) return; 

    lostFoundBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-secondary-gray">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-blue mx-auto mb-2"></div>
        Loading recently found items...
    </td></tr>`;
    
    try {
        const response = await fetch('/api/lost-found/found-items');
        const result = await response.json();

        if (response.ok && result.success) {
            g_foundItems = result.foundItems; 
            lostFoundBody.innerHTML = ''; 

            if (g_foundItems.length === 0) {
                lostFoundBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-accent-green font-semibold">🎉 No items currently reported as found by staff.</td></tr>`;
                return;
            }

            g_foundItems.forEach(item => {
                const date = new Date(item.submissionDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });
                const statusInfo = {
                    Pending: { color: 'text-info-yellow', emoji: '👀' },
                    Retrieved: { color: 'text-accent-green', emoji: '✅' },
                    Closed: { color: 'text-secondary-gray', emoji: '🔒' }
                }[item.status] || { color: 'text-secondary-gray', emoji: '❓' };


                lostFoundBody.innerHTML += `
                    <tr class="hover:bg-light-bg transition-colors">
                        <td class="py-3 px-6 text-sm font-medium text-accent-dark">${item.itemName}</td>
                        <td class="py-3 px-6 text-sm text-secondary-gray">${date}</td>
                        <td class="py-3 px-6 text-sm text-secondary-gray">${item.lastSeenLocation || 'Hostel Office'}</td>
                        <td class="py-3 px-6 text-sm font-semibold ${statusInfo.color}">
                            ${statusInfo.emoji} ${item.status}
                        </td>
                    </tr>
                `;
            });
        } else {
            throw new Error(result.message || `Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching found items:', error);
        lostFoundBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-accent-red">Failed to load items. Check server routes.</td></tr>`;
    }
}

// =========================================================================
// CORE NAVIGATION & UTILITIES (UPDATED)
// =========================================================================

function showReportTab(tabName) {
    // 1. Hide all tab content
    document.querySelectorAll('.report-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // 2. Deactivate all tabs styling
    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.classList.remove('active', 'border-primary-blue', 'text-primary-blue', 'font-semibold');
        tab.classList.add('border-transparent', 'text-secondary-gray', 'hover:text-primary-blue');
    });
    
    // 3. Show active content
    document.getElementById(`report-tab-content-${tabName}`).classList.remove('hidden');
    
    // 4. Activate current tab styling
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.classList.add('active', 'border-primary-blue', 'text-primary-blue', 'font-semibold');
    activeTab.classList.remove('border-transparent', 'text-secondary-gray', 'hover:text-primary-blue');

    // 5. Load specific content based on tab
    if (tabName === 'lost-found') {
        fetchFoundItems();
    }
    // Note: Complaints history is loaded when showView is called, but we keep the logic clean.
}

function populateLostAndFound() {
    // Legacy function now maps directly to fetching live data
    fetchFoundItems();
}


// --- (All other existing functions remain below: loadStudentData, format*, updateActiveMenuItem, etc.) ---
// --- (Due to length, omitting unchanged functions like loadClubActivities, initializeDashboard, etc.) ---


// =========================================================================
// UTILITIES & NAVIGATION (continued)
// =========================================================================
function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });    
}

function formatTime(isoString) {
    if (!isoString) return '...';
    return new Date(isoString).toLocaleTimeString('en-US', {    
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true    
    });
}

function updateActiveMenuItem(viewId) {
    const allLinks = document.querySelectorAll('.nav-link');
    
    allLinks.forEach(link => {
        link.classList.remove('active', 'text-primary-blue', 'font-semibold', 'border-primary-blue');
        link.classList.add('text-secondary-gray', 'hover:text-primary-blue', 'border-transparent');
    });

    if (viewId === 'student-details-view') {
         viewId = 'student-profile-view';
    }
    
    const desktopLink = document.getElementById(`nav-${viewId}`);
    if (desktopLink) {
        desktopLink.classList.add('active', 'text-primary-blue', 'font-semibold');
        desktopLink.classList.remove('text-secondary-gray');
    }
    const mobileLink = document.getElementById(`mobile-nav-${viewId}`);
    if (mobileLink) {
        mobileLink.classList.add('active', 'text-primary-blue', 'bg-light-bg', 'border-primary-blue');
        mobileLink.classList.remove('text-gray-600', 'border-transparent');
    }
}

function showView(viewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => {
        if (view.id === viewId) {
            view.classList.remove('hidden', 'opacity-0', 'translate-x-20');
            view.classList.add('opacity-100', 'translate-x-0');
            view.style.display = 'block'; // Ensure block display
        } else {
            view.classList.add('hidden', 'opacity-0', 'translate-x-20');
            view.classList.remove('opacity-100', 'translate-x-0');
            view.style.display = 'none'; // Ensure hidden
        }
    });
    updateActiveMenuItem(viewId);
    
    // Call correct functions for each view
    if (viewId === 'student-details-view') {
        populateStudentProfileView();    
    } else if (viewId === 'student-room-view') {
        populateRoommatesList();
    } else if (viewId === 'student-reports-view') {
        showReportTab('complaints');
        populateStudentComplaintHistory();
        // populateLostAndFound(); // Removed direct call, handled by showReportTab
    } else if (viewId === 'student-leave-view') {
        populateStudentLeaveHistory();
    } else if (viewId === 'student-attendance-view') {
        updateAttendanceStatus();    
        populateAttendanceLog();
    } else if (viewId === 'student-visitor-view') {
        populateVisitorRequestHistory();
    } else if (viewId === 'student-activities-view') {
        displayAllActivities();
    }
}

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}
function hideMobileMenu() {
    document.getElementById('mobile-menu').classList.add('hidden');
}


function logout() {
    localStorage.removeItem('currentStudentId');    
    window.location.href = "login.html";    
}

// =========================================================================
// CLUB ACTIVITIES FUNCTIONS
// =========================================================================

async function loadClubActivities() {
    try {
        const response = await fetch('/api/activities');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            g_clubActivities = data.activities;
            console.log('✅ Club activities loaded:', g_clubActivities);
            return true;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('❌ Failed to load club activities:', error);
        // Fallback data
        g_clubActivities = [
            {
                _id: '1',
                title: '⚽ Inter-Hostel Cricket Finals',
                type: 'Sports',
                date: '2025-11-15',
                description: 'Finals between Men\'s Hostel and Women\'s Hostel teams',
                imageUrl: ''
            }
        ];
        return false;
    }
}

function displayClubActivitiesOnDashboard() {
    const container = document.getElementById('club-activities-dashboard');
    
    if (!g_clubActivities || g_clubActivities.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-secondary-gray">
                <p>🎭 No upcoming club activities at the moment.</p>
                <p class="text-sm mt-2">Check back later for new events!</p>
            </div>
        `;
        return;
    }

    const recentActivities = g_clubActivities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    container.innerHTML = '';

    recentActivities.forEach(activity => {
        const theme = getActivityTheme(activity.type);
        const formattedDate = formatDate(activity.date);
        const imageUrl = activity.imageUrl || `https://via.placeholder.com/300x150/e0e0e0/909090?text=${activity.type}`;

        const activityHTML = `
            <div class="bg-card-bg rounded-lg shadow-lift overflow-hidden border-l-4 ${theme.border} transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer" onclick="showActivityDetail('${activity._id}')">
                <img src="${imageUrl}" alt="${activity.title}" class="w-full h-32 object-cover">
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-bold text-accent-dark truncate flex-1">${activity.title}</h3>
                        <span class="text-xs font-bold px-2 py-1 rounded-full ${theme.bg} ${theme.text} ml-2 flex-shrink-0">${activity.type}</span>
                    </div>
                    <p class="text-sm font-medium text-secondary-gray mb-2">📅 ${formattedDate}</p>
                    <p class="text-sm text-secondary-gray line-clamp-2">${activity.description || 'No description available.'}</p>
                </div>
            </div>
        `;
        container.innerHTML += activityHTML;
    });
}

function displayAllActivities(filterType = 'All') {
    const container = document.getElementById('all-club-activities');
    
    let activitiesToShow = g_clubActivities;
    
    if (filterType !== 'All') {
        activitiesToShow = g_clubActivities.filter(activity => activity.type === filterType);
    }
    
    activitiesToShow = activitiesToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (activitiesToShow.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-secondary-gray">
                <p>🎭 No ${filterType === 'All' ? '' : filterType + ' '}activities found.</p>
                <p class="text-sm mt-2">Check back later for new events!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    activitiesToShow.forEach(activity => {
        const theme = getActivityTheme(activity.type);
        const formattedDate = formatDate(activity.date);
        const imageUrl = activity.imageUrl || `https://via.placeholder.com/300x150/e0e0e0/909090?text=${activity.type}`;

        const activityHTML = `
            <div class="bg-card-bg rounded-lg shadow-lift overflow-hidden border-l-4 ${theme.border} transition-all duration-300 hover:shadow-xl hover:scale-105">
                <img src="${imageUrl}" alt="${activity.title}" class="w-full h-40 object-cover">
                <div class="p-5">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-xl font-bold text-accent-dark">${activity.title}</h3>
                        <span class="text-xs font-bold px-3 py-1 rounded-full ${theme.bg} ${theme.text} ml-2 flex-shrink-0">${activity.type}</span>
                    </div>
                    <p class="text-sm font-medium text-secondary-gray mb-3">📅 ${formattedDate}</p>
                    <p class="text-sm text-secondary-gray mb-4">${activity.description || 'No description available.'}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-primary-blue font-medium">Hostel Administration</span>
                        <button onclick="showActivityDetail('${activity._id}')" class="text-sm font-medium text-primary-blue hover:text-blue-700">
                            View Details →
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += activityHTML;
    });
}

function filterActivities(type) {
    document.querySelectorAll('.activity-filter-btn').forEach(btn => {
        btn.classList.remove('bg-primary-blue', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    });
    
    const activeBtn = document.querySelector(`button[onclick="filterActivities('${type}')"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        activeBtn.classList.add('bg-primary-blue', 'text-white');
    }
    
    displayAllActivities(type);
}

function getActivityTheme(type) {
    const themes = {
        'Sports': { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' },
        'Cultural': { border: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-700' },
        'Technical': { border: 'border-indigo-500', bg: 'bg-indigo-100', text: 'text-indigo-700' },
        'Workshop': { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        'General': { border: 'border-gray-500', bg: 'bg-gray-100', text: 'text-gray-700' }
    };
    return themes[type] || themes['General'];
}

function showActivityDetail(activityId) {
    const activity = g_clubActivities.find(a => a._id === activityId);
    if (activity) {
        const formattedDate = formatDate(activity.date);
        alert(`🎭 ${activity.title}\n\n📅 Date: ${formattedDate}\n📋 Type: ${activity.type}\n\n📝 Description:\n${activity.description || 'No description available.'}`);
    }
}

// =========================================================================
// DATA POPULATION FUNCTIONS (continued)
// =========================================================================

function initializeDashboard() {
    if (!g_student) {    
        console.error("No student data loaded.");
        logout();    
        return;
    }
    
    // 1. Set Welcome Message
    const firstName = g_student.name.split(' ')[0];
    document.getElementById('welcome-heading').textContent = `Welcome, ${firstName} 👋`;

    // 2. Set Initials & Nav Profile Pic
    const initials = g_student.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    const navImg = document.getElementById('nav-profile-image');
    const navInitials = document.getElementById('nav-initials');
    
    if (g_student.profileImageUrl) {
        navImg.src = g_student.profileImageUrl;
        navImg.classList.remove('hidden');
        navInitials.classList.add('hidden');
    } else {
        navInitials.textContent = initials;
        navInitials.classList.remove('hidden');
        navImg.classList.add('hidden');
    }
    
    // 3. Room Card
    const roomCard = document.querySelector('.card-classy-lift[onclick="showView(\'student-room-view\')"]');
    if (g_room && g_block) {
        roomCard.querySelector('.text-4xl').textContent = g_room.roomNumber;    
        roomCard.querySelector('.text-sm').textContent = `${g_block.blockName} | ${g_room.floor}`;
        roomCard.classList.add('border-primary-blue');    
        roomCard.querySelector('.text-xs').classList.add('text-primary-blue');    
    }

    // 4. Fee Card
    const feeStatusElement = document.getElementById('dashboard-fee-status');
    const feeCard = feeStatusElement.closest('.card-classy-lift');
    const feeStatusText = feeCard.querySelector('.text-sm');
    const feeStatusIcon = feeCard.querySelector('.mt-4');

    if (g_student.feeStatus === 'Pending') {
        feeStatusElement.textContent = 'Fee Due';    
        feeStatusElement.classList.add('text-accent-red');
        feeStatusElement.classList.remove('text-accent-green');
        feeCard.classList.replace('border-accent-green', 'border-accent-red');
        feeCard.querySelector('.text-xs').classList.replace('text-accent-green', 'text-accent-red');
        feeStatusText.textContent = `Status: ${g_student.feeStatus}`;
        feeStatusIcon.classList.replace('text-accent-green', 'text-accent-red');
        feeStatusIcon.querySelector('span').textContent = 'Please pay at the admin office.';
    } else {
        feeStatusElement.textContent = 'Paid';    
        feeStatusElement.classList.add('text-accent-green');
        feeStatusElement.classList.remove('text-accent-red');
        feeCard.classList.replace('border-accent-red', 'border-accent-green');
        feeCard.querySelector('.text-xs').classList.replace('text-accent-red', 'text-accent-green');
        feeStatusText.textContent = `Status: ${g_student.feeStatus}`;
        feeStatusIcon.classList.replace('text-accent-red', 'text-accent-green');
        feeStatusIcon.innerHTML = '<span>●</span> <span class="ml-1">No outstanding balance.</span>';
    }

    // 5. Open Requests Card
    const openRequestsEl = document.getElementById('dashboard-open-requests');
    const openRequestsText = openRequestsEl.nextElementSibling;
    
    const pendingComplaints = g_complaints.filter(c => c.status === 'Pending' || c.status === 'Critical');    
    openRequestsEl.textContent = String(pendingComplaints.length).padStart(2, '0');
    
    if (pendingComplaints.length > 0) {
        openRequestsText.textContent = `Complaint Pending (${pendingComplaints[0].title})`;
    } else {
        openRequestsText.textContent = 'No open complaints.';
    }

    // 6. Display Club Activities
    displayClubActivitiesOnDashboard();
}

function populateRoommatesList() {
    if (!g_room || !g_block || !g_student) {
        console.error("Data missing for room view.");
        return;
    }

    const roomImage = document.getElementById('room-detail-image');
    if (g_room.imageUrl) {
        roomImage.src = g_room.imageUrl;
    }

    const summaryCard = document.querySelector('#student-room-view .lg\\:col-span-1 .p-6'); 
    
    summaryCard.querySelector('h3').textContent = `Room ${g_room.roomNumber} Summary`;
    summaryCard.querySelector('p.flex:nth-child(1) span').textContent = g_block.blockName;
    summaryCard.querySelector('p.flex:nth-child(2) span').textContent = g_room.floor;
    summaryCard.querySelector('p.flex:nth-child(3) span').textContent = `${g_room.capacity} Beds`;
    
    const occupancy = g_roommates.length + 1;    
    const occupancyText = `${occupancy}/${g_room.capacity}`;
    const occupancyEl = summaryCard.querySelector('p.flex:nth-child(4) span');
    occupancyEl.textContent = occupancyText;
    
    if (occupancy >= g_room.capacity) {
        occupancyEl.textContent = `Full (${occupancyText})`;
        occupancyEl.classList.add('text-accent-red');
        occupancyEl.classList.remove('text-accent-green');
    } else {
        occupancyEl.textContent = `Available (${occupancyText})`;
        occupancyEl.classList.add('text-accent-green');
        occupancyEl.classList.remove('text-accent-red');
    }

    const roommatesList = document.getElementById('roommates-list');
    roommatesList.innerHTML = '';
    roommatesList.previousElementSibling.textContent = `Current Roommates (${g_roommates.length})`;

    g_roommates.forEach(mate => {    
        if (!mate) return;
        
        const mateCard = document.createElement('div');
        mateCard.className = `bg-light-bg p-4 rounded-lg shadow-soft flex items-center space-x-4 border-l-4 border-primary-blue`;
        mateCard.innerHTML = `
            <img src="${mate.profileImageUrl || './default-avatar.png'}" alt="${mate.name}" class="h-12 w-12 rounded-full object-cover flex-shrink-0">
            <div class="overflow-hidden">
                <p class="font-bold text-accent-dark truncate">${mate.name}</p>
                <p class="text-sm text-secondary-gray truncate">${mate.department || 'N/A'} - ${mate.year || 'N/A'}</p>
            </div>
        `;
        roommatesList.appendChild(mateCard);
    });

    if (g_roommates.length === 0) {
        roommatesList.innerHTML = `<p class="text-secondary-gray col-span-2">You are currently the sole occupant of Room ${g_room.roomNumber}.</p>`;
    }
}

function populateStudentComplaintHistory() {
    const tableBody = document.getElementById('student-complaint-history');
    tableBody.innerHTML = '';
    
    const myComplaints = g_complaints.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (myComplaints.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="py-4 px-6 text-center text-secondary-gray">You have not filed any complaints.</td></tr>`;
        return;
    }

    myComplaints.forEach(c => {
        let priorityColorClass = '';
        if (c.priority === 'Critical') priorityColorClass = 'text-accent-red';
        else if (c.priority === 'High') priorityColorClass = 'text-orange-500';
        else if (c.priority === 'Medium') priorityColorClass = 'text-info-yellow';
        else priorityColorClass = 'text-accent-green';
        
        let statusColorClass = c.status === 'Resolved' ? 'text-accent-green' : (c.status === 'Pending' || c.status === 'Critical' ? 'text-info-yellow' : 'text-secondary-gray');
        let formattedDate = c.date ? new Date(c.date).toLocaleDateString() : 'N/A';

        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">#C00${c._id ? c._id.substring(c._id.length - 4) : 'N/A'}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${formattedDate}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${c.type || c.title}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${c.location}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm font-medium ${priorityColorClass}">${c.priority}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm font-medium ${statusColorClass}">${c.status}</td>
            </tr>
        `;
    });
}

function populateStudentLeaveHistory() {
    const tableBody = document.getElementById('student-leave-history');
    tableBody.innerHTML = '';
    
    // Use the real fetched data in g_leaveHistory
    const sortedLeaves = g_leaveHistory
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Sort by start date (newest first)

    if (sortedLeaves.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-secondary-gray">No leave history found.</td></tr>`;
        return;
    }

    sortedLeaves.forEach(l => {
        let statusColorClass = l.status === 'Approved' ? 'text-accent-green' : (l.status === 'Pending' ? 'text-info-yellow' : 'text-accent-red');

        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${formatDate(l.startDate)}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${formatDate(l.endDate)}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${l.reason}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm font-medium ${statusColorClass}">${l.status}</td>
            </tr>
        `;
    });
}

function updateDashboardComplaintCount() {
    const pendingComplaints = g_complaints.filter(c => c.status === 'Pending');
    const openRequestsEl = document.getElementById('dashboard-open-requests');
    const openRequestsText = openRequestsEl.nextElementSibling;
    
    openRequestsEl.textContent = String(pendingComplaints.length).padStart(2, '0');
    
    if (pendingComplaints.length > 0) {
        openRequestsText.textContent = `Complaint Pending (${pendingComplaints[0].type || pendingComplaints[0].title})`;
    } else {
        openRequestsText.textContent = 'No open complaints.';
    }
}
async function submitFeedback() {
    if (!g_student || !g_student._id) {
        alert('Student data not available. Please try logging in again.');
        return;
    }
    const studentId = g_student._id;
    const form = document.getElementById('feedback-form'); // Make sure form ID matches HTML (form doesn't have ID in HTML, add id="feedback-form" to the <form> tag in HTML)
    // NOTE: In your HTML, the form inside #report-tab-content-feedback does not have an ID.
    // ACTION: Add id="feedback-form" to that <form> tag in student.html
    
    const category = document.getElementById('feedback-category').value;
    const description = document.getElementById('feedback-description').value;
    const isAnonymous = document.getElementById('feedback-anonymous').checked;

    if (!category || !description.trim()) {
        alert('Please fill out all required fields.');
        return;
    }

    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, category, description, isAnonymous }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(result.message);
            // Reset form fields manually since we might not have the form ID perfectly set yet
            document.getElementById('feedback-category').value = 'Mess & Food Quality'; // Reset to first option
            document.getElementById('feedback-description').value = '';
            document.getElementById('feedback-anonymous').checked = false;
        } else {
            throw new Error(result.message || 'Server error');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback.');
    }
}
async function submitLostItemReport() {
    if (!g_student || !g_student._id) {
        alert('Student data not available. Please try logging in again.');
        return;
    }
    const studentId = g_student._id;
    
    // In your HTML, the form inside #report-tab-content-lost-found doesn't have an ID.
    // The inputs are id="lost-item-name" and "lost-item-location"
    
    const itemName = document.getElementById('lost-item-name').value;
    const lastSeenLocation = document.getElementById('lost-item-location').value;

    if (!itemName.trim()) {
        alert('Please enter the name of the lost item.');
        return;
    }

    try {
        const response = await fetch('/api/lost-found/report-lost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, itemName, lastSeenLocation }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(result.message);
            // Clear inputs
            document.getElementById('lost-item-name').value = '';
            document.getElementById('lost-item-location').value = '';
        } else {
            throw new Error(result.message || 'Server error');
        }
    } catch (error) {
        console.error('Error reporting lost item:', error);
        alert('Failed to submit report.');
    }
}
async function fetchFoundItems() {
    const lostFoundBody = document.getElementById('lost-found-body');
    if (!lostFoundBody) return;

    lostFoundBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-secondary-gray">Loading...</td></tr>`;

    try {
        const response = await fetch('/api/lost-found/found-items');
        const result = await response.json();

        if (response.ok && result.success) {
            const items = result.foundItems; // Correctly maps to backend key
            lostFoundBody.innerHTML = '';

            if (items.length === 0) {
                lostFoundBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-accent-green">No found items reported yet.</td></tr>`;
                return;
            }

            items.forEach(item => {
                const date = new Date(item.submissionDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });
                
                // Color coding for status
                let statusColor = 'text-info-yellow'; // Pending
                if(item.status === 'Retrieved') statusColor = 'text-accent-green';
                if(item.status === 'Closed') statusColor = 'text-secondary-gray';

                lostFoundBody.innerHTML += `
                    <tr class="hover:bg-light-bg transition-colors">
                        <td class="py-3 px-6 text-sm font-medium text-accent-dark">${item.itemName}</td>
                        <td class="py-3 px-6 text-sm text-secondary-gray">${date}</td>
                        <td class="py-3 px-6 text-sm text-secondary-gray">${item.location}</td>
                        <td class="py-3 px-6 text-sm font-semibold ${statusColor}">
                            ${item.status}
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error('Error fetching found items:', error);
        lostFoundBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-accent-red">Error loading data.</td></tr>`;
    }
}
async function fetchFoundItems() {
    const lostFoundBody = document.getElementById('lost-found-body');
    if (!lostFoundBody) return;

    lostFoundBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-secondary-gray">Loading...</td></tr>`;

    try {
        const response = await fetch('/api/lost-found/found-items');
        const result = await response.json();

        if (response.ok && result.success) {
            const items = result.foundItems; // Correctly maps to backend key
            lostFoundBody.innerHTML = '';

            if (items.length === 0) {
                lostFoundBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-accent-green">No found items reported yet.</td></tr>`;
                return;
            }

            items.forEach(item => {
                const date = new Date(item.submissionDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });
                
                // Color coding for status
                let statusColor = 'text-info-yellow'; // Pending
                if(item.status === 'Retrieved') statusColor = 'text-accent-green';
                if(item.status === 'Closed') statusColor = 'text-secondary-gray';

                lostFoundBody.innerHTML += `
                    <tr class="hover:bg-light-bg transition-colors">
                        <td class="py-3 px-6 text-sm font-medium text-accent-dark">${item.itemName}</td>
                        <td class="py-3 px-6 text-sm text-secondary-gray">${date}</td>
                        <td class="py-3 px-6 text-sm text-secondary-gray">${item.location}</td>
                        <td class="py-3 px-6 text-sm font-semibold ${statusColor}">
                            ${item.status}
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error('Error fetching found items:', error);
        lostFoundBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-accent-red">Error loading data.</td></tr>`;
    }
}
// --- Dynamic "Other" Reason UI Setup ---
function setupLeaveForm() {
    const reasonSelect = document.getElementById('leave-reason');
    if (!reasonSelect) return;

    // Add "Other" option if not present
    if (!reasonSelect.querySelector('option[value="Other"]')) {
        const otherOpt = document.createElement('option');
        otherOpt.value = 'Other';
        otherOpt.text = 'Other (Type Manually)';
        reasonSelect.appendChild(otherOpt);
    }

    // Create hidden text input
    const manualInput = document.createElement('input');
    manualInput.type = 'text';
    manualInput.id = 'leave-reason-manual';
    manualInput.className = 'w-full p-3 border border-text-muted rounded-lg focus:ring-primary-blue focus:border-primary-blue bg-light-bg mt-2 hidden';
    manualInput.placeholder = 'Please type your reason here...';
    
    reasonSelect.parentNode.insertBefore(manualInput, reasonSelect.nextSibling);

    // Toggle listener
    reasonSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
            manualInput.classList.remove('hidden');
            manualInput.required = true;
        } else {
            manualInput.classList.add('hidden');
            manualInput.required = false;
        }
    });
}

function showStudentDetails() {
    showView('student-details-view');
    populateStudentProfileView();
}

function populateStudentProfileView() {
    if (!g_student) {
        console.error("No student data loaded.");
        document.getElementById('profile-name').textContent = 'Error loading data';
        return;
    }
    
    const student = g_student;
    const roomNumber = g_room ? g_room.roomNumber : 'N/A';
    const blockName = g_block ? g_block.blockName : 'N/A';
    const attendance = g_attendance;
    const complaints = g_complaints;

    // --- 1. Populate Profile Header ---
    document.getElementById('profile-name').textContent = student.name;
    const nameParts = student.name.split(' ');
    const initials = (nameParts[0] ? nameParts[0][0] : '') + (nameParts[1] ? nameParts[1][0] : '');
    
    const initialsEl = document.getElementById('profile-initials');
    const profileImgEl = document.getElementById('profile-image');

    if (student.profileImageUrl) {
        profileImgEl.src = student.profileImageUrl;
        profileImgEl.classList.remove('hidden');
        initialsEl.classList.add('hidden');
    } else {
        initialsEl.textContent = initials;
        initialsEl.classList.remove('hidden');
        profileImgEl.classList.add('hidden');
    }
    
    document.getElementById('profile-year').textContent = student.year || 'N/A';
    document.getElementById('profile-course').textContent = `${student.course || ''} ${student.department || ''}`;
    document.getElementById('profile-location').textContent = `${blockName} - Room ${roomNumber}`;

    // --- 2. Populate Contact Info ---
    document.getElementById('profile-email').textContent = student.email || 'N/A';
    document.getElementById('profile-phone').textContent = student.phone || 'N/A';
    document.getElementById('profile-join-date').textContent = formatDate(student.joiningDate);

    // --- 3. Populate Fee Details ---
    const feeStatusEl = document.getElementById('profile-fee-status');
    const paymentMethodEl = document.getElementById('profile-payment-method');
    
    feeStatusEl.textContent = student.feeStatus || 'Pending';
    paymentMethodEl.textContent = student.paymentMethod || 'Not Paid';
    
    feeStatusEl.classList.remove('bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');    
    if (student.feeStatus === 'Paid') {
        feeStatusEl.classList.add('bg-green-100', 'text-green-700');
    } else {
        feeStatusEl.textContent = 'Due';
        feeStatusEl.classList.add('bg-red-100', 'text-red-700');
    }

    // --- 4. Populate Assigned Assets ---
    const assetsList = document.getElementById('profile-assets-list');
    const assets = student.assets || [];
    if (assets.length === 0) {
        assetsList.innerHTML = '<p class="text-gray-500 col-span-full">No assets are currently assigned to you.</p>';
    } else {
        assetsList.innerHTML = '';
        const assetIcons = {
            'Table': '🪑', 'Chair': '🪑', 'Bed': '🛏️', 'Mattress': '🛏️',
            'Cupboard': '🚪', 'Fan': '💨', 'Light': '💡', 'System': '💻', 'Other': '📝'
        };
        
        assets.forEach(asset => {
            const assetName = asset.name || 'Unknown Asset';
            const assetTypeMatch = Object.keys(assetIcons).find(key => assetName.toLowerCase().includes(key.toLowerCase()));
            const icon = assetIcons[assetTypeMatch] || assetIcons['Other'];

            const item = `
                <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <span class="text-2xl">${icon}</span>
                    <div>
                        <p class="font-medium text-gray-800">${assetName}</p>
                        <p class="text-sm text-gray-500">Quantity: ${asset.quantity}</p>
                    </div>
                </div>
            `;
            assetsList.innerHTML += item;
        });
    }

    // --- 5. Populate Attendance Log ---
    const attendanceTable = document.getElementById('profile-attendance-log-table');
    if (!attendance || attendance.length === 0) {
        attendanceTable.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500">No attendance data found.</td></tr>';
    } else {
        attendanceTable.innerHTML = '';
        attendance.slice(0, 5).forEach(log => { 
            const statusColor = log.status === 'Present' ? 'text-green-600' : 'text-red-600';
            const row = `
                <tr>
                    <td class="p-4 text-gray-800 font-medium">${formatDate(log.date)}</td>
                    <td class="p-4 text-gray-700">${log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : '--'}</td>
                    <td class="p-4 text-gray-700">${log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : '--'}</td>
                    <td class="p-4 font-medium ${statusColor}">${log.status}</td>
                </tr>
            `;
            attendanceTable.innerHTML += row;
        });
    }

    // --- 6. Populate Complaints List ---
    const complaintsList = document.getElementById('profile-complaints-list');
    if (!complaints || complaints.length === 0) {
        complaintsList.innerHTML = '<p class="text-gray-500">No complaints filed by this student.</p>';
    } else {
        complaintsList.innerHTML = '';
        complaints.forEach(complaint => {
            const statusColor = complaint.status === 'Resolved'    
                ? 'bg-green-100 text-green-700'    
                : 'bg-yellow-100 text-yellow-700';
            
            const item = `
                <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                    <div>
                        <p class="font-medium text-gray-800">${complaint.type || complaint.title}</p>
                        <p class="text-sm text-gray-500">Filed on: ${formatDate(complaint.date)} | Priority: ${complaint.priority}</p>
                    </div>
                    <span class="text-xs font-bold px-3 py-1 rounded-full ${statusColor}">${complaint.status}</span>
                </div>
            `;
            complaintsList.innerHTML += item;
        });
    }
}

// =========================================================================
// MISSING CORE FUNCTIONS (Add these to fix ReferenceErrors)
// =========================================================================

// --- 1. ATTENDANCE FUNCTIONS ---

async function toggleAttendance() {
    if (!g_student || !g_student._id) return;

    // Determine action based on current status
    const action = g_attendanceStatus.status === 'Checked In' ? 'check-out' : 'check-in';
    const statusToSend = action === 'check-in' ? 'Present' : 'Absent';

    try {
        const response = await fetch('/api/attendance/mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                studentId: g_student._id, 
                status: statusToSend 
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(`Successfully ${action === 'check-in' ? 'Checked In' : 'Checked Out'}!`);
            
            // Update local state immediately
            g_attendanceStatus.status = action === 'check-in' ? 'Checked In' : 'Checked Out';
            g_attendanceStatus.lastActionTime = new Date();
            
            // Update UI
            updateAttendanceStatus(); 
            
            // Refresh the log data
            await loadStudentData(); // Reloads all data to get the new log entry
            populateAttendanceLog(); 
        } else {
            throw new Error(result.message || 'Failed to update attendance');
        }
    } catch (error) {
        console.error('Attendance Error:', error);
        alert(error.message);
    }
}

function updateAttendanceStatus() {
    const statusText = document.getElementById('attendance-status-text');
    const statusTime = document.getElementById('attendance-status-time');
    const toggleBtn = document.getElementById('attendance-toggle-btn');
    const statusCard = document.getElementById('attendance-status-card');

    if (!statusText || !toggleBtn) return;

    if (g_attendanceStatus.status === 'Checked In') {
        // UI for Checked In
        statusText.textContent = 'Checked In';
        statusText.classList.remove('text-secondary-gray');
        statusText.classList.add('text-accent-green');
        
        statusCard.classList.remove('border-accent-red'); // Remove red border if present
        statusCard.classList.add('border-accent-green');

        toggleBtn.textContent = 'Check Out';
        toggleBtn.classList.remove('bg-accent-green', 'hover:bg-green-700');
        toggleBtn.classList.add('bg-accent-red', 'hover:bg-red-700');
    } else {
        // UI for Checked Out
        statusText.textContent = 'Checked Out';
        statusText.classList.remove('text-accent-green');
        statusText.classList.add('text-secondary-gray'); // Or red if you prefer
        
        statusCard.classList.remove('border-accent-green');
        statusCard.classList.add('border-accent-red');

        toggleBtn.textContent = 'Check In';
        toggleBtn.classList.remove('bg-accent-red', 'hover:bg-red-700');
        toggleBtn.classList.add('bg-accent-green', 'hover:bg-green-700');
    }

    if (g_attendanceStatus.lastActionTime) {
        statusTime.textContent = `Since: ${formatTime(g_attendanceStatus.lastActionTime)}`;
    } else {
        statusTime.textContent = 'Status unknown';
    }
}

function populateAttendanceLog() {
    const tbody = document.getElementById('attendance-log-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Sort by date descending (newest first)
    const sortedLog = [...g_attendance].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedLog.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500">No attendance records yet.</td></tr>';
        return;
    }

    sortedLog.slice(0, 7).forEach(log => {
        const dateStr = formatDate(log.date);
        const checkIn = log.checkInTime ? formatTime(log.checkInTime) : '--';
        const checkOut = log.checkOutTime ? formatTime(log.checkOutTime) : '--';
        const statusColor = log.status === 'Present' ? 'text-accent-green' : 'text-accent-red';

        const row = `
            <tr class="hover:bg-light-bg transition-colors">
                <td class="py-3 px-6 text-sm text-accent-dark">${dateStr}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${checkIn}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${checkOut}</td>
                <td class="py-3 px-6 text-sm font-semibold ${statusColor}">${log.status}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// --- 2. COMPLAINT FUNCTIONS ---

async function submitComplaint() {
    if (!g_student || !g_student._id) return;

    const type = document.getElementById('complaint-type').value;
    const location = document.getElementById('complaint-location').value;
    const date = document.getElementById('complaint-date').value;
    const priority = document.getElementById('complaint-priority').value;
    const description = document.getElementById('complaint-description').value;

    if (!type || !location || !priority || !description) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: g_student._id,
                title: `${type} Issue at ${location}`, // Auto-generate title
                type,
                location,
                priority,
                description,
                date: date || new Date()
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Complaint submitted successfully!');
            document.getElementById('complaint-form').reset();
            
            // Refresh data
            await loadStudentData();
            populateStudentComplaintHistory();
            updateDashboardComplaintCount();
        } else {
            alert(result.message || 'Failed to submit complaint');
        }
    } catch (err) {
        console.error(err);
        alert('Server error submitting complaint');
    }
}

// --- 3. VISITOR REQUEST FUNCTIONS ---

async function submitVisitorRequest() {
    if (!g_student || !g_student._id) return;

    const visitorName = document.getElementById('visitor-name').value;
    const checkInDate = document.getElementById('visitor-start-date').value;
    const checkOutDate = document.getElementById('visitor-end-date').value;
    const reason = document.getElementById('visitor-reason').value;

    if (!visitorName || !checkInDate || !checkOutDate || !reason) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await fetch('/api/visitor-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: g_student._id,
                visitorName,
                visitDate: checkInDate, 
                checkOutDate,
                reason
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Visitor request submitted for approval.');
            document.getElementById('visitor-request-form').reset();
            
            // Refresh list specifically
            const histRes = await fetch(`/api/visitor-request/history/${g_student._id}`);
            const histData = await histRes.json();
            if(histData.success) {
                g_visitorRequests = histData.visitorRequests;
                populateVisitorRequestHistory();
            }
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Error submitting request');
    }
}

function populateVisitorRequestHistory() {
    const tbody = document.getElementById('visitor-request-history-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Sort newest first
    const sorted = [...g_visitorRequests].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">No visitor requests found.</td></tr>';
        return;
    }

    sorted.forEach(req => {
        const start = formatDate(req.visitDate);
        const end = formatDate(req.checkOutDate);
        
        let statusColor = 'text-info-yellow';
        if(req.status === 'Approved') statusColor = 'text-accent-green';
        if(req.status === 'Rejected') statusColor = 'text-accent-red';

        const row = `
            <tr class="hover:bg-light-bg transition-colors">
                <td class="py-3 px-6 text-sm font-medium text-accent-dark">${req.visitorName}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${start}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${end}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${req.reason}</td>
                <td class="py-3 px-6 text-sm font-bold ${statusColor}">${req.status}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// --- 4. LEAVE REQUEST FUNCTIONS ---

async function submitLeave() {
    if (!g_student || !g_student._id) return;

    const startDate = document.getElementById('leave-start').value;
    const endDate = document.getElementById('leave-end').value;
    let reason = document.getElementById('leave-reason').value;

    if (reason === 'Other') {
        reason = document.getElementById('leave-reason-manual').value;
    }

    if (!startDate || !endDate || !reason) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await fetch('/api/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: g_student._id,
                startDate,
                endDate,
                reason
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Leave request submitted successfully.');
            // Clear inputs
            document.getElementById('leave-start').value = '';
            document.getElementById('leave-end').value = '';
            
            // Refresh History
            const histRes = await fetch(`/api/leave/history/${g_student._id}`);
            const histData = await histRes.json();
            if(histData.success) {
                g_leaveHistory = histData.leaves;
                populateStudentLeaveHistory();
            }
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Error submitting leave request');
    }
}
// =========================================================================
// INITIALIZATION
// =========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    
    const success = await loadStudentData();    
    
    if (success) {
        // Initialize dynamic UI elements
        setupLeaveForm();

        // Load club activities
        await loadClubActivities();
        
        initializeDashboard();    
        showView('student-dashboard-view');
        
        document.getElementById('mobile-menu-button').addEventListener('click', toggleMobileMenu);
        document.getElementById('attendance-toggle-btn').addEventListener('click', toggleAttendance);
    }
});