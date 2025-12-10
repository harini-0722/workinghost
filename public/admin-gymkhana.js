// This is the content for: public/admin-gymkhana.js

// IMPORTANT: This API_URL assumes your Express router is mounted at the root '/api'
// If your router is mounted differently (e.g., '/api/gymkhana'), adjust this line.
// Based on the code, the calls look like they expect '/api/events', etc.
// The provided code uses: `${API_URL}/events` where API_URL = '/api/gymkhana'
const API_URL = '/api/gymkhana'; 


// ====================================================================
// --- Core Add/Edit/Update Logic (Replaces the old handleAdd) ---
// We call this function from the form submission events defined below.
// ====================================================================

async function genericAddEditHandler(e) {
    e.preventDefault();
    const form = e.target;
    const type = form.id.split('-')[1]; // e.g., 'event', 'member'
    
    // Check if we are in Edit Mode
    const editId = form.getAttribute('data-edit-id');
    const isEdit = !!editId;

    // Determine endpoint and method
    const endpoint = isEdit ? `${API_URL}/${type}s/${editId}` : `${API_URL}/${type}s`;
    const method = isEdit ? 'PUT' : 'POST';
    const formData = new FormData(form);

    // --- Special handling for non-image POST/PUT requests (Candidates, Announcements, Positions) ---
    // Note: The HTML code only implemented forms for POSTing candidates and announcements, 
    // and PUT logic is only implemented for CRUD entities (Events/Members/Heads/Clubs).
    if (type === 'candidate' || type === 'election-detail' || type === 'announcement') {
        // These posts are handled by separate event listeners in your HTML's script.
        // Returning to avoid duplicate submission here.
        console.warn(`Submission for ${type} is delegated to the HTML script.`);
        return;
    }
    
    try {
        const response = await fetch(endpoint, { method: method, body: formData });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.message || `Failed to ${isEdit ? 'update' : 'add'} ${type}.`);
        }

        alert(`${type} ${isEdit ? 'updated' : 'added'} successfully!`);
        
        // After successful operation, reload the relevant list and dashboard stats.
        // We rely on the global functions defined in adminhandleghymkhana.html
        if (type === 'event' && window.renderEvents) window.showPage('events');
        if (type === 'member' && window.renderMembers) window.showPage('members');
        if (type === 'club' && window.renderClubs) window.showPage('clubs');
        if (type === 'head' && window.renderHeads) window.showPage('heads');
        
        if (window.renderDashboardCounts) window.renderDashboardCounts();
        if (window.resetForm) window.resetForm(type);

    } catch (error) {
        console.error(`Error ${isEdit ? 'updating' : 'adding'} ${type}:`, error);
        alert(`Error ${isEdit ? 'updating' : 'adding'} ${type}: ` + error.message);
    }
}


// ====================================================================
// --- Data Loading Functions (Used by the inline HTML script) ---
// These functions are used by the HTML's global script, but are 
// defined here in the external file.
// ====================================================================

async function loadDashboardStats() {
    try {
        const res = await fetch(`${API_URL}/dashboard-stats`);
        const { success, data } = await res.json();
        if (success) {
            // Note: Relying on the HTML script to read this directly from the global state
            // If the HTML relies on these IDs, they must be set here, but the HTML script's 
            // fetchGeneralData overwrites this file's load functions with its own data handling.
            // Keeping the original implementation for minimal risk.
            document.getElementById('event-count').textContent = data.eventCount || 0;
            document.getElementById('member-count').textContent = data.memberCount || 0;
            document.getElementById('club-count').textContent = data.clubCount || 0;
            document.getElementById('head-count').textContent = data.headCount || 0;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// NOTE: The loadEvents, loadMembers, loadClubs, loadHeads, and loadCandidates 
// functions in the *original* external JS file contain code for rendering the list 
// directly, which conflicts with the HTML's script logic (which fetches data 
// once into global arrays and renders from there). 
// 
// For minimal breaking change, we are removing the body of the redundant load functions
// to ensure the HTML's global script is the source of truth, but we keep the event 
// listeners below and replace handleAdd with the combined Add/Edit handler.


// Keeping the function signatures as placeholders to prevent ReferenceErrors 
// if other parts of the system are expecting them from this file.

async function loadEvents() { /* Logic handled by HTML script */ }
async function loadMembers() { /* Logic handled by HTML script */ }
async function loadClubs() { /* Logic handled by HTML script */ }
async function loadHeads() { /* Logic handled by HTML script */ }
async function loadCandidates() { /* Logic handled by HTML script */ }


async function loadSettings() {
    // This is handled by fetchSettingsData in the HTML script.
    // Keeping the original signature as a placeholder.
    try {
        const res = await fetch(`${API_URL}/settings`);
        const { success, data } = await res.json();
        if (success && data) {
            // This logic is mostly redundant with the HTML's script, 
            // but we keep the signature for safety.
            if(data.about_us_text) { 
                document.getElementById('settings-about-text').value = data.about_us_text;
            }
            // ... (other settings fields logic)
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}


// ====================================================================
// --- Event Listeners and Setup (FIXED) ---
// We replace the old handleAdd listener with the new combined handler.
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Show dashboard on load
    // Note: showPage is called by the HTML script's DOMContentLoaded, 
    // so this is redundant but harmless.
    // showPage('dashboard');
    
    // --- Load Data Functions (Called by HTML script, but keeping signatures safe) ---
    if (window.loadDashboardStats) window.loadDashboardStats();
    if (window.loadSettings) window.loadSettings();

    // --- ADD/EDIT LISTENERS (FIXED) ---
    // We replace the call to the non-existent 'handleAdd' with the new combined handler.
    document.getElementById('add-event-form').addEventListener('submit', genericAddEditHandler);
    document.getElementById('add-member-form').addEventListener('submit', genericAddEditHandler);
    document.getElementById('add-club-form').addEventListener('submit', genericAddEditHandler);
    document.getElementById('add-head-form').addEventListener('submit', genericAddEditHandler);
    
    // NOTE: Candidates form logic must remain delegated to the HTML script,
    // as it involves refreshing multiple components specific to the election tab.
    // document.getElementById('add-candidate-form').addEventListener('submit', genericAddEditHandler);


    // --- SETTINGS LISTENERS (Unchanged, as logic is complex/specific) ---
    // Assuming these settings forms are handled by the HTML script functions now.
    // document.getElementById('settings-about-form').addEventListener('submit', saveAboutSettings);
    // document.getElementById('settings-election-form').addEventListener('submit', saveElectionSettings);

    // --- DELETE LISTENERS (Handled by the HTML script now via window.deleteItem) ---
});


// Exporting the necessary functions used by the HTML script's EventListeners
if (typeof module !== 'undefined' && module.exports) {
    // Placeholder to satisfy environments that expect exports
    module.exports = {
        loadDashboardStats,
        loadEvents,
        loadMembers,
        loadClubs,
        loadHeads,
        loadCandidates,
        loadSettings,
        genericAddEditHandler // Optionally export if you need to access it manually
    };
}