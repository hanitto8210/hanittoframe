
const originalImage = document.getElementById("originalImage");
const colorCanvas = document.getElementById("colorCanvas");
const lineColor = document.getElementById("lineColor");
const downloadButton = document.getElementById("downloadColorImage");

if (originalImage && colorCanvas && lineColor && downloadButton) {
    const ctx = colorCanvas.getContext("2d");

    // 詳細ページのURLから素材IDを取得
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    async function loadMaterial() {
        try {
            const response = await fetch("materials.json");

            if (!response.ok) {
                throw new Error("素材データを読み込めませんでした。");
            }

            const materials = await response.json();

            const material = materials.find(
                item => String(item.id) === id
            );

            if (!material) {
                throw new Error("素材が見つかりません。");
            }

            originalImage.onload = () => {
                colorCanvas.width = originalImage.naturalWidth;
                colorCanvas.height = originalImage.naturalHeight;

                changeColor();
            };

            originalImage.onerror = () => {
                alert("素材画像を読み込めませんでした。");
            };

            originalImage.src = material.file || material.image;
        } catch (error) {
            console.error(error);
            alert("素材の読み込みに失敗しました。");
        }
    }

    // 黒い線を選択した色に変更
    function changeColor() {
        const width = colorCanvas.width;
        const height = colorCanvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(originalImage, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        const hex = lineColor.value;
        const red = parseInt(hex.slice(1, 3), 16);
        const green = parseInt(hex.slice(3, 5), 16);
        const blue = parseInt(hex.slice(5, 7), 16);

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const alpha = pixels[i + 3];

            // 透明部分は変更しない
            if (alpha === 0) {
                continue;
            }

            // 黒に近い部分だけを色変更する
            const brightness = (r + g + b) / 3;

            if (brightness < 100) {
                pixels[i] = red;
                pixels[i + 1] = green;
                pixels[i + 2] = blue;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // 色を変えたらすぐにプレビュー更新
    lineColor.addEventListener("input", changeColor);

    // PNGでダウンロード
    downloadButton.addEventListener("click", () => {
        colorCanvas.toBlob(blob => {
            if (!blob) {
                alert("PNGを作成できませんでした。");
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = (id || "material") + "-color.png";

            link.click();

            URL.revokeObjectURL(url);
        }, "image/png");
    });

    loadMaterial();
}
