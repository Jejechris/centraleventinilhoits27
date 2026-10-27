/**
 * CENTRAL EVENT 2027 — RESILIENT API CLIENT
 * Hardened communications with automatic JSON parsing, timeouts, and error alerts.
 */

const CE_API = {
  async fetchWithTimeout(url, options = {}, timeout = 12000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
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
      return await response.json();
    } catch (err) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('Permintaan ke server timeout (lebih dari 12 detik).');
      }
      throw err;
    }
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

  async deleteSpreadsheet(id) {
    return await this.fetchWithTimeout('/api/spreadsheets/delete', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
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
