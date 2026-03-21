// Toggle dark/light mode and switch moon/sun icon
function toggleMode() {
    document.body.classList.toggle('dark-mode');

    // Update moon/sun icons
    const toggles = document.querySelectorAll('.moon-toggle');
    toggles.forEach(btn => {
        if (document.body.classList.contains('dark-mode')) {
            btn.textContent = '🌞'; // show sun in dark mode
        } else {
            btn.textContent = '🌙'; // show moon in light mode
        }
    });

    // Save preference
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Initialize theme on page load
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.querySelectorAll('.moon-toggle').forEach(btn => btn.textContent = '🌞');
}

// Attach toggle function to buttons
document.querySelectorAll('.moon-toggle').forEach(btn => {
    btn.onclick = toggleMode;
});

// ===== User & Savings Functionality =====
function signUp() {
    let name = document.getElementById("name").value;
    let pin = document.getElementById("pin").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.push({ name, pin, savings: 0, goal: 0 });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created");
}

function login() {
    let name = document.getElementById("name").value;
    let pin = document.getElementById("pin").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.name === name && u.pin === pin);
    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        showDashboard();
    } else {
        alert("Invalid login");
    }
}

function showDashboard() {
    document.getElementById("auth").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    let user = JSON.parse(localStorage.getItem("currentUser"));
    document.getElementById("welcome").innerText = "Welcome " + user.name;
    document.getElementById("savings").innerText = user.savings;
    document.getElementById("goalDisplay").innerText = user.goal;
    let progress = user.goal ? (user.savings / user.goal) * 100 : 0;
    document.getElementById("progress").style.width = progress + "%";
}

function addSavings() {
    let amount = Number(document.getElementById("amount").value);
    let users = JSON.parse(localStorage.getItem("users"));
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let index = users.findIndex(u => u.name === currentUser.name);
    users[index].savings += amount;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[index]));
    showDashboard();
}

function setGoal() {
    let goal = Number(document.getElementById("goal").value);
    let users = JSON.parse(localStorage.getItem("users"));
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let index = users.findIndex(u => u.name === currentUser.name);
    users[index].goal = goal;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[index]));
    showDashboard();
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

function updateStatus() {
    let status = document.getElementById("status");
    if (navigator.onLine) {
        status.innerText = "🟢 Online - Data synced";
    } else {
        status.innerText = "🔴 Offline - Data saved locally";
    }
}

window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
updateStatus();

if (localStorage.getItem("currentUser")) {
    showDashboard();
}

function login() {
    let name = document.getElementById("name").value;
    let pin = document.getElementById("pin").value;

    if (navigator.onLine) {
        db.ref("users/" + name).get().then(snapshot => {
            if (snapshot.exists()) {
                let user = snapshot.val();
                if (user.pin === pin) {
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    showDashboard();
                } else {
                    alert("Wrong PIN");
                }
            } else {
                alert("User not found");
            }
        });
    } else {
        // Offline fallback
        let users = JSON.parse(localStorage.getItem("users")) || [];
        let user = users.find(u => u.name === name && u.pin === pin);

        if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));
            showDashboard();
        } else {
            alert("Offline: user not found");
        }
    }
}

function signUp() {
    let name = document.getElementById("name").value;
    let pin = document.getElementById("pin").value;

    let userData = { name, pin, savings: 0, goal: 0 };

    // Save locally
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(userData);
    localStorage.setItem("users", JSON.stringify(users));

    // Save to Firebase (if online)
    if (navigator.onLine) {
        db.ref("users/" + name).set(userData);
    }

    alert("Account created!");
}

function setGoal() {
    let goal = Number(document.getElementById("goal").value);

    let users = JSON.parse(localStorage.getItem("users"));
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    let index = users.findIndex(u => u.name === currentUser.name);
    users[index].goal = goal;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[index]));

    // Sync to Firebase
    if (navigator.onLine) {
        db.ref("users/" + currentUser.name).update({
            goal: goal
        });
    }

    showDashboard();
}

function addSavings() {
    let amount = Number(document.getElementById("amount").value);

    let users = JSON.parse(localStorage.getItem("users"));
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    let index = users.findIndex(u => u.name === currentUser.name);
    users[index].savings += amount;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[index]));

    // Sync to Firebase
    if (navigator.onLine) {
        db.ref("users/" + currentUser.name).update({
            savings: users[index].savings
        });
    }

    showDashboard();
}
window.addEventListener("online", () => {
    let user = JSON.parse(localStorage.getItem("currentUser"));

    if (user) {
        db.ref("users/" + user.name).set(user);
        console.log("Synced to cloud!");
    }
});