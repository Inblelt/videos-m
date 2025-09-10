// ------------------ Supabase ------------------
const supabaseUrl = 'https://qwdyfqahcqncseznxzgz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZHlmcWFoY3FuY3Nlem54emd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTM2NzMsImV4cCI6MjA3MzA2OTY3M30.0-jdmjcWXa5huqv-Wl0oTSCAtX-q0ZWIMJhOL9OX-bk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ------------------ Загрузка видео ------------------
async function loadVideos(searchTerm = '') {
    const container = document.getElementById('videosContainer');
    if (!container) return;

    let { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .ilike('title', `%${searchTerm}%`);

    container.innerHTML = '';
    if (!videos) return;

    videos.forEach(v => {
        const div = document.createElement('div');
        div.className = 'videoCard';
        div.innerHTML = `
            <img src="${v.thumbnail}" class="videoThumb">
            <h3>${v.title}</h3>
            <p>${v.description || ''}</p>
        `;
        container.appendChild(div);
    });
}

const searchBtn = document.getElementById('searchBtn');
if(searchBtn) {
    searchBtn.addEventListener('click', () => {
        const term = document.getElementById('searchBar').value;
        loadVideos(term);
    });
}

// Загружаем видео при старте
window.addEventListener('load', () => loadVideos());

// ------------------ Регистрация ------------------
async function register() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !email || !password) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    // Создаем пользователя через Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { username: username }
        }
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert('Регистрация успешна! Проверьте почту для подтверждения.');
}

// ------------------ Вход ------------------
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert('Вы успешно вошли!');
    window.location.href = 'profile.html';
}

// ------------------ Профиль пользователя ------------------
async function loadProfile() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        alert('Пожалуйста, войдите в аккаунт.');
        window.location.href = 'auth.html';
        return;
    }

    // Отображаем данные пользователя
    const usernameElem = document.getElementById('username');
    const emailElem = document.getElementById('email');
    if(usernameElem) usernameElem.innerText = user.user_metadata?.username || 'Username';
    if(emailElem) emailElem.innerText = user.email;

    // Загружаем видео пользователя на profile.html
    const { data: videos } = await supabase.from('videos').select('*').eq('user_id', user.id);
    const container = document.getElementById('myVideos');
    if(container) {
        container.innerHTML = '';
        if(videos) {
            videos.forEach(v => {
                const div = document.createElement('div');
                div.className = 'videoCard';
                div.innerHTML = `
                    <img src="${v.thumbnail}" class="videoThumb">
                    <h3>${v.title}</h3>
                `;
                container.appendChild(div);
            });
        }
    }
}

// ------------------ Загрузка видео ------------------
async function uploadVideo() {
    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;
    const url = document.getElementById('videoURL').value;
    const thumbnail = document.getElementById('videoThumbnail').value;

    if (!title || !url) {
        alert('Пожалуйста, заполните хотя бы название и URL видео.');
        return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if(userError || !user) {
        alert('Пожалуйста, войдите в аккаунт.');
        window.location.href = 'auth.html';
        return;
    }

    const { error } = await supabase.from('videos').insert([{
        title,
        description,
        url,
        thumbnail,
        user_id: user.id
    }]);

    if(error) {
        alert(error.message);
        return;
    }

    alert('Видео успешно загружено!');
    window.location.href = 'index.html';
}

// ------------------ Инициализация на profile.html ------------------
window.addEventListener('load', () => {
    if(document.getElementById('profileContainer')) {
        loadProfile();
    }
});
