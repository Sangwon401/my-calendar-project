document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.getElementById('calendar');
    const tasksPopup = document.getElementById('tasks-popup');
    const closeBtn = document.querySelector('.close-btn');
    const taskTextInput = document.getElementById('task-text');
    const taskPersonSelect = document.getElementById('task-person');
    const addTaskBtn = document.getElementById('add-task');
    const tasksList = document.getElementById('tasks-list');
    
    let tasks = {};
    let selectedDate = '';

    function createCalendar(date) {
        const month = date.getMonth();
        const year = date.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        calendar.innerHTML = '';
        
        // Header with day names
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        dayNames.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            calendar.appendChild(dayDiv);
        });
        
        // Fill in empty days
        for (let i = 0; i < firstDay; i++) {
            calendar.appendChild(document.createElement('div'));
        }
        
        // Fill in days
        for (let day = 1; day <= lastDate; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            dayDiv.dataset.date = `${year}-${month + 1}-${day}`;
            
            if (new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6) {
                dayDiv.classList.add('saturday');
            }
            
            // Check for holidays (for simplicity, hardcoded examples)
            const holidays = [
                { month: 1, day: 1 }, // New Year's Day
                { month: 5, day: 5 }, // Children's Day
                { month: 8, day: 15 }, // Liberation Day
                // Add more holidays as needed
            ];
            if (holidays.some(holiday => holiday.month === month + 1 && holiday.day === day)) {
                dayDiv.classList.add('holiday');
            }

            // Add task badge if there are tasks for this date
            if (tasks[`${year}-${month + 1}-${day}`]) {
                const badge = document.createElement('span');
                badge.className = 'task-badge';
                dayDiv.appendChild(badge);
            }
            
            dayDiv.addEventListener('click', function() {
                selectedDate = dayDiv.dataset.date;
                displayTasksPopup(selectedDate);
            });
            
            calendar.appendChild(dayDiv);
        }
    }

    function displayTasksPopup(date) {
        tasksPopup.style.display = 'flex';
        const taskListHTML = Object.keys(tasks[date] || {})
            .sort((a, b) => {
                if (a === '은지&상원') return -1;
                if (b === '은지&상원') return 1;
                if (a === '은지') return -1;
                if (b === '은지') return 1;
                return a.localeCompare(b);
            })
            .map(person => 
                `<div class="task-section">
                    <div class="task-person">${person}</div>
                    <ul class="task-list">
                        ${tasks[date][person].map(task => 
                            `<li>
                                <span class="task-description">${task.description}</span>
                                <span class="delete-btn" onclick="deleteTask('${date}', '${task.description}', '${person}')">x</span>
                            </li>`
                        ).join('')}
                    </ul>
                </div>`
            )
            .join('');
        
        tasksList.innerHTML = taskListHTML;
    }

    function addTask(date, description, person) {
        if (!tasks[date]) {
            tasks[date] = {};
        }
        if (!tasks[date][person]) {
            tasks[date][person] = [];
        }
        tasks[date][person].push({ description });
        createCalendar(new Date(date));
        displayTasksPopup(date); // Keep the popup open
    }

    window.deleteTask = function(date, description, person) {
        if (tasks[date] && tasks[date][person]) {
            tasks[date][person] = tasks[date][person].filter(task => task.description !== description);
            if (tasks[date][person].length === 0) {
                delete tasks[date][person];
            }
            if (Object.keys(tasks[date]).length === 0) {
                delete tasks[date];
            }
            createCalendar(new Date(date));
            displayTasksPopup(date);
        }
    }

    closeBtn.addEventListener('click', function() {
        tasksPopup.style.display = 'none';
    });

    addTaskBtn.addEventListener('click', function() {
        const description = taskTextInput.value;
        const person = taskPersonSelect.value;
        if (description && person) {
            addTask(selectedDate, description, person);
            taskTextInput.value = '';
            taskPersonSelect.value = '';
            // Keep the popup open
        }
    });

    const today = new Date();
    createCalendar(today);
});
