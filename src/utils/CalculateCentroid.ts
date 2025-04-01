export function calculateCentroid(coordinates: number[][][]): [number, number] {
    const polygon = coordinates[0]; // Get the first ring of the polygon
    let area = 0;
    let centroidX = 0;
    let centroidY = 0;
  
    for (let i = 0; i < polygon.length - 1; i++) {
      const [x0, y0] = polygon[i];
      const [x1, y1] = polygon[i + 1];
      const a = x0 * y1 - x1 * y0;
      area += a;
      centroidX += (x0 + x1) * a;
      centroidY += (y0 + y1) * a;
    }
  
    area *= 0.5;
    centroidX /= (6 * area);
    centroidY /= (6 * area);
  
    return [centroidX, centroidY];
  }