document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL STATE ---
    let appState = { 
        blocks: [], 
        assets: [],
        complaints: [],
        visitorLogs: [] // Container for fetched visitor data
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
    
    // Visitor Detail Modal Elements
    const visitorDetailsModal = document.getElementById('visitor-details-modal');
    const visitorDetailsContent = document.getElementById('visitor-details-content');

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

    // Function to update the visitor count card on the dashboard
    function updateVisitorCount() {
        const today = new Date().toISOString().split('T')[0];
        const visitorsToday = appState.visitorLogs.filter(v => 
            v.date === today && (v.status === 'Approved' || v.status === 'Pending')
        ).length;
        statVisitorsToday.textContent = `${visitorsToday} Today`;
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
    
    // UPDATED: Use appState.visitorLogs
    function renderVisitorsView() {
        const searchTerm = visitorSearchInput.value.toLowerCase();
        const dateFilter = visitorDateFilter.value;
        visitorLogContainer.innerHTML = '';
        
        const logsToFilter = appState.visitorLogs; 
        
        const filteredLogs = logsToFilter.filter(log => {
            const searchMatch = (log.visitorName?.toLowerCase().includes(searchTerm)) ||
                                 (log.studentName?.toLowerCase().includes(searchTerm)) ||
                                 (log.roomNumber?.toLowerCase().includes(searchTerm));
            const dateMatch = (!dateFilter) || (log.date === dateFilter);
            return searchMatch && dateMatch;
        });
        
        if (filteredLogs.length === 0) {
            visitorLogContainer.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 py-6">No visitor logs match the criteria.</td></tr>`;
            return;
        }

        // Sort by date (newest first)
        filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        filteredLogs.forEach(log => {
            const statusClass = log.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                log.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                log.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700';
            
            // Format requested period from start/end dates
            const startDateStr = new Date(log.startDate).toLocaleDateString('en-US');
            const endDateStr = new Date(log.endDate).toLocaleDateString('en-US');
            const requestedPeriod = `${startDateStr} - ${endDateStr}`;

            let actionButtonsHTML = '';
            if (log.status === 'Pending') {
                actionButtonsHTML = `
                    <button class="action-btn approve-btn px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-md shadow-sm hover:bg-green-700" data-id="${log.id}" data-action="Approved">Approve</button>
                    <button class="action-btn reject-btn px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-md shadow-sm hover:bg-red-700" data-id="${log.id}" data-action="Rejected">Reject</button>
                `;
            } else if (log.status === 'Approved') {
                if (!log.timeIn) {
                    actionButtonsHTML = `
                        <button class="action-btn check-in-btn px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md shadow-sm hover:bg-blue-700" data-id="${log.id}">Check In</button>
                    `;
                } else if (!log.timeOut) {
                    actionButtonsHTML = `
                        <button class="action-btn check-out-btn px-2 py-1 bg-amber-600 text-white text-xs font-medium rounded-md shadow-sm hover:bg-amber-700" data-id="${log.id}">Check Out</button>
                    `;
                } else {
                    actionButtonsHTML = `<span class="text-gray-500 text-xs">Completed</span>`;
                }
            } else { // Rejected 
                 actionButtonsHTML = `<span class="text-gray-500 text-xs">No Action</span>`;
            }
            
            const timeInDisplay = log.timeIn ? new Date(log.timeIn).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : 'N/A';
            const timeOutDisplay = log.timeOut ? new Date(log.timeOut).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : 'N/A';

            const rowHTML = `
                <tr class="hover:bg-gray-50 visitor-row" data-id="${log.id}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${log.visitorName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div>${log.studentName}</div>
                        <div class="text-xs text-gray-500">${log.roomNumber}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        <div class="text-xs text-gray-500">
                            ${requestedPeriod}
                        </div>
                        <div class="truncate font-medium" title="Reason: ${log.reason}">Reason: ${log.reason}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${log.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>In: ${timeInDisplay}</div>
                        <div>Out: ${timeOutDisplay}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-1 flex flex-col justify-center items-center">
                        <button class="action-btn view-details-btn px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm hover:bg-blue-600 mb-1" data-id="${log.id}">View</button>
                        <div class="flex flex-wrap justify-center gap-1">${actionButtonsHTML}</div>
                    </td>
                </tr>
            `;
            visitorLogContainer.innerHTML += rowHTML;
        });
    }

    // Function to handle all visitor actions (Approve, Reject, Check-in, Check-out)
    async function updateVisitorRequest(id, action, timeType = null) {
        if (!confirm(`Confirm action: ${action} for request ID: ${id}?`)) return;
        
        let updateData = {};
        let method = 'PATCH';
        let apiPath = '';

        if (action === 'Approved' || action === 'Rejected') {
            updateData = { status: action };
            apiPath = `/api/visitor-request/${id}/status`;
        } else if (timeType === 'checkIn') {
            updateData = { timeIn: new Date().toISOString() };
            apiPath = `/api/visitor-request/${id}/checkin`;
        } else if (timeType === 'checkOut') {
            updateData = { timeOut: new Date().toISOString() };
            apiPath = `/api/visitor-request/${id}/checkout`;
        } else {
             return; // Should not happen
        }

        try {
            const res = await fetch(apiPath, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const data = await res.json();
            
            if (data.success) {
                showSuccess(`Request status updated to ${action}!`);
                await loadVisitorLogs(); // Refresh the list
            } else {
                showError(`Failed to perform action: ${data.message}`);
            }
        } catch (error) {
            console.error('Action failed:', error);
            showError('A server error occurred during the visitor action.');
        }
    }
    
    // Function to display the full visitor details in a modal
    function showVisitorDetails(log) {
        const timeInDisplay = log.timeIn ? new Date(log.timeIn).toLocaleString() : 'N/A';
        const timeOutDisplay = log.timeOut ? new Date(log.timeOut).toLocaleString() : 'N/A';
        const submissionDateDisplay = new Date(log.date).toLocaleDateString();

        visitorDetailsContent.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-y-3 gap-x-4 border-b pb-3">
                    <div><label class="block text-sm font-medium text-gray-500">Visitor Name</label><p class="font-semibold text-lg text-gray-900">${log.visitorName}</p></div>
                    <div><label class="block text-sm font-medium text-gray-500">Student Visited</label><p class="font-medium text-gray-900">${log.studentName} (Room ${log.roomNumber})</p></div>
                </div>
                
                <div class="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div><label class="block text-sm font-medium text-gray-500">Submitted On</label><p>${submissionDateDisplay}</p></div>
                    <div><label class="block text-sm font-medium text-gray-500">Request ID</label><p class="text-xs truncate">${log.id}</p></div>
                    <div><label class="block text-sm font-medium text-gray-500">Requested Start Date</label><p class="font-medium text-blue-600">${new Date(log.startDate).toLocaleDateString()}</p></div>
                    <div><label class="block text-sm font-medium text-gray-500">Requested End Date</label><p class="font-medium text-blue-600">${new Date(log.endDate).toLocaleDateString()}</p></div>
                </div>
                
                <div class="border-t pt-3">
                    <label class="block text-sm font-medium text-gray-500">Reason for Visit</label>
                    <p class="bg-gray-100 p-3 rounded text-gray-800">${log.reason}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4 border-t pt-3">
                    <div><label class="block text-sm font-medium text-gray-500">Time In (Actual)</label><p class="font-medium text-green-600">${timeInDisplay}</p></div>
                    <div><label class="block text-sm font-medium text-gray-500">Time Out (Actual)</label><p class="font-medium text-red-600">${timeOutDisplay}</p></div>
                </div>
                
            </div>
        `;
        showModal('visitor-details-modal');
    }


    // --- 11. OTHER LISTENERS ---
    
    adminLogoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            window.location.href = '/login.html';
        }
    });
    
    feesSearchInput.addEventListener('input', renderFeesView);
    feesFilterSelect.addEventListener('change', renderFeesView);
    
    // UPDATED: Call renderVisitorsView when filters/search change
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

    // Listener for Visitor Log Actions (Approve, Reject, Check-in, Check-out, View)
    visitorLogContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.action-btn');
        const id = target?.dataset.id;
        if (!id) return;

        if (target.classList.contains('approve-btn')) {
            updateVisitorRequest(id, 'Approved');
        } else if (target.classList.contains('reject-btn')) {
            updateVisitorRequest(id, 'Rejected');
        } else if (target.classList.contains('check-in-btn')) {
            updateVisitorRequest(id, 'Check-in', 'checkIn');
        } else if (target.classList.contains('check-out-btn')) {
            updateVisitorRequest(id, 'Check-out', 'checkOut');
        } else if (target.classList.contains('view-details-btn')) {
            const log = appState.visitorLogs.find(l => l.id === id);
            if (log) {
                showVisitorDetails(log);
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
        renderEvents();
    }
    initApp();
});