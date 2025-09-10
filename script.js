// Supabase
const supabaseUrl = 'https://qwdyfqahcqncseznxzgz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZHlmcWFoY3FuY3Nlem54emd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTM2NzMsImV4cCI6MjA3MzA2OTY3M30.0-jdmjcWXa5huqv-Wl0oTSCAtX-q0ZWIMJhOL9OX-bk';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// ------------------ Видео ------------------
async function loadVideos(searchTerm = '') {
    const container = document.getElementById('videosContainer');
    if (!container) return;

    let { data: videos } = await supabase
        .from('videos')
        .select('*')
        .ilike('title', `%${searchTerm}%`);

    container.innerHTML = '';
    if (!videos) return;

    videos.forEach(v => {
        const div = document.createElement('div');
        div.className = 'videoCard';
        div.innerHTML = `<img src="${v.thumbnail}" class="videoThumb"><h3>${v.title}</h3>`;
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

window.onload = () => loadVideos();

// ------------------ Auth ------------------
async function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const username = document.getElementById('registerUsername').value;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if(error){ alert(error.message); return; }

    await supabase.from('users').insert([{ id: data.user.id, username, email }]);
    alert('Registered! Please login.');
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error){ alert(error.message); return; }

    alert('Logged in!');
    window.location.href = 'profile.html';
}

// ------------------ Profile ------------------
async function loadProfile() {
    const user = supabase.auth.getUser().then(res => res.data.user);
    if(!user) return;

    document.getElementById('username').innerText = user.username || 'No username';
    document.getElementById('email').innerText = user.email;

    const { data: videos } = await supabase.from('videos').select('*').eq('user_id', user.id);
    const container = document.getElementById('myVideos');
    if(!container) return;

    container.innerHTML = '';
    videos.forEach(v => {
        const div = document.createElement('div');
        div.className = 'videoCard';
        div.innerHTML = `<img src="${v.thumbnail}" class="videoThumb"><h3>${v.title}</h3>`;
        container.appendChild(div);
    });
}

window.onload = () => {
    loadVideos();
    loadProfile();
};
