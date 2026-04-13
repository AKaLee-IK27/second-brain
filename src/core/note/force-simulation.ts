/**
 * Simple force-directed graph layout engine.
 * Replaces d3-force to avoid transitive dependency issues.
 */

export interface ForceNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface ForceEdge {
  source: string;
  target: string;
}

interface SimulationConfig {
  nodes: ForceNode[];
  edges: ForceEdge[];
  chargeStrength?: number;
  linkDistance?: number;
  linkStrength?: number;
  centerForce?: number;
  collisionRadius?: number;
  alphaDecay?: number;
  width?: number;
  height?: number;
}

export function runForceSimulation(config: SimulationConfig): ForceNode[] {
  const {
    nodes,
    edges,
    chargeStrength = -150,
    linkDistance = 80,
    linkStrength = 0.5,
    centerForce = 0.05,
    collisionRadius = 18,
    alphaDecay = 0.03,
    width = 800,
    height = 600,
  } = config;

  const centerX = width / 2;
  const centerY = height / 2;
  let alpha = 1;
  const minAlpha = 0.001;

  // Build adjacency for quick lookup
  const nodeMap = new Map<string, ForceNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Run simulation for a fixed number of ticks
  const maxTicks = 300;
  for (let tick = 0; tick < maxTicks && alpha > minAlpha; tick++) {
    // Reset forces
    for (const node of nodes) {
      node.vx = 0;
      node.vy = 0;
    }

    // Charge force (repulsion between all nodes)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 1) distSq = 1;
        const dist = Math.sqrt(distSq);
        const force = (chargeStrength * alpha) / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Link force (attraction between connected nodes)
    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) continue;

      let dx = target.x - source.x;
      let dy = target.y - source.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) dist = 1;

      const force = (dist - linkDistance) * linkStrength * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    // Center force (pull towards center)
    for (const node of nodes) {
      node.vx += (centerX - node.x) * centerForce * alpha;
      node.vy += (centerY - node.y) * centerForce * alpha;
    }

    // Collision detection (prevent overlap)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = collisionRadius * 2;
        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const fx = (dx / dist) * overlap * alpha;
          const fy = (dy / dist) * overlap * alpha;
          a.vx -= fx * 2;
          a.vy -= fy * 2;
          b.vx += fx * 2;
          b.vy += fy * 2;
        }
      }
    }

    // Apply velocities with damping
    const damping = 0.6;
    for (const node of nodes) {
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;

      // Keep within bounds
      node.x = Math.max(collisionRadius, Math.min(width - collisionRadius, node.x));
      node.y = Math.max(collisionRadius, Math.min(height - collisionRadius, node.y));
    }

    alpha *= 1 - alphaDecay;
  }

  return nodes;
}
