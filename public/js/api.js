/**
 * CENTRAL EVENT 2027 — RESILIENT API CLIENT
 * Hardened communications with automatic JSON parsing, timeouts, and error alerts.
 */

const CE_API = {
  _cache: new Map(), // url -> { data, timestamp }
  _inFlight: new Map(), // url -> Promise

  clearCache() {
    this._cache.clear();
  },

  async fetchWithTimeout(url, options = {}, timeout = 12000) {
    const isGet = !options.method || options.method.toUpperCase() === 'GET';

    // Invalidate cache on mutations (POST, PUT, DELETE)
    if (!isGet) {
      this._cache.clear();
    } else {
      // 1. Check recent memory cache (TTL: 2500ms)
      const cached = this._cache.get(url);
      if (cached && (Date.now() - cached.timestamp < 2500)) {
        return cached.data;
      }

      // 2. In-flight request deduplication (share ongoing promise)
      if (this._inFlight.has(url)) {
        return await this._inFlight.get(url);
      }
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const executeFetch = async () => {
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          }
        });
        clearTimeout(id);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (isGet) {
          this._cache.set(url, { data, timestamp: Date.now() });
        }
        return data;
      } catch (err) {
        clearTimeout(id);
        if (err.name === 'AbortError') {
          throw new Error('Permintaan ke server timeout (lebih dari 12 detik).');
        }
        throw err;
      } finally {
        if (isGet) {
          this._inFlight.delete(url);
        }
      }
    };

    if (isGet) {
      const promise = executeFetch();
      this._inFlight.set(url, promise);
      return await promise;
    }

    return await executeFetch();
  },

  async getStatus(subEventId = 'safari') {
    return await this.fetchWithTimeout(`/api/status?subEventId=${encodeURIComponent(subEventId)}`);
  },

  async getOverview() {
    return await this.fetchWithTimeout('/api/overview');
  },

  async togglePos(id, subEventId) {
    const profile = Onboarding.getProfile();
    const user = profile.name ? `${profile.name} (${profile.role})` : 'Command App';
    return await this.fetchWithTimeout('/api/toggle-pos', {
      method: 'POST',
      body: JSON.stringify({ id, subEventId, user })
    });
  },

  async setSimulasi(time) {
    return await this.fetchWithTimeout('/api/simulasi', {
      method: 'POST',
      body: JSON.stringify({ time: time || null })
    });
  },

  async saveRundownItem(subEventId, item) {
    return await this.fetchWithTimeout('/api/rundown/save', {
      method: 'POST',
      body: JSON.stringify({ subEventId, item })
    });
  },

  async deleteRundownItem(subEventId, itemId) {
    return await this.fetchWithTimeout('/api/rundown/delete', {
      method: 'POST',
      body: JSON.stringify({ subEventId, itemId })
    });
  },

  async saveStation(subEventId, item) {
    return await this.fetchWithTimeout('/api/stations/save', {
      method: 'POST',
      body: JSON.stringify({ subEventId, item })
    });
  },

  async deleteStation(subEventId, stationId) {
    return await this.fetchWithTimeout('/api/stations/delete', {
      method: 'POST',
      body: JSON.stringify({ subEventId, stationId })
    });
  },

  async updateEventMeta(subEventId, metadata) {
    return await this.fetchWithTimeout('/api/event/update', {
      method: 'POST',
      body: JSON.stringify({ subEventId, metadata })
    });
  },

  async resetEvent(subEventId) {
    return await this.fetchWithTimeout('/api/event/reset', {
      method: 'POST',
      body: JSON.stringify({ subEventId })
    });
  },

  async askAi(question, subEventId) {
    return await this.fetchWithTimeout('/api/ask-ai', {
      method: 'POST',
      body: JSON.stringify({ question, subEventId })
    }, 25000); // Allow 25s for AI thinking
  },

  async getDriveFolders() {
    return await this.fetchWithTimeout('/api/drive/folders');
  },

  async getDriveSubfolder(folderId, name = '') {
    return await this.fetchWithTimeout(`/api/drive/subfolder/${encodeURIComponent(folderId)}?name=${encodeURIComponent(name)}`);
  },

  async uploadDriveFile(payload) {
    return await this.fetchWithTimeout('/api/drive/upload', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, 60000); // 60s timeout for large uploads
  },

  async getSpreadsheets(subEventId = null) {
    const url = subEventId ? `/api/spreadsheets?subEventId=${encodeURIComponent(subEventId)}` : '/api/spreadsheets';
    return await this.fetchWithTimeout(url);
  },

  async getSubEventDrive(subEventId) {
    return await this.fetchWithTimeout(`/api/drive/subevent/${encodeURIComponent(subEventId)}`);
  },

  async linkSubEventDrive(subEventId, urlOrId) {
    return await this.fetchWithTimeout('/api/drive/subevent/link', {
      method: 'POST',
      body: JSON.stringify({ subEventId, urlOrId })
    });
  },

  async addSpreadsheet(payload) {
    return await this.fetchWithTimeout('/api/spreadsheets/add', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateSpreadsheet(id, data) {
    try {
      return await this.fetchWithTimeout(`/api/spreadsheets/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (e) {
      return await this.fetchWithTimeout('/api/spreadsheets/update', {
        method: 'POST',
        body: JSON.stringify({ id, ...data })
      });
    }
  },

  async deleteSpreadsheet(id) {
    try {
      return await this.fetchWithTimeout(`/api/spreadsheets/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      return await this.fetchWithTimeout('/api/spreadsheets/delete', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
    }
  },

  async getCanvaLinks(subEventId = null) {
    const url = subEventId ? `/api/canva/${encodeURIComponent(subEventId)}` : '/api/canva';
    return await this.fetchWithTimeout(url);
  },

  async addCanvaLink(payload) {
    return await this.fetchWithTimeout('/api/canva/add', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateCanvaLink(id, data) {
    try {
      return await this.fetchWithTimeout(`/api/canva/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (e) {
      return await this.fetchWithTimeout('/api/canva/update', {
        method: 'POST',
        body: JSON.stringify({ id, ...data })
      });
    }
  },

  async deleteCanvaLink(id) {
    try {
      return await this.fetchWithTimeout(`/api/canva/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      return await this.fetchWithTimeout('/api/canva/delete', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
    }
  },

  async getProgress(subEventId = null) {
    const url = subEventId ? `/api/progress/${encodeURIComponent(subEventId)}` : '/api/progress';
    return await this.fetchWithTimeout(url);
  },

  async updateProgress(payload) {
    return await this.fetchWithTimeout('/api/progress/update', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async toggleMilestone(payload) {
    return await this.fetchWithTimeout('/api/progress/toggle-milestone', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
