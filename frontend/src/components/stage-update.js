let timer; // To store the timer
let stageUpdated = false; // Flag to check if stage is updated

// Function to start the stage update process
function startStageUpdate(minutes) {
    const updateTime = minutes * 60 * 1000; // Convert minutes to milliseconds

    // Update the stage status
    document.getElementById("stage-status").innerHTML = "Stage 1: Updated!";

    // Start the timer for the next stage update
    timer = setTimeout(() => {
        if (!stageUpdated) {
            alert("Stage not updated in time!");
            document.getElementById("stage-status").innerHTML = "Stage 1: Not Updated!";
        }
    }, updateTime);

    // Show countdown in the timer
    countdownTimer(updateTime);
}

// Function to simulate countdown timer
function countdownTimer(timeRemaining) {
    const timerDisplay = document.getElementById("timer-status");

    let interval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(interval);
        } else {
            timeRemaining -= 1000; // Reduce by 1 second
            const minutes = Math.floor(timeRemaining / 60000);
            const seconds = Math.floor((timeRemaining % 60000) / 1000);
            timerDisplay.innerHTML = `Time Remaining: ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

// Function to update the stage again (optional)
function updateStage() {
    stageUpdated = true;
    document.getElementById("stage-status").innerHTML = "Stage Updated! Proceeding to the next stage.";
    clearTimeout(timer); // Stop the alert timeout if updated in time
}
