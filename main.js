window.addEventListener("load", () => {

	const numsElm = document.getElementById("nums");
	const opesElm = document.getElementById("opes");
	const opesSelectElm = document.getElementById("opes-select");
	const resultElm = document.getElementById("result");
	const inputElm = document.getElementById("input");
	const outputElm = document.getElementById("output");
	const messageElm = document.getElementById("message");
	const solutionElm = document.getElementById("solution");

	const execBtn = document.getElementById("exec");
	const stopBtn = document.getElementById("stop");

	opesElm.addEventListener("click", () => {
		opesElm.classList.add("invisible");
		opesSelectElm.classList.remove("hidden");
		opesSelectElm.focus();
	});

	opesSelectElm.addEventListener("focus", () => {
		const values = opesElm.value.split(" ");
		opesSelectElm.size = opesSelectElm.options.length;
		[...opesSelectElm.options].forEach(opt => opt.selected = values.includes(opt.value));
	});
	opesSelectElm.addEventListener("blur", () => {
		const values = [...opesSelectElm.options].filter(opt => opt.selected).map(opt => opt.value);
		opesElm.value = values.join(" ");
		opesElm.textContent = values.join(" ");
		opesElm.classList.remove("invisible");
		opesSelectElm.classList.add("hidden");
	});

	let isRunning = false;

	inputElm.addEventListener("submit", e => {

		e.preventDefault();

		if (isRunning) {
			return;
		}

		const numsStr = numsElm.value.trim() || numsElm.placeholder;
		numsElm.value = numsStr;
		opesElm.blur();
		const opesStr = opesElm.value;
		const resultStr = resultElm.value;
		const sortable = document.getElementById("sortable").value === "1";
		const limit = document.getElementById("limit").value;

		const nums = numsStr.split(/[\s,]+/);
		const opes = ["n", ...opesStr.split(" ")];
		const result = resultStr * 1;

		solutionElm.innerHTML = "";
		if (nums.every(v => /^\d+$/.test(v)) && /^-?\d+$/.test(resultStr)) {
			messageElm.textContent = "実行中...";
		} else {
			messageElm.textContent = "正しく入力してください";
			return;
		}

		isRunning = true;

		let solutionCount = 0;
		const worker = new Worker("worker.js");
		worker.addEventListener("message", e => {
			const { message, solution, complete } = e.data;
			if (message) {
				messageElm.textContent = message;
			}
			if (solution) {
				solutionCount++;
				const li = document.createElement("li");
				li.textContent = solution;
				solutionElm.appendChild(li);
			}
			if (complete) {
				stopBtn.classList.add("hidden");
				execBtn.classList.remove("hidden");
				messageElm.textContent = solutionCount ? `解一覧 (${solutionCount}件)` : "解が見つかりませんでした";
				isRunning = false;
			}
		});
		execBtn.classList.add("hidden");
		stopBtn.classList.remove("hidden");
		stopBtn.addEventListener("click", () => {
			worker.terminate();
			messageElm.textContent = "中断しました";
			stopBtn.classList.add("hidden");
			execBtn.classList.remove("hidden");
			isRunning = false;
		});
		worker.postMessage({ nums, opes, result, sortable, limit });

	});

});
