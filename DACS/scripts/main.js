// Khởi tạo bản đồ
function initMap() {
    const center = { lat: 10.8231, lng: 106.6297 }; // Tọa độ TP.HCM
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: center,
    });

    // Thêm marker
    new google.maps.Marker({
        position: center,
        map: map,
        title: "Vị trí bất động sản",
    });
}

// Xử lý sự kiện khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
    console.log("Trang đã được tải!");

    // Thêm các sự kiện khác nếu cần
    const searchButton = document.querySelector(".search-section button");
    if (searchButton) {
        searchButton.addEventListener("click", function (e) {
            e.preventDefault();
            alert("Tìm kiếm bất động sản...");
        });
    }
});