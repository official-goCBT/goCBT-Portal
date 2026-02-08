/* --- DATABASES --- */
const studentDB = [
    { regNo: "2024/CS/001", pin: "1111", name: "Adebayo Samuel", dept: "CS" },
    { regNo: "2024/LAW/010", pin: "1010", name: "Ibrahim Bello", dept: "LAW" }
];
const facilitatorDB = [{ id: "admin@gocbt.com", pin: "admin123", name: "Dr. Adeyemi" }];

/* --- PWA & NOTIFICATIONS --- */
let deferredPrompt;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => console.log("PWA Ready"));
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBanner').classList.remove('hidden');
});

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        document.getElementById('installBanner').classList.add('hidden');
    }
}

/* --- UI ACTIONS --- */
function switchForm(role) {
    const title = document.getElementById('formTitle');
    const idLabel = document.getElementById('idLabel');
    const authFooter = document.getElementById('authFooter');
    
    if (role === 'facilitator') {
        title.innerText = "Facilitator Access";
        idLabel.innerText = "Official Email";
        authFooter.innerHTML = `<p>Want to join? <a href="#" class="link-btn">Apply as Facilitator</a></p>`;
    } else {
        title.innerText = "Student Portal";
        idLabel.innerText = "Registration Number";
        authFooter.innerHTML = `<p>New here? <a href="#" class="link-btn">Join Students</a></p>`;
    }
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('userPass');
    const icon = document.getElementById('toggleIcon');
    const isPass = passInput.type === "password";
    passInput.type = isPass ? "text" : "password";
    icon.innerText = isPass ? "HIDE" : "SHOW";
}

function showError(msg) {
    const toast = document.getElementById('errorToast');
    document.getElementById('errorMessage').innerText = msg;
    toast.classList.add('show', 'shake');
    setTimeout(() => toast.classList.remove('show', 'shake'), 3000);
}

/* --- AUTH CORE --- */
function handleLogin() {
    const btn = document.getElementById('submitBtn');
    const id = document.getElementById('userID').value.trim();
    const pin = document.getElementById('userPass').value.trim();
    const isStudent = document.getElementById('stuTab').checked;

    btn.classList.add('btn-loading');
    btn.disabled = true;

    setTimeout(() => {
        let user = isStudent ? 
            studentDB.find(s => s.regNo === id && s.pin === pin) :
            facilitatorDB.find(f => f.id === id && f.pin === pin);

        if (user) {
            if (isStudent) {
                logActivity(user.regNo);
                window.location.href = "https://official-gocbt.github.io/Home/";
            } else {
                showDashboard(user.name);
            }
        } else {
            showError("Invalid Credentials Provided");
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    }, 1200);
}

function logActivity(regNo) {
    let history = JSON.parse(localStorage.getItem(`history_${regNo}`)) || [];
    history.unshift({ date: new Date().toLocaleString(), device: navigator.platform });
    localStorage.setItem(`history_${regNo}`, JSON.stringify(history.slice(0, 5)));
}

function showDashboard(name) {
    document.getElementById('authCard').classList.add('hidden');
    document.getElementById('adminView').classList.remove('hidden');
    document.getElementById('adminWelcome').innerText = `Welcome, ${name}`;
    loadAudit();
}

function loadAudit() {
    const tbody = document.getElementById('auditBody');
    tbody.innerHTML = "";
    studentDB.forEach(s => {
        const h = JSON.parse(localStorage.getItem(`history_${s.regNo}`)) || [];
        tbody.innerHTML += `<tr><td>${s.name}</td><td>${s.regNo}</td><td>${h.length}</td><td>${h[0]?.date || 'Never'}</td></tr>`;
    });
}

function logout() { location.reload(); }
const CACHE_NAME = 'gocbt-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch Assets
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
/* --- NOTIFICATION MODULE --- */
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log("Notification permission granted.");
            }
        });
    }
}

// Facilitator function to "Notify Students"
function triggerGlobalNotification(message) {
    if (Notification.permission === 'granted') {
        const options = {
            body: message,
            icon: 'https://cdn-icons-png.flaticon.com/512/3413/3413535.png'
        };
        new Notification("goCBT Admin Update", options);
    } else {
        alert("Notification permission not granted.");
    }
}
