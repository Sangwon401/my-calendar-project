document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.getElementById('calendar');
    const tasksPopup = document.getElementById('task-popup');
    const closeBtn = document.querySelector('.close-btn');
    const taskTextInput = document.getElementById('task-text');
    const taskPersonSelect = document.getElementById('task-person');
    const addTaskBtn = document.getElementById('add-task');
    const tasksList = document.getElementById('tasks-list');
    const priorityTable = document.getElementById('priority-table');
    const addPriorityBtn = document.getElementById('add-priority');
    const priorityInput = document.getElementById('priority-text');
    const toast = document.getElementById('toast');
    const maxTaskLength = 30; // 최대 문자 수
    let tasks = {};
    let priority = {};
    let selectedDate = '';
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    function createCalendar(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        calendar.innerHTML = '';

        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        dayNames.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            calendar.appendChild(dayDiv);
        });

        for (let i = 0; i < firstDay; i++) {
            calendar.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= lastDate; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            dayDiv.dataset.date = `${year}-${month + 1}-${day}`;

            if (new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6) {
                dayDiv.classList.add('saturday');
            }

            if (tasks[`${year}-${month + 1}-${day}`]) {
                const badge = document.createElement('span');
                badge.className = 'task-badge';
                badge.textContent = '★';
                dayDiv.appendChild(badge);
            }

            dayDiv.addEventListener('click', function() {
                selectedDate = dayDiv.dataset.date;
                displayTasksPopup(selectedDate);
            });

            calendar.appendChild(dayDiv);
        }

        const header = document.querySelector('.header');
        header.querySelector('.month-name').textContent = `${monthNames[month]} ${year}`;
    }

    function displayTasksPopup(date) {
        tasksPopup.style.display = 'flex';
        const taskListHTML = Object.keys(tasks[date] || {}).map(person => 
            `<div class="task-section">
                <div class="task-person">${person} 일정</div>
                <ul class="task-list">
                    ${tasks[date][person].map((task, index) => `
                        <li>
                            <span class="task-description">${task.text}</span>
                            <span class="delete-btn" onclick="deleteTask('${date}', '${person}', ${index})">X</span>
                        </li>
                    `).join('')}
                </ul>
            </div>`
        ).join('');
        tasksPopup.querySelector('#tasks-list').innerHTML = taskListHTML;
    }    

    window.deleteTask = function(date, person, index) {
        tasks[date][person].splice(index, 1);
        if (tasks[date][person].length === 0) {
            delete tasks[date][person];
            if (Object.keys(tasks[date]).length === 0) {
                delete tasks[date];
            }
        }
        displayTasksPopup(date);
        saveData();
    }
    
    function addTask() {
        const person = taskPersonSelect.value;
        const text = taskTextInput.value.trim();
        
        if (text.length === 0) {
            showToast('내용을 추가해주세요');
            return;
        }

        if (text.length > maxTaskLength) {
            showToast('입력은 30글자를 넘을 수 없습니다.');
            return;
        }
    
        if (!tasks[selectedDate]) tasks[selectedDate] = {};
        if (!tasks[selectedDate][person]) tasks[selectedDate][person] = [];
        tasks[selectedDate][person].push({ text, completed: false });
    
        updateTaskBadge(selectedDate); // 현재 날짜에 별표 뱃지 추가
        displayTasksPopup(selectedDate); // 팝업 업데이트
        taskTextInput.value = ''; // 텍스트 필드 비우기
        saveData();
    }
    
    window.addTask = addTask;

    function updateTaskBadge(date) {
        const dayDivs = calendar.querySelectorAll(`[data-date="${date}"]`);
        dayDivs.forEach(dayDiv => {
            // 기존의 동그라미 제거
            const existingBadge = dayDiv.querySelector('.task-badge');
            if (existingBadge) {
                dayDiv.removeChild(existingBadge);
            }
            // 새로운 동그라미 추가
            const newBadge = document.createElement('span');
            newBadge.className = 'task-badge';
            newBadge.textContent = '★';
            dayDiv.appendChild(newBadge);
        });
    }    

    function addPriority() {
        const text = priorityInput.value.trim();
        if (text.length === 0) {
            showToast('내용을 추가해주세요');
            return;
        }
        if (text.length > maxTaskLength) {
            showToast('입력은 30글자를 넘을 수 없습니다.');
            return;
        }
        if (!priority[currentMonth + 1]) priority[currentMonth + 1] = [];
        priority[currentMonth + 1].push({ text, completed: false });
        priorityInput.value = '';
        updatePriorityTable();
        saveData();
    }

    window.addPriority = addPriority;

    function updatePriorityTable() {
        let html = `
            <thead>
                <tr>
                    <th>우선순위</th>
                    <th>내용</th>
                    <th>완료</th>
                    <th>삭제</th>
                </tr>
            </thead>
            <tbody>
                ${priority[currentMonth + 1].map((item, index) => `
                    <tr draggable="true" ondragstart="drag(event)" ondragover="allowDrop(event)" ondrop="drop(event)">
                        <td class="priority-number">${index + 1}</td>
                        <td class="priority-description ${item.completed ? 'completed' : ''}">${item.text}</td>
                        <td class="priority-checkbox"><input type="checkbox" ${item.completed ? 'checked' : ''} onclick="togglePriorityCompletion(${index})"></td>
                        <td class="delete-btn" onclick="deletePriority(${index})">X</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        priorityTable.innerHTML = html;
    }

    window.deletePriority = function(index) {
        priority[currentMonth + 1].splice(index, 1);
        updatePriorityTable();
        saveData();
    }

    window.togglePriorityCompletion = function(index) {
        const item = priority[currentMonth + 1][index];
        item.completed = !item.completed;
        updatePriorityTable();
        saveData();
    }
    
    function showToast(message) {
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    function saveData() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('priority', JSON.stringify(priority));
    }

    function loadData() {
        tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        priority = JSON.parse(localStorage.getItem('priority')) || {};
        updatePriorityTable();
        createCalendar(currentMonth, currentYear);
    }

    function drag(ev) {
        ev.dataTransfer.setData('text/plain', ev.target.rowIndex);
    }

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drop(ev) {
        ev.preventDefault();
        const fromIndex = ev.dataTransfer.getData('text/plain');
        const toIndex = ev.target.closest('tr').rowIndex - 1;
        if (fromIndex !== toIndex) {
            const item = priority[currentMonth + 1].splice(fromIndex, 1)[0];
            priority[currentMonth + 1].splice(toIndex, 0, item);
            updatePriorityTable();
            saveData();
        }
    }

    document.getElementById('prev-month').addEventListener('click', function() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        createCalendar(currentMonth, currentYear);
    });

    document.getElementById('next-month').addEventListener('click', function() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        createCalendar(currentMonth, currentYear);
    });

    closeBtn.addEventListener('click', function() {
        tasksPopup.style.display = 'none';
    });

    addTaskBtn.addEventListener('click', addTask);

    addPriorityBtn.addEventListener('click', addPriority);

    loadData();
});
