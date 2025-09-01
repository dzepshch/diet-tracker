let currentUser = null;

function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username && password) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            alert('Пользователь уже существует!');
            return;
        }
        users[username] = { password, profile: null, logs: { calories: 0, water: 0 } };
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
    currentUser = null;
    document.getElementById('main-section').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function calculateCalories(weight, height, age, gender, goal) {
    // Формула Миффлина-Сан Жеора для базового метаболизма
    let bmr = gender === 'male' 
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    
    // Умножаем на коэффициент активности (предполагаем среднюю активность 1.4)
    bmr *= 1.4;
    
    // Корректировка в зависимости от цели
    if (goal === 'lose') return Math.round(bmr * 0.85); // 15% дефицит
    if (goal === 'gain') return Math.round(bmr * 1.15); // 15% профицит
    return Math.round(bmr); // Поддержание
}

function calculateWater(weight) {
    // 30 мл воды на кг веса, переводим в стаканы (250 мл)
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
    const logs = users[currentUser].logs;

    const calories = calculateCalories(profile.weight, profile.height, profile.age, profile.gender, profile.goal);
    const water = calculateWater(profile.weight);

    document.getElementById('calories').textContent = calories;
    document.getElementById('water').textContent = water;
    document.getElementById('total-calories').textContent = logs.calories || 0;
    document.getElementById('total-water').textContent = logs.water || 0;
}

function logCalories() {
    const calories = parseInt(document.getElementById('calories-consumed').value);
    if (calories >= 0) {
        const users = JSON.parse(localStorage.getItem('users'));
        users[currentUser].logs.calories = (users[currentUser].logs.calories || 0) + calories;
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
        users[currentUser].logs.water = (users[currentUser].logs.water || 0) + water;
        localStorage.setItem('users', JSON.stringify(users));
        updateDashboard();
        document.getElementById('water-consumed').value = '';
    } else {
        alert('Введите корректное количество воды!');
    }
}