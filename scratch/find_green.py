from PIL import Image

# Load the screenshot
img = Image.open("screenshot_sim_now.png")
width, height = img.size

# Find all green pixels (low red, high green, low blue)
green_pixels = []
for y in range(height):
    for x in range(width):
        r, g, b, a = img.getpixel((x, y))
        # Green button color is #00FF66, which has r ~ 0, g ~ 255, b ~ 102
        if g > 200 and r < 50 and b < 150:
            green_pixels.append((x, y))

if green_pixels:
    # Calculate center of the green region
    xs = [p[0] for p in green_pixels]
    ys = [p[1] for p in green_pixels]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    center_x = (min_x + max_x) // 2
    center_y = (min_y + max_y) // 2
    print(f"Green button bounds: x({min_x}-{max_x}), y({min_y}-{max_y})")
    print(f"Pixel Center: {center_x}, {center_y}")
    
    # Map to Mac screen coordinates based on Simulator bounds: 862, 38, 1346, 1068
    # screenshot resolution is 1290x2796
    sim_x = 862
    sim_y = 38
    sim_w = 1346 - 862
    sim_h = 1068 - 38
    
    mac_x = sim_x + (center_x / 1290.0) * sim_w
    mac_y = sim_y + (center_y / 2796.0) * sim_h
    print(f"Mac Coordinate: {mac_x:.2f}, {mac_y:.2f}")
else:
    print("No green pixels found.")
