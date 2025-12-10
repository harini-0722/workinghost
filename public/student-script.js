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
let g_foundItems = []; // Store real found items
let g_lostReports = []; // ADDED: Store real lost reports for the student

let g_attendanceStatus = { status: 'Checked Out', lastActionTime: null };

// --- Mock data (Only for Announcements now) ---
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

async function fetchFoundItems() {
    try {
        // Calls the /api/lostandfound/found-items route
        const response = await fetch('/api/lostandfound/found-items');
        const data = await response.json();
        if (data.success) {
            g_foundItems = data.foundItems;
            console.log('✅ Found Items loaded:', g_foundItems);
        } else {
            console.error('Failed to load found items:', data.message);
        }
    } catch (error) {
        console.error('Error fetching found items:', error);
    }
}

// NEW: Function to fetch the student's lost reports
async function fetchLostReports(studentId) {
    try {
        // Calls the /api/lostandfound/lost-reports/:studentId route
        const response = await fetch(`/api/lostandfound/lost-reports/${studentId}`);
        const data = await response.json();
        if (data.success) {
            g_lostReports = data.lostItems;
            console.log('✅ Lost Reports loaded:', g_lostReports);
        } else {
            console.error('Failed to load lost reports:', data.message);
        }
    } catch (error) {
        console.error('Error fetching lost reports:', error);
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
        
        // Fetch Found Items 
        await fetchFoundItems(); 

        // NEW: Fetch Lost Reports for the student
        await fetchLostReports(studentId); 

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
            await loadStudentData(); // Reloads all data including complaints
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

// NEW: Function to submit a LOST item report
async function submitLostItemReport() {
    const itemName = document.getElementById('lost-item-name').value;
    const lastSeenLocation = document.getElementById('lost-item-location').value;
    const studentId = g_student._id;

    if (!itemName || !lastSeenLocation || !studentId) {
        alert('Please fill out all fields and ensure you are logged in.');
        return;
    }

    const reportData = {
        studentId: studentId,
        itemName: itemName,
        // The server expects 'lastSeenLocation' for a POST request to /report-lost
        lastSeenLocation: lastSeenLocation, 
    };

    try {
        const response = await fetch('/api/lostandfound/report-lost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`Lost item report for "${itemName}" submitted successfully!`);

            // Refresh lost reports and UI
            await fetchLostReports(studentId);
            populateLostReportsTable();
            
            document.getElementById('lost-item-form').reset();
        } else {
            throw new Error(data.message || 'Failed to submit lost item report on the server.');
        }
    } catch (error) {
        console.error('Lost Report Submission Error:', error);
        alert(`Failed to submit report: ${error.message}`);
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

// --- LEAVE FUNCTIONALITY (kept as is) ---

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
    
    const sortedLeaves = g_leaveHistory
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

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
// LOST & FOUND FUNCTIONS
// =========================================================================

// NEW: Function to populate the 'Recently Found Items' table (using g_foundItems)
function populateFoundItemsTable() {
    const tableBody = document.getElementById('lost-found-body');
    tableBody.innerHTML = ''; // Clear existing content

    if (!g_foundItems || g_foundItems.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-secondary-gray">No items have been found recently.</td></tr>`;
        return;
    }

    // g_foundItems holds data fetched from /api/lostandfound/found-items
    g_foundItems.forEach(item => {
        // Status class based on LostFound model statuses (Pending, Retrieved, Closed)
        let statusClass = item.status === 'Retrieved' ? 'bg-accent-green/20 text-accent-green' : 'bg-info-yellow/20 text-info-yellow';
        if (item.status === 'Closed') statusClass = 'bg-gray-200/50 text-secondary-gray';

        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${item.itemName}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${formatDate(item.submissionDate)}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${item.location}</td>
                <td class="py-3 px-6 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${item.status}
                    </span>
                </td>
            </tr>
        `;
    });
}

// NEW: Function to populate the 'My Lost Reports' table (using g_lostReports)
function populateLostReportsTable() {
    const tableBody = document.getElementById('lost-reports-body');
    tableBody.innerHTML = ''; // Clear existing content

    if (!g_lostReports || g_lostReports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-secondary-gray">You have not filed any lost item reports.</td></tr>`;
        return;
    }

    // g_lostReports holds data fetched from /api/lostandfound/lost-reports/:studentId
    g_lostReports.forEach(report => {
        let statusClass;
        if (report.status === 'Retrieved') { statusClass = 'bg-accent-green/20 text-accent-green'; }
        else if (report.status === 'Pending') { statusClass = 'bg-info-yellow/20 text-info-yellow'; }
        else { statusClass = 'bg-accent-red/20 text-accent-red'; } // For 'Closed' or other statuses

        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${report.itemName}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${formatDate(report.submissionDate)}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${report.location}</td>
                <td class="py-3 px-6 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${report.status}
                    </span>
                </td>
            </tr>
        `;
    });
}

// NEW: Helper function to initialize all Lost & Found tables
function initializeLostAndFound() {
    populateLostReportsTable();
    populateFoundItemsTable();
}


// =========================================================================
// UTILITIES & NAVIGATION
// =========================================================================
function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    // Ensure dateString is treated as UTC/GMT to avoid timezone shifting issues
    const date = new Date(dateString);
    if (isNaN(date)) return 'N/A';
    
    return date.toLocaleDateString('en-GB', {
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
    const mobileLinks = document.querySelectorAll('#mobile-menu .nav-link');

    allLinks.forEach(link => {
        link.classList.remove('active', 'border-primary-blue', 'text-primary-blue');
        link.classList.add('border-transparent', 'text-secondary-gray', 'hover:text-primary-blue');
    });

    mobileLinks.forEach(link => {
        link.classList.remove('border-primary-blue', 'text-primary-blue', 'bg-light-bg');
        link.classList.add('border-transparent', 'text-gray-600', 'hover:bg-light-bg', 'hover:text-gray-800');
    });

    const activeLink = document.getElementById(`nav-${viewId}`);
    const activeMobileLink = document.getElementById(`mobile-nav-${viewId}`);

    if (activeLink) {
        activeLink.classList.add('active', 'border-b-2', 'border-primary-blue', 'text-primary-blue');
        activeLink.classList.remove('border-transparent', 'text-secondary-gray');
    }

    if (activeMobileLink) {
        activeMobileLink.classList.add('active', 'border-l-4', 'border-primary-blue', 'text-primary-blue', 'bg-light-bg');
        activeMobileLink.classList.remove('border-transparent', 'text-gray-600', 'hover:bg-light-bg', 'hover:text-gray-800');
    }
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
    updateActiveMenuItem(viewId);
    window.scrollTo(0, 0);

    // Special logic for specific views
    if (viewId === 'student-profile-view') {
        populateStudentProfile(g_student, g_block.blockName, g_room.roomNumber, g_complaints);
    } else if (viewId === 'student-room-view') {
        populateRoommatesList();
    } else if (viewId === 'student-attendance-view') {
        updateAttendanceStatus();
        populateAttendanceHistory();
    } else if (viewId === 'student-reports-view') {
        // Ensure default tab is populated when view is opened
        showReportTab('complaints');
    } else if (viewId === 'student-visitor-view') {
        populateVisitorRequestHistory();
    } else if (viewId === 'student-leave-view') {
        populateStudentLeaveHistory();
    }
}

// ADDED: Function to handle Report Tab switching
function showReportTab(tabName) {
    document.querySelectorAll('.report-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.report-tab').forEach(el => el.classList.remove('border-primary-blue', 'text-primary-blue', 'border-transparent', 'text-secondary-gray', 'hover:text-gray-800'));
    
    // Add active class and styling to the selected tab button
    document.getElementById(`tab-${tabName}`).classList.add('border-b-2', 'border-primary-blue', 'text-primary-blue');
    document.getElementById(`tab-${tabName}`).classList.remove('border-transparent', 'text-secondary-gray', 'hover:text-gray-800');

    // Show the corresponding content
    document.getElementById(`report-tab-content-${tabName}`).classList.remove('hidden');

    // Call specific population functions when the tab is switched to
    if (tabName === 'complaints') {
        populateStudentComplaintHistory();
    } else if (tabName === 'lost-found') {
        initializeLostAndFound(); // This ensures the tables are loaded with real data
    }
}


function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const button = document.getElementById('mobile-menu-button');
    const isExpanded = button.getAttribute('aria-expanded') === 'true' || false;

    if (isExpanded) {
        menu.classList.add('hidden');
        button.setAttribute('aria-expanded', 'false');
    } else {
        menu.classList.remove('hidden');
        button.setAttribute('aria-expanded', 'true');
    }
}

function hideMobileMenu() {
    document.getElementById('mobile-menu').classList.add('hidden');
    document.getElementById('mobile-menu-button').setAttribute('aria-expanded', 'false');
}

function showStudentDetails() {
    showView('student-profile-view');
}

function updateStudentDashboard() {
    // 1. Student Info
    document.getElementById('dashboard-greeting').textContent = `Welcome back, ${g_student.name.split(' ')[0]}!`;
    const initialBox = document.getElementById('nav-initials');
    const navImg = document.getElementById('nav-profile-image');
    
    const nameParts = g_student.name.split(' ');
    const initials = (nameParts[0] ? nameParts[0][0] : '') + (nameParts[1] ? nameParts[1][0] : '');
    
    if (g_student.profileImageUrl) {
         navImg.src = g_student.profileImageUrl;
         navImg.classList.remove('hidden');
         initialBox.classList.add('hidden');
    } else {
         initialBox.textContent = initials;
         initialBox.classList.remove('hidden');
         navImg.classList.add('hidden');
    }

    // 2. Room Card
    document.getElementById('dashboard-room-number').textContent = g_room.roomNumber;
    document.getElementById('dashboard-room-block').textContent = g_block.blockName;
    document.getElementById('dashboard-room-capacity').textContent = `${g_roommates.length + 1}/${g_room.capacity}`;
    
    // 3. Fee Status Card
    const feeStatusEl = document.getElementById('dashboard-fee-status');
    const feeStatusIcon = document.getElementById('dashboard-fee-status-icon');
    
    if (g_student.feeStatus === 'Due' || g_student.feeStatus === 'Overdue') {
        feeStatusEl.textContent = g_student.feeStatus;
        feeStatusIcon.classList.replace('text-accent-green', 'text-accent-red');
        feeStatusIcon.innerHTML = '<span>●</span> <span class="ml-1">Payment required.</span>';
    } else {
        feeStatusEl.textContent = g_student.feeStatus;
        feeStatusIcon.classList.replace('text-accent-red', 'text-accent-green');
        feeStatusIcon.innerHTML = '<span>●</span> <span class="ml-1">No outstanding balance.</span>';
    }

    // 4. Open Requests Card
    updateDashboardComplaintCount();

    // 5. Display Club Activities
    displayClubActivitiesOnDashboard();
    
    // 6. Display Announcements (mocked)
    populateAnnouncementsList();
}

function updateDashboardComplaintCount() {
    const openRequestsEl = document.getElementById('dashboard-open-requests');
    const openRequestsText = document.getElementById('dashboard-open-requests-text');
    const pendingComplaints = g_complaints.filter(c => c.status === 'Pending' || c.status === 'Critical');
    
    openRequestsEl.textContent = String(pendingComplaints.length).padStart(2, '0');
    
    if (pendingComplaints.length > 0) {
        // Show the title of the highest priority pending complaint
        const highestPriority = pendingComplaints.sort((a, b) => {
            const priorityOrder = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        })[0];
        openRequestsText.textContent = `${pendingComplaints.length} Pending Complaints (Highest: ${highestPriority.title})`;
    } else {
        openRequestsText.textContent = 'No open complaints.';
    }
}


function populateStudentProfile(student, blockName, roomNumber, complaints) {
    if (!student) return;

    // Profile Details
    document.getElementById('profile-name').textContent = student.name || 'N/A';
    document.getElementById('profile-student-id').textContent = student.studentId || 'N/A';
    document.getElementById('profile-email').textContent = student.email || 'N/A';
    document.getElementById('profile-phone').textContent = student.phone || 'N/A';
    document.getElementById('profile-program').textContent = student.program || 'N/A';
    document.getElementById('profile-batch').textContent = student.batch || 'N/A';
    
    // Residence Details
    document.getElementById('profile-block').textContent = blockName || 'N/A';
    document.getElementById('profile-room').textContent = roomNumber || 'N/A';
    document.getElementById('profile-fee-status').textContent = student.feeStatus || 'N/A';
    
    // Emergency Contact
    document.getElementById('emergency-name').textContent = student.emergencyContact?.name || 'N/A';
    document.getElementById('emergency-phone').textContent = student.emergencyContact?.phone || 'N/A';
    document.getElementById('emergency-relationship').textContent = student.emergencyContact?.relationship || 'N/A';

    // Complaint Summary
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
    document.getElementById('complaint-summary-total').textContent = totalComplaints;
    document.getElementById('complaint-summary-resolved').textContent = resolvedComplaints;
    document.getElementById('complaint-summary-pending').textContent = totalComplaints - resolvedComplaints;
}

function populateRoommatesList() {
    const listContainer = document.getElementById('roommates-list');
    listContainer.innerHTML = '';
    
    if (g_roommates.length === 0) {
        listContainer.innerHTML = `<p class="text-secondary-gray text-center py-4">You have no registered roommates.</p>`;
        return;
    }

    g_roommates.forEach(roommate => {
        const initials = (roommate.name.split(' ')[0] ? roommate.name.split(' ')[0][0] : '') + (roommate.name.split(' ')[1] ? roommate.name.split(' ')[1][0] : '');
        
        listContainer.innerHTML += `
            <div class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div class="w-10 h-10 flex items-center justify-center rounded-full bg-primary-blue text-white font-bold text-sm">
                    ${initials}
                </div>
                <div class="flex-1">
                    <p class="font-semibold text-accent-dark">${roommate.name}</p>
                    <p class="text-sm text-secondary-gray">${roommate.program} - ${roommate.batch}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-accent-dark">${roommate.studentId}</p>
                    <a href="tel:${roommate.phone}" class="text-sm text-primary-blue hover:underline">${roommate.phone}</a>
                </div>
            </div>
        `;
    });
}

function updateAttendanceStatus() {
    const statusEl = document.getElementById('current-attendance-status');
    const timeEl = document.getElementById('last-action-time');
    const button = document.getElementById('attendance-toggle-btn');
    
    const isCheckedIn = g_attendanceStatus.status === 'Checked In';

    statusEl.textContent = g_attendanceStatus.status;
    statusEl.className = `font-bold text-xl ${isCheckedIn ? 'text-accent-green' : 'text-accent-red'}`;
    
    timeEl.textContent = g_attendanceStatus.lastActionTime ? `Last action: ${formatTime(g_attendanceStatus.lastActionTime)}` : 'Last action: N/A';

    button.textContent = isCheckedIn ? 'Check Out' : 'Check In';
    button.className = `w-full py-3 rounded-lg font-semibold transition duration-200 ${isCheckedIn ? 'bg-accent-red hover:bg-red-700' : 'bg-primary-blue hover:bg-blue-700'} text-white shadow-lg`;
}

async function toggleAttendance() {
    const studentId = g_student._id;
    const action = g_attendanceStatus.status === 'Checked In' ? 'checkout' : 'checkin';
    
    try {
        const response = await fetch(`/api/attendance/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Update global status
            g_attendanceStatus.status = data.status;
            g_attendanceStatus.lastActionTime = data.actionTime;
            
            alert(`Successfully ${action === 'checkin' ? 'Checked In' : 'Checked Out'}!`);
            
            // Reload attendance data and refresh UI
            await loadStudentData(); 
            updateAttendanceStatus();
            populateAttendanceHistory();
        } else {
            throw new Error(data.message || `Failed to ${action}.`);
        }
    } catch (error) {
        console.error('Attendance Toggle Error:', error);
        alert(`Error: ${error.message}`);
    }
}

function populateAttendanceHistory() {
    const tableBody = document.getElementById('attendance-history-body');
    tableBody.innerHTML = '';
    
    if (g_attendance.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-secondary-gray">No attendance records found.</td></tr>`;
        return;
    }

    g_attendance.sort((a, b) => new Date(b.actionTime) - new Date(a.actionTime)); // Sort newest first

    g_attendance.forEach(record => {
        const isCheckIn = record.type === 'Check In';
        const typeClass = isCheckIn ? 'text-accent-green' : 'text-accent-red';

        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${formatDate(record.actionTime)}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${new Date(record.actionTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm font-medium ${typeClass}">${record.type}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${record.gate || 'Main Gate'}</td>
            </tr>
        `;
    });
}

function populateStudentComplaintHistory() {
    const tableBody = document.getElementById('student-complaint-history');
    tableBody.innerHTML = '';
    
    const sortedComplaints = g_complaints
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)

    if (sortedComplaints.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-secondary-gray">No complaint history found.</td></tr>`;
        return;
    }

    sortedComplaints.forEach(c => {
        let statusColorClass;
        if (c.status === 'Resolved') { statusColorClass = 'bg-accent-green/20 text-accent-green'; }
        else if (c.status === 'Pending') { statusColorClass = 'bg-info-yellow/20 text-info-yellow'; }
        else if (c.status === 'Critical') { statusColorClass = 'bg-accent-red/20 text-accent-red'; }
        else { statusColorClass = 'bg-gray-200/50 text-secondary-gray'; }

        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${c.title}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${formatDate(c.date)}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${c.priority}</td>
                <td class="py-3 px-6 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorClass}">
                        ${c.status}
                    </span>
                </td>
            </tr>
        `;
    });
}

function populateVisitorRequestHistory() {
    const tableBody = document.getElementById('visitor-request-history-body');
    tableBody.innerHTML = '';
    
    const sortedRequests = g_visitorRequests
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Sort by start date (newest first)

    if (sortedRequests.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="py-4 px-6 text-center text-secondary-gray">No visitor requests found.</td></tr>`;
        return;
    }

    sortedRequests.forEach(req => {
        let statusColorClass;
        if (req.status === 'Approved') { statusColorClass = 'bg-accent-green/20 text-accent-green'; }
        else if (req.status === 'Pending') { statusColorClass = 'bg-info-yellow/20 text-info-yellow'; }
        else { statusColorClass = 'bg-accent-red/20 text-accent-red'; }

        tableBody.innerHTML += `
            <tr class="hover:bg-light-bg transition duration-150">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-accent-dark">${req.visitorName}</td>
                <td class="py-3 px-6 whitespace-nowrap text-sm text-secondary-gray">${formatDate(req.startDate)} - ${formatDate(req.endDate)}</td>
                <td class="py-3 px-6 text-sm text-secondary-gray">${req.reason}</td>
                <td class="py-3 px-6 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorClass}">
                        ${req.status}
                    </span>
                </td>
                <td class="py-3 px-6 text-sm">
                    ${req.status === 'Pending' ? `<button onclick="cancelVisitorRequest('${req._id}')" class="text-accent-red hover:text-red-700">Cancel</button>` : '—'}
                </td>
            </tr>
        `;
    });
}

async function cancelVisitorRequest(requestId) {
    if (!confirm("Are you sure you want to cancel this visitor request?")) {
        return;
    }

    try {
        const response = await fetch(`/api/visitor-request/cancel/${requestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: g_student._id })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert("Visitor request cancelled successfully.");
            // Re-fetch and re-populate
            const vRes = await fetch(`/api/visitor-request/history/${g_student._id}`);
            const vData = await vRes.json();
            if(vData.success) {
                g_visitorRequests = vData.visitorRequests;
                populateVisitorRequestHistory();
            }
        } else {
            throw new Error(data.message || 'Failed to cancel request.');
        }

    } catch (error) {
        console.error('Cancel Error:', error);
        alert(`Failed to cancel request: ${error.message}`);
    }
}

async function loadClubActivities() {
    try {
        const response = await fetch('/api/clubs/activities');
        const data = await response.json();
        if (data.success) {
            g_clubActivities = data.activities;
            console.log('✅ Club Activities loaded:', g_clubActivities);
        }
    } catch (error) {
        console.error('Error fetching club activities:', error);
    }
}

function displayClubActivitiesOnDashboard() {
    const listContainer = document.getElementById('club-activities-list');
    listContainer.innerHTML = '';

    if (g_clubActivities.length === 0) {
        listContainer.innerHTML = `<p class="text-secondary-gray text-sm p-4 text-center">No upcoming club activities.</p>`;
        return;
    }

    // Filter for upcoming (or recent past) activities, max 3
    const upcomingActivities = g_clubActivities
        .filter(a => new Date(a.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Include last 7 days
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    if (upcomingActivities.length === 0) {
         listContainer.innerHTML = `<p class="text-secondary-gray text-sm p-4 text-center">No upcoming club activities.</p>`;
         return;
    }


    upcomingActivities.forEach(activity => {
        listContainer.innerHTML += `
            <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="flex flex-col">
                    <p class="font-semibold text-accent-dark text-sm">${activity.title}</p>
                    <p class="text-xs text-secondary-gray">${activity.clubName}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-primary-blue font-medium">${formatDate(activity.date)}</p>
                    <p class="text-xs text-secondary-gray">${activity.time}</p>
                </div>
            </div>
        `;
    });
}

// --- Announcements Modal Functions ---

function populateAnnouncementsList() {
    const listContainer = document.getElementById('announcement-list-container');
    listContainer.innerHTML = '';

    if (mockAnnouncements.length === 0) {
        listContainer.innerHTML = `<p class="text-secondary-gray text-center p-4">No announcements available.</p>`;
        return;
    }

    mockAnnouncements.forEach(ann => {
        listContainer.innerHTML += `
            <div onclick="showAnnouncementDetail(${ann.id})" class="cursor-pointer p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-150 border border-gray-100">
                <p class="text-sm text-secondary-gray mb-1">${formatDate(ann.date)}</p>
                <h4 class="font-bold text-accent-dark truncate">${ann.title}</h4>
                <p class="text-sm text-secondary-gray mt-1 line-clamp-2">${ann.short_desc}</p>
            </div>
        `;
    });
}

function openAnnouncementsModal() {
    document.getElementById('announcements-modal').classList.remove('hidden');
    showAnnouncementsList();
}

function closeAnnouncementsModal() {
    document.getElementById('announcements-modal').classList.add('hidden');
}

function showAnnouncementDetail(id) {
    const ann = mockAnnouncements.find(a => a.id === id);
    if (!ann) return;
    document.getElementById('announcement-list-view').classList.add('hidden');
    document.getElementById('announcement-detail-view').classList.remove('hidden');
    document.getElementById('announcement-detail-title').textContent = ann.title;
    document.getElementById('announcement-detail-date').textContent = `Posted on: ${formatDate(ann.date)}`;
    document.getElementById('announcement-detail-body').innerHTML = ann.full_desc;
}
function showAnnouncementsList() {
    document.getElementById('announcement-detail-view').classList.add('hidden');
    document.getElementById('announcement-list-view').classList.remove('hidden');
}

// --- Logout Function ---
function logout() {
    localStorage.removeItem('currentStudentId');
    window.location.href = 'index.html'; // Assuming your login page is index.html
}

// =========================================================================
// INITIALIZATION
// =========================================================================
function setupLeaveForm() {
    // Attach listener for the 'Other' option in leave reason
    const reasonSelect = document.getElementById('leave-reason');
    if (reasonSelect) {
        reasonSelect.addEventListener('change', toggleLeaveReason);
    }
}

function initializeDashboard() {
    updateStudentDashboard();
    // Also initialize the form listeners
    document.getElementById('complaint-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitComplaint();
    });
    document.getElementById('visitor-request-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitVisitorRequest();
    });
    document.getElementById('leave-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitLeave();
    });
    // Attach listener for Lost Item Report
    const lostItemForm = document.getElementById('lost-item-form');
    if (lostItemForm) {
        lostItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitLostItemReport();
        });
    }

    // Default to the first report tab
    showReportTab('complaints'); 
}

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

        // Add listeners for report tabs
        document.getElementById('tab-complaints').addEventListener('click', () => showReportTab('complaints'));
        document.getElementById('tab-lost-found').addEventListener('click', () => showReportTab('lost-found'));

    }
});