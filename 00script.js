let jsonData = [];
function loadJsonData() {
    fetch('00merge1.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data;
        })
        .catch(error => console.error('Error loading JSON:', error));
}

function search() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const searchWords = searchText.match(/\S+/gi) || [];

    const results = jsonData.filter(item => {
        const text = item.en.toLowerCase() + " " + item.vi.toLowerCase();
        return searchWords.every(word => text.includes(word));
    });

    results.sort((a, b) => {
        const aMatchCount = countMatches(a, searchWords);
        const bMatchCount = countMatches(b, searchWords);

        return bMatchCount - aMatchCount;
    });
    
    displayResults(results);
}

function countMatches(item, words) {
    const itemWordsEn = item.en.toLowerCase().match(/\S+/g) || [];
    const itemWordsVi = item.vi.toLowerCase().match(/\S+/g) || [];

    const countEn = words.reduce((count, word) => count + (itemWordsEn.includes(word) ? 1 : 0), 0);
    const countVi = words.reduce((count, word) => count + (itemWordsVi.includes(word) ? 1 : 0), 0);

    if (countEn > countVi) {
        return countSequentialMatches(itemWordsEn, words) - penaltyForLength(itemWordsEn.length);
    } else {
        return countSequentialMatches(itemWordsVi, words) - penaltyForLength(itemWordsVi.length);
    }
}
function countSequentialMatches(itemWords, words) {
    let count = 0;
    let lastIndex = -1;
    let totalDistance = 0;

    for (const word of words) {
        const index = itemWords.indexOf(word, lastIndex + 1);
        if (index > lastIndex) {
            count++;
            totalDistance += index - lastIndex - 1;
            lastIndex = index;
        } else {
            break;
        }
    }

    // Sử dụng một hàm để tính điểm dựa trên count và totalDistance
    return calculateScore(count, totalDistance);
}

function calculateScore(count, totalDistance) {
    // giảm điểm : khoảng cách lớn giữa các từ
    // tăng điểm : khi có nhiều từ khớp và khoảng cách giữa chúng càng ngắn
    return count - totalDistance * 0.5;
}
function penaltyForLength(length) {
    // Hệ số càng cao thì ưu tiên cho độ dài ngắn càng lớn
    return length * 0.5; 
}

function highlightSearchTerms(text, searchWords) {
    return searchWords.reduce((acc, word) => {
        const regex = new RegExp(`(${word})`, 'gi');
        return acc.replace(regex, '<span class="highlight">$1</span>');
    }, text);
}


function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        return;
    }

    const maxResults = 500;
    const displayedResults = results.slice(0, maxResults);
    const searchWords = document.getElementById('searchInput').value.match(/\S+/gi) || [];

    displayedResults.forEach((item, index) => {
        const enP = document.createElement('p');
        enP.innerHTML = `En: ${highlightSearchTerms(item.en, searchWords)} `;
        
        const speakerIcon = document.createElement('span');
        speakerIcon.className = 'speaker-icon';
        speakerIcon.innerHTML = '&#128266;'; // Unicode cho biểu tượng loa
        speakerIcon.onclick = () => speakText(item.en);
        enP.appendChild(speakerIcon);

        resultsDiv.appendChild(enP);

        const viP = document.createElement('p');
        viP.innerHTML = `Vi: ${highlightSearchTerms(item.vi, searchWords)}`;
        resultsDiv.appendChild(viP);

        if (index < displayedResults.length - 1) {
            const separator = document.createElement('hr');
            resultsDiv.appendChild(separator);
        }
    });
}

let textSpeeds = {};

function speakText(text) {
    // Hủy bỏ bất kỳ âm thanh nào đang được phát
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    let voices = speechSynthesis.getVoices();

    // Chọn giọng đọc tiếng Anh Mỹ
    let selectedVoice = voices.find(voice => voice.lang === 'en-US');

    // Điều chỉnh giọng đọc và độ cao
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.pitch = 2;
    }

    // Kiểm tra xem đoạn văn bản đã được nhấp trước đó chưa
    if (textSpeeds[text] === 'slow') {
        // Nếu lần trước đọc chậm, lần này đọc nhanh
        utterance.rate = 0.01;
        textSpeeds[text] = 'fast';
    } else {
        // Nếu lần trước đọc nhanh hoặc chưa được nhấp, lần này đọc chậm
        utterance.rate = 0.9;
        textSpeeds[text] = 'slow';
    }

    speechSynthesis.speak(utterance);
}

loadJsonData();
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        search();
    }
});

document.addEventListener('keypress', function(event) {
    if (event.key === '/') {
        event.preventDefault();
        document.getElementById('searchInput').focus();
    }
});


// results.sort((b, a) => {
//     const aScore = calculateScore(a, searchWords);
//     const bScore = calculateScore(b, searchWords);

//     return bScore - aScore; // Sắp xếp giảm dần theo điểm số
// });
// function calculateScore(item, words) {
//     const matchCount = countMatches(item, words);
//     const textLength = (item.en + " " + item.vi).length;
//     return matchCount * 10 + textLength; // Điểm số dựa trên số từ khớp và độ dài chuỗi
// }

//****************************************** */
// function displayResults(results) {
//     const resultsDiv = document.getElementById('results');
//     resultsDiv.innerHTML = '';

//     if (results.length === 0) {
//         resultsDiv.innerHTML = '<p>No results found</p>';
//         return;
//     }

//     const maxResults = 500;
//     const displayedResults = results.slice(0, maxResults);
//     const searchWords = document.getElementById('searchInput').value.match(/\S+/gi) || [];

//     displayedResults.forEach((item) => {
//         const enP = document.createElement('p');
//         enP.innerHTML = `En: ${highlightSearchTerms(item.en, searchWords)}`;
//         resultsDiv.appendChild(enP);

//         const viP = document.createElement('p');
//         viP.innerHTML = `Vi: ${highlightSearchTerms(item.vi, searchWords)}`;
//         resultsDiv.appendChild(viP);

//         const separator = document.createElement('hr');
//         resultsDiv.appendChild(separator);
//     });
// }// function speakText(text) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     speechSynthesis.speak(utterance);
// }
// function speakText(text) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     let voices = speechSynthesis.getVoices();

//     // Chọn giọng đọc. Ví dụ: chọn giọng đọc tiếng Anh Mỹ đầu tiên
//     let selectedVoice = voices.find(voice => voice.lang === 'en-US');

//     // Nếu tìm thấy giọng đọc, sử dụng giọng đó
//     if (selectedVoice) {
//         utterance.voice = selectedVoice;
//     }

//     speechSynthesis.speak(utterance);
// }

// function speakText(text) {
//     // Hủy bỏ bất kỳ âm thanh nào đang được phát
//     speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     let voices = speechSynthesis.getVoices();

//     // Chọn giọng đọc tiếng Anh Mỹ
//     let selectedVoice = voices.find(voice => voice.lang === 'en-US');

//     // Kiểm tra xem đoạn văn bản đã được nhấp trước đó chưa
//     if (clickedTexts[text]) {
//         // Nếu đã nhấp, đọc chậm hơn
//         utterance.rate = 0.01;
//     } else {
//         // Nếu chưa nhấp, đọc với tốc độ bình thường
//         utterance.rate = 0.9;
//     }

//     // Điều chỉnh giọng đọc và độ cao
//     if (selectedVoice) {
//         utterance.voice = selectedVoice;
//         utterance.pitch = 1.2;
//     }

//     // Đánh dấu văn bản này là đã được nhấp
//     clickedTexts[text] = true;

//     speechSynthesis.speak(utterance);
// }

// function speakText(text) {
//     // Hủy bỏ bất kỳ âm thanh nào đang được phát
//     speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     let voices = speechSynthesis.getVoices();

//     // Chọn giọng đọc tiếng Anh Mỹ
//     let selectedVoice = voices.find(voice => voice.lang === 'en-US');

//     // Điều chỉnh giọng đọc
//     if (selectedVoice) {
//         utterance.voice = selectedVoice;
//         utterance.rate = 0.9; // Tốc độ đọc chậm hơn một chút
//         utterance.pitch = 1.2; // Độ cao hơi cao
//     }

//     speechSynthesis.speak(utterance);
// }

