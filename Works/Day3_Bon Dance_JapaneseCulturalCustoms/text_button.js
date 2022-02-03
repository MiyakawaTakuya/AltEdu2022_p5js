
function bgmSWStartButtonClick() {
    let elm = document.getElementById('text');
    return new Promise((resolve, reject) => {
        let texts = "Try waving your index finger.".split('');
        function showMessage(texts, cb) {
            if (texts.length === 0) {
                return cb();
            }
            let ch = texts.shift();
            elm.innerHTML += ch;
            setTimeout(() => {
                showMessage(texts, cb);
            }, 60);
        }
        elm.innerHTML = '';
        showMessage(texts, resolve);
    });
}


function bgmStopButtonClick() {
    let elm = document.getElementById('text');
    return new Promise((resolve, reject) => {
        let texts = "Select your mode".split('');
        function showMessage(texts, cb) {
            if (texts.length === 0) {
                return cb();
            }
            let ch = texts.shift();
            elm.innerHTML += ch;
            setTimeout(() => {
                showMessage(texts, cb);
            }, 60);
        }
        elm.innerHTML = '';
        showMessage(texts, resolve);
    });
}

/** * アプリ起動時に、説明を表示します. */
function startIntro() {
    let elm = document.getElementById('text');
    return new Promise((resolve, reject) => {
        let texts = "Select your mode".split('');
        function showMessage(texts, cb) {
            if (texts.length === 0) {
                return cb();
            }
            let ch = texts.shift();
            elm.innerHTML += ch;
            setTimeout(() => {
                showMessage(texts, cb);
            }, 60);
        }
        elm.innerHTML = '';
        showMessage(texts, resolve);
    });
}

/** * アプリを起動します. */
window.addEventListener('DOMContentLoaded', () => {
    // アプリの説明を行います.
    startIntro().then(() => {
        // ボタンの表示と挙動
        document.querySelector('.js-btn-group').classList.add('--visible');
        document.getElementById('SW_startButton').onclick = bgmSWStartButtonClick;
        document.getElementById('stopButton').onclick = bgmStopButtonClick;
    });
});
