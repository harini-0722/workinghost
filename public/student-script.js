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
let g_lostFoundItems = []; // <-- ADDED: New global variable for Lost & Found data

let g_attendanceStatus = { status: 'Checked Out', lastActionTime: null };

// --- Mock data (Only for Lost & Found and Announcements now) ---
// We will keep this here but modify the populateLostAndFound function to use the actual data
const mockLostFound = [
    { id: 'F001', item: 'Blue Umbrella (MOCK)', dateFound: '2025-10-20', location: 'Hostel Lobby', status: 'Available' },
    { id: 'F002', item: 'Physics Textbook (MOCK)', dateFound: '2025-10-18', location: 'Common Room', status: 'Available' },
];

const mockAnnouncements = [
    {
        id: 1,
        date: '2025-10-24',
        title: 'Mandatory Hostel Meeting - Oct 25th',
        short_desc: 'All residents are required to attend a mandatory meeting regarding...',
        full_desc: '<p>All residents are required to attend a mandatory meeting regarding new security protocols.</p><p><strong>Date:</strong> October 25th, 2005<br><strong>Time:</strong> 7:00 PM<br><strong>Location:</strong> Mess Hall</p><p>Attendance will be taken. Please be on time.</p>'
    }
];

// =========================================================================
// DATA LOADING & REFRESH
// =========================================================================

/**
 * NEW FUNCTION: Fetch Lost and Found items from the server.
 */
async function loadLostFoundItems() {
    try {
        // ASSUMPTION: The API endpoint for found items is /api/lost-found/found
        const response = await fetch('/api/lost-found/found'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
            // Assuming data.items contains the array of found items
            g_lostFoundItems = data.items || [];
            console.log('✅ Lost & Found items loaded:', g_lostFoundItems);
        } else {
            throw new Error(data.message || 'Failed to fetch lost and found data.');
        }
    } catch (error) {
        console.error('❌ Failed to load Lost & Found items:', error);
        // Fallback to mock data if API fails, but log the error
        g_lostFoundItems = mockLostFound; 
    }
}


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
        
        // Fetch Lost and Found Items (Calling new function)
        await loadLostFoundItems(); 


        // Get current attendance status
        const statusResponse = await fetch(`/api/attendance/status/${studentId}`);
        if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.success) {
                g_attendanceStatus.status = statusData.status;
                g_attendanceStatus.lastActionTime = statusData.lastActionTime;
            }
        }

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
// API FUNCTIONS
// =========================================================================

async function submitComplaint() {
    const type = document.getElementById('complaint-type').value;
    const location = document.getElementById('complaint-location').value;
    const date = document.getElementById('complaint-date').value;
    const priority = document.getElementById('complaint-priority').value;
    const description = document.getElementById('complaint-description').value;
    const studentId = g_student._id;

    if (!type || !location || !date || !priority || !description || !studentId) {
        alert('Please fill all required fields and ensure student data is loaded.');
        return;
    }

    const complaintData = {
        studentId: studentId, 
        type: type,
        location: location,
        date: date,
        priority: priority,
        description: description,
        title: `${type} - ${location}`,
    };

    try {
        const response = await fetch('/api/complaints', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(complaintData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`Complaint submitted successfully!\n\nComplaint ID: #C${data.complaint._id.slice(-4)}\nPriority: ${priority}\nStatus: Pending Review`);
            
            // Refresh data and UI
            await loadStudentData(); 
            populateStudentComplaintHistory();
            updateDashboardComplaintCount();
            
            document.getElementById('complaint-form').reset();
        } else {
            throw new Error(data.message || 'Failed to submit complaint on the server.');
        }

    } catch (error) {
        console.error('Submission Error:', error);
        alert(`Failed to submit complaint: ${error.message}`);
    }
}

async function submitVisitorRequest() {
    const name = document.getElementById('visitor-name').value;
    const startDate = document.getElementById('visitor-start-date').value;
    const endDate = document.getElementById('visitor-end-date').value;
    const reason = document.getElementById('visitor-reason').value;
    const studentId = g_student._id; 

    if (!name || !startDate || !endDate || !reason || !studentId) {
        alert('Please fill out all fields and ensure you are logged in.');
        return;
    }
    if (new Date(endDate) < new Date(startDate)) {
        alert('End date must be after the start date.');
        return;
    }
    
    const requestData = {
        studentId: studentId,
        visitorName: name,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
    };

    try {
        const response = await fetch('/api/visitor-request', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`Visitor request for ${name} submitted successfully! Status: Pending`);
            
            // Refresh visitor data and UI
            try {
                const vRes = await fetch(`/api/visitor-request/history/${studentId}`);
                const vData = await vRes.json();
                if(vData.success) {
                    g_visitorRequests = vData.visitorRequests;
                    populateVisitorRequestHistory();
                }
            } catch(err) { console.error(err); }
            
            document.getElementById('visitor-request-form').reset();
        } else {
            throw new Error(data.message || 'Failed to submit visitor request on the server.');
        }

    } catch (error) {
        console.error('Submission Error:', error);
        alert(`Failed to submit request: ${error.message}`);
    }
}

// --- NEW LEAVE FUNCTIONALITY ---

function toggleLeaveReason() {
    const reasonSelect = document.getElementById('leave-reason');
    const manualInput = document.getElementById('leave-reason-manual');
    if (reasonSelect.value === 'Other') {
        manualInput.classList.remove('hidden');
        manualInput.required = true;
    } else {
        manualInput.classList.add('hidden');
        manualInput.required = false;
        manualInput.value = '';
    }
}

async function submitLeave() {
    const start = document.getElementById('leave-start').value;
    const end = document.getElementById('leave-end').value;
    const reasonSelect = document.getElementById('leave-reason');
    let reason = reasonSelect.value;
    
    // Check if "Other" is selected and get text value
    if (reason === 'Other') {
        const manualReason = document.getElementById('leave-reason-manual').value.trim();
        if (!manualReason) {
            alert('Please type your reason for leave.');
            return;
        }
        reason = manualReason;
    }

    if (!start || !end || !reason) {
        alert('Please select start date, end date, and reason.');
        return;
    }
    if (new Date(end) < new Date(start)) {
        alert('Return date must be after the departure date.');
        return;
    }

    const leaveData = {
        studentId: g_student._id,
        startDate: start,
        endDate: end,
        reason: reason
    };

    try {
        const response = await fetch('/api/leave', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leaveData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`Leave request submitted successfully!`);
            
            // Refresh leave data and UI
            const lRes = await fetch(`/api/leave/history/${g_student._id}`);
            const lData = await lRes.json();
            if(lData.success) {
                g_leaveHistory = lData.leaves;
                populateStudentLeaveHistory();
            }
            
            // Reset form
            document.getElementById('leave-start').value = '';
            document.getElementById('leave-end').value = '';
            reasonSelect.value = 'Family Emergency'; 
            
            // Reset "Other" input
            const manualInput = document.getElementById('leave-reason-manual');
            if(manualInput) {
                manualInput.value = '';
                manualInput.classList.add('hidden');
            }
        } else {
            throw new Error(data.message || 'Failed to submit leave request.');
        }

    } catch (error) {
        console.error('Leave Submission Error:', error);
        alert(`Failed to submit leave request: ${error.message}`);
    }
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

// =========================================================================
// UTILITIES & NAVIGATION
// =========================================================================
function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    // Check if the input is already a date object or string
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'N/A'; // Check for invalid date
    
    return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });    
}

function formatTime(isoString) {
    if (!isoString) return '...';
    // Check if the input is already a date object or string
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    if (isNaN(date.getTime())) return '...'; // Check for invalid date
    
    return date.toLocaleTimeString('en-US', {    
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
        populateLostAndFound(); // This will now use the correct data
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

function showReportTab(tabName) {
    document.querySelectorAll('.report-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.classList.remove('active', 'border-primary-blue', 'text-primary-blue');
    });
    
    document.getElementById(`report-tab-content-${tabName}`).classList.remove('hidden');
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.classList.add('active', 'border-primary-blue', 'text-primary-blue');
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
// DATA POPULATION FUNCTIONS
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
    updateDashboardComplaintCount(); // Moved out for clarity

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

function updateDashboardComplaintCount() {
    const pendingComplaints = g_complaints.filter(c => c.status === 'Pending');
    const openRequestsEl = document.getElementById('dashboard-open-requests');
    const openRequestsText = openRequestsEl.nextElementSibling;
    
    openRequestsEl.textContent = String(pendingComplaints.length).padStart(2, '0');
    
    if (pendingComplaints.length > 0) {
        // Use the type or title of the first pending complaint
        openRequestsText.textContent = `Complaint Pending (${pendingComplaints[0].type || pendingComplaints[0].title})`;
    } else {
        openRequestsText.textContent = 'No open complaints.';
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
    let manualInput = document.getElementById('leave-reason-manual');
    if (!manualInput) {
        manualInput = document.createElement('input');
        manualInput.type = 'text';
        manualInput.id = 'leave-reason-manual';
        manualInput.className = 'w-full p-3 border border-text-muted rounded-lg focus:ring-primary-blue focus:border-primary-blue bg-light-bg mt-2 hidden';
        manualInput.placeholder = 'Please type your reason here...';
        
        reasonSelect.parentNode.insertBefore(manualInput, reasonSelect.nextSibling);
    }

    // Toggle listener
    reasonSelect.addEventListener('change', toggleLeaveReason);
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
// ATTENDANCE & OTHER FUNCTIONS
// =========================================================================

function updateAttendanceStatus() {
    const card = document.getElementById('attendance-status-card');
    const statusText = document.getElementById('attendance-status-text');
    const timeText = document.getElementById('attendance-status-time');
    const button = document.getElementById('attendance-toggle-btn');

    card.classList.remove('border-accent-green', 'border-accent-red');
    statusText.classList.remove('text-accent-green', 'text-accent-red');
    button.classList.remove('bg-accent-green', 'bg-accent-red', 'hover:bg-green-700', 'hover:bg-red-700');

    if (g_attendanceStatus.status === 'Checked In') {
        card.classList.add('border-accent-green');
        statusText.classList.add('text-accent-green');
        statusText.textContent = 'Checked In';
        timeText.textContent = `Since: ${formatTime(g_attendanceStatus.lastActionTime)}`;
        button.classList.add('bg-accent-red', 'hover:bg-red-700');
        button.textContent = 'Check Out';
    } else {
        card.classList.add('border-accent-red');
        statusText.classList.add('text-accent-red');
        statusText.textContent = 'Checked Out';
        timeText.textContent = g_attendanceStatus.lastActionTime ? `Since: ${formatTime(g_attendanceStatus.lastActionTime)}` : 'Not yet checked in today';
        button.classList.add('bg-accent-green', 'hover:bg-green-700');
        button.textContent = 'Check In';
    }
}

async function toggleAttendance() {
    const button = document.getElementById('attendance-toggle-btn');
    button.disabled = true;
    button.textContent = 'Updating...';

    try {
        const response = await fetch('/api/attendance/toggle', {    
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: g_student._id })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }

        g_attendanceStatus.status = data.newStatus;
        g_attendanceStatus.lastActionTime = data.lastActionTime;

        updateAttendanceStatus();
        
        const attResponse = await fetch(`/api/student/${g_student._id}`);
        const attData = await attResponse.json();
        if (attData.success) {
            g_attendance = attData.attendance;    
            populateAttendanceLog();    
        }
        
    } catch (error) {
        console.error('Error toggling attendance:', error);
        alert(`Error: ${error.message}`);
    } finally {
        button.disabled = false;
    }
}

function populateAttendanceLog() {
    const tableBody = document.getElementById('attendance-log-body');
    tableBody.innerHTML = '';
    
    if (g_attendance.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-secondary-gray">No attendance log found.</td></tr>`;
        return;
    }
    
    g_attendance.slice(0, 7).forEach(log => {
        const statusClass = log.status === 'Present' ? 'text-accent-green' : 'text-accent-red';
        let formattedDate = log.date ? formatDate(log.date) : 'N/A';
        
        let checkIn = log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : '--';
        let checkOut = log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : '--';

        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${formattedDate}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${checkIn}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${checkOut}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm font-medium ${statusClass}">${log.status}</td>
            </tr>
        `;
    });
}

function populateVisitorRequestHistory() {
    const tableBody = document.getElementById('visitor-request-history-body');
    tableBody.innerHTML = '';
    
    const myVisitorHistory = g_visitorRequests
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); 

    if (myVisitorHistory.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="py-4 px-6 text-center text-secondary-gray">No visitor request history.</td></tr>`;
        return;
    }

    myVisitorHistory.forEach(v => {
        let statusClass;
        if (v.status === 'Approved') {
            statusClass = 'text-accent-green';
        } else if (v.status === 'Pending') {
            statusClass = 'text-info-yellow';
        } else {
            statusClass = 'text-accent-red'; 
        }
        
        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${v.visitorName}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${formatDate(v.startDate)}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${formatDate(v.endDate)}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${v.reason}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm font-medium ${statusClass}">${v.status}</td>
            </tr>
        `;
    });
}

/**
 * FIXED FUNCTION: Now uses g_lostFoundItems populated from API call in loadStudentData.
 */
function populateLostAndFound() {
    const tableBody = document.getElementById('lost-found-body');
    tableBody.innerHTML = '';
    
    // Use the fetched data (g_lostFoundItems)
    const items = g_lostFoundItems; 
    
    if (items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-secondary-gray">No items reported found.</td></tr>`;
        return;
    }
    items.forEach(item => {
        // Assuming item objects have properties: item, dateFound, location, status
        const statusClass = item.status === 'Available' ? 'text-accent-green' : 'text-secondary-gray';
        const formattedDate = formatDate(item.dateFound); // Use your existing date formatter
        
        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${item.item}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${formattedDate}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${item.location}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm font-medium ${statusClass}">${item.status}</td>
            </tr>
        `;
    });
}

// --- Announcement Modal Functions ---
function openAnnouncementsModal() {
    document.getElementById('announcement-modal').classList.remove('hidden');
    populateAnnouncementsList();
}
function closeAnnouncementsModal() {
    document.getElementById('announcement-modal').classList.add('hidden');
}
function populateAnnouncementsList() {
    document.getElementById('announcement-list-view').classList.remove('hidden');
    document.getElementById('announcement-detail-view').classList.add('hidden');
    const container = document.getElementById('announcement-list-container');
    container.innerHTML = '';    
    mockAnnouncements.forEach(ann => {
        container.innerHTML += `
            <a href="#" onclick="event.preventDefault(); showAnnouncementDetail(${ann.id})" class="block p-4 rounded-lg bg-light-bg hover:bg-gray-200 transition duration-200">
                <p class="text-xs text-secondary-gray">${ann.date}</p>
                <h4 class="font-bold text-accent-dark hover:text-primary-blue">${ann.title}</h4>
                <p class="text-sm text-secondary-gray">${ann.short_desc}</p>
            </a>
        `;
    });
}
function showAnnouncementDetail(id) {
    const ann = mockAnnouncements.find(a => a.id === id);
    if (!ann) return;
    document.getElementById('announcement-list-view').classList.add('hidden');
    document.getElementById('announcement-detail-view').classList.remove('hidden');
    document.getElementById('announcement-detail-title').textContent = ann.title;
    document.getElementById('announcement-detail-date').textContent = `Posted on: ${ann.date}`;
    document.getElementById('announcement-detail-body').innerHTML = ann.full_desc;
}
function showAnnouncementsList() {
    document.getElementById('announcement-detail-view').classList.add('hidden');
    document.getElementById('announcement-list-view').classList.remove('hidden');
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