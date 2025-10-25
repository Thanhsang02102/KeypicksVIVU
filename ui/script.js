// DOM Elements
const tabRoundtrip = document.getElementById('tab-roundtrip');
const tabOneWay = document.getElementById('tab-one-way');
const returnDateGroup = document.getElementById('return-date-group');
const returnDateInput = document.getElementById('return-date');
const searchForm = document.getElementById('flight-search-form');
const searchResults = document.getElementById('search-results');

// State
let isRoundTrip = true;

// Hàm chuyển đổi tab
function setTripType(isRound) {
    isRoundTrip = isRound;

    // Cập nhật giao diện (CSS)
    if (isRound) {
        tabRoundtrip.classList.add('border-vna-primary', 'vna-text-primary');
        tabRoundtrip.classList.remove('border-transparent', 'text-gray-500');
        tabOneWay.classList.add('border-transparent', 'text-gray-500');
        tabOneWay.classList.remove('border-vna-primary', 'vna-text-primary');

        // Hiển thị ngày về và yêu cầu nhập
        returnDateGroup.classList.remove('hidden');
        returnDateInput.setAttribute('required', 'required');
    } else {
        tabOneWay.classList.add('border-vna-primary', 'vna-text-primary');
        tabOneWay.classList.remove('border-transparent', 'text-gray-500');
        tabRoundtrip.classList.add('border-transparent', 'text-gray-500');
        tabRoundtrip.classList.remove('border-vna-primary', 'vna-text-primary');

        // Ẩn ngày về và bỏ yêu cầu nhập
        returnDateGroup.classList.add('hidden');
        returnDateInput.removeAttribute('required');
    }
}

// Event Listeners cho Tabs
tabRoundtrip.addEventListener('click', () => setTripType(true));
tabOneWay.addEventListener('click', () => setTripType(false));

// Xử lý submit form
searchForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Ngăn chặn form submit mặc định

    // 1. Lấy dữ liệu từ form
    const formData = new FormData(searchForm);
    const searchData = {};
    formData.forEach((value, key) => {
        // Chỉ lấy ngày về nếu là khứ hồi
        if (key !== 'return-date' || isRoundTrip) {
            searchData[key] = value;
        }
    });

    // Thêm loại chuyến bay vào dữ liệu
    searchData.tripType = isRoundTrip ? 'Khứ Hồi' : 'Một Chiều';

    // In dữ liệu ra console (Trong dự án thật, bước này sẽ gọi API)
    console.log("Dữ liệu tìm kiếm:", searchData);

    // 2. Giả lập kết quả (Trong dự án thật: gọi API GDS/NDC)
    displayFakeResults(searchData);
});

// Hàm giả lập hiển thị kết quả
function displayFakeResults(data) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.classList.remove('hidden');
    resultsContainer.innerHTML = `
        <h3 class="text-xl font-bold mb-4 vna-text-primary">Kết quả cho ${data.departure} - ${data.arrival} (${data['depart-date']})</h3>
        <div class="bg-gray-50 p-4 border rounded-lg mb-4">
            <p class="font-semibold vna-text-primary">Chuyến bay VN 7120</p>
            <p class="text-sm text-gray-600">Khởi hành: ${data['depart-date']} - 08:00 (SGN)</p>
            <p class="text-sm text-gray-600">Đến: 10:00 (HAN)</p>
            <p class="text-lg font-bold text-red-600 mt-2">Giá từ: 1,850,000 VND</p>
            <button class="vna-primary text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-800">Chọn vé</button>
        </div>
        <div class="bg-gray-50 p-4 border rounded-lg">
            <p class="font-semibold vna-text-primary">Chuyến bay VN 7215</p>
            <p class="text-sm text-gray-600">Khởi hành: ${data['depart-date']} - 14:30 (SGN)</p>
            <p class="text-sm text-gray-600">Đến: 16:30 (HAN)</p>
            <p class="text-lg font-bold text-red-600 mt-2">Giá từ: 2,100,000 VND</p>
            <button class="vna-primary text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-800">Chọn vé</button>
        </div>
        <p class="mt-4 text-sm text-gray-500">Lưu ý: Đây chỉ là dữ liệu giả lập. Trong thực tế, dữ liệu sẽ được lấy từ API của các hãng hàng không.</p>
    `;
    // Cuộn tới phần kết quả
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Khởi tạo trạng thái ban đầu
setTripType(true);