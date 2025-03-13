document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Scripts loaded!");

    // ✅ Check if User is Logged In
    function isUserLoggedIn() {
        return localStorage.getItem("userLoggedIn") === "true";
    }

    // ✅ Restrict Add Driver
    const addDriverForm = document.getElementById("add-driver-form");
    if (addDriverForm) {
        addDriverForm.addEventListener("submit", function (event) {
            if (!isUserLoggedIn()) {
                event.preventDefault();
                alert("❌ You must be logged in to add a driver!");
                return;
            }

            const driverData = {
                name: document.getElementById("name").value,
                age: parseInt(document.getElementById("age").value),
                total_pole_positions: parseInt(document.getElementById("pole_positions").value),
                total_race_wins: parseInt(document.getElementById("race_wins").value),
                total_points_scored: parseFloat(document.getElementById("points").value),
                total_world_titles: parseInt(document.getElementById("world_titles").value),
                total_fastest_laps: parseInt(document.getElementById("fastest_laps").value),
                team: document.getElementById("team").value
            };

            fetch("/drivers/add_driver", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(driverData)
            })
            .then(response => response.json())
            .then(data => alert(data.message))
            .catch(error => console.error("Error:", error));
        });
    }

    // ✅ Restrict Add Team
    const addTeamForm = document.getElementById("add-team-form");
    if (addTeamForm) {
        addTeamForm.addEventListener("submit", function (event) {
            if (!isUserLoggedIn()) {
                event.preventDefault();
                alert("❌ You must be logged in to add a team!");
                return;
            }

            const teamData = {
                name: document.getElementById("name").value,
                year_founded: parseInt(document.getElementById("year_founded").value),
                total_pole_positions: parseInt(document.getElementById("pole_positions").value),
                total_race_wins: parseInt(document.getElementById("race_wins").value),
                total_constructor_titles: parseInt(document.getElementById("constructor_titles").value),
                previous_season_position: parseInt(document.getElementById("previous_position").value)
            };

            fetch("/teams/add_team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(teamData)
            })
            .then(response => response.json())
            .then(data => alert(data.message))
            .catch(error => console.error("Error:", error));
        });
    }

    // ✅ Restrict Editing and Deleting
    function restrictEditDeleteButtons() {
        if (!isUserLoggedIn()) {
            document.querySelectorAll(".edit-button, .delete-button").forEach(button => {
                button.style.display = "none"; // Hide buttons if not logged in
            });
        }
    }
    restrictEditDeleteButtons();

    // ✅ Query Drivers
    const queryDriverForm = document.getElementById("query-driver-form");
    if (queryDriverForm) {
        queryDriverForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const attribute = document.getElementById("attribute").value;
            const condition = document.getElementById("condition").value;
            const value = document.getElementById("value").value;

            try {
                const response = await fetch(`/drivers/query_drivers?attribute=${attribute}&condition=${condition}&value=${value}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("Query Results:", data);

                const resultsDiv = document.getElementById("results");
                resultsDiv.innerHTML = "<h2>Query Results:</h2>";

                if (data.length === 0) {
                    resultsDiv.innerHTML += "<p>No drivers found.</p>";
                } else {
                    data.forEach(driver => {
                       const driverHTML = `
                            <div class="driver-card" id="driver-${driver.name}">
                                <p><strong>Name:</strong> <span id="name-${driver.name}">${driver.name}</span></p>
                                <p><strong>Age:</strong> <input type="number" id="age-${driver.name}" value="${driver.age}" disabled></p>
                                <p><strong>Total Race Wins:</strong> <input type="number" id="race_wins-${driver.name}" value="${driver.total_race_wins}" disabled></p>
                                <button class="edit-button" data-name="${driver.name}">✏ Edit</button>
                                <button class="save-button" data-name="${driver.name}" style="display:none;">💾 Save</button>
                            </div>
                        `;
                        // resultsDiv.innerHTML += driverHTML;
                        resultsDiv.innerHTML += `
                        <p><a href="/drivers/${driver.name}">${driver.name}</a> - ${driver[attribute]}</p>
                        `;
                    });
                    attachDriverEditListeners();
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Failed to query drivers. Check console for details.");
            }
        });
    }

    // ✅ Attach Event Listeners for Editing Drivers
    function attachDriverEditListeners() {
        document.querySelectorAll(".edit-button").forEach(button => {
            button.addEventListener("click", function () {
                if (!isUserLoggedIn()) {
                    alert("❌ You must be logged in to edit!");
                    return;
                }

                const name = button.getAttribute("data-name");
                document.getElementById(`age-${name}`).removeAttribute("disabled");
                document.getElementById(`race_wins-${name}`).removeAttribute("disabled");

                button.style.display = "none"; // Hide Edit button
                document.querySelector(`.save-button[data-name="${name}"]`).style.display = "inline-block";
            });
        });

        // ✅ Save Updated Driver Details
        document.querySelectorAll(".save-button").forEach(button => {
            button.addEventListener("click", async function () {
                const name = button.getAttribute("data-name");

                const updatedDriver = {
                    age: parseInt(document.getElementById(`age-${name}`).value),
                    total_race_wins: parseInt(document.getElementById(`race_wins-${name}`).value)
                };

                fetch(`/drivers/update_driver/${name}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedDriver)
                })
                .then(response => response.json())
                .then(data => {
                    alert("✅ Driver updated successfully!");
                    window.location.reload();
                })
                .catch(error => console.error("❌ Update Error:", error));
            });
        });
    }

    // ✅ Query Teams
    const queryTeamForm = document.getElementById("query-form");
    if (queryTeamForm) {
        queryTeamForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const attribute = document.getElementById("attribute").value;
            const condition = document.getElementById("condition").value;
            const value = document.getElementById("value").value;

            try {
                const response = await fetch(`/teams/query_teams?attribute=${encodeURIComponent(attribute)}&condition=${encodeURIComponent(condition)}&value=${encodeURIComponent(value)}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("Query Results:", data);

                const resultsDiv = document.getElementById("results");
                resultsDiv.innerHTML = "<h2>Query Results:</h2>";

                if (data.length === 0) {
                    resultsDiv.innerHTML += "<p>No teams found.</p>";
                } else {
                    data.forEach(team => {
                        // resultsDiv.innerHTML += `
                        //     <div class="team-card" id="team-${team.name}">
                        //         <p><strong>Name:</strong> ${team.name}</p>  
                        //         <p><strong>Year Founded:</strong> 
                        //             <input type="number" id="year_founded-${team.name}" value="${parseInt(team.year_founded) || ''}" disabled>
                        //         </p>
                        //         <p><strong>Total Race Wins:</strong> 
                        //             <input type="number" id="race_wins-${team.name}" value="${parseInt(team.total_race_wins) || ''}" disabled>
                        //         </p>
                        //         <p><strong>Total Constructor Titles:</strong> 
                        //             <input type="number" id="constructor_titles-${team.name}" value="${parseInt(team.total_constructor_titles) || ''}" disabled>
                        //         </p>
                        //         <button class="edit-button" data-name="${team.name}">✏ Edit</button>
                        //         <button class="save-button" data-name="${team.name}" style="display:none;">💾 Save</button>
                        //     </div>
                        // `;
                        resultsDiv.innerHTML += `
                        <p><a href="/teams/${team.name}">${team.name}</a> - ${team[attribute]}</p>
                    `;
                    });                    
                    attachEditListeners(); 
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Failed to query teams. Check console for details.");
            }
        });
    }
    // ✅ Attach Edit Button Listeners AFTER Query
    function attachEditListeners() {
        document.querySelectorAll(".edit-button").forEach(button => {
            button.addEventListener("click", function () {
                console.log("🖊 Edit button clicked!");
                if (!isUserLoggedIn()) {
                    alert("❌ You must be logged in to edit teams!");
                    return;
                }

                const teamName = this.dataset.name;
                console.log("Editing team:", teamName);

                // Enable inputs
                document.getElementById(`year_founded-${teamName}`).disabled = false;
                document.getElementById(`race_wins-${teamName}`).disabled = false;
                document.getElementById(`constructor_titles-${teamName}`).disabled = false;

                this.style.display = "none"; // Hide Edit button
                document.querySelector(`.save-button[data-name="${teamName}"]`).style.display = "inline-block"; // Show Save button
            });
        });

        document.querySelectorAll(".save-button").forEach(button => {
            button.addEventListener("click", async function () {
                console.log("💾 Save button clicked!");
                if (!isUserLoggedIn()) {
                    alert("❌ You must be logged in to save changes!");
                    return;
                }

                const teamName = this.dataset.name;
                const updatedTeamData = {
                    year_founded: document.getElementById(`year_founded-${teamName}`).value,
                    total_race_wins: document.getElementById(`race_wins-${teamName}`).value,
                    total_constructor_titles: document.getElementById(`constructor_titles-${teamName}`).value
                };

                console.log("Updating team:", teamName, updatedTeamData);

                try {
                    const response = await fetch(`/teams/update_team/${teamName}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedTeamData)
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log("Update Response:", data);
                    alert("✅ Team updated successfully!");

                    // Reset UI
                    document.getElementById(`year_founded-${teamName}`).disabled = true;
                    document.getElementById(`race_wins-${teamName}`).disabled = true;
                    document.getElementById(`constructor_titles-${teamName}`).disabled = true;

                    this.style.display = "none"; // Hide Save button
                    document.querySelector(`.edit-button[data-name="${teamName}"]`).style.display = "inline-block"; // Show Edit button
                } catch (error) {
                    console.error("Error:", error);
                    alert("❌ Failed to update team. Check console for details.");
                }
            });
        });

    // ✅ Compare Drivers
    const compareDriversForm = document.getElementById("compare-drivers-form");
    if (compareDriversForm) {
        compareDriversForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const driver1 = document.getElementById("driver1").value;
            const driver2 = document.getElementById("driver2").value;

            try {
                const response = await fetch(`/drivers/compare_drivers?driver1=${encodeURIComponent(driver1)}&driver2=${encodeURIComponent(driver2)}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                const resultsDiv = document.getElementById("results");
                resultsDiv.innerHTML = "<h2>Comparison Results:</h2>";

                Object.keys(data.comparison).forEach(stat => {
                    resultsDiv.innerHTML += `<p><strong>${stat}:</strong> ${data.comparison[stat][driver1]} vs ${data.comparison[stat][driver2]}</p>`;
                });
            } catch (error) {
                console.error("Error:", error);
                alert("Failed to compare drivers. Check console for details.");
            }
        });
    }

    // ✅ Handle Updating Drivers
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("update-driver-button")) {
            if (!isUserLoggedIn()) {
                alert("❌ You must be logged in to update a driver!");
                return;
            }

            const driverName = event.target.dataset.name;
            document.getElementById("update-driver-form").style.display = "block";
            document.getElementById("update-name").value = driverName;
        }
    });

    document.getElementById("update-driver-button").addEventListener("click", function () {
        const name = document.getElementById("update-name").value;
        const updatedAge = document.getElementById("update-age").value;
        const updatedRaceWins = document.getElementById("update-race-wins").value;

        const updateData = {};
        if (updatedAge) updateData.age = parseInt(updatedAge);
        if (updatedRaceWins) updateData.total_race_wins = parseInt(updatedRaceWins);

        fetch(`/drivers/update_driver/${name}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error("Error:", error));
    });

    // ✅ Handle Updating Teams
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("update-team-button")) {
            if (!isUserLoggedIn()) {
                alert("❌ You must be logged in to update a team!");
                return;
            }

            const teamName = event.target.dataset.name;
            document.getElementById("update-team-form").style.display = "block";
            document.getElementById("update-team-name").value = teamName;
        }
    });

    document.getElementById("update-team-button").addEventListener("click", function () {
        const name = document.getElementById("update-team-name").value;
        const updatedYearFounded = document.getElementById("update-year-founded").value;

        const updateData = {};
        if (updatedYearFounded) updateData.year_founded = parseInt(updatedYearFounded);

        fetch(`/teams/update_team/${name}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error("Error:", error));
    });
    }

    // ✅ Handle Edit Button Click
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("edit-button")) {
            const teamName = event.target.getAttribute("data-name");
            const nameInput = document.getElementById(`team_name-${teamName}`);
            const yearFoundedInput = document.getElementById(`year_founded-${teamName}`);
            const raceWinsInput = document.getElementById(`race_wins-${teamName}`);
            const constructorTitlesInput = document.getElementById(`constructor_titles-${teamName}`);

            if (!isUserLoggedIn()) {
                alert("❌ You must be logged in to edit a team!");
                return;
            }

            // ✅ Enable input fields
            nameInput.removeAttribute("disabled");
            yearFoundedInput.removeAttribute("disabled");
            raceWinsInput.removeAttribute("disabled");
            constructorTitlesInput.removeAttribute("disabled");

            // ✅ Show "Save" button and hide "Edit" button
            event.target.style.display = "none";
            document.querySelector(`.save-button[data-name='${teamName}']`).style.display = "inline-block";
        }
    });

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("save-button")) {
            const teamName = event.target.getAttribute("data-name");
            console.log(`💾 Saving Team: ${teamName}`);
    
            const nameInput = document.getElementById(`team_name-${teamName}`);
            const yearFoundedInput = document.getElementById(`year_founded-${teamName}`);
            const raceWinsInput = document.getElementById(`race_wins-${teamName}`);
            const constructorTitlesInput = document.getElementById(`constructor_titles-${teamName}`);
    
            if (!isUserLoggedIn()) {
                alert("❌ You must be logged in to update a team!");
                return;
            }
    
            // ✅ Ensure data is sent in correct format
            const updatedTeamData = {};
            if (nameInput.value) updatedTeamData.name = nameInput.value;
            if (yearFoundedInput.value) updatedTeamData.year_founded = parseInt(yearFoundedInput.value);
            if (raceWinsInput.value) updatedTeamData.total_race_wins = parseInt(raceWinsInput.value);
            if (constructorTitlesInput.value) updatedTeamData.total_constructor_titles = parseInt(constructorTitlesInput.value);
    
            console.log("📡 Sending Update:", updatedTeamData);
    
            fetch(`/teams/update_team/${encodeURIComponent(teamName)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTeamData)
            })
            .then(response => response.json())
            .then(data => {
                console.log("✅ Update Response:", data);
                alert(data.message);
                window.location.reload();
            })
            .catch(error => console.error("❌ Error updating team:", error));
    
            // ✅ Disable input fields after saving
            nameInput.setAttribute("disabled", "true");
            yearFoundedInput.setAttribute("disabled", "true");
            raceWinsInput.setAttribute("disabled", "true");
            constructorTitlesInput.setAttribute("disabled", "true");
    
            // ✅ Show Edit button again
            document.querySelector(`.edit-button[data-name='${teamName}']`).style.display = "inline-block";
            event.target.style.display = "none";
        }
    });    
    

    // ✅ Attach Event Listeners for Editing Drivers
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("edit-button")) {
            const name = event.target.getAttribute("data-name");
            document.getElementById(`age-${name}`).removeAttribute("disabled");
            document.getElementById(`race_wins-${name}`).removeAttribute("disabled");

            event.target.style.display = "none"; // Hide Edit button
            document.querySelector(`.save-button[data-name="${name}"]`).style.display = "inline-block";
        }
    });

    // ✅ Save Updated Driver Details
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("save-button")) {
            const name = event.target.getAttribute("data-name");

            const updatedDriver = {
                age: parseInt(document.getElementById(`age-${name}`).value),
                total_race_wins: parseInt(document.getElementById(`race_wins-${name}`).value)
            };

            fetch(`/drivers/update_driver/${name}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedDriver)
            })
            .then(response => response.json())
            .then(data => {
                alert("✅ Driver updated successfully!");
                window.location.reload();
            })
            .catch(error => console.error("❌ Update Error:", error));
        }
    });

    // ✅ Attach Event Listeners for Editing Teams
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("edit-button")) {
            const teamName = event.target.getAttribute("data-name");
            document.getElementById(`year_founded-${teamName}`).removeAttribute("disabled");
            document.getElementById(`race_wins-${teamName}`).removeAttribute("disabled");

            event.target.style.display = "none"; // Hide Edit button
            document.querySelector(`.save-button[data-name="${teamName}"]`).style.display = "inline-block";
        }
    });

    // ✅ Save Updated Team Details
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("save-button")) {
            const teamName = event.target.getAttribute("data-name");

            const updatedTeam = {
                year_founded: parseInt(document.getElementById(`year_founded-${teamName}`).value),
                total_race_wins: parseInt(document.getElementById(`race_wins-${teamName}`).value)
            };

            fetch(`/teams/update_team/${teamName}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTeam)
            })
            .then(response => response.json())
            .then(data => {
                alert("✅ Team updated successfully!");
                window.location.reload();
            })
            .catch(error => console.error("❌ Update Error:", error));
        }
    });

    // ✅ Make Logout Button Visible if Logged In
    if (isUserLoggedIn()) {
        const logoutButton = document.getElementById("logout-button");
        if (logoutButton) logoutButton.style.display = "block";
    }

    // ✅ Make Delete Buttons Visible if Logged In
    if (isUserLoggedIn()) {
        const deleteDriverBtn = document.getElementById("delete-driver-btn");
        const deleteTeamBtn = document.getElementById("delete-team-btn");

        if (deleteDriverBtn) deleteDriverBtn.style.display = "block";
        if (deleteTeamBtn) deleteTeamBtn.style.display = "block";
    }

    document.getElementById("delete-driver-btn").addEventListener("click", async function () {
        const driverName = document.getElementById("driver-name").textContent;

        if (!confirm("Are you sure you want to delete this driver?")) return;

        try {
            const response = await fetch(`/drivers/delete_driver/${driverName}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete driver");

            alert("✅ Driver deleted successfully!");
            window.location.href = "/";
        } catch (error) {
            alert("❌ Error deleting driver: " + error.message);
        }
    });

    document.getElementById("delete-team-btn").addEventListener("click", async function () {
        const teamName = document.getElementById("team-name").textContent;

        if (!confirm("Are you sure you want to delete this team?")) return;

        try {
            const response = await fetch(`/teams/delete_team/${teamName}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete team");

            alert("✅ Team deleted successfully!");
            window.location.href = "/";
        } catch (error) {
            alert("❌ Error deleting team: " + error.message);
        }
    });

});
