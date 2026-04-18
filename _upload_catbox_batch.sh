#!/bin/bash
# 批量上传产品图片到 Catbox

BASE="/Users/huangcanlin/mok-furniture/product-images"
OUT="/Users/huangcanlin/mok-furniture/catbox_mok.json"

declare -A IMAGES=(
  ["MR01_1.jpg"]="products/MR01_1.jpg"
  ["MR01_2.jpg"]="products/MR01_2.jpg"
  ["MR01_3.jpg"]="products/MR01_3.jpg"
  ["Y06A_1.jpg"]="products/Y06A_1.jpg"
  ["Y06A_2.jpg"]="products/Y06A_2.jpg"
  ["Y06A_3.jpg"]="products/Y06A_3.jpg"
  ["Y06A_4.jpg"]="products/Y06A_4.jpg"
  ["Y08B_1.jpg"]="products/Y08B_1.jpg"
  ["Y08B_2.jpg"]="products/Y08B_2.jpg"
  ["logo.jpg"]="products/logo.jpg"
)

echo "{" > "$OUT"

first=true
for local_file in "${!IMAGES[@]}"; do
  r2_key="${IMAGES[$local_file]}"
  full_path="${BASE}/${local_file}"
  
  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> "$OUT"
  fi
  
  echo -n "  \"/${r2_key}\": " >> "$OUT"
  
  echo "Uploading ${local_file}..."
  url=$(curl -s -F "reqtype=fileupload" -F "fileToUpload=@${full_path}" https://catbox.moe/user/api.php)
  
  if echo "$url" | grep -q "https://"; then
    echo "  \"${url}\"" >> "$OUT"
    echo "  → ${url}"
  else
    echo "  null" >> "$OUT"
    echo "  ✗ Failed: ${url}"
  fi
  
  sleep 2
done

echo "" >> "$OUT"
echo "}" >> "$OUT"

echo "\nDone. Results in ${OUT}"
