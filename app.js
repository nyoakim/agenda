document.addEventListener('DOMContentLoaded', () => {
    // State
    let state = {
        title: "Weekly Agenda",
        date: new Date().toISOString().split('T')[0],
        topics: [
            {
                id: crypto.randomUUID(),
                title: "Project Updates",
                completed: false,
                comment: "",
                subtopics: [
                    { id: crypto.randomUUID(), title: "Frontend Status", completed: false },
                    { id: crypto.randomUUID(), title: "Backend API", completed: false }
                ]
            }
        ]
    };

    // DOM Elements
    const titleInput = document.getElementById('meetingTitle');
    const dateInput = document.getElementById('meetingDate');
    const agendaContainer = document.getElementById('agendaContainer');
    const addTopicBtn = document.getElementById('addTopicBtn');
    const saveJsonBtn = document.getElementById('saveJsonBtn');
    const loadJsonInput = document.getElementById('loadJsonInput');
    const exportPdfBtn = document.getElementById('exportPdfBtn');

    // Initialization
    loadState();
    render();

    // Event Listeners
    titleInput.addEventListener('input', (e) => {
        state.title = e.target.value;
        saveState();
    });

    dateInput.addEventListener('change', (e) => {
        state.date = e.target.value;
        saveState();
    });

    addTopicBtn.addEventListener('click', () => {
        state.topics.push({
            id: crypto.randomUUID(),
            title: "",
            completed: false,
            comment: "",
            subtopics: []
        });
        saveState();
        render();
    });

    saveJsonBtn.addEventListener('click', downloadState);

    loadJsonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                state = JSON.parse(event.target.result);
                saveState();
                render();
            } catch (err) {
                alert("Invalid file format");
            }
        };
        reader.readAsText(file);
    });

    exportPdfBtn.addEventListener('click', () => {
        window.print();
    });

    // Core Functions
    function saveState() {
        localStorage.setItem('meetingManagerData', JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem('meetingManagerData');
        if (saved) {
            state = JSON.parse(saved);
        }
        titleInput.value = state.title;
        dateInput.value = state.date;
    }

    function downloadState() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `meeting-${state.date}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function render() {
        agendaContainer.innerHTML = '';
        state.topics.forEach((topic, index) => {
            const card = createTopicCard(topic, index);
            agendaContainer.appendChild(card);
        });
    }

    function createTopicCard(topic, index) {
        const card = document.createElement('div');
        card.className = `topic-card ${topic.completed ? 'topic-completed' : ''}`;

        card.innerHTML = `
            <div class="topic-header">
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="status-checkbox" ${topic.completed ? 'checked' : ''}>
                </div>
                <div class="topic-content">
                    <input type="text" class="topic-input" placeholder="Topic Title" value="${topic.title}">
                    <textarea class="comment-area" placeholder="Add notes or minutes here...">${topic.comment}</textarea>
                    
                    <div class="subtopics-list"></div>
                    <button class="add-subtopic-btn no-print">+ Add Sub-item</button>
                </div>
                <button class="btn-icon no-print delete-topic-btn" title="Remove Topic">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        // Event Bindings
        const checkbox = card.querySelector('.status-checkbox');
        const titleInp = card.querySelector('.topic-input');
        const commentArea = card.querySelector('.comment-area');
        const deleteBtn = card.querySelector('.delete-topic-btn');
        const addSubBtn = card.querySelector('.add-subtopic-btn');
        const subList = card.querySelector('.subtopics-list');

        checkbox.addEventListener('change', () => {
            topic.completed = checkbox.checked;
            card.classList.toggle('topic-completed', topic.completed);
            saveState();
        });

        titleInp.addEventListener('input', (e) => {
            topic.title = e.target.value;
            saveState();
        });

        commentArea.addEventListener('input', (e) => {
            topic.comment = e.target.value;
            saveState();
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm('Delete this topic?')) {
                state.topics.splice(index, 1);
                saveState();
                render();
            }
        });

        addSubBtn.addEventListener('click', () => {
            topic.subtopics.push({ id: crypto.randomUUID(), title: "", completed: false });
            saveState();
            render(); // Re-render is easiest for subtopics
        });

        // Render Subtopics
        topic.subtopics.forEach((sub, subIndex) => {
            const subItem = document.createElement('div');
            subItem.className = `subtopic-item ${sub.completed ? 'subtopic-completed' : ''}`;
            subItem.innerHTML = `
                <input type="checkbox" class="status-checkbox" ${sub.completed ? 'checked' : ''}>
                <input type="text" class="subtopic-input" placeholder="Sub-item" value="${sub.title}">
                <div class="subtopic-actions no-print">
                    <button class="btn-icon delete-sub-btn"><i class="fa-solid fa-times"></i></button>
                </div>
            `;

            const subCheck = subItem.querySelector('.status-checkbox');
            const subInp = subItem.querySelector('.subtopic-input');
            const subDel = subItem.querySelector('.delete-sub-btn');

            subCheck.addEventListener('change', () => {
                sub.completed = subCheck.checked;
                subItem.classList.toggle('subtopic-completed', sub.completed);
                saveState();
            });

            subInp.addEventListener('input', (e) => {
                sub.title = e.target.value;
                saveState();
            });

            subDel.addEventListener('click', () => {
                topic.subtopics.splice(subIndex, 1);
                saveState();
                render();
            });

            subList.appendChild(subItem);
        });

        return card;
    }
});

