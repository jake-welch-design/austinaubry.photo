/*
Developed by Jake Welch
http://www.jakewelch.design/
19 February 2024

Austin Aubry photography portfolio, landing page pixelation animation 
*/

// Image handling variables
let imgs = [];
let imgSizes = [];
let numImages = 12; // Update this for however many images you have

// Layout variables
let imgsPerRow;
let desktopRow = 12; // Update for however many images you want in a row on desktop (currently you have all images on one, so it should match numImages)
let mobileRow = 4; // Update for how many you want on one row on mobile.

let padding;
let paddingDesktop = 20; // Spacing in pixels between images on desktop
let paddingMobile = 10; // Spacing in pixels between images on mobile

// Pixelation animation variables
let res = 1;
let currentResSpeed = 0.1;
let maxResSpeed = 2; // Increasing this makes the pixelation animation faster (I wouldn't go higher than 20)
let maxRes;

// Image links (make sure to keep the order of the photos the same as the order of images.)
let imageLinks = [
  "https://austinaubry.photo/analog-reflections-in-japan-1",  // 0.jpg link
  "https://austinaubry.photo/census",                         // 1.jpg link
  "https://austinaubry.photo/impressions-1",                  // 2.jpg link
  "https://austinaubry.photo/consolations-in-color",          // 3.jpg link
  "https://austinaubry.photo/marc-jacobs-ss23",               // 4.jpg link
  "https://austinaubry.photo/marc-jacobs-fw23",               // 5.jpg link
  "https://austinaubry.photo/hermes-aw23-1",                  // 6.jpg link
  "https://austinaubry.photo/hypebeast-salomon-sportstyle-1", // 7.jpg link
  "https://austinaubry.photo/hypebeast-tommy-hilfiger",       // 8.jpg link
  "https://austinaubry.photo/properties",                     // 9.jpg link
  "https://austinaubry.photo/musicians-1",                   // 10.jpg link
  "https://austinaubry.photo/events-1"                       // 11.jpg link
];
let imagePositions = [];


function preload() {
  for (let i = 0; i < numImages; i++) {
    imgs[i] = loadImage(`images/${i}.jpg`);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateLayout();
}

function draw() {
  background(255);
  if (currentResSpeed < maxResSpeed) {
    currentResSpeed += 1;
  }
  if (res < maxRes) {
    res += currentResSpeed;
    res = min(res, maxRes);
  }
  let xOffset = padding;
  let rowHeights = [];
  let currentRow = 0;
  imgSizes.forEach(({ width, height }, i) => {
    if (i % imgsPerRow === 0 && i !== 0) {
      currentRow++;
      xOffset = padding;
      rowHeights[currentRow] = height;
    } else {
      if (height > (rowHeights[currentRow] || 0)) {
        rowHeights[currentRow] = height;
      }
    }
    xOffset += width + padding;
  });

  let totalGridHeight = rowHeights.reduce((acc, curr) => acc + curr, 0) + padding * (rowHeights.length - 1);
  let yOffset = (windowHeight - totalGridHeight) / 2;
  xOffset = padding;
  currentRow = 0;
  
  let accumulatedHeight = yOffset;
  imgSizes.forEach(({ width, height }, i) => {
    if (i % imgsPerRow === 0 && i !== 0) {
      currentRow++;
      xOffset = padding; // Reset xOffset for a new row
      accumulatedHeight += rowHeights[currentRow - 1] + padding; 
    }

    let dynamicLayer = createGraphics(res, (res / width) * height);
    dynamicLayer.clear();
    dynamicLayer.image(imgs[i], 0, 0, dynamicLayer.width, dynamicLayer.height);

    let staticLayer = createGraphics(width, height);
    staticLayer.clear();
    staticLayer.noSmooth();
    staticLayer.image(dynamicLayer, 0, 0, staticLayer.width, staticLayer.height);

    image(staticLayer, xOffset, accumulatedHeight);

    imagePositions.push({ x: xOffset, y: yOffset, width, height, link: imageLinks[i] });
    xOffset += width + padding;

    let isHovering = false;

    for (let { x, y, width, height } of imagePositions) {
      if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
        cursor(HAND); 
        isHovering = true;
        break; 
      }
    }

    if (!isHovering) {
      cursor(ARROW);
    }

    dynamicLayer.remove();
    staticLayer.remove();
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLayout();
}

function calculateLayout() {
  imgsPerRow = windowWidth < 860 ? mobileRow : desktopRow;
  padding = windowWidth < 860 ? paddingMobile : paddingDesktop;

  let totalPadding = padding * (imgsPerRow + 1);
  let totalAvailableWidth = windowWidth - totalPadding;
  let dynamicWidth = totalAvailableWidth / imgsPerRow;

  maxRes = dynamicWidth;

  let xOffset = padding;
  let yOffset = 0; 
  let rowHeight = 0;
  imagePositions = []; 

  imgs.forEach((img, index) => {
    if (index % imgsPerRow === 0 && index !== 0) { 
      yOffset += rowHeight + padding;
      rowHeight = 0; 
      xOffset = padding; 
    }

    let aspectRatio = img.width / img.height;
    let dynamicHeight = dynamicWidth / aspectRatio;
    imgSizes[index] = { width: dynamicWidth, height: dynamicHeight }; 

    rowHeight = max(rowHeight, dynamicHeight); 

    imagePositions[index] = { x: xOffset, y: yOffset, width: dynamicWidth, height: dynamicHeight, link: imageLinks[index] };

    xOffset += dynamicWidth + padding; 
  });

  let totalContentHeight = yOffset + rowHeight; 
  let startYOffset = (windowHeight - totalContentHeight) / 2; 

  imagePositions.forEach((pos, index) => {
    imagePositions[index].y += startYOffset;
  });
}

function mousePressed() {
  for (let { x, y, width, height, link } of imagePositions) {
    if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
      window.open(link, "_blank");
      break; 
    }
  }
}

function touchStarted() {
  let yOffsetCalc = yOffset; 
  for (let i = 0; i < imagePositions.length; i++) {
    let { x, y, width, height, link } = imagePositions[i];
    if (mouseX >= x && mouseX <= x + width && mouseY >= yOffsetCalc && mouseY <= yOffsetCalc + height) {
      window.open(link, "_blank");
      return false; 
    }
    if (i % columns === columns - 1) { 
      yOffsetCalc += rowHeights[Math.floor(i / columns)] + padding;
    }
  }
  return false;
}
