/*
Developed by Jake Welch
http://www.jakewelch.design/
Last updated March 27 2024

Austin Aubry photography portfolio, landing page pixelation animation 
*/

///////////////////////////////
// START OF GLOBAL VARIABLES //
///////////////////////////////

// Image handling variables
let imgs = [];
let imgSizes = [];
let numImages = 12; // Update this for however many images you have

// Layout variables
let imgsPerRow;
let desktopRow = 12; // Update for however many images you want in a row on desktop (currently you have all images on one, so it should match numImages)
let mobileRow = 4; // Update for how many you want on one row on mobile.

let padding;
let paddingDesktop = 20; // Spacing in px between images on desktop
let paddingMobile = 10; // Spacing in px between images on mobile

// Pixelation animation variables
let lowestSpeed = 0.3; // For control over the randomness
let highestSpeed = 3; // For control over the randomness
let maxResThreshold = 0.2; //if 30% of max res reached, then set image to full res
let fps = 8; //frame rate 
let staggerEvery = 3; //effects stagger every 3rd image, can be adjusted

let maxResSpeed = highestSpeed; 
let res = [];
let currentResSpeeds = [];
let maxRes;

// Image raise animation variables
let imgRaiseAmt = 20; // Amount to raise images by on hover (in pixels)
let imgRaiseSpeed = 0.8; // Speed of the raise effect (higher value is faster, lower is slower)

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
  "https://austinaubry.photo/musicians-1",                    // 10.jpg link
  "https://austinaubry.photo/events-1"                        // 11.jpg link
];
let imagePositions = [];

//////////////////////////////
// END OF GLOBAL VARIABLES //
/////////////////////////////

// Preload all the images
function preload() {
  for (let i = 0; i < numImages; i++) {
    imgs[i] = loadImage(`images/${i}.jpg`); // Loading images remains the same
    res[i] = 1; // Initial resolution
  }

  // Initialize speeds for each of the three patterns
  let speeds = [random(lowestSpeed, highestSpeed), random(lowestSpeed, highestSpeed), random(lowestSpeed, highestSpeed)];

  // Assign speeds to images based on their modulo 3 result
  for (let i = 0; i < numImages; i++) {
    currentResSpeeds[i] = speeds[i % staggerEvery]; // Assigns one of the three speeds based on the image index
  }
}

// Initialize the canvas, all the layout & image sizing
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(8);
  calculateLayout();
}

// Draw the display items
function draw() {
  background(255);

  // Variables to manage rows and positioning
  let xOffset = padding;
  let rowHeights = [];
  let currentRow = 0;
  let isHoveringOverAnyImage = false; // Track if the cursor is hovering over any image

  // Reset xOffset for drawing logic
  xOffset = padding;

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

    // Adjust xOffset for the next image
    xOffset += width + padding;
  });

  // Calculate the total height of the grid
  let totalGridHeight = rowHeights.reduce((acc, curr) => acc + curr, 0) + padding * (rowHeights.length - 1);

  // Adjust yOffset to center the grid vertically
  let yOffset = (windowHeight - totalGridHeight) / 2;

  // Reset xOffset and currentRow for actual drawing
  xOffset = padding;
  currentRow = 0;
  let accumulatedHeight = yOffset;

  imgSizes.forEach(({ width, height }, i) => {
    if (i % imgsPerRow === 0 && i !== 0) {
      currentRow++;
      xOffset = padding;
      accumulatedHeight += rowHeights[currentRow - 1] + padding;
    }

  // Draw the images with random pixelation speeds
   if (currentResSpeeds[i] < maxResSpeed) {
      currentResSpeeds[i] += lowestSpeed;
    }

    if (res[i] < maxRes) {
      res[i] += currentResSpeeds[i];
      if (res[i] / maxRes >= maxResThreshold) {
        res[i] = maxRes;
      }
    }

    let dynamicLayer = createGraphics(Math.ceil(res[i]), Math.ceil((res[i] / imgs[i].width) * imgs[i].height));
    dynamicLayer.image(imgs[i], 0, 0, dynamicLayer.width, dynamicLayer.height);

    let staticLayer = createGraphics(width, height);
    staticLayer.clear();
    staticLayer.noSmooth();
    staticLayer.image(dynamicLayer, 0, 0, width, height);

    // Hover effect logic (as previously described)
    let isHovering = mouseX >= imagePositions[i].x && mouseX <= imagePositions[i].x + width && 
                     mouseY >= imagePositions[i].y && mouseY <= imagePositions[i].y + height && 
                     windowWidth >= 860; // Applies only for desktop

    if (isHovering) {
      isHoveringOverAnyImage = true;
      if (imagePositions[i].hoverOffset === undefined) imagePositions[i].hoverOffset = 0;
      imagePositions[i].hoverOffset = lerp(imagePositions[i].hoverOffset, imgRaiseAmt, imgRaiseSpeed);
    } else {
      if (imagePositions[i].hoverOffset === undefined) imagePositions[i].hoverOffset = 0;
      imagePositions[i].hoverOffset = lerp(imagePositions[i].hoverOffset, 0, imgRaiseSpeed);
    }

    let adjustedYOffset = accumulatedHeight - (imagePositions[i].hoverOffset || 0);

    // Draw the image with adjusted yOffset
    image(staticLayer, xOffset, adjustedYOffset);

    xOffset += width + padding;

    dynamicLayer.remove();
    staticLayer.remove();
  });

  // Update cursor based on hovering state
  if (isHoveringOverAnyImage) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}



// Window resizing function
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLayout();
}

// Function to calculate layout parameters for desktop & mobile
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

// Link clicking for desktop
function mousePressed() {
  for (let { x, y, width, height, link } of imagePositions) {
    if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
      window.location.href = link;
      break;
    }
  }
}

// Link clicking for mobile
function touchStarted() {
  console.log("touchStarted called"); // Check if function is called
  if (touches.length > 0) {
    const touchX = touches[0].x;
    const touchY = touches[0].y;
    console.log("Touch coordinates:", touchX, touchY); // Log touch coordinates

    for (let i = 0; i < imagePositions.length; i++) {
      const { x, y, width, height, link } = imagePositions[i];
      if (touchX >= x && touchX <= x + width && touchY >= y && touchY <= y + height) {
        console.log("Opening link for image:", i); // Log which image is being clicked
        window.location.href = link;
        return false;
      }
    }
  }
  return false;
}
