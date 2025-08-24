/*
  Development-only mock API for workflows
  - Exposes REST endpoints under /mock-api/workflows
  - Persists each workflow as a separate JSON file in src/data/workflows
  - Auto-seeds from src/data/mock-workflows.json if the directory is empty

  This file is loaded by Create React App's dev server when `npm start` runs.
*/

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const WORKFLOWS_DIR = path.join(DATA_DIR, 'workflows');
const SEED_FILE = path.join(DATA_DIR, 'mock-workflows.json');

function ensureDir() {
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });
  }
}

function readJson(filePath) {
  const buf = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(buf);
}

function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
}

function listWorkflowFiles() {
  ensureDir();
  const entries = fs.readdirSync(WORKFLOWS_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith('.json')).map((e) => e.name);
}

function getWorkflowPath(id) {
  // Use the workflow id as the filename to keep mapping consistent
  return path.join(WORKFLOWS_DIR, `${id}.json`);
}

function seedIfEmpty() {
  ensureDir();
  const files = listWorkflowFiles();
  if (files.length === 0 && fs.existsSync(SEED_FILE)) {
    try {
      const seed = readJson(SEED_FILE);
      const arr = Array.isArray(seed.workflows) ? seed.workflows : [];
      for (const w of arr) {
        const filePath = getWorkflowPath(w.id);
        try {
          writeJson(filePath, w);
        } catch (err) {
          // If a particular file fails, continue with others
          // eslint-disable-next-line no-console
          console.warn('Failed to seed workflow file:', filePath, err);
        }
      }
      // eslint-disable-next-line no-console
      console.log(`Seeded ${arr.length} workflow files from mock-workflows.json`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to seed workflows from mock-workflows.json:', err);
    }
  }
}

function safeReadWorkflow(id) {
  const filePath = getWorkflowPath(id);
  if (!fs.existsSync(filePath)) return null;
  try {
    return readJson(filePath);
  } catch (err) {
    return null;
  }
}

function generateId() {
  // Simple time-based id; ensures uniqueness during dev
  return `wf_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

module.exports = function setup(app) {
  // Use the dev server's Express instance to add endpoints
  const express = require('express');
  app.use(express.json({ limit: '2mb' }));

  ensureDir();
  seedIfEmpty();

  // Health check
  app.get('/mock-api/health', (req, res) => {
    res.json({ ok: true });
  });

  // List workflows
  app.get('/mock-api/workflows', (req, res) => {
    try {
      const files = listWorkflowFiles();
      const workflows = files.map((f) => readJson(path.join(WORKFLOWS_DIR, f)));
      // Sort by updated_at desc if present
      workflows.sort((a, b) => {
        const au = a?.updated_at || a?.created_at || '';
        const bu = b?.updated_at || b?.created_at || '';
        return au > bu ? -1 : au < bu ? 1 : 0;
      });
      res.json(workflows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list workflows', details: String(err) });
    }
  });

  // Read workflow by id
  app.get('/mock-api/workflows/:id', (req, res) => {
    try {
      const workflow = safeReadWorkflow(req.params.id);
      if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
      res.json(workflow);
    } catch (err) {
      res.status(500).json({ error: 'Failed to read workflow', details: String(err) });
    }
  });

  // Create workflow
  app.post('/mock-api/workflows', (req, res) => {
    try {
      const now = new Date().toISOString();
      let id = req.body?.id || generateId();
      // Ensure unique filename
      while (fs.existsSync(getWorkflowPath(id))) {
        id = generateId();
      }

      const workflow = {
        id,
        name: req.body?.name || 'Untitled Workflow',
        description: req.body?.description || '',
        status: req.body?.status || 'draft',
        created_at: now,
        updated_at: now,
        last_execution: null,
        execution_status: 'pending',
        nodes: Array.isArray(req.body?.nodes) ? req.body.nodes : [],
        edges: Array.isArray(req.body?.edges) ? req.body.edges : [],
        viewport: req.body?.viewport || { x: 0, y: 0, zoom: 1 },
      };

      writeJson(getWorkflowPath(id), workflow);
      res.status(201).json(workflow);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create workflow', details: String(err) });
    }
  });

  // Update workflow
  app.put('/mock-api/workflows/:id', (req, res) => {
    try {
      const existing = safeReadWorkflow(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Workflow not found' });

      const updated = {
        ...existing,
        ...req.body,
        id: existing.id, // never change id
        updated_at: new Date().toISOString(),
      };

      writeJson(getWorkflowPath(existing.id), updated);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update workflow', details: String(err) });
    }
  });

  // Delete workflow
  app.delete('/mock-api/workflows/:id', (req, res) => {
    try {
      const filePath = getWorkflowPath(req.params.id);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Workflow not found' });
      fs.unlinkSync(filePath);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete workflow', details: String(err) });
    }
  });

  // Execute workflow (mock)
  app.post('/mock-api/workflows/:id/execute', (req, res) => {
    try {
      const existing = safeReadWorkflow(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Workflow not found' });

      existing.last_execution = new Date().toISOString();
      existing.execution_status = Math.random() > 0.2 ? 'success' : 'failed';
      existing.updated_at = existing.last_execution;

      writeJson(getWorkflowPath(existing.id), existing);

      const success = existing.execution_status === 'success';
      res.json({
        success,
        message: success ? 'Workflow execution started successfully' : 'Workflow execution failed: Invalid configuration or connection error',
        executionId: success ? `exec_${Date.now()}` : undefined,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to execute workflow', details: String(err) });
    }
  });
};

