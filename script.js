let currentUser = null;
let caloriesChart = null;
let waterChart = null;

function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username && password) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            alert('Пользователь уже существует!');
            return;
        }
        users[username] = { password, profile: null, dailyLogs: {} };
        localStorage.setItem('users', JSON.stringify(users));
        alert('Регистрация успешна! Пожалуйста, войдите.');
        showLogin();
    } else {
        alert('Заполните все поля!');
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username] && users[username].password === password) {
        currentUser = username;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-section').style.display = 'block';
        loadProfile();
    } else {
        alert('Неверное имя пользователя или пароль!');
    }
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function logout() {
    if (caloriesChart) caloriesChart.destroy();
    if (waterChart) waterChart.destroy();
    currentUser = null;
    document.getElementById('main-section').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function calculateCalories(weight, height, age, gender, goal) {
    let bmr = gender === 'male' 
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    bmr *= 1.4;
    if (goal === 'lose') return Math.round(bmr * 0.85);
    if (goal === 'gain') return Math.round(bmr * 1.15);
    return Math.round(bmr);
}

function calculateWater(weight) {
    return Math.round((weight * 30) / 250);
}

function saveProfile() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const goal = document.getElementById('goal').value;

    if (weight && height && age && gender && goal) {
        const users = JSON.parse(localStorage.getItem('users'));
        users[currentUser].profile = { weight, height, age, gender, goal };
        localStorage.setItem('users', JSON.stringify(users));
        document.getElementById('profile-form').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        updateDashboard();
    } else {
        alert('Заполните все поля!');
    }
}

function loadProfile() {
    const users = JSON.parse(localStorage.getItem('users'));
    if (users[currentUser].profile) {
        document.getElementById('profile-form').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        updateDashboard();
    } else {
        document.getElementById('profile-form').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
}

function updateDashboard() {
    const users = JSON.parse(localStorage.getItem('users'));
    const profile = users[currentUser].profile;
    const dailyLogs = users[currentUser].dailyLogs;
    const today = getCurrentDate();
    if (!dailyLogs[today]) {
        dailyLogs[today] = { calories: 0, water: 0 };
    }
    const todayLog = dailyLogs[today];

    const recCalories = calculateCalories(profile.weight, profile.height, profile.age, profile.gender, profile.goal);
    const recWater = calculateWater(profile.weight);

    document.getElementById('calories').textContent = recCalories;
    document.getElementById('water').textContent = recWater;

    const calPercent = Math.min((todayLog.calories / recCalories) * 100, 100);
    document.getElementById('calories-progress').style.width = `${calPercent}%`;
    document.getElementById('calories-text').textContent = `Съедено сегодня: ${todayLog.calories} / ${recCalories} ккал (${Math.round(calPercent)}%)`;

    const waterPercent = Math.min((todayLog.water / recWater) * 100, 100);
    document.getElementById('water-progress').style.width = `${waterPercent}%`;
    document.getElementById('water-text').textContent = `Выпито сегодня: ${todayLog.water} / ${recWater} стаканов (${Math.round(waterPercent)}%)`;

    updateCharts(dailyLogs, recCalories, recWater);
}

function logCalories() {
    const calories = parseInt(document.getElementById('calories-consumed').value);
    if (calories >= 0) {
        const users = JSON.parse(localStorage.getItem('users'));
        const today = getCurrentDate();
        if (!users[currentUser].dailyLogs[today]) {
            users[currentUser].dailyLogs[today] = { calories: 0, water: 0 };
        }
        users[currentUser].dailyLogs[today].calories += calories;
        localStorage.setItem('users', JSON.stringify(users));
        updateDashboard();
        document.getElementById('calories-consumed').value = '';
    } else {
        alert('Введите корректное количество калорий!');
    }
}

function logWater() {
    const water = parseInt(document.getElementById('water-consumed').value);
    if (water >= 0) {
        const users = JSON.parse(localStorage.getItem('users'));
        const today = getCurrentDate();
        if (!users[currentUser].dailyLogs[today]) {
            users[currentUser].dailyLogs[today] = { calories: 0, water: 0 };
        }
        users[currentUser].dailyLogs[today].water += water;
        localStorage.setItem('users', JSON.stringify(users));
        updateDashboard();
        document.getElementById('water-consumed').value = '';
    } else {
        alert('Введите корректное количество воды!');
    }
}

function updateCharts(dailyLogs, recCalories, recWater) {
    const dates = [];
    const calData = [];
    const waterData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        calData.push(dailyLogs[dateStr] ? dailyLogs[dateStr].calories : 0);
        waterData.push(dailyLogs[dateStr] ? dailyLogs[dateStr].water : 0);
    }

    if (caloriesChart) caloriesChart.destroy();
    caloriesChart = new Chart(document.getElementById('calories-chart'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Калории',
                data: calData,
                borderColor: '#4CAF50',
                fill: false
            }, {
                label: 'Рекомендуемые',
                data: Array(7).fill(recCalories),
                borderColor: '#FF6384',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    if (waterChart) waterChart.destroy();
    waterChart = new Chart(document.getElementById('water-chart'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Вода (стаканы)',
                data: waterData,
                borderColor: '#2196F3',
                fill: false
            }, {
                label: 'Рекомендуемые',
                data: Array(7).fill(recWater),
                borderColor: '#FF6384',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
