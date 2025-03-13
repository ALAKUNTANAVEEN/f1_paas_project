const firebaseConfig = {
    apiKey: "AIzaSyAaAhr5cKdDHB0NTSzAhhvxoWZFduFvT-Q",
    authDomain: "formulaone-e1b47.firebaseapp.com",
    projectId: "formulaone-e1b47",
    storageBucket: "formulaone-e1b47.appspot.com",
    messagingSenderId: "810361524427",
    appId: "1:810361524427:web:e82a124abe2ebb74700b4e",
    measurementId: "G-S95174JZQY"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", function () {
    console.log("🔥 Firebase script loaded!");

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        const loginButton = document.getElementById("submit-login");
        if (loginButton) {
            loginButton.addEventListener("click", function () {
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;

                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then(userCredential => {
                        console.log("User logged in:", userCredential.user);
                        alert("🎉 Login successful!");
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error("Login Error:", error.message);
                        alert(error.message);
                    });
            });
        }
    }

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            firebase.auth().signOut()
                .then(() => {
                    console.log("User logged out");
                    alert("Logout successful!");
                    window.location.reload();
                })
                .catch(error => {
                    console.error("Logout Error:", error.message);
                });
        });
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            document.getElementById("auth-status").innerText = `Logged in as ${user.email}`;
            document.getElementById("logout-button").style.display = "block";
            localStorage.setItem("userLoggedIn", "true");  
        } else {
            document.getElementById("auth-status").innerText = "Not logged in";
            document.getElementById("logout-button").style.display = "none";
            localStorage.setItem("userLoggedIn", "false"); 
        }
    });    
});
