const fs = require("fs");
const path = require("path");

function cleanPath(p) {
  if (!p) return "";
  return p.replace(/^\.\.\//, "/").replace(/^\.\//, "/");
}

function parseHTML(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  
  // Extract Title
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i) || content.match(/<h1>([^<]+)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, ".html");
  
  // Slug
  const slug = path.basename(filePath, ".html")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Company (Usually first word of title)
  const company = title.split(" ")[0];

  // Price
  const priceMatch = content.match(/<p class="price">([^<]+)<\/p>/i);
  let priceStr = priceMatch ? priceMatch[1] : "0";
  priceStr = priceStr.replace(/[^0-9]/g, "");
  const price = parseInt(priceStr, 10) || 0;

  // Description
  const descMatch = content.match(/<p class="desc">([\s\S]*?)<\/p>/i);
  const description = descMatch ? descMatch[1].trim().replace(/\s+/g, " ") : "";

  // Main Product Image
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"[^>]*id="slider-img"/i) || content.match(/<img[^>]+id="slider-img"[^>]+src="([^"]+)"/i);
  const mainImage = imgMatch ? cleanPath(imgMatch[1]) : "";

  // Key Features
  const featuresList = [];
  const featuresSectionMatch = content.match(/<h2>Key Features<\/h2>\s*<ul>([\s\S]*?)<\/ul>/i);
  if (featuresSectionMatch) {
    const liMatches = featuresSectionMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/gi);
    for (const match of liMatches) {
      featuresList.push(match[1].trim().replace(/\s+/g, " "));
    }
  }

  // YouTube Link
  const ytMatch = content.match(/<iframe[^>]+src="([^"]+)"/i);
  let youtubeVideo = ytMatch ? ytMatch[1] : "";
  // standardise youtube embed url if needed, but let's keep it as is
  if (youtubeVideo.startsWith("//")) {
    youtubeVideo = "https:" + youtubeVideo;
  }

  // Specifications
  const specifications = [];
  const specsSectionMatch = content.match(/<div class="specs-table[^"]*">([\s\S]*?)<\/div>\s*<\/section>/i) || content.match(/<div class="specs-table[^"]*">([\s\S]*?)<\/div>/i);
  if (specsSectionMatch) {
    const itemMatches = specsSectionMatch[1].matchAll(/<div class="spec-item[^"]*">\s*<span>([^<]+)<\/span>\s*<span>([^<]+)<\/span>\s*<\/div>/gi);
    for (const match of itemMatches) {
      specifications.push({
        key: match[1].trim(),
        value: match[2].trim()
      });
    }
  }

  // Detail Sections (spec-details)
  const detailSections = [];
  const detailsSectionMatch = content.match(/<section class="spec-details"[^>]*>([\s\S]*?)<\/section>/i);
  if (detailsSectionMatch) {
    const blockMatches = detailsSectionMatch[1].matchAll(/<div class="spec-block[^"]*">([\s\S]*?)<\/div>\s*<\/div>/gi);
    for (const match of blockMatches) {
      const blockHTML = match[0];
      const imgM = blockHTML.match(/<img[^>]+src="([^"]+)"/i);
      const titleM = blockHTML.match(/<h2>([^<]+)<\/h2>/i);
      const descM = blockHTML.match(/<p>([\s\S]*?)<\/p>/i);
      if (titleM && descM) {
        detailSections.push({
          title: titleM[1].trim(),
          description: descM[1].trim().replace(/\s+/g, " "),
          image: imgM ? cleanPath(imgM[1]) : ""
        });
      }
    }
  }

  // Design Sections
  const designSections = [];
  const designSectionMatch = content.match(/<section class="design-section"[^>]*>([\s\S]*?)<\/section>/i);
  if (designSectionMatch) {
    const blockMatches = designSectionMatch[1].matchAll(/<div class="design-block[^"]*">([\s\S]*?)<\/div>\s*<\/div>/gi);
    for (const match of blockMatches) {
      const blockHTML = match[0];
      const imgM = blockHTML.match(/<img[^>]+src="([^"]+)"/i);
      const titleM = blockHTML.match(/<h2>([^<]+)<\/h2>/i);
      const descM = blockHTML.match(/<p>([\s\S]*?)<\/p>/i);
      if (titleM && descM) {
        designSections.push({
          title: titleM[1].trim(),
          description: descM[1].trim().replace(/\s+/g, " "),
          image: imgM ? cleanPath(imgM[1]) : ""
        });
      }
    }
  }

  // Connectivity / Usage Sections
  const connectivity = [];
  const connSectionMatch = content.match(/<section class="(?:connectivity-section|usage-section)"[^>]*>([\s\S]*?)<\/section>/i);
  if (connSectionMatch) {
    const rowMatches = connSectionMatch[1].matchAll(/<div class="connect-row[^"]*">\s*<span>([^<]+)<\/span>\s*<p>([\s\S]*?)<\/p>\s*<\/div>/gi);
    for (const match of rowMatches) {
      connectivity.push({
        title: match[1].trim(),
        description: match[2].trim().replace(/\s+/g, " ")
      });
    }
  }

  // Find associated JS slider file
  const jsMatch = content.match(/<script src="([^"]+\.js)"/i);
  let sliderImages = [];
  if (jsMatch) {
    const jsPath = path.join(path.dirname(filePath), jsMatch[1]);
    if (fs.existsSync(jsPath)) {
      const jsContent = fs.readFileSync(jsPath, "utf8");
      const imgArrMatch = jsContent.match(/const\s+images\s*=\s*\[([\s\S]*?)\];/i);
      if (imgArrMatch) {
        sliderImages = imgArrMatch[1]
          .split(",")
          .map(s => s.trim().replace(/['"`]/g, ""))
          .filter(s => s.length > 0)
          .map(cleanPath);
      }
    }
  }

  return {
    title,
    slug,
    company,
    price,
    image: mainImage,
    sliderImages,
    description,
    features: featuresList,
    specifications,
    detailSections,
    designSections,
    connectivity,
    youtubeVideo
  };
}

// Parse Lenses
const lensDir = "/Users/sach_kak/Desktop/Web Development/Photograph web/Lens";
const lenses = fs.readdirSync(lensDir)
  .filter(f => f.endsWith(".html"))
  .map(f => {
    const data = parseHTML(path.join(lensDir, f));
    data.category = "lens";
    // default subCategory
    data.subCategory = "zoom"; 
    if (data.title.toLowerCase().includes("prime") || data.title.toLowerCase().includes("50mm") || data.title.toLowerCase().includes("macro")) {
      data.subCategory = "prime";
    }
    return data;
  });

console.log("=== LENSES ===");
console.log(JSON.stringify(lenses, null, 2));

// Parse Tripods
const tripodDir = "/Users/sach_kak/Desktop/Web Development/Photograph web/Tripod";
const tripods = fs.readdirSync(tripodDir)
  .filter(f => f.endsWith(".html"))
  .map(f => {
    const data = parseHTML(path.join(tripodDir, f));
    data.category = "tripod";
    data.subCategory = data.title.toLowerCase().includes("travel") ? "travel" : "video";
    return data;
  });

console.log("=== TRIPODS ===");
console.log(JSON.stringify(tripods, null, 2));

// Write to files
fs.writeFileSync("/Users/sach_kak/Desktop/Web Development/Photograph web/Data/lens.js", "module.exports = " + JSON.stringify(lenses, null, 2) + ";");
fs.writeFileSync("/Users/sach_kak/Desktop/Web Development/Photograph web/Data/tripod.js", "module.exports = " + JSON.stringify(tripods, null, 2) + ";");
console.log("Successfully generated Data/lens.js and Data/tripod.js!");
