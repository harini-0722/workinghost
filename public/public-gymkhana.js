// This is the content for: public/public-gymkhana.js
const API_URL = '/api/gymkhana'; // Use relative path

document.addEventListener('DOMContentLoaded', () => {
    loadPublicData();
});

async function loadPublicData() {
    try {
        const res = await fetch(`${API_URL}/public-data`);
        const { success, data } = await res.json();
        if (!success) {
            console.error("Failed to load public data");
            return;
        }

        // Populate all sections
        populateHomeMembers(data.members);
        populateAboutUs(data.settings?.aboutUs);
        populateClubs(data.clubs);
        populateHeads(data.heads);
        populateEvents(data.events);
        populateElections(data.candidates, data.settings?.electionDates);

    } catch (error) {
        console.error('Error loading public data:', error);
    }
}

function populateHomeMembers(members) {
    const grid = document.getElementById('home-members-grid');
    if (!grid) return;
    grid.innerHTML = ''; // Clear
    members.forEach(m => {
        grid.innerHTML += `
            <div class="flex flex-col items-center text-center bg-white rounded-2xl shadow-xl p-8 card-hover">
                <img class="w-36 h-36 rounded-full object-cover ring-4 ring-blue-200" src="${m.imageUrl}" alt="${m.name}">
                <h3 class="mt-6 text-xl font-bold text-gray-900">${m.name}</h3>
                <p class="text-base font-medium text-blue-600">${m.position}</p>
                <p class="text-sm text-gray-500">${m.description}</p>
            </div>`;
    });
}

function populateAboutUs(aboutText) {
    const el = document.getElementById('home-about-text');
    if (!el) return;
    if (aboutText) {
        // Format text from database (respecting newlines)
        el.innerHTML = aboutText.split('\n').map(p => `<p>${p}</p>`).join('');
    } else {
        el.innerHTML = '<p>About text has not been set by the admin.</p>';
    }
}

function populateClubs(clubs) {
    const grids = {
        scitech: document.getElementById('tech-clubs-grid'),
        cultural: document.getElementById('cultural-clubs-grid'),
        sports: document.getElementById('sports-clubs-grid'),
        academic: document.getElementById('academic-clubs-grid'),
    };

    // Define colors for each council
    const councilColors = {
        scitech: 'text-indigo-600',
        cultural: 'text-rose-600',
        sports: 'text-green-600',
        academic: 'text-amber-600'
    };

    // Clear all grids
    Object.values(grids).forEach(g => { if(g) g.innerHTML = ''; });

    clubs.forEach(c => {
        const grid = grids[c.council];
        const color = councilColors[c.council] || 'text-gray-600';
        if (grid) {
            grid.innerHTML += `
                <div class="flex flex-col items-center p-6 bg-gray-100 rounded-2xl shadow-lg card-hover">
                    <i class="${c.icon} fa-4x ${color}"></i>
                    <h4 class="mt-5 text-xl font-bold text-gray-900 text-center">${c.name}</h4>
                </div>`;
        }
    });
}

function populateHeads(heads) {
    const grids = {
        scitech: document.getElementById('tech-heads-grid'),
        cultural: document.getElementById('cultural-heads-grid'),
        sports: document.getElementById('sports-heads-grid'),
        academic: document.getElementById('academic-heads-grid'),
    };
    
    // Define colors for each council
    const councilColors = {
        scitech: { ring: 'ring-indigo-200', text: 'text-indigo-600' },
        cultural: { ring: 'ring-rose-200', text: 'text-rose-600' },
        sports: { ring: 'ring-green-200', text: 'text-green-600' },
        academic: { ring: 'ring-amber-200', text: 'text-amber-600' }
    };

    // Clear all grids
    Object.values(grids).forEach(g => { if(g) g.innerHTML = ''; });

    heads.forEach(h => {
        const grid = grids[h.council];
        const colors = councilColors[h.council] || { ring: 'ring-gray-200', text: 'text-gray-600' };
        if (grid) {
            grid.innerHTML += `
                <div class="flex flex-col items-center text-center bg-white rounded-2xl shadow-xl p-8 card-hover">
                    <img class="w-40 h-40 rounded-full object-cover ring-4 ${colors.ring}" src="${h.imageUrl}" alt="${h.name}">
                    <h3 class="mt-6 text-2xl font-bold text-gray-900">${h.name}</h3>
                    <p class="text-lg font-medium ${colors.text}">${h.position}</p>
                </div>`;
        }
    });
}

function populateEvents(events) {
    const grid = document.getElementById('events-grid');
    if (!grid) return;
    grid.innerHTML = ''; // Clear
    events.forEach(e => {
        grid.innerHTML += `
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden card-hover">
                <img class="h-64 w-full object-cover" src="${e.imageUrl}" alt="${e.name}">
                <div class="p-8">
                    <p class="text-sm font-semibold text-indigo-600 uppercase">${e.dateTag}</p>
                    <h3 class="mt-2 text-2xl font-bold text-gray-900">${e.name}</h3>
                    <p class="mt-3 text-gray-500">${e.description}</p>
                </div>
            </div>`;
    });
}

function populateElections(candidates, dates) {
    const datesList = document.getElementById('election-dates-list');
    const candidatesList = document.getElementById('candidates-list');
    if (!datesList || !candidatesList) return;

    // Populate Dates
    datesList.innerHTML = '';
    if (dates) {
        datesList.innerHTML = `
            ${dates.d1_title ? `<li class="flex items-start"><i class="fas fa-check-circle text-indigo-500 mt-1.5 mr-3"></i><div><p class="font-semibold text-gray-900">${dates.d1_title}</p><p class="text-gray-600">${dates.d1_date}</p></div></li>` : ''}
            ${dates.d2_title ? `<li class="flex items-start"><i class="fas fa-check-circle text-indigo-500 mt-1.5 mr-3"></i><div><p class="font-semibold text-gray-900">${dates.d2_title}</p><p class="text-gray-600">${dates.d2_date}</p></div></li>` : ''}
            ${dates.d3_title ? `<li class="flex items-start"><i class="fas fa-vote-yea text-indigo-500 mt-1.5 mr-3"></i><div><p class="font-semibold text-gray-900">${dates.d3_title}</p><p class="text-gray-600">${dates.d3_date}</p></div></li>` : ''}
            ${dates.d4_title ? `<li class="flex items-start"><i class="fas fa-trophy text-indigo-500 mt-1.5 mr-3"></i><div><p class="font-semibold text-gray-900">${dates.d4_title}</p><p class="text-gray-600">${dates.d4_date}</p></div></li>` : ''}
        `;
    }

    // Group candidates by position
    const positions = {};
    candidates.forEach(c => {
        if (!positions[c.position]) {
            positions[c.position] = [];
        }
        positions[c.position].push(c);
    });

    // Populate Candidates
    candidatesList.innerHTML = '';
    for (const positionName in positions) {
        let candidatesHTML = '';
        positions[positionName].forEach(c => {
            candidatesHTML += `
                <div class="bg-white p-6 rounded-2xl shadow-xl flex items-center space-x-6 card-hover">
                    <img class="w-20 h-20 rounded-full object-cover" src="${c.imageUrl}" alt="${c.name}">
                    <div>
                        <h4 class="text-xl font-bold text-gray-900">${c.name}</h4>
                        <p class="text-gray-500">${c.description}</p>
                    </div>
                </div>`;
        });

        candidatesList.innerHTML += `
            <div>
                <h3 class="text-2xl font-bold text-gray-800 border-b-2 border-indigo-200 pb-2">${positionName}</h3>
                <div class="space-y-6 mt-6">${candidatesHTML}</div>
            </div>`;
    }
}