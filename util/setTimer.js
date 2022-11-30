export const makeTimer = (time) => {
	let timeLeft = time;
	const timer = document.querySelector('.time-left');

	const gameOver = () => {
		clearInterval(timer);

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
