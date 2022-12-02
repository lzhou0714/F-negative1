export const makeTimer = (time, audio) => {
	let timeLeft = time;
	const timer = document.querySelector('.time-left');

	const gameOver = () => {
		clearInterval(timerInterval);

		audio.pause();

		const defeat_sound = new Audio('../assets/defeat.mp3');
		defeat_sound.play();

		const defeat = document.querySelector('.modal-defeat');
		defeat.style.display = 'block';
		// When the user clicks the button, open the modal
	};

	const updateTimer = () => {
		timeLeft = timeLeft - 1;

		if (timeLeft >= 0) {
			timer.textContent = `Time: ${timeLeft}s`;
		} else {
			gameOver();
		}
	};

	const timerInterval = setInterval(updateTimer, 1000);
	return timerInterval;
};
