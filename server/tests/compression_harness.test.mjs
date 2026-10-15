import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import compression from "compression";
import http from "node:http";
import zlib from "node:zlib";

// Mock representative response datasets
const smallHealthData = {
  status: "ok",
  timestamp: "2026-10-15T12:00:00.000Z",
  uptime: 12456.78,
  version: "1.0.0",
};

const mediumEventsData = {
  success: true,
  data: Array.from({ length: 8 }).map((_, i) => ({
    id: `event-${i + 1}`,
    title: `Nexora Hackathon Prep Session ${i + 1}`,
    description: "Hands-on collaboration workshop for student builders and developers.",
    type: i % 2 === 0 ? "hackathon" : "workshop",
    startDate: "2026-10-20T10:00:00Z",
    endDate: "2026-10-20T14:00:00Z",
    location: "Campus Hub & Virtual",
    attendeeCount: 42 + i * 5,
  })),
};

const largeDashboardData = {
  success: true,
  data: {
    profile: {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      fullName: "Krati Gupta",
      username: "kratigupta",
      bio: "Full stack developer interested in distributed systems, AI collaboration, and open source.",
      department: "Computer Science and Engineering",
      year: 3,
      avatarUrl: "https://example.com/avatar.png",
      profileCompletion: 92,
      skills: ["TypeScript", "Next.js", "Express", "Prisma", "PostgreSQL", "Socket.IO", "Tailwind CSS"],
    },
    stats: { teams: 4, projects: 6, skills: 7, connections: 18 },
    recentProjects: Array.from({ length: 5 }).map((_, i) => ({
      id: `proj-${i}`,
      title: `Student Collaboration Engine ${i + 1}`,
      description: "Building scalable distributed tools for collaborative student teams worldwide.",
      status: "in_progress",
      createdAt: "2026-10-01T00:00:00Z",
    })),
    notifications: Array.from({ length: 5 }).map((_, i) => ({
      id: `notif-${i}`,
      type: "team_invite",
      title: `New Team Invitation ${i + 1}`,
      body: "You have been invited to join the Nexora Core platform team.",
      referenceType: "team",
      referenceId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      isRead: false,
      createdAt: "2026-10-14T10:00:00Z",
    })),
    activityHeatmap: Object.fromEntries(
      Array.from({ length: 180 }).map((_, i) => [
        `2026-0${1 + (i % 9)}-${String(1 + (i % 28)).padStart(2, "0")}`,
        (i * 3) % 8,
      ])
    ),
  },
};

const largeRecommendedTeammatesData = {
  success: true,
  data: {
    users: Array.from({ length: 20 }).map((_, i) => ({
      id: `user-${i + 1}`,
      fullName: `Candidate Student ${i + 1}`,
      username: `student_${i + 1}`,
      department: i % 2 === 0 ? "Computer Science and Engineering" : "Information Technology",
      year: 3,
      bio: `Passionate engineer specializing in modern web frameworks, cloud deployments, and AI match tooling #${i + 1}.`,
      avatarUrl: `https://example.com/students/avatar_${i + 1}.jpg`,
      skills: ["React", "TypeScript", "Node.js", "Python", "Docker", "Kubernetes", "PostgreSQL"],
      score: 85 - i * 2,
      matchReasons: ["Same department", "3 shared skills", "Same academic year"],
    })),
  },
};

// Helper to launch Express server on an ephemeral port
function startServer(withCompression) {
  const app = express();
  if (withCompression) {
    app.use(compression());
  }

  app.get("/api/v1/health", (_req, res) => res.json(smallHealthData));
  app.get("/api/v1/events", (_req, res) => res.json(mediumEventsData));
  app.get("/api/v1/dashboard", (_req, res) => res.json(largeDashboardData));
  app.get("/api/v1/recommended-teammates", (_req, res) => res.json(largeRecommendedTeammatesData));

  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

function fetchRaw(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path,
        method: "GET",
        headers,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const rawBuffer = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            bytes: rawBuffer.length,
            body: rawBuffer,
          });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

export const compressionMeasurements = [];

test("API Compression measurement harness compares uncompressed vs compressed responses", async (t) => {
  const uncompressed = await startServer(false);
  const compressed = await startServer(true);

  t.after(() => {
    uncompressed.server.close();
    compressed.server.close();
  });

  const endpoints = [
    { name: "Small JSON (/api/v1/health)", path: "/api/v1/health" },
    { name: "Medium JSON (/api/v1/events)", path: "/api/v1/events" },
    { name: "Large JSON (/api/v1/dashboard)", path: "/api/v1/dashboard" },
    { name: "Large JSON (/api/v1/recommended-teammates)", path: "/api/v1/recommended-teammates" },
  ];

  for (const ep of endpoints) {
    // 1. Without compression
    const rawRes = await fetchRaw(uncompressed.port, ep.path, {
      "Accept-Encoding": "gzip",
    });

    // 2. With compression
    const compRes = await fetchRaw(compressed.port, ep.path, {
      "Accept-Encoding": "gzip",
    });

    assert.equal(rawRes.statusCode, 200);
    assert.equal(compRes.statusCode, 200);

    const isCompressed = compRes.headers["content-encoding"] === "gzip";
    let decompressedJson;

    if (isCompressed) {
      const decompressedBuffer = zlib.gunzipSync(compRes.body);
      decompressedJson = JSON.parse(decompressedBuffer.toString("utf-8"));
    } else {
      decompressedJson = JSON.parse(compRes.body.toString("utf-8"));
    }

    const originalJson = JSON.parse(rawRes.body.toString("utf-8"));
    assert.deepEqual(decompressedJson, originalJson, "Decompressed payload must exactly match original");

    const reductionPercent = (
      ((rawRes.bytes - compRes.bytes) / rawRes.bytes) *
      100
    ).toFixed(2);

    compressionMeasurements.push({
      endpoint: ep.name,
      path: ep.path,
      rawBytes: rawRes.bytes,
      compressedBytes: compRes.bytes,
      reduction: `${reductionPercent}%`,
      encoding: compRes.headers["content-encoding"] || "identity (below threshold)",
      status: compRes.statusCode,
    });
  }

  console.log("\n=== MEASURED API COMPRESSION RESULTS ===");
  console.table(compressionMeasurements);
  console.log("=========================================\n");

  // Validate expectations:
  // - Small response (<1KB default threshold) is not compressed (avoids overhead)
  const healthResult = compressionMeasurements.find((m) => m.path === "/api/v1/health");
  assert.equal(healthResult.encoding, "identity (below threshold)");

  // - Large responses are gzip compressed with >60% savings
  const dashboardResult = compressionMeasurements.find((m) => m.path === "/api/v1/dashboard");
  assert.equal(dashboardResult.encoding, "gzip");
  assert.ok(parseFloat(dashboardResult.reduction) > 60);

  const teammatesResult = compressionMeasurements.find((m) => m.path === "/api/v1/recommended-teammates");
  assert.equal(teammatesResult.encoding, "gzip");
  assert.ok(parseFloat(teammatesResult.reduction) > 60);
});
