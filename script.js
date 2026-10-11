
/* =========================
   素材データを読み込む
========================= */

async function loadMaterials() {
    try {
        const response = await fetch("materials.json");

        if (!response.ok) {
            throw new Error(
                `素材データの読み込みに失敗しました。HTTP ${response.status}`
            );
        }

        const materials = await response.json();

        if (!Array.isArray(materials)) {
            throw new Error("materials.json の形式が正しくありません。");
        }

        return materials;

    } catch (error) {
        console.error(error);
        throw error;
    }
}


/* =========================
   トップページの処理
========================= */

async function initHomePage() {
    const materialList = document.getElementById("material-list");
    const materialCount = document.getElementById("material-count");
    const message = document.getElementById("material-message");

    try {
        // JSONから素材データを取得
        const materials = await loadMaterials();

        // 素材の件数を表示
        materialCount.textContent = `${materials.length} 件の素材`;

        // 一覧をいったん空にする
        materialList.replaceChildren();

        // 素材が0件だった場合
        if (materials.length === 0) {
            message.textContent = "現在、登録されている素材はありません。";
            return;
        }

        // 素材データを1件ずつカードにする
        materials.forEach(material => {
            const card = document.createElement("a");
            card.className = "material-card";
            card.href = `detail.html?id=${encodeURIComponent(material.id)}`;

            // プレビュー画像
            const image = document.createElement("img");
            image.src = material.image;
            image.alt = material.name;
            image.loading = "lazy";

            // カード内の文字部分
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            const name = document.createElement("h3");
            name.textContent = material.name;

            const description = document.createElement("p");
            description.textContent =
                (material.description || "").split(/\r?\n/)[0];

            // カードを組み立てる
            cardBody.append(name, description);
            card.append(image, cardBody);
            materialList.append(card);
        });

        // 読み込み完了
        message.textContent = "";

    } catch (error) {
        message.textContent =
            "素材を読み込めませんでした。サーバーの起動とJSONの内容を確認してください。";
    }
}



/* =========================
   詳細ページの処理
========================= */

async function initDetailPage() {
    const content = document.getElementById("detail-content");
    const message = document.getElementById("detail-message");
    const notFound = document.getElementById("not-found");

    // 1枚目を取得
    const image = document.getElementById("detail-image");

    const name = document.getElementById("detail-name");
    const description = document.getElementById("detail-description");
    const downloadButton = document.getElementById("download-button");

    try {
        // URLから素材IDを取得
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

        // JSONから素材データを取得
        const materials = await loadMaterials();

        // IDが一致する素材を探す
        const material = materials.find(
            item => String(item.id) === id
        );

        // 素材が見つからない場合
        if (!material) {
            message.textContent = "";
            notFound.hidden = false;
            return;
        }

        // 素材情報をページに表示
        document.title = `${material.name}｜ハニット FRAME`;

        // 色変更機能の表示・非表示
        const colorEditor = document.getElementById("color-editor");

        if (colorEditor) {
            colorEditor.hidden = material.colorChange === false;
        }

        image.alt = material.name;

        const previewImages = [
            material.image,
            ...(material.image2 ? [material.image2] : [])
        ];

        let currentPreview = 0;

        const counter = document.getElementById("preview-counter");
        const prevButton = document.getElementById("preview-prev");
        const nextButton = document.getElementById("preview-next");

        function showPreview(index) {
            currentPreview = index;

            image.src = previewImages[currentPreview];
            image.alt = `${material.name}（プレビュー${currentPreview + 1}）`;

            counter.textContent =
                `${currentPreview + 1} / ${previewImages.length}`;

            // 画像が1枚なら矢印と枚数を非表示
            const hasMultipleImages = previewImages.length > 1;

            prevButton.hidden = !hasMultipleImages;
            nextButton.hidden = !hasMultipleImages;
            counter.hidden = !hasMultipleImages;
        }

        prevButton.addEventListener("click", () => {
            showPreview(
                (currentPreview - 1 + previewImages.length)
                % previewImages.length
            );
        });

        nextButton.addEventListener("click", () => {
            showPreview(
                (currentPreview + 1) % previewImages.length
            );
        });

        showPreview(0);


        name.textContent = material.name;
        description.textContent = material.description || "";

        // ダウンロードボタンの処理
        downloadButton.addEventListener("click", () => {
            const link = document.createElement("a");

            link.href = material.file;
            link.download = material.file.split("/").pop();

            document.body.appendChild(link);
            link.click();
            link.remove();
        });

        // 詳細情報を表示
        content.hidden = false;
        message.textContent = "";

    } catch (error) {
        console.error(error);

        message.textContent =
            "素材を読み込めませんでした。サーバーの起動とJSONの内容を確認してください。";
    }
}


/* =========================
   ページを判定して実行
========================= */

// トップページなら一覧を表示
if (document.getElementById("material-list")) {
    initHomePage();
}

// 詳細ページなら素材情報を表示
if (document.getElementById("detail-content")) {
    initDetailPage();
}
