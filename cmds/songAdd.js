<?php
header('Content-Type: application/json');
error_reporting(0);

// 1. Tìm và kết nối CSDL GDPS (connection.php)
$possible_paths = [
    __DIR__ . "/../../connection.php",
    __DIR__ . "/../../../connection.php",
    __DIR__ . "/../../incl/lib/connection.php",
    __DIR__ . "/../../../incl/lib/connection.php",
    $_SERVER['DOCUMENT_ROOT'] . "/connection.php",
    $_SERVER['DOCUMENT_ROOT'] . "/incl/lib/connection.php"
];

$connected = false;
foreach ($possible_paths as $path) {
    if (file_exists($path)) {
        include_once($path);
        $connected = true;
        break;
    }
}

if (!$connected || !isset($db)) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$url = isset($_GET['url']) ? trim($_GET['url']) : '';

if (empty($url)) {
    echo json_encode(["error" => "Thiếu link bài hát/YouTube URL"]);
    exit;
}

// 2. Hàm chuyển đổi URL YouTube thành Direct MP3 Link thông qua Cobalt API (Tốc độ cao, miễn phí)
function getCobaltMp3($youtubeUrl) {
    $apiUrl = "https://api.cobalt.tools/api/json";
    
    $payload = json_encode([
        "url" => $youtubeUrl,
        "downloadMode" => "audio",
        "audioFormat" => "mp3"
    ]);

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    curl_close($ch);

    if ($response) {
        $data = json_decode($response, true);
        if (isset($data['url'])) {
            return [
                'url' => $data['url'],
                'title' => isset($data['filename']) ? pathinfo($data['filename'], PATHINFO_FILENAME) : 'YouTube Song'
            ];
        }
    }
    return false;
}

$directDownloadUrl = $url;
$songTitle = "Custom Song";
$authorName = "YouTube / Discord Bot";

// 3. Kiểm tra xem URL truyền vào có phải là link YouTube hay không
if (preg_match('/(youtube\.com|youtu\.be)/i', $url)) {
    $cobaltData = getCobaltMp3($url);
    if ($cobaltData && !empty($cobaltData['url'])) {
        $directDownloadUrl = $cobaltData['url'];
        if (!empty($cobaltData['title'])) {
            $songTitle = $cobaltData['title'];
        }
    } else {
        echo json_encode(["error" => "Không thể lấy file MP3 từ link YouTube này! Vui lòng thử link khác."]);
        exit;
    }
} else {
    // Nếu là link MP3 trực tiếp thông thường
    $parsedUrl = parse_url($url, PHP_URL_PATH);
    $filename = basename($parsedUrl);
    $extractedName = pathinfo($filename, PATHINFO_FILENAME);
    if (!empty($extractedName) && strlen($extractedName) >= 2) {
        $songTitle = $extractedName;
    }
}

try {
    // 4. Kiểm tra xem link bài hát này đã từng thêm chưa
    $checkQuery = $db->prepare("SELECT ID, name, authorName FROM songs WHERE download = :url LIMIT 1");
    $checkQuery->bindValue(':url', $directDownloadUrl, PDO::PARAM_STR);
    $checkQuery->execute();
    $existingSong = $checkQuery->fetch(PDO::FETCH_ASSOC);

    if ($existingSong) {
        echo json_encode([
            "exists" => true,
            "id" => $existingSong['ID'],
            "name" => $existingSong['name'],
            "author" => $existingSong['authorName']
        ]);
        exit;
    }

    // 5. Thêm thông tin bài hát vào CSDL
    $query = $db->prepare("INSERT INTO songs (name, authorID, authorName, size, download, hash) VALUES (:name, 9, :author, '5.00', :url, '')");
    $query->bindValue(':name', urldecode($songTitle), PDO::PARAM_STR);
    $query->bindValue(':author', $authorName, PDO::PARAM_STR);
    $query->bindValue(':url', $directDownloadUrl, PDO::PARAM_STR);
    $query->execute();

    $songID = $db->lastInsertId();

    echo json_encode([
        "exists" => false,
        "id" => $songID,
        "name" => urldecode($songTitle),
        "author" => $authorName
    ]);

} catch (Exception $e) {
    echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
}
?>
