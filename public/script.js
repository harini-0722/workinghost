document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL STATE ---
    let appState = { 
        blocks: [], 
        assets: [],
        complaints: [],
        visitorLogs: [],
        // NEW: Container for fetched leave requests
        leaveRequests: []
    }; 
    
    let eventData = [
        { id: 1, title: 'Inter-Hostel Cricket Match', type: 'Sports', date: '2025-11-10', description: 'Finals between Men\'s Hostel and Women\'s Hostel.' },
        { id: 2, title: 'Mess Committee Meeting', type: 'Announcement', date: '2025-11-05', description: 'Discussing the new menu for next month.' }
    ];

    let currentRoomData = null; 

    // --- 2. DOM Elements ---
    const dashboardView = document.getElementById('dashboard-view');
    const detailView = document.getElementById('detail-view');
    const feesView = document.getElementById('fees-view');
    const showFeesViewBtn = document.getElementById('show-fees-view-btn');
    const backToDashboardFromFeesBtn = document.getElementById('back-to-dashboard-from-fees-btn');
    const feesStudentListContainer = document.getElementById('fees-student-list-container');
    const feesSearchInput = document.getElementById('fees-search-input');
    const feesFilterSelect = document.getElementById('fees-filter-select');
    const statFeesPending = document.getElementById('stat-fees-pending');

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
    
    // NEW: Leave Request Elements
    const leaveView = document.getElementById('leave-view');
    const showLeaveViewBtn = document.getElementById('show-leave-view-btn');
    const backToDashboardFromLeaveBtn = document.getElementById('back-to-dashboard-from-leave-btn');
    const leaveRequestContainer = document.getElementById('leave-request-container');
    const leaveSearchInput = document.getElementById('leave-search-input');
    const leaveStatusFilter = document.getElementById('leave-status-filter');
    const refreshLeavesBtn = document.getElementById('refresh-leaves-btn');
    const statLeavePending = document.getElementById('stat-leave-pending');
    const leaveDetailsModal = document.getElementById('leave-details-modal');
    const leaveDetailsContent = document.getElementById('leave-details-content');
    
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

    // --- 3. THEME/HELPER DATA & UTILITY FUNCTIONS ---
    const themes = { 
        pink: { border: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-600', icon: 'user-group' },
        blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600', icon: 'user-group' },
        green: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600', icon: 'building-office' },
        purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600', icon: 'academic-cap' },
        yellow: { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'beaker' },
        orange: { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-600', icon: 'paper-airplane' }, // ADDED: Orange Theme
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
    
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // --- NEW: LEAVE MANAGEMENT FUNCTIONS ---

    // Function to load all leave requests from the backend API
    async function loadLeaveRequests() {
        try {
            console.log('🔄 Loading leave requests from database...');
            const res = await fetch('/api/leave'); 
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.success) {
                appState.leaveRequests = data.leaves || []; 
                console.log('✅ Leave requests loaded from server:', appState.leaveRequests);
                
                // Update the dashboard stat for pending leaves
                updateLeaveCount();

                // Re-render if we're currently viewing the leaves
                if (!leaveView.classList.contains('hidden')) {
                    renderLeaveView();
                }

            } else {
                throw new Error(data.message || 'Failed to load leave requests');
            }
        } catch (error) {
            console.error('❌ Failed to load leave requests data:', error);
            if (!leaveView.classList.contains('hidden')) {
                leaveRequestContainer.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-6">Error: Failed to load leave requests. Check server status.</td></tr>`;
            }
        }
    }

    // Function to update the pending leave count card on the dashboard
    function updateLeaveCount() {
        const pendingLeaves = appState.leaveRequests.filter(l => l.status === 'Pending').length;
        statLeavePending.textContent = `${pendingLeaves} Pending`;
    }

    // Function to render the Leave Request Management View
    // Function to render the Leave Request Management View
function renderLeaveView() {
    const searchTerm = leaveSearchInput.value.toLowerCase();
    const statusFilter = leaveStatusFilter.value;
    leaveRequestContainer.innerHTML = '';

    // --- FIX START: Enrich data before filtering ---
    // The API gives us studentId, but we need names and room numbers.
    // We map over the requests to fill in missing details from appState.blocks
    appState.leaveRequests.forEach(leave => {
        if (!leave.studentName || !leave.roomNumber) {
            // Try to find the student in our loaded hostel data
            for (const block of appState.blocks) {
                if (block.rooms) {
                    for (const room of block.rooms) {
                        if (room.students) {
                            const student = room.students.find(s => s._id === leave.studentId);
                            if (student) {
                                leave.studentName = student.name; // Assign Name
                                leave.roomNumber = room.roomNumber; // Assign Room
                                return; // Stop searching for this specific leave
                            }
                        }
                    }
                }
            }
        }
    });
    // --- FIX END ---

    const filteredLeaves = appState.leaveRequests.filter(leave => {
        // Use 'Unknown' if data is still missing to prevent crashes
        const sName = (leave.studentName || '').toLowerCase();
        const rNum = (leave.roomNumber || '').toLowerCase();

        const statusMatch = (statusFilter === 'All') || (leave.status === statusFilter);
        const searchMatch = (sName.includes(searchTerm)) || (rNum.includes(searchTerm));

        return statusMatch && searchMatch;
    });

    if (filteredLeaves.length === 0) {
        leaveRequestContainer.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-6">No leave requests match the criteria.</td></tr>`;
        return;
    }

    // Sort: Pending first, then by applied date (newest first)
    filteredLeaves.sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(b.appliedDate) - new Date(a.appliedDate);
    });

    filteredLeaves.forEach(leave => {
        let statusClass = '';
        let actionButtons = '';

        switch (leave.status) {
            case 'Approved': statusClass = 'bg-green-100 text-green-700'; break;
            case 'Rejected': statusClass = 'bg-red-100 text-red-700'; break;
            default: statusClass = 'bg-yellow-100 text-yellow-700'; // Pending
        }

        const viewBtn = `<button class="view-leave-btn text-gray-500 hover:text-blue-600 ml-2" data-id="${leave._id}" title="View Details"><hero-icon-solid name="eye" class="h-5 w-5"></hero-icon-solid></button>`;

        if (leave.status === 'Pending') {
            actionButtons = `
                <button class="update-leave-btn bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition" data-id="${leave._id}" data-action="Approved">Approve</button>
                <button class="update-leave-btn bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 ml-1 transition" data-id="${leave._id}" data-action="Rejected">Reject</button>
            `;
        } else {
            actionButtons = `<span class="text-xs text-gray-400 mr-2">Actioned</span>`;
        }

        const rowHTML = `
            <tr class="hover:bg-gray-50 transition-colors border-b">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="font-medium">${leave.studentName || 'Unknown ID: ' + leave.studentId.substring(0,6)+'...'}</div>
                    <div class="text-xs text-gray-500">Room: ${leave.roomNumber || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <div class="truncate" title="${leave.reason}">${leave.reason}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    ${formatDate(leave.appliedDate)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${leave.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div class="flex items-center justify-center">
                        ${actionButtons}
                        ${viewBtn}
                    </div>
                </td>
            </tr>
        `;
        leaveRequestContainer.innerHTML += rowHTML;
    });
}

    // Handle Admin Action (Approve/Reject) on Leave Request
    async function handleLeaveAction(id, action) {
        if(!confirm(`Are you sure you want to ${action} this leave request?`)) return;

        try {
            const res = await fetch(`/api/leave/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });

            const data = await res.json();
            
            if (data.success) {
                showSuccess(`Leave request status updated to ${action}`);
                await loadLeaveRequests(); // Reload data and re-render view
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error updating leave status:', error);
            showError(`Failed to update leave status: ${error.message}`);
        }
    }

    // Show Leave Details Modal
    function showLeaveDetailsModal(id) {
        const leave = appState.leaveRequests.find(l => l._id === id);
        if(!leave) return;

        leaveDetailsContent.innerHTML = `
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="col-span-2 flex justify-between items-center border-b pb-2">
                    <h3 class="text-lg font-bold text-gray-800">${leave.studentName}'s Request</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' : leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}">${leave.status}</span>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">Student ID</span>
                    <p class="font-semibold text-gray-800">${leave.studentId}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">Room Number</span>
                    <p class="font-semibold text-gray-800">${leave.roomNumber}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">Start Date</span>
                    <p class="text-gray-800">${formatDate(leave.startDate)}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 uppercase tracking-wide">End Date</span>
                    <p class="text-gray-800">${formatDate(leave.endDate)}</p>
                </div>
                <div class="col-span-2 bg-gray-50 p-4 rounded-lg mt-2">
                    <span class="text-xs text-gray-500 uppercase tracking-wide block mb-1">Reason for Leave</span>
                    <p class="text-gray-700 italic">"${leave.reason}"</p>
                </div>
                <div class="col-span-2 bg-blue-50 p-4 rounded-lg mt-2">
                    <span class="text-xs text-gray-500 uppercase tracking-wide block mb-1">Applied On</span>
                    <p class="text-blue-700 font-medium">${new Date(leave.appliedDate).toLocaleString()}</p>
                </div>
            </div>
        `;
        showModal('leave-details-modal');
    }
    // --- END LEAVE MANAGEMENT FUNCTIONS ---


    // --- VISITOR MANAGEMENT FUNCTIONS (Unchanged, retained for context) ---

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
                
                updateVisitorCount();

                if (!visitorsView.classList.contains('hidden')) {
                    renderVisitorsView();
                }

            } else {
                throw new Error(data.message || 'Failed to load visitor logs');
            }
        } catch (error) {
            console.error('❌ Failed to load visitor logs data:', error);
            if (!visitorsView.classList.contains('hidden')) {
                visitorLogContainer.innerHTML = `<tr><td colspan="7" class="text-center text-red-500 py-6">Error: Failed to load visitor logs. Check server status.</td></tr>`;
            }
        }
    }

    function updateVisitorCount() {
        const today = new Date().toISOString().split('T')[0];
        const visitorsToday = appState.visitorLogs.filter(v => (v.rawDate ? v.rawDate.split('T')[0] : v.date) === today).length;
        statVisitorsToday.textContent = `${visitorsToday} Today`;
    }

    function renderVisitorsView() {
        const searchTerm = visitorSearchInput.value.toLowerCase();
        const dateFilter = visitorDateFilter.value;
        visitorLogContainer.innerHTML = '';
        
        const logsToFilter = appState.visitorLogs; 
        
        const filteredLogs = logsToFilter.filter(log => {
            const searchMatch = (log.visitorName?.toLowerCase().includes(searchTerm)) ||
                                (log.studentName?.toLowerCase().includes(searchTerm)) ||
                                (log.roomNumber?.toLowerCase().includes(searchTerm));
            
            const logDate = log.rawDate ? new Date(log.rawDate).toISOString().split('T')[0] : log.date;
            const dateMatch = (!dateFilter) || (logDate === dateFilter);
            
            return searchMatch && dateMatch;
        });
        
        if (filteredLogs.length === 0) {
            visitorLogContainer.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 py-6">No visitor logs match the criteria.</td></tr>`;
            return;
        }

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

            switch(log.status) {
                case 'Approved': statusClass = 'bg-blue-100 text-blue-700'; break;
                case 'Rejected': statusClass = 'bg-red-100 text-red-700'; break;
                case 'Checked In': statusClass = 'bg-green-100 text-green-700'; break;
                case 'Checked Out': statusClass = 'bg-gray-100 text-gray-700'; break;
                default: statusClass = 'bg-yellow-100 text-yellow-700'; // Pending
            }

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
                await loadVisitorLogs(); 
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error updating visitor status:', error);
            showError(error.message);
        }
    }

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

    // --- COMPLAINT MANAGEMENT FUNCTIONS (Unchanged, retained for context) ---

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
                
                updateComplaintsCount();
                
                if (!complaintsView.classList.contains('hidden')) {
                    renderComplaintsView();
                }
            } else {
                throw new Error(data.message || 'Failed to load complaints');
            }
        } catch (error) {
            console.error('❌ Failed to load complaints data:', error);
            showError('Failed to load complaints: ' + error.message);
            
            complaintsListContainer.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-red-500 py-6">
                        ❌ Failed to load complaints. Please try again.
                    </td>
                </tr>
            `;
        }
    }

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

    function updateComplaintsCount() {
        const openComplaints = appState.complaints.filter(complaint => 
            complaint.status === 'Pending' || complaint.status === 'In Progress'
        ).length;
        statOpenComplaints.textContent = openComplaints;
    }

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

          // Change one of the stats to show the manually entered capacity
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
                            <div><span class="text-gray-500">Total Rooms</span><p class="text-lg font-semibold text-gray-900">${totalRooms}</p></div>
                            <div><span class="text-gray-500">Occupied Rooms</span><p class="text-lg font-semibold text-gray-900">${occupiedRooms}</p></div>
                            <div><span class="text-gray-500">Current Students</span><p class="text-lg font-semibold text-gray-900">${currentStudents}</p></div>
                            <div><span class="text-gray-500">Target Capacity</span><p class="text-lg font-semibold text-gray-900">${block.blockCapacity || totalCapacity}</p></div> 
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
        updateVisitorCount(); 
        updateLeaveCount(); // NEW: Update the leave count stat
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
            const max = room.capacity;  hostelOccupancy += current;
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
       const displayedCapacity = block.blockCapacity || hostelCapacity; // Use set limit, fallback to sum of rooms
    
    detailStatCapacity.textContent = displayedCapacity; 
    detailStatOccupancy.textContent = hostelOccupancy; 
    detailStatAvailable.textContent = displayedCapacity - hostelOccupancy;
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
        leaveView.classList.add('hidden'); // NEW: Hide leave view
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
    
    // --- 6. ASSET ASSIGNMENT LOGIC (Unchanged, retained for context) ---
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
            <input type="number" name="assignedAssetQty" value="1" min="1" class="asset-qty block w-full rounded-md border-gray-300 shadow-sm text-sm" placeholder="Qty">
            <button type="button" class="remove-asset-row-btn text-red-500 hover:text-red-700">
                <hero-icon-solid name="x-circle" class="h-5 w-5"></hero-icon-solid>
            </button>
        `;
        
        row.querySelector('.remove-asset-row-btn').addEventListener('click', () => {
            row.remove();
            if (!container.querySelector('.asset-assignment-row') && assetOptions.includes("No assets")) {
                container.innerHTML = '<p class="text-sm text-gray-500 no-assets-msg">No assets in stock to assign.</p>';
            }
        });
        
        container.appendChild(row);
    }

    addRoomAssetRowBtn.addEventListener('click', () => addAssetAssignmentRow(roomAssetAssignmentContainer));
    addStudentAssetRowBtn.addEventListener('click', () => addAssetAssignmentRow(studentAssetAssignmentContainer));

    function processAssetAssignments(container) {
        const assignmentRows = container.querySelectorAll('.asset-assignment-row');
        const assignedAssets = [];
        const tempStockCheck = {}; 

        for (const row of assignmentRows) {
            const assetName = row.querySelector('.asset-select').value;
            const quantity = parseInt(row.querySelector('.asset-qty').value, 10);
            
            if (!assetName || !quantity || quantity <= 0) {
                continue; 
            }

            const assetInStock = appState.assets.find(a => a.name === assetName);
            if (!assetInStock) {
                alert(`Error: Asset "${assetName}" not found in inventory.`);
                return null; 
            }

            const currentStock = assetInStock.quantity;
            const alreadyAssigned = tempStockCheck[assetName] || 0;
            
            if (quantity > (currentStock - alreadyAssigned)) {
                alert(`Error: Not enough "${assetName}" in stock. Available: ${currentStock}, Requested: ${quantity + alreadyAssigned}`);
                return null; 
            }

            tempStockCheck[assetName] = alreadyAssigned + quantity;
            assignedAssets.push({ name: assetName, quantity: quantity });
        }
        
        return assignedAssets;
    }

    // --- 7. FORM & DATA HANDLERS (Unchanged, retained for context) ---
   // In script.js (~ line 1056 in your provided code)
addBlockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const blockName = document.getElementById('block-name').value;
    const blockKey = document.getElementById('block-key').value.toLowerCase().replace(/\s+/g, '-');
    const blockTheme = document.getElementById('block-theme').value;
    // --- START: Capture new field ---
    const blockCapacity = parseInt(document.getElementById('block-capacity').value, 10);
    if (!blockName || !blockKey || isNaN(blockCapacity) || blockCapacity < 0) return;
    // --- END: Capture new field ---

    try {
        const res = await fetch('/api/blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // --- Send new field in the body ---
            body: JSON.stringify({ blockName, blockKey, blockTheme, blockCapacity }) 
        });
        const data = await res.json();
        if (data.success) {
            await loadHostelData();
            hideModal('add-block-modal');
            addBlockForm.reset();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert(`Error adding block: ${error.message}`);
    }
});
// In script.js (~ line 1111)// Add this function before initApp in script.js (around line 1400)
function updateStudentRoomSelect() {
    studentRoomSelect.innerHTML = '<option value="" disabled selected>-- Select an available room --</option>';
    
    // Find the currently viewed block based on detailView's data attribute
    const blockKey = detailView.dataset.currentHostelKey;
    const currentBlock = appState.blocks.find(b => b.blockKey === blockKey);

    if (!currentBlock || !currentBlock.rooms) {
        studentRoomSelect.innerHTML = '<option value="" disabled>No rooms in this block</option>';
        return;
    }

    currentBlock.rooms
        // Sort rooms by number
        .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' }))
        .forEach(room => {
            const currentOccupancy = room.students ? room.students.length : 0;
            const maxCapacity = room.capacity || 0;
            const availableSlots = maxCapacity - currentOccupancy;

            if (availableSlots > 0) {
                // Use room._id as the value for submission
                studentRoomSelect.innerHTML += `
                    <option value="${room._id}" data-max-capacity="${maxCapacity}" data-current-occupancy="${currentOccupancy}">
                        ${room.roomNumber} (${currentOccupancy}/${maxCapacity}) - ${availableSlots} slots left
                    </option>
                `;
            }
        });

    if (studentRoomSelect.options.length === 1) { // Only the disabled default option remains
        studentRoomSelect.innerHTML = '<option value="" disabled selected>No available rooms found</option>';
    }
}
addRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // --- CAPACITY CHECK LOGIC START ---
    const blockKey = detailView.dataset.currentHostelKey;
    const block = appState.blocks.find(b => b.blockKey === blockKey);
    const newRoomCapacity = parseInt(document.getElementById('room-capacity').value, 10);

    if (!blockKey || !block) {
        alert('Error: No block selected.');
        return;
    }

    const currentRooms = block.rooms || [];
    const blockMaxStudents = block.blockCapacity || 999999; // Total student limit
    // Calculate the total capacity *after* adding the new room
    const currentRoomsTotalStudentCapacity = currentRooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    const projectedTotalStudentCapacity = currentRoomsTotalStudentCapacity + newRoomCapacity;

    if (projectedTotalStudentCapacity > blockMaxStudents) {
        showError(`Cannot add room. Projected student capacity (${projectedTotalStudentCapacity}) exceeds the Block's maximum student limit of ${blockMaxStudents}.`);
        return; 
    }
    // --- CAPACITY CHECK LOGIC END ---

    const assignedAssets = processAssetAssignments(roomAssetAssignmentContainer);
    if (assignedAssets === null) {
        return;
    }
    // 2. NEW: Room Count Limit Check 
    // We assume blockMaxStudents is ALSO the desired room count limit.
    const currentRoomCount = currentRooms.length;
    
    if (currentRoomCount >= blockMaxStudents) {
        showError(`Cannot add room. The block is limited to ${blockMaxStudents} rooms, and it already has ${currentRoomCount} rooms.`);
        return;
    }
    // The rest of the original code follows:
    // ... rest of original function body ...
    
    const formData = new FormData();
    formData.append('roomNumber', document.getElementById('room-id').value);
    formData.append('floor', document.getElementById('room-floor').value);
    formData.append('capacity', document.getElementById('room-capacity').value);
    formData.append('assets', JSON.stringify(assignedAssets)); 

    const imageFile = document.getElementById('room-image-file').files[0];
    if (imageFile) {
        formData.append('roomImage', imageFile);
    }
    
    const submitBtn = addRoomForm.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        const res = await fetch(`/api/blocks/${blockKey}/rooms`, {
            method: 'POST',
            body: formData 
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Room';

        const data = await res.json();
        if (data.success) {
            await loadHostelData();
            await loadAssetData();
            hideModal('add-room-modal');
            addRoomForm.reset();
            roomAssetAssignmentContainer.innerHTML = ''; 
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Room';
        alert(`Error adding room: ${error.message}`);
    }
});
// In script.js (~ line 1205)
// In script.js (~ line 1205)
addStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedRoomId = document.getElementById('student-room-id').value;
    const selectedOption = studentRoomSelect.querySelector(`option[value="${selectedRoomId}"]`);
    const blockKey = detailView.dataset.currentHostelKey;
    const block = appState.blocks.find(b => b.blockKey === blockKey);

    // --- START: NEW STUDENT CAPACITY VALIDATION ---
    if (!selectedRoomId || !selectedOption) {
        alert('Please select a valid room.');
        return;
    }
    
    // 1. Room-Level Check: Check if the selected room is full
    const maxRoomCapacity = parseInt(selectedOption.dataset.maxCapacity, 10);
    const currentRoomOccupancy = parseInt(selectedOption.dataset.currentOccupancy, 10);

    if (currentRoomOccupancy >= maxRoomCapacity) {
        showError(`Room ${selectedOption.textContent.split(' ')[0]} is already full (${currentRoomOccupancy}/${maxRoomCapacity}). Please choose another room.`);
        return; 
    }
    
    // 2. Block-Level Check: Check if the block is full
    if (block && block.blockCapacity) {
        let currentBlockOccupancy = 0;
        // Calculate current total student occupancy across all rooms in this block
        (block.rooms || []).forEach(room => {
            currentBlockOccupancy += (room.students ? room.students.length : 0);
        });
const projectedOccupancy = currentBlockOccupancy + 1; // +1 for the student being added
        const blockMaxStudents = block.blockCapacity;
        if (projectedOccupancy > blockMaxStudents) {
            showError(`Cannot add student. The block is full. Current students: ${currentBlockOccupancy}. Block limit: ${blockMaxStudents}.`);
            return;
        }
    }
    // --- END: NEW STUDENT CAPACITY VALIDATION ---

    const assignedAssets = processAssetAssignments(studentAssetAssignmentContainer);
    if (assignedAssets === null) {
        return; 
    }
     
    const formData = new FormData(addStudentForm);
    formData.append('blockKey', blockKey);
    formData.append('assets', JSON.stringify(assignedAssets)); 
    
    // We explicitly set the correct roomId using the value from the select
    formData.set('roomId', selectedRoomId);

    try {
        const submitBtn = addStudentForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
         
        const res = await fetch('/api/students', {
            method: 'POST',
            body: formData
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Student';

        const data = await res.json();
        if (data.success) {
            await loadHostelData();
            await loadAssetData();
            hideModal('add-student-modal');
            addStudentForm.reset();
            studentAssetAssignmentContainer.innerHTML = ''; 
            // Re-render detail view to update UI immediately
            renderDetailView(blockKey); 
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert(`Error adding student: ${error.message}`);
        const submitBtn = addStudentForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Student';
    }
});
    addEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEvent = {
            id: Date.now(),
            title: document.getElementById('event-title').value,
            type: document.getElementById('event-type').value,
            date: document.getElementById('event-date').value,
            description: document.getElementById('event-description').value,
        };
        eventData.push(newEvent);
        renderEvents();
        hideModal('add-event-modal');
        addEventForm.reset();
    });

    addClubActivityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addClubActivityForm);
        
        try {
            const submitBtn = addClubActivityForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';

            const res = await fetch('/api/activities', {
                method: 'POST',
                body: formData 
            });

            submitBtn.disabled = false;
            submitBtn.textContent = 'Post Activity';

            const data = await res.json();
            if (data.success) {
                await loadClubActivities();
                hideModal('add-club-activity-modal');
                addClubActivityForm.reset();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert(`Error adding activity: ${error.message}`);
            const submitBtn = addClubActivityForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post Activity';
        }
    });
    
    addAssetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const type = assetTypeSelect.value;
        const otherName = document.getElementById('asset-name-other').value;

        if (type === 'Other' && !otherName) {
            alert('Please specify the asset name when selecting "Other".');
            return;
        }
        
        const formData = new FormData(addAssetForm);
        
        const submitBtn = addAssetForm.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            const res = await fetch('/api/assets', {
                method: 'POST',
                body: formData
            });

            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Asset';

            const data = await res.json();
            if (data.success) {
                await loadAssetData(); 
                hideModal('add-asset-modal');
                addAssetForm.reset();
                assetNameOtherWrapper.classList.add('hidden');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Asset';
            alert(`Error adding asset: ${error.message}`);
        }
    });

    assetTypeSelect.addEventListener('change', () => {
        if (assetTypeSelect.value === 'Other') {
            assetNameOtherWrapper.classList.remove('hidden');
        } else {
            assetNameOtherWrapper.classList.add('hidden');
        }
    });

    // --- 8. DETAIL VIEW & MODAL LISTENERS (Unchanged, retained for context) ---
    function filterAndSearchRooms() {
        const searchTerm = roomSearchInput.value.toLowerCase();
        const filterTerm = roomFilterSelect.value;
        const roomCards = roomListContainer.querySelectorAll('.room-card');

        roomCards.forEach(card => {
            const roomId = card.dataset.roomId.toLowerCase();
            const roomStatus = card.dataset.roomStatus;
            const searchMatch = roomId.includes(searchTerm);
            const filterMatch = (filterTerm === 'All') || (filterTerm === 'Full' && roomStatus === 'Full') || (filterTerm === 'Available' && roomStatus === 'Available');
            card.style.display = (searchMatch && filterMatch) ? 'block' : 'none';
        });
    }
    roomSearchInput.addEventListener('input', filterAndSearchRooms);
    roomFilterSelect.addEventListener('change', filterAndSearchRooms);

    roomListContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.room-card');
        if (card) {
            const roomId = card.dataset.roomId;
            const blockKey = detailView.dataset.currentHostelKey;
            const block = appState.blocks.find(b => b.blockKey === blockKey);
            if (!block) return;
            const room = block.rooms.find(r => r.roomNumber === roomId);
            if (!room) return;
            
            renderRoomDetailsModal(room, block);
            showModal('room-details-modal');
        }
    });

    modalDeleteRoomBtn.addEventListener('click', async () => {
        if (!currentRoomData || !currentRoomData._id) return;
        const blockKey = detailView.dataset.currentHostelKey;
        const roomId = currentRoomData._id;

        if (confirm(`Are you sure you want to delete room ${currentRoomData.roomNumber}?\nThis will also remove all students in it and return all assets to stock.`)) {
            try {
                const res = await fetch(`/api/blocks/${blockKey}/rooms/${roomId}`, {
                    method: 'DELETE'
                });
                const data = await res.json();
                if (data.success) {
                    await loadHostelData(); 
                    await loadAssetData(); 
                    hideModal('room-details-modal');
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                alert(`Error deleting room: ${error.message}`);
            }
        }
    });

    modalOccupantContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('.remove-student-btn');
        if (button) {
            e.preventDefault(); 
            e.stopPropagation();
            const studentId = button.dataset.studentId;
            if (confirm(`Are you sure you want to remove this student?\nTheir assets will be returned to stock.`)) {
                try {
                    const res = await fetch(`/api/students/${studentId}`, {
                        method: 'DELETE'
                    });
                    const data = await res.json();
                    if (data.success) {
                        await loadHostelData(); 
                        await loadAssetData(); 

                        const blockKey = detailView.dataset.currentHostelKey;
                        const block = appState.blocks.find(b => b.blockKey === blockKey);
                        const updatedRoom = block.rooms.find(r => r._id === currentRoomData._id);
                        if (updatedRoom) {
                            renderRoomDetailsModal(updatedRoom, block);
                            console.log('✅ Student removed, modal updated.');
                        } else {
                            hideModal('room-details-modal');
                        }
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    alert(`Error removing student: ${error.message}`);
                }
            }
        }
    });
    
    // --- 9. DELETE HANDLERS (for cards) (Unchanged, retained for context) ---
    hostelBlockContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('.remove-block-btn');
        if (button) {
            e.preventDefault(); e.stopPropagation();
            const blockId = button.dataset.blockId;
            const blockName = button.dataset.blockName;
            if (confirm(`Are you sure you want to delete the block "${blockName}"?\nThis action is permanent and will delete all associated rooms, students, and return their assets.`)) {
                try {
                    const res = await fetch(`/api/blocks/${blockId}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        await loadHostelData();
                        await loadAssetData(); 
                    } else { throw new Error(data.message); }
                } catch (error) { alert(`Error deleting block: ${error.message}`); }
            }
        }
    });
    
    clubActivityContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('.remove-activity-btn');
        if (button) {
            e.preventDefault(); e.stopPropagation();
            const activityId = button.dataset.activityId;
            const activityTitle = button.dataset.activityTitle;
            if (confirm(`Are you sure you want to delete the activity "${activityTitle}"?`)) {
                try {
                    const res = await fetch(`/api/activities/${activityId}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        await loadClubActivities();
                    } else { throw new Error(data.message); }
                } catch (error) { alert(`Error deleting activity: ${error.message}`); }
            }
        }
    });

    assetInventoryContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('.remove-asset-btn');
        if (button) {
            e.preventDefault(); e.stopPropagation();
            const assetId = button.dataset.assetId;
            const assetName = button.dataset.assetName;
            if (confirm(`Are you sure you want to delete "${assetName}" from the inventory?`)) {
                try {
                    const res = await fetch(`/api/assets/${assetId}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        await loadAssetData(); 
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    alert(`Error deleting asset: ${error.message}`);
                }
            }
        }
    });

    // --- 10. "SHOW MODAL" BUTTON LISTENERS & VIEW NAVIGATION ---
    showAddBlockModalBtn.addEventListener('click', () => showModal('add-block-modal'));
    
    showAddRoomModalBtn.addEventListener('click', () => {
        roomAssetAssignmentContainer.innerHTML = ''; 
        addAssetAssignmentRow(roomAssetAssignmentContainer); 
        showModal('add-room-modal');
    });

    // In script.js (~ line 1334)
showAddStudentModalBtn.addEventListener('click', () => {
    // 1. Refresh the room selector based on current capacity
    updateStudentRoomSelect(); 
    
    // 2. Reset and show asset assignment form
    studentAssetAssignmentContainer.innerHTML = ''; 
    addAssetAssignmentRow(studentAssetAssignmentContainer); 
    
    // 3. Show modal
    showModal('add-student-modal');
});
    
    showAddEventModalBtn.addEventListener('click', () => showModal('add-event-modal'));
    showAddClubActivityModalBtn.addEventListener('click', () => showModal('add-club-activity-modal'));
    showAddAssetModalBtn.addEventListener('click', () => showModal('add-asset-modal')); 

    // View navigation listeners
    showFeesViewBtn.addEventListener('click', () => {
        hideAllViews();
        feesView.classList.remove('hidden');
        renderFeesView();
    });
    
    backToDashboardFromFeesBtn.addEventListener('click', () => {
        hideAllViews();
        dashboardView.classList.remove('hidden');
        renderDashboard();
    });
    
    showVisitorsViewBtn.addEventListener('click', () => {
        hideAllViews();
        visitorsView.classList.remove('hidden');
        visitorDateFilter.value = new Date().toISOString().split('T')[0]; 
        loadVisitorLogs(); 
    });
    
    backToDashboardFromVisitorsBtn.addEventListener('click', () => {
        hideAllViews();
        dashboardView.classList.remove('hidden');
    });

    // Complaints View Listeners
    showComplaintsViewBtn.addEventListener('click', () => {
        hideAllViews();
        complaintsView.classList.remove('hidden');
        loadComplaintsData();
    });
    
    backToDashboardFromComplaintsBtn.addEventListener('click', () => {
        hideAllViews();
        dashboardView.classList.remove('hidden');
    });

    // NEW: Leave View Listeners
    showLeaveViewBtn.addEventListener('click', () => {
        hideAllViews();
        leaveView.classList.remove('hidden');
        loadLeaveRequests();
    });
    
    backToDashboardFromLeaveBtn.addEventListener('click', () => {
        hideAllViews();
        dashboardView.classList.remove('hidden');
    });

    // Complaints filtering and search
    complaintSearchInput.addEventListener('input', renderComplaintsView);
    complaintStatusFilter.addEventListener('change', renderComplaintsView);
    complaintTypeFilter.addEventListener('change', renderComplaintsView);

    // Refresh complaints
    refreshComplaintsBtn.addEventListener('click', () => {
        loadComplaintsData();
        showSuccess('Complaints refreshed');
    });

    // NEW: Leave filtering and search
    leaveSearchInput.addEventListener('input', renderLeaveView);
    leaveStatusFilter.addEventListener('change', renderLeaveView);

    // NEW: Refresh leaves
    refreshLeavesBtn.addEventListener('click', () => {
        loadLeaveRequests();
        showSuccess('Leave requests refreshed');
    });

    // Complaint actions
    complaintsListContainer.addEventListener('click', async (e) => {
        const viewBtn = e.target.closest('.view-complaint-details-btn');
        const statusBtn = e.target.closest('.update-complaint-status-btn');
        
        if (viewBtn) {
            const complaintId = viewBtn.dataset.complaintId;
            showComplaintDetails(complaintId);
        }
        
        if (statusBtn) {
            const complaintId = statusBtn.dataset.complaintId;
            const newStatus = statusBtn.dataset.newStatus;
            
            let adminNotes = '';
            if (newStatus === 'Resolved') {
                adminNotes = prompt('Enter resolution notes:');
                if (adminNotes === null) return;
            }
            
            if (await updateComplaintStatus(complaintId, newStatus, adminNotes)) {
                renderComplaintsView();
            }
        }
    });

    // Add response to complaint
    complaintDetailsContent.addEventListener('click', async (e) => {
        if (e.target.id === 'submit-complaint-response') {
            const complaintId = e.target.dataset.complaintId;
            const responseText = document.getElementById('complaint-response').value.trim();
            
            if (!responseText) {
                showError('Please enter a response');
                return;
            }
            
            if (await addComplaintResponse(complaintId, responseText)) {
                document.getElementById('complaint-response').value = '';
                showComplaintDetails(complaintId);
            }
        }
    });

    // Visitor Log Actions (Unchanged, retained for context)
    visitorLogContainer.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('.update-visitor-btn');
        if (actionBtn) {
            const id = actionBtn.dataset.id;
            const action = actionBtn.dataset.action;
            handleVisitorAction(id, action);
        }

        const viewBtn = e.target.closest('.view-visitor-btn');
        if (viewBtn) {
            const id = viewBtn.dataset.id;
            showVisitorDetailsModal(id);
        }
    });

    // NEW: Leave Request Actions
    leaveRequestContainer.addEventListener('click', (e) => {
        // Handle Action Buttons (Approve, Reject)
        const actionBtn = e.target.closest('.update-leave-btn');
        if (actionBtn) {
            const id = actionBtn.dataset.id;
            const action = actionBtn.dataset.action;
            handleLeaveAction(id, action);
        }

        // Handle View Details (Eye Icon)
        const viewBtn = e.target.closest('.view-leave-btn');
        if (viewBtn) {
            const id = viewBtn.dataset.id;
            showLeaveDetailsModal(id);
        }
    });

    // --- 11. OTHER LISTENERS (Unchanged, retained for context) ---
    adminLogoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            window.location.href = '/login.html';
        }
    });
    
    feesSearchInput.addEventListener('input', renderFeesView);
    feesFilterSelect.addEventListener('change', renderFeesView);
    
    visitorSearchInput.addEventListener('input', renderVisitorsView);
    visitorDateFilter.addEventListener('change', renderVisitorsView);
    
    feesStudentListContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.toggle-fee-status-btn');
        if (button) {
            const studentId = button.dataset.studentId;
            const student = findStudentById(studentId);
            if (student) {
                student.feeStatus = (student.feeStatus === 'Paid') ? 'Pending' : 'Paid';
                console.log(`Updated student ${student.name} fee status to ${student.feeStatus}`);
                renderFeesView();
            }
        }
    });

    // --- 12. INITIALIZE APP ---
    function initApp() {
        console.log('🚀 Initializing Admin Dashboard...');
        loadHostelData();
        loadClubActivities();
        loadAssetData();
        loadComplaintsData();
        loadVisitorLogs(); 
        loadLeaveRequests(); // NEW: Load initial leave request data
        renderEvents();
    }
    initApp();
});