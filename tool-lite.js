document.querySelectorAll("[data-lite-tool]").forEach((tool) => {
  const input = tool.querySelector("input[type=file]");
  const canvas = tool.querySelector("canvas");
  const button = tool.querySelector("button");
  const result = tool.querySelector(".result");
  const width = Number(tool.dataset.width);
  const height = Number(tool.dataset.height);
  let bitmap = null;

  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 25_000_000) {
      result.textContent = "Выберите JPG, PNG или WebP до 25 МБ.";
      return;
    }
    bitmap?.close?.();
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    const ratio = Math.min(width / bitmap.width, height / bitmap.height);
    const drawWidth = bitmap.width * ratio;
    const drawHeight = bitmap.height * ratio;
    context.drawImage(bitmap, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    result.textContent = `${bitmap.width}×${bitmap.height} → ${width}×${height}. Файл обработан локально.`;
    button.disabled = false;
  });

  button.addEventListener("click", () => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `kadrmarket-${width}x${height}.jpg`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 2_000);
    }, "image/jpeg", .9);
  });
});
