document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL STATE ---
    let appState = { 
        blocks: [], 
        assets: [],
        complaints: [],
        visitorLogs: [],
        leaveRequests: [] // ADDED: Container for leave requests
    }; 
    
    let eventData = [
        { id: 1, title: 'Inter-Hostel Cricket Match', type: 'Sports', date: '2025-11-10', description: 'Finals between Men\'s Hostel and Women\'s Hostel.' },
        { id: 2, title: 'Mess Committee Meeting', type: 'Announcement', date: '2025-11-05', description: 'Discussing the new menu for next month.' }
    ];

    let currentRoomData = null; 

    // --- 2. DOM Elements ---
    const dashboardView = document.getElementById('dashboard-view');
    const detailView = document.getElementById('detail-view');
    
    // Fees View Elements
    const feesView = document.getElementById('fees-view');
    const showFeesViewBtn = document.getElementById('show-fees-view-btn');
    const backToDashboardFromFeesBtn = document.getElementById('back-to-dashboard-from-fees-btn');
    const feesStudentListContainer = document.getElementById('fees-student-list-container');
    const feesSearchInput = document.getElementById('fees-search-input');
    const feesFilterSelect = document.getElementById('fees-filter-select');
    const statFeesPending = document.getElementById('stat-fees-pending');

    // Visitors View Elements
    const visitorsView = document.getElementById('visitors-view');
    const showVisitorsViewBtn = document.getElementById('show-visitors-view-btn');
    const backToDashboardFromVisitorsBtn = document.getElementById('back-to-dashboard-from-visitors-btn');
    const visitorLogContainer = document.getElementById('visitor-log-container');
    const visitorSearchInput = document.getElementById('visitor-search-input');
    const visitorDateFilter = document.getElementById('visitor-date-filter');
    const statVisitorsToday = document.getElementById('stat-visitors-today');
    
    // Complaints View Elements
    const complaintsView = document.getElementById('complaints-view');
    const showComplaintsViewBtn = document.getElementById('show-complaints-view-btn');
    const backToDashboardFromComplaintsBtn = document.getElementById('back-to-dashboard-from-complaints-btn');
    const complaintsListContainer = document.getElementById('complaints-list-container');
    const complaintSearchInput = document.getElementById('complaint-search-input');
    const complaintStatusFilter = document.getElementById('complaint-status-filter');
    const complaintTypeFilter = document.getElementById('complaint-type-filter');
    const refreshComplaintsBtn = document.getElementById('refresh-complaints-btn');
    const statOpenComplaints = document.getElementById('stat-open-complaints');
    const complaintDetailsModal = document.getElementById('complaint-details-modal');
    const complaintDetailsContent = document.getElementById('complaint-details-content');
    
    // Leave Requests View Elements (ADDED)
    const leaveView = document.getElementById('leave-view');
    const showLeaveViewBtn = document.getElementById('show-leave-view-btn');
    const backToDashboardFromLeaveBtn = document.getElementById('back-to-dashboard-from-leave-btn');
    const leaveRequestContainer = document.getElementById('leave-request-container');
    const leaveSearchInput = document.getElementById('leave-search-input');
    const leaveStatusFilter = document.getElementById('leave-status-filter');
    const statLeavePending = document.getElementById('stat-leave-pending');

    const hostelBlockContainer = document.getElementById('hostel-block-container');
    const statTotalCapacity = document.getElementById('stat-total-capacity');
    const statOccupancyPercent = document.getElementById('stat-occupancy-percent');
    const statOccupancyLabel = document.getElementById('stat-occupancy-label');
    const statOccupancyRing = document.getElementById('stat-occupancy-ring');
    const eventListContainer = document.getElementById('event-list-container');
    const detailHostelName = document.getElementById('detail-hostel-name');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    const roomListContainer = document.getElementById('room-list-container');
    const detailStatCapacity = document.getElementById('detail-stat-capacity');
    const detailStatOccupancy = document.getElementById('detail-stat-occupancy');
    const detailStatAvailable = document.getElementById('detail-stat-available');
    const roomSearchInput = document.getElementById('room-search-input');
    const roomFilterSelect = document.getElementById('room-filter-select');
    const showAddBlockModalBtn = document.getElementById('show-add-block-modal-btn');
    const addBlockForm = document.getElementById('add-block-form');
    const showAddRoomModalBtn = document.getElementById('show-add-room-modal-btn');
    const addRoomForm = document.getElementById('add-room-form');
    const showAddStudentModalBtn = document.getElementById('show-add-student-modal-btn');
    const addStudentForm = document.getElementById('add-student-form');
    const studentRoomSelect = document.getElementById('student-room-id');
    const showAddEventModalBtn = document.getElementById('show-add-event-modal-btn');
    const addEventForm = document.getElementById('add-event-form');
    const adminLogoutBtn = document.getElementById('admin-logout-btn'); 
    
    // Room Detail Modal Elements
    const roomDetailsModal = document.getElementById('room-details-modal');
    const modalRoomTitle = document.getElementById('modal-room-title');
    const modalRoomComplaintsBadge = document.getElementById('modal-room-complaints-badge');
    const modalRoomComplaintsCount = document.getElementById('modal-room-complaints-count');
    const modalRoomCapacity = document.getElementById('modal-room-capacity');
    const modalRoomOccupancy = document.getElementById('modal-room-occupancy');
    const modalRoomAvailable = document.getElementById('modal-room-available');
    const modalOccupantTitle = document.getElementById('modal-occupant-title');
    const modalOccupantContainer = document.getElementById('modal-occupant-container');
    const modalIssuesContainer = document.getElementById('modal-issues-container');
    const modalDeleteRoomBtn = document.getElementById('modal-delete-room-btn'); 

    // Club Activity Elements
    const clubActivityContainer = document.getElementById('club-activity-container');
    const showAddClubActivityModalBtn = document.getElementById('show-add-club-activity-modal-btn');
    const addClubActivityForm = document.getElementById('add-club-activity-form');
    
    // Asset Elements
    const assetInventoryContainer = document.getElementById('asset-inventory-container');
    const showAddAssetModalBtn = document.getElementById('show-add-asset-modal-btn');
    const addAssetForm = document.getElementById('add-asset-form');
    const assetTypeSelect = document.getElementById('asset-type');
    const assetNameOtherWrapper = document.getElementById('asset-name-other-wrapper');
    
    // Asset Assignment Elements
    const addRoomAssetRowBtn = document.getElementById('add-room-asset-row-btn');
    const roomAssetAssignmentContainer = document.getElementById('room-asset-assignment-container');
    const addStudentAssetRowBtn = document.getElementById('add-student-asset-row-btn');
    const studentAssetAssignmentContainer = document.getElementById('student-asset-assignment-container');

    // --- 3. THEME/HELPER DATA ---
    const themes = { 
        pink: { border: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-600', icon: 'user-group' },
        blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600', icon: 'user-group' },
        green: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600', icon: 'building-office' },
        purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600', icon: 'academic-cap' },
        yellow: { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'beaker' },
    };
    const eventThemes = { 
        'Sports': { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-700' },
        'Club Activity': { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-700' },
        'Announcement': { border: 'border-red-500', bg: 'bg-red-100', text: 'text-red-700' },
        'General': { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-700' },
    };
    const clubActivityThemes = { 
        'Sports': { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' },
        'Cultural': { border: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-700' },
        'Technical': { border: 'border-indigo-500', bg: 'bg-indigo-100', text: 'text-indigo-700' },
        'Workshop': { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        'General': { border: 'border-gray-500', bg: 'bg-gray-100', text: 'text-gray-700' },
    };
    const getStatus = (current, max) => { 
        if (current >= max) return { text: 'Full', classes: 'bg-red-500 text-white', progress: 'bg-red-500' };
        return { text: 'Available', classes: 'bg-green-500 text-white', progress: 'bg-green-500' };
    };
    
    // Helper to find a student by ID
    function findStudentById(studentId) {
        for (const block of appState.blocks) {
            for (const room of block.rooms) {
                const student = room.students.find(s => s._id === studentId);
                if (student) return student;
            }
        }
        return null;
    }

    // Utility functions for notifications
    function showSuccess(message) {
        console.log('✅ ' + message);
        alert('✅ ' + message);
    }

    function showError(message) {
        console.error('❌ ' + message);
        alert('❌ ' + message);
    }
    
    // --- LEAVE MANAGEMENT FUNCTIONS (ADDED) ---
    async function loadLeaveRequests() {
        try {
            console.log('🔄 Loading leave requests from database...');
            const res = await fetch('/api/leave'); // Ensure this route exists in your backend
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const data = await res.json();
            if (data.success) {
                appState.leaveRequests = data.leaves || [];
                console.log('✅ Leave requests loaded:', appState.leaveRequests);
                updateLeaveStats();
                if (!leaveView.classList.contains('hidden')) {
                    renderLeaveView();
                }
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Failed to load leave requests:', error);
            // Optionally show error in UI
        }
    }

    function updateLeaveStats() {
        const pendingCount = appState.leaveRequests.filter(l => l.status === 'Pending').length;
        statLeavePending.textContent = `${pendingCount} Pending`;
    }

    function renderLeaveView() {
        const searchTerm = leaveSearchInput.value.toLowerCase();
        const statusFilter = leaveStatusFilter.value;
        leaveRequestContainer.innerHTML = '';

        const filteredLeaves = appState.leaveRequests.filter(leave => {
            const matchesSearch = (leave.studentName?.toLowerCase().includes(searchTerm)) || 
                                  (leave.reason?.toLowerCase().includes(searchTerm));
            const matchesStatus = (statusFilter === 'All') || (leave.status === statusFilter);
            return matchesSearch && matchesStatus;
        });

        if (filteredLeaves.length === 0) {
            leaveRequestContainer.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-6">No leave requests found.</td></tr>`;
            return;
        }

        filteredLeaves.forEach(leave => {
            let statusClass = '';
            let actionButtons = '';

            switch(leave.status) {
                case 'Approved': statusClass = 'bg-green-100 text-green-800'; break;
                case 'Rejected': statusClass = 'bg-red-100 text-red-800'; break;
                default: statusClass = 'bg-yellow-100 text-yellow-800';
            }

            if (leave.status === 'Pending') {
                actionButtons = `
                    <button class="update-leave-btn bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition mr-2" data-id="${leave._id}" data-action="Approved">Approve</button>
                    <button class="update-leave-btn bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition" data-id="${leave._id}" data-action="Rejected">Reject</button>
                `;
            } else {
                actionButtons = `<span class="text-xs text-gray-400">Completed</span>`;
            }

            const startDate = new Date(leave.startDate).toLocaleDateString();
            const endDate = new Date(leave.endDate).toLocaleDateString();

            const row = `
                <tr class="hover:bg-gray-50 transition-colors border-b">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${leave.studentName || 'Unknown'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${leave.roomNumber || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div class="text-xs text-gray-500">From: ${startDate}</div>
                        <div class="text-xs text-gray-500">To: ${endDate}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title="${leave.reason}">${leave.reason}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${leave.status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        ${actionButtons}
                    </td>
                </tr>
            `;
            leaveRequestContainer.innerHTML += row;
        });
    }

    async function handleLeaveAction(id, action) {
        if(!confirm(`Are you sure you want to mark this request as ${action}?`)) return;

        try {
            const res = await fetch(`/api/leave/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });

            const data = await res.json();
            if (data.success) {
                showSuccess(`Leave request ${action}`);
                loadLeaveRequests(); // Reload data
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error updating leave status:', error);
            showError(error.message);
        }
    }

    // --- VISITOR MANAGEMENT FUNCTIONS ---

    // Function to load visitor logs from the backend API
    async function loadVisitorLogs() {
        try {
            console.log('🔄 Loading visitor logs from database...');
            const res = await fetch('/api/visitor-request'); 
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.success) {
                appState.visitorLogs = data.logs || []; 
                console.log('✅ Visitor logs loaded from server:', appState.visitorLogs);
                
                // Update the dashboard stat for visitors today
                updateVisitorCount();

                // Re-render if we're currently viewing the logs
                if (!visitorsView.classList.contains('hidden')) {
                    renderVisitorsView();
                }

            } else {
                throw new Error(data.message || 'Failed to load visitor logs');
            }
        } catch (error) {
            console.error('❌ Failed to load visitor logs data:', error);
            // Show error in the log container if the view is open
            if (!visitorsView.classList.contains('hidden')) {
                visitorLogContainer.innerHTML = `<tr><td colspan="7" class="text-center text-red-500 py-6">Error: Failed to load visitor logs. Check server status.</td></tr>`;
            }
        }
    }

    // Function to update the visitor count card on the dashboard
    function updateVisitorCount() {
        const today = new Date().toISOString().split('T')[0];
        // Use rawDate if available for more accuracy, otherwise date
        const visitorsToday = appState.visitorLogs.filter(v => (v.rawDate ? v.rawDate.split('T')[0] : v.date) === today).length;
        statVisitorsToday.textContent = `${visitorsToday} Today`;
    }

    // --- UPDATED VISITOR VIEW LOGIC ---
    function renderVisitorsView() {
        const searchTerm = visitorSearchInput.value.toLowerCase();
        const dateFilter = visitorDateFilter.value;
        visitorLogContainer.innerHTML = '';
        
        const logsToFilter = appState.visitorLogs; 
        
        const filteredLogs = logsToFilter.filter(log => {
            const searchMatch = (log.visitorName?.toLowerCase().includes(searchTerm)) ||
                                (log.studentName?.toLowerCase().includes(searchTerm)) ||
                                (log.roomNumber?.toLowerCase().includes(searchTerm));
            
            // Handle date matching securely
            const logDate = log.rawDate ? new Date(log.rawDate).toISOString().split('T')[0] : log.date;
            const dateMatch = (!dateFilter) || (logDate === dateFilter);
            
            return searchMatch && dateMatch;
        });
        
        if (filteredLogs.length === 0) {
            visitorLogContainer.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 py-6">No visitor logs match the criteria.</td></tr>`;
            return;
        }

        // Sort: Pending first, then by date
        filteredLogs.sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            const dateA = a.rawDate ? new Date(a.rawDate) : new Date(a.date);
            const dateB = b.rawDate ? new Date(b.rawDate) : new Date(b.date);
            return dateB - dateA; // Newest first
        });

        filteredLogs.forEach(log => {
            let statusClass = '';
            let actionButtons = '';

            // 1. Determine Status Color
            switch(log.status) {
                case 'Approved': statusClass = 'bg-blue-100 text-blue-700'; break;
                case 'Rejected': statusClass = 'bg-red-100 text-red-700'; break;
                case 'Checked In': statusClass = 'bg-green-100 text-green-700'; break;
                case 'Checked Out': statusClass = 'bg-gray-100 text-gray-700'; break;
                default: statusClass = 'bg-yellow-100 text-yellow-700'; // Pending
            }

            // 2. Generate Buttons based on Status
            const viewBtn = `<button class="view-visitor-btn text-gray-500 hover:text-blue-600 ml-2" data-id="${log.id}" title="View Details"><hero-icon-solid name="eye" class="h-5 w-5"></hero-icon-solid></button>`;

            if (log.status === 'Pending') {
                actionButtons = `
                    <button class="update-visitor-btn bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition" data-id="${log.id}" data-action="Approved">Approve</button>
                    <button class="update-visitor-btn bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 ml-1 transition" data-id="${log.id}" data-action="Rejected">Reject</button>
                `;
            } else if (log.status === 'Approved') {
                actionButtons = `
                    <button class="update-visitor-btn bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600 transition" data-id="${log.id}" data-action="Checked In">Check In</button>
                `;
            } else if (log.status === 'Checked In') {
                actionButtons = `
                    <button class="update-visitor-btn bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 transition" data-id="${log.id}" data-action="Checked Out">Check Out</button>
                `;
            } else {
                actionButtons = `<span class="text-xs text-gray-400 mr-2">Completed</span>`;
            }

            const rowHTML = `
                <tr class="hover:bg-gray-50 transition-colors border-b">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${log.visitorName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div class="font-medium">${log.studentName}</div>
                        <div class="text-xs text-gray-500">${log.roomNumber}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        ${log.startDate}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${log.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div><span class="font-semibold">In:</span> ${log.timeIn}</div>
                        <div><span class="font-semibold">Out:</span> ${log.timeOut}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div class="flex items-center justify-center">
                            ${actionButtons}
                            ${viewBtn}
                        </div>
                    </td>
                </tr>
            `;
            visitorLogContainer.innerHTML += rowHTML;
        });
    }

    // --- NEW: Handle Visitor Actions (Approve, Reject, Check In/Out) ---
    async function handleVisitorAction(id, action) {
        if(!confirm(`Are you sure you want to mark this request as ${action}?`)) return;

        try {
            const res = await fetch(`/api/visitor-request/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });

            const data = await res.json();
            
            if (data.success) {
                showSuccess(`Visitor status updated to ${action}`);
                await loadVisitorLogs(); // Reload table to show new status/buttons
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error updating visitor status:', error);
            showError(error.message);
        }
    }

    // --- NEW: Show Visitor Details Modal ---
    function showVisitorDetailsModal(id) {
        const log = appState.visitorLogs.find(l => l.id === id);
        if(!log) return;

        const content = document.getElementById('visitor-details-content');
        if (!content) {
            console.error("visitor-details-content element not found");
            return;
        }

        content.innerHTML = `
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="col-span-2 flex justify-between items-center border-b pb-2">
                    <h3 class="text-lg font-bold text-gray-800">${log.visitorName}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">${log.status}</span>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">Student Host</span>
                    <p class="font-semibold text-gray-800">${log.studentName}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">Room Number</span>
                    <p class="font-semibold text-gray-800">${log.roomNumber}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">Start Date</span>
                    <p class="text-gray-800">${log.startDate}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">End Date</span>
                    <p class="text-gray-800">${log.endDate}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">Check-In Time</span>
                    <p class="text-green-700 font-medium">${log.timeIn}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">Check-Out Time</span>
                    <p class="text-red-700 font-medium">${log.timeOut}</p>
                </div>
                <div class="col-span-2 bg-gray-50 p-4 rounded-lg mt-2">
                    <span class="text-xs text-gray-500 uppercase tracking-wide block mb-1">Purpose of Visit</span>
                    <p class="text-gray-700 italic">"${log.reason || 'No reason provided'}"</p>
                </div>
            </div>
        `;
        showModal('visitor-details-modal');
    }

    // --- COMPLAINT MANAGEMENT FUNCTIONS ---

    // Load real complaints from database
    async function loadComplaintsData() {
        try {
            console.log('🔄 Loading complaints from database...');
            const res = await fetch('/api/complaints');
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.success) {
                appState.complaints = data.complaints;
                console.log('✅ Complaints loaded from server:', appState.complaints);
                
                // Update open complaints count
                updateComplaintsCount();
                
                // Re-render if we're in complaints view
                if (!complaintsView.classList.contains('hidden')) {
                    renderComplaintsView();
                }
            } else {
                throw new Error(data.message || 'Failed to load complaints');
            }
        } catch (error) {
            console.error('❌ Failed to load complaints data:', error);
            showError('Failed to load complaints: ' + error.message);
            
            // Update UI to show error state
            complaintsListContainer.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-red-500 py-6">
                        ❌ Failed to load complaints. Please try again.
                    </td>
                </tr>
            `;
        }
    }

    // Update complaint status
    async function updateComplaintStatus(complaintId, newStatus, adminNotes = '') {
        try {
            console.log(`🔄 Updating complaint ${complaintId} to status: ${newStatus}`);
            
            const res = await fetch(`/api/complaints/${complaintId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    status: newStatus,
                    adminNotes: adminNotes,
                    resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : null
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                console.log(`✅ Complaint ${complaintId} status updated to ${newStatus}`);
                
                // Update local state
                const complaintIndex = appState.complaints.findIndex(c => c._id === complaintId);
                if (complaintIndex !== -1) {
                    appState.complaints[complaintIndex].status = newStatus;
                    if (adminNotes) {
                        appState.complaints[complaintIndex].adminNotes = adminNotes;
                    }
                    if (newStatus === 'Resolved') {
                        appState.complaints[complaintIndex].resolvedAt = new Date().toISOString();
                    }
                }
                
                // Update counts and re-render
                updateComplaintsCount();
                renderComplaintsView();
                
                showSuccess(`Complaint status updated to ${newStatus}`);
                return true;
            } else {
                throw new Error(data.message || 'Failed to update complaint status');
            }
        } catch (error) {
            console.error('❌ Failed to update complaint status:', error);
            showError('Failed to update complaint: ' + error.message);
            return false;
        }
    }

    // Add admin response to complaint
    async function addComplaintResponse(complaintId, response) {
        try {
            console.log(`🔄 Adding response to complaint ${complaintId}`);
            
            const res = await fetch(`/api/complaints/${complaintId}/response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    response: response,
                    respondedAt: new Date().toISOString(),
                    respondedBy: 'Admin'
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                console.log(`✅ Response added to complaint ${complaintId}`);
                
                // Update local state
                const complaintIndex = appState.complaints.findIndex(c => c._id === complaintId);
                if (complaintIndex !== -1) {
                    if (!appState.complaints[complaintIndex].responses) {
                        appState.complaints[complaintIndex].responses = [];
                    }
                    appState.complaints[complaintIndex].responses.push({
                        response: response,
                        respondedAt: new Date().toISOString(),
                        respondedBy: 'Admin'
                    });
                }
                
                renderComplaintsView();
                showSuccess('Response added successfully');
                return true;
            } else {
                throw new Error(data.message || 'Failed to add response');
            }
        } catch (error) {
            console.error('❌ Failed to add complaint response:', error);
            showError('Failed to add response: ' + error.message);
            return false;
        }
    }

    // Update complaints count on dashboard
    function updateComplaintsCount() {
        const openComplaints = appState.complaints.filter(complaint => 
            complaint.status === 'Pending' || complaint.status === 'In Progress'
        ).length;
        statOpenComplaints.textContent = openComplaints;
    }

    // Render complaints view
    function renderComplaintsView() {
        const statusFilter = complaintStatusFilter.value;
        const typeFilter = complaintTypeFilter.value;
        const searchTerm = complaintSearchInput.value.toLowerCase();
        
        complaintsListContainer.innerHTML = '';
        
        const filteredComplaints = appState.complaints.filter(complaint => {
            const statusMatch = (statusFilter === 'All') || (complaint.status === statusFilter);
            const typeMatch = (typeFilter === 'All') || (complaint.complaintType === typeFilter);
            const searchMatch = (complaint.studentName.toLowerCase().includes(searchTerm)) ||
                                     (complaint.roomNumber.toLowerCase().includes(searchTerm)) ||
                                     (complaint.description.toLowerCase().includes(searchTerm));
            return statusMatch && typeMatch && searchMatch;
        });

        if (filteredComplaints.length === 0) {
            complaintsListContainer.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-gray-500 py-6">
                        No complaints found matching the criteria.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by date (newest first)
        filteredComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        filteredComplaints.forEach(complaint => {
            const statusColors = {
                'Pending': 'bg-yellow-100 text-yellow-800',
                'In Progress': 'bg-blue-100 text-blue-800', 
                'Resolved': 'bg-green-100 text-green-800'
            };
            
            const statusColor = statusColors[complaint.status] || 'bg-gray-100 text-gray-800';
            const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const icon = ''; // Emoji replaced with empty space

            const rowHTML = `
                <tr class="hover:bg-gray-50 complaint-row" data-complaint-id="${complaint._id}">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${complaint.studentName}</div>
                                <div class="text-sm text-gray-500">${complaint.studentId || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        ${complaint.roomNumber}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div class="flex items-center">
                            <span class="icon-space text-lg mr-2">${icon}</span>
                            ${complaint.complaintType}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        <div class="truncate complaint-description" title="${complaint.description}">
                            ${complaint.description}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formattedDate}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                            ${complaint.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <button class="view-complaint-details-btn px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm hover:bg-blue-600" data-complaint-id="${complaint._id}">
                            <span class="icon-space"> </span>View
                        </button>
                        ${complaint.status !== 'Resolved' ? `
                            <button class="update-complaint-status-btn px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-md shadow-sm hover:bg-green-600" data-complaint-id="${complaint._id}" data-new-status="Resolved">
                                <span class="icon-space"> </span>Resolve
                            </button>
                        ` : ''}
                        ${complaint.status === 'Pending' ? `
                            <button class="update-complaint-status-btn px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm hover:bg-blue-600" data-complaint-id="${complaint._id}" data-new-status="In Progress">
                                <span class="icon-space"> </span>Start Progress
                            </button>
                        ` : ''}
                        ${complaint.status === 'In Progress' ? `
                            <button class="update-complaint-status-btn px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-md shadow-sm hover:bg-yellow-600" data-complaint-id="${complaint._id}" data-new-status="Pending">
                                <span class="icon-space"> </span>Mark Pending
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
            complaintsListContainer.innerHTML += rowHTML;
        });
    }

    // Show complaint details modal
    function showComplaintDetails(complaintId) {
        const complaint = appState.complaints.find(c => c._id === complaintId);
        if (!complaint) {
            showError('Complaint not found');
            return;
        }

        const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const resolvedDate = complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Not resolved yet';

        const icon = ''; // Emoji replaced with empty space

        let responsesHTML = '';
        if (complaint.responses && complaint.responses.length > 0) {
            responsesHTML = `
                <div class="mt-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Admin Responses:</h4>
                    ${complaint.responses.map(response => `
                        <div class="bg-blue-50 p-3 rounded-lg mb-2">
                            <p class="text-sm text-gray-700">${response.response}</p>
                            <p class="text-xs text-gray-500 mt-1">
                                By ${response.respondedBy} on ${new Date(response.respondedAt).toLocaleDateString()}
                            </p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        complaintDetailsContent.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Student Name</label>
                        <p class="mt-1 text-sm text-gray-900">${complaint.studentName}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Room Number</label>
                        <p class="mt-1 text-sm text-gray-900">${complaint.roomNumber}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Complaint Type</label>
                        <p class="mt-1 text-sm text-gray-900"><span class="icon-space">${icon} </span>${complaint.complaintType}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <p class="mt-1 text-sm text-gray-900">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                                complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                            }">
                                ${complaint.status}
                            </span>
                        </p>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700">Description</label>
                    <p class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">${complaint.description}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Submitted On</label>
                        <p class="mt-1 text-sm text-gray-900">${formattedDate}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Resolved On</label>
                        <p class="mt-1 text-sm text-gray-900">${resolvedDate}</p>
                    </div>
                </div>
                
                ${complaint.adminNotes ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Admin Notes</label>
                        <p class="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">${complaint.adminNotes}</p>
                    </div>
                ` : ''}
                
                ${responsesHTML}
                
                <div class="mt-6">
                    <label for="complaint-response" class="block text-sm font-medium text-gray-700">Add Response</label>
                    <textarea id="complaint-response" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Enter your response to the student..."></textarea>
                    <button id="submit-complaint-response" data-complaint-id="${complaint._id}" class="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700">
                        Send Response
                    </button>
                </div>
            </div>
        `;

        showModal('complaint-details-modal');
    }

    // --- 4. RENDER FUNCTIONS ---
    async function loadHostelData() {
        try {
            const res = await fetch('/api/blocks');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            if (data.success) {
                appState.blocks = data.blocks; 
                console.log('✅ Hostel Data reloaded from server:', appState.blocks);
                if (!dashboardView.classList.contains('hidden')) {
                    renderDashboard();
                }
                if (!detailView.classList.contains('hidden')) {
                    const currentBlockKey = detailView.dataset.currentHostelKey;
                    if (currentBlockKey) {
                        renderDetailView(currentBlockKey);
                    }
                }
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Failed to load hostel data:', error);
            hostelBlockContainer.innerHTML = `<p class="text-red-500 col-span-full">Error: Could not load data from server. ${error.message}</p>`;
        }
    }

    async function loadClubActivities() {
        try {
            const res = await fetch('/api/activities');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            if (data.success) {
                console.log('✅ Club Activities reloaded from server:', data.activities);
                renderClubActivities(data.activities); 
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Failed to load club activities:', error);
            clubActivityContainer.innerHTML = `<p class="text-red-500 col-span-full">Error: Could not load activities. ${error.message}</p>`;
        }
    }

    async function loadAssetData() {
        try {
            const res = await fetch('/api/assets');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            if (data.success) {
                appState.assets = data.assets; 
                console.log('✅ Asset Data reloaded from server:', appState.assets);
                renderAssets(appState.assets); 
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Failed to load asset data:', error);
            assetInventoryContainer.innerHTML = `<p class="text-red-500 col-span-full">Error: Could not load assets. ${error.message}</p>`;
        }
    }

    function renderDashboard() {
        hostelBlockContainer.innerHTML = '';
        let grandTotalCapacity = 0;
        let grandTotalStudents = 0;
        let totalPendingFees = 0;

        if (!appState.blocks || appState.blocks.length === 0) {
            hostelBlockContainer.innerHTML = `<p class="text-gray-500 col-span-full">No hostel blocks found. Add one to get started!</p>`;
        }

        for (const block of appState.blocks) {
            const theme = themes[block.blockTheme] || themes.blue;
            const totalRooms = block.rooms ? block.rooms.length : 0;
            let currentStudents = 0;
            let totalCapacity = 0;
            
            if (block.rooms) {
                block.rooms.forEach(room => {
                    const studentsInRoom = room.students ? room.students.length : 0;
                    currentStudents += studentsInRoom;
                    totalCapacity += (room.capacity || 0);
                    
                    if (room.students) {
                        room.students.forEach(student => {
                            if (student.feeStatus === 'Pending') {
                                totalPendingFees++;
                            }
                        });
                    }
                });
            }
            
            const occupiedRooms = block.rooms ? block.rooms.filter(room => room.students && room.students.length > 0).length : 0;
            
            grandTotalCapacity += totalCapacity;
            grandTotalStudents += currentStudents;

            const blockHTML = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden border-l-8 ${theme.border} relative transition-all duration-300 hover:shadow-xl hover:scale-105">
                    <button class="remove-block-btn absolute top-3 right-3 p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200 z-10" data-block-id="${block._id}" data-block-name="${block.blockName}" title="Delete Block">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <a href="#" class="block-link block hover:bg-gray-50 p-6" data-hostel-key="${block.blockKey}">
                        <div class="flex items-center mb-4">
                            <div class="p-3 ${theme.bg} rounded-lg"><hero-icon-solid name="${theme.icon}" class="h-6 w-6 ${theme.text}"></hero-icon-solid></div>
                            <h3 class="text-2xl font-bold text-gray-900 ml-4">${block.blockName}</h3>
                        </div>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div><span class="text-gray-500">Capacity</span><p class="text-lg font-semibold text-gray-900">${totalRooms}</p></div>
                            <div><span class="text-gray-500">Occupied Rooms</span><p class="text-lg font-semibold text-gray-900">${occupiedRooms}</p></div>
                            <div><span class="text-gray-500">Current Students</span><p class="text-lg font-semibold text-gray-900">${currentStudents}</p></div>
                            <div><span class="text-gray-500">Total Capacity</span><p class="text-lg font-semibold text-gray-900">${totalCapacity}</p></div>
                        </div>
                    </a>
                </div>
            `;
            hostelBlockContainer.innerHTML += blockHTML;
        }
        
        statTotalCapacity.textContent = grandTotalCapacity;
        const occupancyPercent = grandTotalCapacity > 0 ? (grandTotalStudents / grandTotalCapacity * 100) : 0;
        statOccupancyPercent.textContent = occupancyPercent.toFixed(1) + '%';
        statOccupancyLabel.textContent = occupancyPercent.toFixed(0) + '%';
        statOccupancyRing.style.strokeDashoffset = 100 - occupancyPercent;
        
        statFeesPending.textContent = `${totalPendingFees} Pending`;
        // Updated: Call the function to set the visitor stat based on fetched data
        updateVisitorCount(); 
        updateLeaveStats(); // Updated: Call leave stats
    }

    function renderDetailView(blockKey) {
        const block = appState.blocks.find(b => b.blockKey === blockKey);
        if (!block) { alert('Error: Could not find block data.'); backToDashboardBtn.click(); return; }
        detailView.dataset.currentHostelKey = block.blockKey;
        const theme = themes[block.blockTheme] || themes.blue;
        detailHostelName.innerHTML = `<span class="p-2 ${theme.bg} ${theme.text} rounded-lg mr-2"><hero-icon-solid name="${theme.icon}" class="h-6 w-6 inline-block"></hero-icon-solid></span> ${block.blockName}`;
        let hostelCapacity = 0, hostelOccupancy = 0;
        roomListContainer.innerHTML = '';
        studentRoomSelect.innerHTML = '<option value="" disabled selected>-- Select an available room --</option>';
        const rooms = block.rooms || [];
        rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' }));

        rooms.forEach(room => {
            const current = room.students ? room.students.length : 0;
            const max = room.capacity; hostelCapacity += max; hostelOccupancy += current;
            const status = getStatus(current, max); const percent = max > 0 ? (current / max) * 100 : 0;
            const studentNames = (room.students && room.students.length > 0) ? room.students.map(s => s.name).join(', ') : 'None';
            const imageUrl = room.imageUrl || `https://via.placeholder.com/300x150/e0e0e0/909090?text=${room.roomNumber}`;
            const roomHTML = `
                <div class="room-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer" data-room-id="${room.roomNumber}" data-room-status="${status.text}">
                    <img src="${imageUrl}" alt="Room ${room.roomNumber}" class="activity-card-image">
                    <div class="p-5">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-xl font-bold text-gray-800">${room.roomNumber}</h3>
                            <span class="text-xs font-bold px-3 py-1 rounded-full ${status.classes}">${status.text}</span>
                        </div>
                        <p class="text-sm text-gray-500 mb-4">${room.floor}</p>
                        <div class="progress-bar mb-2">
                            <div class="progress-bar-inner ${status.progress}" style="width: ${percent}%;"></div>
                        </div>
                        <p class="text-sm text-gray-700 font-medium">Occupancy: <span class="font-normal">${current}/${max}</span></p>
                        <p class="text-sm text-gray-700 font-medium truncate">Students: <span class="font-normal">${studentNames}</span></p>
                    </div>
                </div>
            `;
            roomListContainer.innerHTML += roomHTML;
            if (status.text === 'Available') { studentRoomSelect.innerHTML += `<option value="${room._id}">${room.roomNumber} (${current}/${max})</option>`; }
        });
        if (rooms.length === 0) { roomListContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">No rooms added to this block yet.</p>'; }
        detailStatCapacity.textContent = hostelCapacity; detailStatOccupancy.textContent = hostelOccupancy; detailStatAvailable.textContent = hostelCapacity - hostelOccupancy;
        roomSearchInput.value = ''; roomFilterSelect.value = 'All';
    }
    
    function renderRoomDetailsModal(room, block) {
        if (!room) { console.error("Room data is missing."); return; }
        currentRoomData = room; 
        modalRoomTitle.textContent = `Room Details: ${room.roomNumber}`;
        modalRoomCapacity.textContent = room.capacity;
        const occupancy = room.students ? room.students.length : 0;
        const available = room.capacity - occupancy;
        modalRoomOccupancy.textContent = occupancy; modalRoomAvailable.textContent = available;
        modalOccupantTitle.textContent = `Current Occupants (${occupancy})`;
        modalOccupantContainer.innerHTML = '';
        if (occupancy === 0) {
            modalOccupantContainer.innerHTML = '<p class="text-gray-500 md:col-span-2">This room is empty.</p>';
        } else {
            room.students.forEach(student => {
                const feeStatus = student.feeStatus || 'Pending';
                const statusColor = feeStatus.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                let yearColor = 'bg-gray-100 text-gray-700'; 
                if (student.year && student.year.toLowerCase().includes('3')) yearColor = 'bg-pink-100 text-pink-700';
                if (student.year && student.year.toLowerCase().includes('2')) yearColor = 'bg-yellow-100 text-yellow-700';
                if (student.year && student.year.toLowerCase().includes('1')) yearColor = 'bg-blue-100 text-blue-700'; 
                
                const studentHTML = `<div class="bg-white border rounded-lg p-4 shadow-sm relative"><button class="remove-student-btn absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200 z-10" data-student-id="${student._id}" title="Remove Student"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button><span class="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 ${yearColor} rounded">${student.year || 'N/A'}</span><div class="flex items-center gap-4 mt-8"><img src="${student.profileImageUrl || './default-avatar.png'}" alt="${student.name}" class="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 object-cover"><div class="overflow-hidden"><h4 class="font-bold text-gray-800 truncate">${student.name}</h4><p class="text-sm text-blue-600 truncate">${student.rollNumber || ''}</p></div></div><div class="mt-4 space-y-2 text-sm text-gray-600"><p class="truncate"><strong>Email:</strong> ${student.email || 'N/A'}</p><p><strong>Phone:</strong> ${student.phone || 'N/A'}</p><p><strong>Joined:</strong> ${student.joiningDate ? new Date(student.joiningDate).toLocaleDateString() : 'N/A'}</p></div><div class="flex justify-between items-center mt-4 pt-3 border-t"><div><span class="text-xs font-medium">Fee Status:</span><span class="text-sm font-bold px-3 py-1 rounded ${statusColor}">${feeStatus === 'Pending' ? 'Pending' : feeStatus}</span></div><a href="/student-profile.html?id=${student._id}" target="_blank" class="view-student-details text-sm font-medium text-blue-600 hover:underline" data-student-id="${student._id}">View Full Details</a></div></div>`;
                
                modalOccupantContainer.innerHTML += studentHTML;
            });
        }
        modalIssuesContainer.innerHTML = '';
        const complaints = room.complaints || []; 
        if (complaints.length === 0 && room.roomNumber === 'A-101') { complaints.push({ title: 'Broken AC/Leakage', status: 'Critical', _id: 'fake123' }); }
        if (complaints.length === 0) {
            modalIssuesContainer.innerHTML = '<p class="text-gray-500">No open issues reported for this room.</p>';
            modalRoomComplaintsBadge.classList.add('hidden');
        } else {
            complaints.forEach(complaint => {
                const statusColor = complaint.status.toLowerCase() === 'critical' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white';
                const issueHTML = `<div class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border"><p class="font-medium text-gray-700">${complaint.title}</p><span class="text-xs font-bold px-3 py-1 rounded-full ${statusColor}">${complaint.status}</span></div>`;
                modalIssuesContainer.innerHTML += issueHTML;
            });
            modalRoomComplaintsCount.textContent = complaints.length;
            modalRoomComplaintsBadge.classList.remove('hidden');
        }
    } 

    function renderEvents() {
        eventListContainer.innerHTML = '';
        if (eventData.length === 0) {
            eventListContainer.innerHTML = `<p class="text-gray-500 col-span-full">No events or announcements posted yet.</p>`; return;
        }
        eventData.slice().reverse().forEach(event => {
            const theme = eventThemes[event.type] || eventThemes.General;
            const formattedDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const eventHTML = `<div class="bg-white rounded-lg shadow-md overflow-hidden border-l-8 ${theme.border} transition-all duration-300 hover:shadow-xl hover:scale-105"><div class="p-5"><div class="flex justify-between items-center mb-2"><h3 class="text-xl font-bold text-gray-800">${event.title}</h3><span class="text-xs font-bold px-3 py-1 rounded-full ${theme.bg} ${theme.text}">${event.type}</span></div><p class="text-sm font-medium text-gray-600 mb-3">Date: ${formattedDate}</p><p class="text-sm text-gray-700">${event.description}</p></div></div>`;
            eventListContainer.innerHTML += eventHTML;
        });
    }
    
    function renderClubActivities(activities) { 
        clubActivityContainer.innerHTML = '';
        if (!activities || activities.length === 0) {
            clubActivityContainer.innerHTML = `<p class="text-gray-500 col-span-full">No club activities posted yet.</p>`;
            return;
        }
        activities.forEach(activity => {
            const theme = clubActivityThemes[activity.type] || clubActivityThemes.General;
            const formattedDate = new Date(activity.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const imageUrl = activity.imageUrl || `https://via.placeholder.com/300x150/${theme.bg.split('-')[1]}00/FFFFFF?text=${activity.type}`; 
            
            const activityHTML = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden border-l-8 ${theme.border} transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col relative">
                    <button class="remove-activity-btn absolute top-3 right-3 p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200 z-10" data-activity-id="${activity._id}" data-activity-title="${activity.title}" title="Delete Activity">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <img src="${imageUrl}" alt="${activity.title}" class="activity-card-image">
                    <div class="p-5 flex flex-col flex-grow">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg font-bold text-gray-800">${activity.title}</h3>
                            <span class="text-xs font-bold px-3 py-1 rounded-full ${theme.bg} ${theme.text} flex-shrink-0 ml-2">${activity.type}</span>
                        </div>
                        <p class="text-sm font-medium text-gray-600 mb-3">Date: ${formattedDate}</p>
                        <p class="text-sm text-gray-700 flex-grow">${activity.description || ''}</p>
                        </div>
                </div>
            `;
            clubActivityContainer.innerHTML += activityHTML;
        });
    }
    
    function renderAssets(assets) {
        assetInventoryContainer.innerHTML = '';
        if (!assets || assets.length === 0) {
            assetInventoryContainer.innerHTML = `<p class="text-gray-500 col-span-full">No assets found in inventory.</p>`;
            return;
        }
        
        assets.forEach(asset => {
            const assetName = asset.name;
            const imageUrl = asset.imageUrl || `https://via.placeholder.com/300x150/e0e0e0/909090?text=${assetName.replace(' ', '+')}`;
            
            const icon = ''; // Emoji replaced with empty space

            const assetHTML = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col relative">
                    <button class="remove-asset-btn absolute top-3 right-3 p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200 z-10" data-asset-id="${asset._id}" data-asset-name="${assetName}" title="Delete Asset">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <img src="${imageUrl}" alt="${assetName}" class="activity-card-image">
                    <div class="p-5 flex flex-col flex-grow">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg font-bold text-gray-800"><span class="icon-space">${icon} </span>${assetName}</h3>
                            <span class="text-lg font-bold text-blue-600">x ${asset.quantity}</span>
                        </div>
                        <p class="text-sm text-gray-700 flex-grow">${asset.description || 'No description provided.'}</p>
                    </div>
                </div>
            `;
            assetInventoryContainer.innerHTML += assetHTML;
        });
    }
    
    function renderFeesView() {
        const statusFilter = feesFilterSelect.value;
        const searchTerm = feesSearchInput.value.toLowerCase();
        feesStudentListContainer.innerHTML = '';
        
        const allStudents = appState.blocks.flatMap(block => 
            (block.rooms || []).flatMap(room => 
                (room.students || []).map(student => ({
                    ...student,
                    roomNumber: room.roomNumber,
                    blockName: block.blockName
                }))
            )
        );
        
        const filteredStudents = allStudents.filter(student => {
            const statusMatch = (statusFilter === 'All') || (student.feeStatus === statusFilter);
            const searchMatch = (student.name.toLowerCase().includes(searchTerm)) || 
                             (student.rollNumber.toLowerCase().includes(searchTerm));
            return statusMatch && searchMatch;
        });

        if (filteredStudents.length === 0) {
            feesStudentListContainer.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-6">No students match the criteria.</td></tr>`;
            return;
        }
        
        filteredStudents.forEach(student => {
            const isPaid = student.feeStatus === 'Paid';
            const statusIcon = 'check'; // Kept 'check' as it's a heroicon, not an emoji
            const statusClass = isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
            const buttonClass = isPaid ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600';
            const buttonText = isPaid ? 'Mark Pending' : 'Mark Paid';

            const rowHTML = `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <img class="h-10 w-10 rounded-full object-cover" src="${student.profileImageUrl || './default-avatar.png'}" alt="${student.name}">
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${student.name}</div>
                                <div class="text-sm text-gray-500">${student.email || 'N/A'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${student.rollNumber}</div>
                        <div class="text-sm text-gray-500">${student.department || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        ${student.blockName} / <strong>${student.roomNumber}</strong>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${student.feeStatus}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button class="toggle-fee-status-btn px-3 py-2 text-white text-xs font-medium rounded-md shadow-sm ${buttonClass} flex items-center justify-center" data-student-id="${student._id}">
                            <hero-icon-solid name="${statusIcon}" class="h-4 w-4 mr-1"></hero-icon-solid>
                            ${buttonText}
                        </button>
                    </td>
                </tr>
            `;
            feesStudentListContainer.innerHTML += rowHTML;
        });
    }
    
    // --- 5. MODAL & VIEW-SWITCHING LOGIC ---
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('hidden', 'active');
        void modal.offsetWidth;
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); 
    }
    
    function hideAllViews() {
        dashboardView.classList.add('hidden');
        detailView.classList.add('hidden');
        feesView.classList.add('hidden');
        visitorsView.classList.add('hidden');
        complaintsView.classList.add('hidden');
        leaveView.classList.add('hidden'); // ADDED
    }

    document.addEventListener('click', (e) => {
        if (e.target.dataset.modalHide) {
            hideModal(e.target.dataset.modalHide);
        }
    });

    backToDashboardBtn.addEventListener('click', () => {
        hideAllViews();
        dashboardView.classList.remove('hidden');
        detailView.dataset.currentHostelKey = '';
        currentRoomData = null;
        loadHostelData();
    });

    hostelBlockContainer.addEventListener('click', (e) => {
        const link = e.target.closest('.block-link');
        if (link) {
            e.preventDefault();
            const blockKey = link.dataset.hostelKey;
            renderDetailView(blockKey);
            hideAllViews();
            detailView.classList.remove('hidden');
        }
    });
    
    // --- 6. ASSET ASSIGNMENT LOGIC ---
    function getAssetOptionsHTML() {
        let optionsHTML = '<option value="" disabled selected>Select asset...</option>';
        const availableAssets = appState.assets.filter(a => a.quantity > 0);
        if(availableAssets.length === 0) {
            return '<option value="" disabled>No assets in stock</option>';
        }
        availableAssets.forEach(asset => {
            optionsHTML += `<option value="${asset.name}">${asset.name} (Stock: ${asset.quantity})</option>`;
        });
        return optionsHTML;
    }

    function addAssetAssignmentRow(container) {
        const assetOptions = getAssetOptionsHTML();
        
        const noAssetsMsg = container.querySelector('.no-assets-msg');
        if(noAssetsMsg) noAssetsMsg.remove();

        if (assetOptions.includes("No assets")) {
            if (!container.querySelector('.asset-assignment-row')) {
                container.innerHTML = '<p class="text-sm text-gray-500 no-assets-msg">No assets in stock to assign.</p>';
            }
            return;
        }
        
        const row = document.createElement('div');
        row.className = 'asset-assignment-row grid grid-cols-3 gap-2 items-center';
        row.innerHTML = `
            <select name="assignedAssetName" class="asset-select col-span-2 block w-full rounded-md border-gray-300 shadow-sm text-sm">
                ${assetOptions}
            </select>
            <input type="number" name="assignedAssetQty" value continue it value="1" min="1" class="asset-qty block w-full rounded-md border-gray-300 shadow-sm text-sm" placeholder="Qty">
            <button type="button" class="remove-asset-row-btn ml-2 text-red-500 hover:text-red-700 bg-red-50 p-1 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        container.appendChild(row);
    }

    // Helper to extract assets from dynamic rows
    function getSelectedAssets(container) {
        const assets = [];
        const rows = container.querySelectorAll('.asset-assignment-row');
        rows.forEach(row => {
            const name = row.querySelector('.asset-select').value;
            const qty = parseInt(row.querySelector('.asset-qty').value) || 0;
            if (name && qty > 0) {
                assets.push({ name, quantity: qty });
            }
        });
        return assets;
    }

    // Event Delegation for removing asset rows
    const handleRemoveAssetRow = (e) => {
        const btn = e.target.closest('.remove-asset-row-btn');
        if (btn) {
            btn.closest('.asset-assignment-row').remove();
        }
    };

    if(roomAssetAssignmentContainer) roomAssetAssignmentContainer.addEventListener('click', handleRemoveAssetRow);
    if(studentAssetAssignmentContainer) studentAssetAssignmentContainer.addEventListener('click', handleRemoveAssetRow);

    if(addRoomAssetRowBtn) addRoomAssetRowBtn.addEventListener('click', () => addAssetAssignmentRow(roomAssetAssignmentContainer));
    if(addStudentAssetRowBtn) addStudentAssetRowBtn.addEventListener('click', () => addAssetAssignmentRow(studentAssetAssignmentContainer));


    // --- 7. EVENT LISTENERS (FORMS & ACTIONS) ---

    // -- VIEW SWITCHING --
    showFeesViewBtn.addEventListener('click', () => {
        hideAllViews();
        feesView.classList.remove('hidden');
        renderFeesView();
    });

    showVisitorsViewBtn.addEventListener('click', () => {
        hideAllViews();
        visitorsView.classList.remove('hidden');
        loadVisitorLogs(); // Load latest data
    });

    showComplaintsViewBtn.addEventListener('click', () => {
        hideAllViews();
        complaintsView.classList.remove('hidden');
        loadComplaintsData();
    });
    
    // ADDED: Leave View Switcher
    showLeaveViewBtn.addEventListener('click', () => {
        hideAllViews();
        leaveView.classList.remove('hidden');
        loadLeaveRequests();
    });

    backToDashboardFromFeesBtn.addEventListener('click', () => backToDashboardBtn.click());
    backToDashboardFromVisitorsBtn.addEventListener('click', () => backToDashboardBtn.click());
    backToDashboardFromComplaintsBtn.addEventListener('click', () => backToDashboardBtn.click());
    backToDashboardFromLeaveBtn.addEventListener('click', () => backToDashboardBtn.click());


    // -- MODAL TRIGGERS --
    showAddBlockModalBtn.addEventListener('click', () => showModal('add-block-modal'));
    showAddRoomModalBtn.addEventListener('click', () => {
        // Reset asset container
        roomAssetAssignmentContainer.innerHTML = ''; 
        showModal('add-room-modal');
    });
    showAddStudentModalBtn.addEventListener('click', () => {
        studentAssetAssignmentContainer.innerHTML = '';
        // Only show available rooms in the dropdown is handled in renderDetailView
        showModal('add-student-modal');
    });
    showAddEventModalBtn.addEventListener('click', () => showModal('add-event-modal'));
    showAddAssetModalBtn.addEventListener('click', () => showModal('add-asset-modal'));
    showAddClubActivityModalBtn.addEventListener('click', () => showModal('add-club-activity-modal'));

    // -- SEARCH & FILTERS --
    // Fees
    feesSearchInput.addEventListener('input', renderFeesView);
    feesFilterSelect.addEventListener('change', renderFeesView);

    // Visitors
    visitorSearchInput.addEventListener('input', renderVisitorsView);
    visitorDateFilter.addEventListener('change', renderVisitorsView);
    visitorLogContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.update-visitor-btn');
        if(btn) {
            await handleVisitorAction(btn.dataset.id, btn.dataset.action);
        }
        const viewBtn = e.target.closest('.view-visitor-btn');
        if(viewBtn) {
            showVisitorDetailsModal(viewBtn.dataset.id);
        }
    });

    // Complaints
    complaintSearchInput.addEventListener('input', renderComplaintsView);
    complaintStatusFilter.addEventListener('change', renderComplaintsView);
    complaintTypeFilter.addEventListener('change', renderComplaintsView);
    refreshComplaintsBtn.addEventListener('click', () => {
        refreshComplaintsBtn.classList.add('animate-spin');
        loadComplaintsData().finally(() => refreshComplaintsBtn.classList.remove('animate-spin'));
    });

    // Leave
    leaveSearchInput.addEventListener('input', renderLeaveView);
    leaveStatusFilter.addEventListener('change', renderLeaveView);
    leaveRequestContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.update-leave-btn');
        if(btn) {
            await handleLeaveAction(btn.dataset.id, btn.dataset.action);
        }
    });

    // Rooms
    roomSearchInput.addEventListener('input', () => {
        const term = roomSearchInput.value.toLowerCase();
        const cards = roomListContainer.querySelectorAll('.room-card');
        cards.forEach(card => {
            const id = card.dataset.roomId.toLowerCase();
            card.style.display = id.includes(term) ? 'block' : 'none';
        });
    });
    roomFilterSelect.addEventListener('change', () => {
        const filter = roomFilterSelect.value;
        const cards = roomListContainer.querySelectorAll('.room-card');
        cards.forEach(card => {
            if (filter === 'All') { card.style.display = 'block'; }
            else { card.style.display = card.dataset.roomStatus === filter ? 'block' : 'none'; }
        });
    });

    // -- FORM SUBMISSIONS --

    // 1. Add Block
    addBlockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addBlockForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const res = await fetch('/api/blocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if(res.ok) {
                showSuccess('Hostel Block Added!');
                addBlockForm.reset();
                hideModal('add-block-modal');
                loadHostelData();
            } else {
                const err = await res.json();
                showError(err.message);
            }
        } catch(err) { showError(err.message); }
    });

    // 2. Add Room
    addRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addRoomForm);
        const data = Object.fromEntries(formData.entries());
        
        // Add current block key context
        if(detailView.dataset.currentHostelKey) {
            data.blockKey = detailView.dataset.currentHostelKey;
        } else {
            showError("No hostel block selected.");
            return;
        }

        // Get assigned assets
        data.assets = getSelectedAssets(roomAssetAssignmentContainer);

        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if(res.ok) {
                showSuccess('Room Added!');
                addRoomForm.reset();
                hideModal('add-room-modal');
                loadHostelData(); // Refresh data
            } else {
                const err = await res.json();
                showError(err.message);
            }
        } catch(err) { showError(err.message); }
    });

    // 3. Add Student
    addStudentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addStudentForm);
        
        // We need to construct the object carefully, especially for file upload if present
        // Assuming standard JSON for now as per previous context
        const data = Object.fromEntries(formData.entries());
        data.feeStatus = 'Pending'; // Default
        
        // Get assigned assets for the student
        data.assignedAssets = getSelectedAssets(studentAssetAssignmentContainer);

        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if(res.ok) {
                showSuccess('Student Added!');
                addStudentForm.reset();
                hideModal('add-student-modal');
                loadHostelData();
            } else {
                const err = await res.json();
                showError(err.message);
            }
        } catch(err) { showError(err.message); }
    });

    // 4. Add Asset
    addAssetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addAssetForm);
        const data = Object.fromEntries(formData.entries());

        if (assetTypeSelect.value === 'Other') {
             data.name = document.getElementById('asset-name-other').value;
        }

        try {
            const res = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if(res.ok) {
                showSuccess('Asset Added to Inventory!');
                addAssetForm.reset();
                hideModal('add-asset-modal');
                loadAssetData();
            } else {
                const err = await res.json();
                showError(err.message);
            }
        } catch(err) { showError(err.message); }
    });
    
    // Toggle "Other" input for asset type
    if(assetTypeSelect) {
        assetTypeSelect.addEventListener('change', (e) => {
            if(e.target.value === 'Other') {
                assetNameOtherWrapper.classList.remove('hidden');
                document.getElementById('asset-name-other').required = true;
            } else {
                assetNameOtherWrapper.classList.add('hidden');
                document.getElementById('asset-name-other').required = false;
            }
        });
    }

    // 5. Add Event
    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // For now, just updating local state as an example, replace with API call
        const formData = new FormData(addEventForm);
        const newEvent = Object.fromEntries(formData.entries());
        
        // Simple UI update simulation
        newEvent.id = Date.now();
        eventData.push(newEvent);
        renderEvents();
        showSuccess('Event Posted!');
        addEventForm.reset();
        hideModal('add-event-modal');
    });

    // 6. Add Club Activity
    addClubActivityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addClubActivityForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if(res.ok) {
                showSuccess('Activity Posted!');
                addClubActivityForm.reset();
                hideModal('add-club-activity-modal');
                loadClubActivities();
            } else {
                const err = await res.json();
                showError(err.message);
            }
        } catch(err) { showError(err.message); }
    });

    // -- DYNAMIC ACTIONS (DELEGATION) --

    // Room List Clicks (Open Details)
    roomListContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.room-card');
        if (card) {
            const roomId = card.dataset.roomId;
            const blockKey = detailView.dataset.currentHostelKey;
            const block = appState.blocks.find(b => b.blockKey === blockKey);
            const room = block.rooms.find(r => r.roomNumber === roomId);
            if (room) {
                renderRoomDetailsModal(room, block);
                showModal('room-details-modal');
            }
        }
    });

    // Fees Status Toggle
    feesStudentListContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.toggle-fee-status-btn');
        if (btn) {
            const studentId = btn.dataset.studentId;
            // Determine current status based on button class or text to toggle
            // In a real app, better to fetch status or store it in dataset
            const isCurrentlyPaid = btn.innerText.includes('Mark Pending');
            const newStatus = isCurrentlyPaid ? 'Pending' : 'Paid';

            if(confirm(`Change fee status to ${newStatus}?`)) {
                try {
                    const res = await fetch(`/api/students/${studentId}/fee-status`, {
                         method: 'PATCH',
                         headers: {'Content-Type': 'application/json'},
                         body: JSON.stringify({ feeStatus: newStatus })
                    });
                    if(res.ok) {
                        showSuccess(`Fee status updated to ${newStatus}`);
                        // Reload data to reflect changes
                        await loadHostelData(); 
                        renderFeesView();
                    }
                } catch(err) { showError('Failed to update fee status'); }
            }
        }
    });

    // Complaint Actions (Resolve, Response)
    complaintsListContainer.addEventListener('click', async (e) => {
        const resolveBtn = e.target.closest('.update-complaint-status-btn');
        if(resolveBtn) {
            const id = resolveBtn.dataset.complaintId;
            const status = resolveBtn.dataset.newStatus;
            await updateComplaintStatus(id, status);
        }

        const viewBtn = e.target.closest('.view-complaint-details-btn');
        if(viewBtn) {
            showComplaintDetails(viewBtn.dataset.complaintId);
        }
    });
    
    // Complaint Response Submit
    const submitResponseBtn = document.getElementById('submit-complaint-response');
    if(submitResponseBtn) {
        // Use document delegation because modal is dynamic
        document.body.addEventListener('click', async (e) => {
            if(e.target.id === 'submit-complaint-response') {
                const btn = e.target;
                const id = btn.dataset.complaintId;
                const textarea = document.getElementById('complaint-response');
                const responseText = textarea.value.trim();
                
                if(!responseText) { alert('Please enter a response'); return; }
                
                const success = await addComplaintResponse(id, responseText);
                if(success) {
                    hideModal('complaint-details-modal');
                }
            }
        });
    }

    // Delete Block
    hostelBlockContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.remove-block-btn');
        if(btn) {
            e.stopPropagation(); // Prevent opening block details
            e.preventDefault();
            if(confirm(`Are you sure you want to delete block ${btn.dataset.blockName}? This will delete all rooms and students within it.`)) {
                try {
                    const res = await fetch(`/api/blocks/${btn.dataset.blockId}`, { method: 'DELETE' });
                    if(res.ok) {
                        showSuccess('Block deleted');
                        loadHostelData();
                    }
                } catch(err) { showError('Failed to delete block'); }
            }
        }
    });
    
    // Delete Asset
    assetInventoryContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.remove-asset-btn');
        if(btn) {
            e.preventDefault();
            if(confirm(`Delete asset "${btn.dataset.assetName}"?`)) {
                 try {
                    const res = await fetch(`/api/assets/${btn.dataset.assetId}`, { method: 'DELETE' });
                    if(res.ok) {
                        showSuccess('Asset deleted');
                        loadAssetData();
                    }
                } catch(err) { showError('Failed to delete asset'); }
            }
        }
    });
    
    // Delete Club Activity
    clubActivityContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.remove-activity-btn');
        if(btn) {
            e.preventDefault();
            if(confirm(`Delete activity "${btn.dataset.activityTitle}"?`)) {
                 try {
                    const res = await fetch(`/api/activities/${btn.dataset.activityId}`, { method: 'DELETE' });
                    if(res.ok) {
                        showSuccess('Activity deleted');
                        loadClubActivities();
                    }
                } catch(err) { showError('Failed to delete activity'); }
            }
        }
    });
    
    // Admin Logout
    if(adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
             if(confirm('Logout of Admin Dashboard?')) {
                 window.location.href = '/index.html'; // Redirect to home/login
             }
        });
    }

    // --- 8. INITIALIZATION ---
    console.log('🚀 Admin Dashboard Initializing...');
    
    // Initial Data Load
    loadHostelData();
    renderEvents(); // Local data for now
    loadClubActivities();
    loadAssetData();
    loadComplaintsData();
    loadVisitorLogs();
    loadLeaveRequests();

}); // End of DOMContentLoaded