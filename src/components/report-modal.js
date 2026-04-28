/* ============================================
   CivicPulse — Report Issue Modal
   Multi-step form: Image -> Location -> Description -> Review
   Government Portal Theme
   ============================================ */

import { addIssue } from '../data/store.js';
import { CATEGORIES, getCategoryByName } from '../data/categories.js';
import { categorize } from '../data/ai-categorizer.js';
import { getCurrentPosition, reverseGeocode, searchLocation } from '../utils/geolocation.js';
import { compressImage, validateImage } from '../utils/image.js';
import { debounce, escapeHtml } from '../utils/helpers.js';
import { showToast } from './toast.js';

/**
 * Open the report issue modal
 * @param {function} onComplete - called after successful submission
 */
export function openReportModal(onComplete) {
  const modalRoot = document.getElementById('modal-root');

  let currentStep = 0;
  let formData = {
    imageUrl: '',
    location: null,
    description: '',
    category: '',
    categoryConfidence: 0,
  };

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'report-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'report-modal';

  backdrop.appendChild(modal);

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', escHandler);

  function close() {
    backdrop.style.animation = 'fade-out 200ms ease forwards';
    modal.style.animation = 'slide-down 200ms ease forwards';
    setTimeout(() => {
      backdrop.remove();
      document.removeEventListener('keydown', escHandler);
    }, 200);
  }

  function renderStep() {
    const steps = [renderImageStep, renderLocationStep, renderDescriptionStep, renderReviewStep];
    steps[currentStep]();

    if (window.lucide) {
      window.lucide.createIcons({ nodes: [modal] });
    }
  }

  // =====================
  // STEP 1: Image Upload
  // =====================
  function renderImageStep() {
    modal.innerHTML = `
      <div class="modal-header">
        <h2><i data-lucide="image" style="width:20px;height:20px;display:inline;vertical-align:middle;margin-right:8px;color:var(--primary-500);"></i> Add a Photo</h2>
        <button class="btn-icon btn-ghost" id="modal-close" aria-label="Close">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>

      <div class="stepper">
        <div class="stepper-dot active"></div>
        <div class="stepper-dot"></div>
        <div class="stepper-dot"></div>
        <div class="stepper-dot"></div>
      </div>

      <div class="modal-body">
        <div class="upload-zone ${formData.imageUrl ? 'has-image' : ''}" id="upload-zone">
          ${formData.imageUrl
            ? `<img src="${formData.imageUrl}" class="upload-preview" alt="Preview" />`
            : `
              <i data-lucide="image-plus" class="upload-icon" style="width:48px;height:48px;color:var(--text-tertiary);"></i>
              <div class="upload-text">
                <strong>Click to upload</strong> or drag and drop<br/>
                <span class="text-xs" style="color:var(--text-tertiary);">JPEG, PNG, WebP up to 10MB</span>
              </div>
            `}
        </div>
        <input type="file" id="file-input" accept="image/*" capture="environment" style="display:none;" />
        ${formData.imageUrl ? `
          <button class="btn btn-ghost btn-sm" id="remove-image" style="margin-top:var(--space-2);color:var(--red-500);">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Remove photo
          </button>
        ` : ''}
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" id="skip-image">Skip</button>
        <button class="btn btn-primary" id="next-btn" ${!formData.imageUrl ? 'disabled style="opacity:0.5;"' : ''}>
          Next
          <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>
        </button>
      </div>
    `;

    const uploadZone = modal.querySelector('#upload-zone');
    const fileInput = modal.querySelector('#file-input');
    const nextBtn = modal.querySelector('#next-btn');

    modal.querySelector('#modal-close').addEventListener('click', close);

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });

    async function handleFile(file) {
      const validation = validateImage(file);
      if (!validation.valid) {
        showToast({ type: 'error', title: 'Invalid Image', message: validation.error });
        return;
      }

      try {
        uploadZone.innerHTML = '<div class="spinner" style="margin:var(--space-10) auto;"></div>';
        const compressed = await compressImage(file, 800, 0.7);
        formData.imageUrl = compressed;
        renderStep();
      } catch {
        showToast({ type: 'error', title: 'Upload Failed', message: 'Could not process the image. Please try again.' });
      }
    }

    const removeBtn = modal.querySelector('#remove-image');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        formData.imageUrl = '';
        renderStep();
      });
    }

    modal.querySelector('#skip-image').addEventListener('click', () => {
      currentStep = 1;
      renderStep();
    });

    if (nextBtn && formData.imageUrl) {
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      nextBtn.addEventListener('click', () => {
        currentStep = 1;
        renderStep();
      });
    }
  }

  // =====================
  // STEP 2: Location
  // =====================
  function renderLocationStep() {
    const hasLoc = formData.location && formData.location.lat;

    modal.innerHTML = `
      <div class="modal-header">
        <h2><i data-lucide="map-pin" style="width:20px;height:20px;display:inline;vertical-align:middle;margin-right:8px;color:var(--primary-500);"></i> Set Location</h2>
        <button class="btn-icon btn-ghost" id="modal-close" aria-label="Close">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>

      <div class="stepper">
        <div class="stepper-dot completed"></div>
        <div class="stepper-dot active"></div>
        <div class="stepper-dot"></div>
        <div class="stepper-dot"></div>
      </div>

      <div class="modal-body">
        <button class="btn btn-secondary" id="detect-location" style="width:100%;margin-bottom:var(--space-4);">
          <i data-lucide="locate" style="width:18px;height:18px;"></i>
          ${hasLoc ? 'Re-detect My Location' : 'Detect My Location'}
        </button>

        <div class="input-group" style="margin-bottom:var(--space-4);">
          <label class="input-label">Or search for an address</label>
          <div style="position:relative;">
            <input type="text" class="input-field" id="address-search" placeholder="Type an address..." value="${hasLoc ? escapeHtml(formData.location.address) : ''}" />
            <div id="search-results" style="position:absolute;top:100%;left:0;right:0;z-index:10;margin-top:4px;display:none;"></div>
          </div>
        </div>

        ${hasLoc ? `
          <div class="location-display">
            <div class="loc-icon">
              <i data-lucide="map-pin" style="width:18px;height:18px;"></i>
            </div>
            <div class="loc-text">
              <div class="loc-address">${escapeHtml(formData.location.address)}</div>
              <div class="loc-coords">${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}</div>
            </div>
          </div>
          <div class="mini-map" id="location-mini-map"></div>
        ` : `
          <div style="text-align:center;padding:var(--space-8) 0;color:var(--text-tertiary);">
            <i data-lucide="map-pin-off" style="width:32px;height:32px;margin-bottom:var(--space-2);opacity:0.5;"></i>
            <p style="font-size:var(--font-sm);">No location selected yet</p>
          </div>
        `}
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" id="back-btn">
          <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
          Back
        </button>
        <button class="btn btn-primary" id="next-btn" ${!hasLoc ? 'disabled style="opacity:0.5;"' : ''}>
          Next
          <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>
        </button>
      </div>
    `;

    modal.querySelector('#modal-close').addEventListener('click', close);
    modal.querySelector('#back-btn').addEventListener('click', () => {
      currentStep = 0;
      renderStep();
    });

    // Detect location
    modal.querySelector('#detect-location').addEventListener('click', async () => {
      const btn = modal.querySelector('#detect-location');
      btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Detecting...';
      btn.disabled = true;

      try {
        const pos = await getCurrentPosition();
        const address = await reverseGeocode(pos.lat, pos.lng);
        formData.location = { lat: pos.lat, lng: pos.lng, address };
        renderStep();
        showToast({ type: 'success', title: 'Location Found', message: address });
      } catch (err) {
        showToast({ type: 'error', title: 'Location Error', message: err.message });
        btn.innerHTML = '<i data-lucide="locate" style="width:18px;height:18px;"></i> Try Again';
        btn.disabled = false;
        if (window.lucide) window.lucide.createIcons({ nodes: [btn] });
      }
    });

    // Address search
    const searchInput = modal.querySelector('#address-search');
    const resultsDiv = modal.querySelector('#search-results');

    const doSearch = debounce(async (query) => {
      if (query.length < 3) {
        resultsDiv.style.display = 'none';
        return;
      }

      const results = await searchLocation(query);
      if (results.length === 0) {
        resultsDiv.style.display = 'none';
        return;
      }

      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = results.map((r, i) => `
        <div class="search-result-item" data-index="${i}" style="padding:var(--space-3) var(--space-4);background:var(--bg-surface);border:1px solid var(--border-color);cursor:pointer;font-size:var(--font-sm);color:var(--text-secondary);${i === 0 ? 'border-radius:var(--radius-md) var(--radius-md) 0 0;' : ''}${i === results.length - 1 ? 'border-radius:0 0 var(--radius-md) var(--radius-md);' : ''}">
          <i data-lucide="map-pin" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;color:var(--text-tertiary);"></i> ${escapeHtml(r.address.substring(0, 80))}
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons({ nodes: [resultsDiv] });

      resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.index);
          const selected = results[idx];
          formData.location = {
            lat: selected.lat,
            lng: selected.lng,
            address: selected.address,
          };
          resultsDiv.style.display = 'none';
          renderStep();
        });

        item.addEventListener('mouseenter', () => {
          item.style.background = 'var(--bg-surface-hover)';
          item.style.color = 'var(--text-primary)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'var(--bg-surface)';
          item.style.color = 'var(--text-secondary)';
        });
      });
    }, 400);

    searchInput.addEventListener('input', (e) => doSearch(e.target.value));

    // Next button
    const nextBtn = modal.querySelector('#next-btn');
    if (nextBtn && hasLoc) {
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      nextBtn.addEventListener('click', () => {
        currentStep = 2;
        renderStep();
      });
    }

    // Init mini map
    if (hasLoc) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const mapEl = modal.querySelector('#location-mini-map');
          if (mapEl && window.L) {
            try {
              const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: false })
                .setView([formData.location.lat, formData.location.lng], 15);

              L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OSM, &copy; CARTO',
                maxZoom: 19,
              }).addTo(map);

              L.circleMarker([formData.location.lat, formData.location.lng], {
                radius: 8,
                fillColor: '#1B3A5C',
                color: '#4777A7',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
              }).addTo(map);
            } catch (e) {
              console.warn('Map init error:', e);
            }
          }
        }, 100);
      });
    }
  }

  // ==========================
  // STEP 3: Description
  // ==========================
  function renderDescriptionStep() {
    const aiResult = formData.description
      ? categorize(formData.description)
      : { category: '', confidence: 0 };

    if (aiResult.category && aiResult.confidence > 0.2) {
      formData.category = aiResult.category;
      formData.categoryConfidence = aiResult.confidence;
    }

    const selectedCat = formData.category ? getCategoryByName(formData.category) : null;

    modal.innerHTML = `
      <div class="modal-header">
        <h2><i data-lucide="pen-line" style="width:20px;height:20px;display:inline;vertical-align:middle;margin-right:8px;color:var(--primary-500);"></i> Describe the Issue</h2>
        <button class="btn-icon btn-ghost" id="modal-close" aria-label="Close">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>

      <div class="stepper">
        <div class="stepper-dot completed"></div>
        <div class="stepper-dot completed"></div>
        <div class="stepper-dot active"></div>
        <div class="stepper-dot"></div>
      </div>

      <div class="modal-body">
        <div class="input-group">
          <label class="input-label">What's the issue? *</label>
          <textarea class="input-field" id="description-input" placeholder="Describe the civic issue in detail. For example: 'Large pothole on Main Street near the park entrance, about 2 feet wide...'" rows="4">${escapeHtml(formData.description)}</textarea>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="text-xs" style="color:var(--text-tertiary);">Be specific -- mention size, location details, urgency</span>
            <span class="text-xs" id="char-count" style="color:var(--text-tertiary);">${formData.description.length}/500</span>
          </div>
        </div>

        <!-- AI Category -->
        ${selectedCat ? `
          <div class="ai-category animate-scale-in">
            <i data-lucide="${selectedCat.icon}" class="ai-icon" style="width:20px;height:20px;color:${selectedCat.color};"></i>
            <div>
              <div class="ai-label"><i data-lucide="cpu" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i> AI Detected Category</div>
              <div class="ai-value">${selectedCat.name}</div>
            </div>
            <span class="ai-confidence">${Math.round(formData.categoryConfidence * 100)}%</span>
          </div>
        ` : ''}

        <!-- Manual Category Override -->
        <div class="input-group" style="margin-top:var(--space-4);">
          <label class="input-label">Category ${selectedCat ? '(override AI)' : '*'}</label>
          <select class="input-field" id="category-select" style="cursor:pointer;">
            <option value="">Select a category...</option>
            ${CATEGORIES.map(c => `
              <option value="${c.name}" ${formData.category === c.name ? 'selected' : ''}>${c.name}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" id="back-btn">
          <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
          Back
        </button>
        <button class="btn btn-primary" id="next-btn" ${!formData.description.trim() ? 'disabled style="opacity:0.5;"' : ''}>
          Review
          <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>
        </button>
      </div>
    `;

    modal.querySelector('#modal-close').addEventListener('click', close);
    modal.querySelector('#back-btn').addEventListener('click', () => {
      currentStep = 1;
      renderStep();
    });

    // Description input
    const descInput = modal.querySelector('#description-input');
    const charCount = modal.querySelector('#char-count');
    const nextBtn = modal.querySelector('#next-btn');

    descInput.addEventListener('input', debounce((e) => {
      const val = e.target.value.substring(0, 500);
      formData.description = val;
      charCount.textContent = `${val.length}/500`;

      // AI categorize in real-time
      const result = categorize(val);
      if (result.category && result.confidence > 0.2) {
        formData.category = result.category;
        formData.categoryConfidence = result.confidence;

        const cat = getCategoryByName(result.category);
        const aiDiv = modal.querySelector('.ai-category');
        if (aiDiv) {
          const aiIcon = aiDiv.querySelector('.ai-icon');
          if (aiIcon) aiIcon.setAttribute('data-lucide', cat.icon);
          aiDiv.querySelector('.ai-value').textContent = cat.name;
          aiDiv.querySelector('.ai-confidence').textContent = `${Math.round(result.confidence * 100)}%`;
          if (window.lucide) window.lucide.createIcons({ nodes: [aiDiv] });
        } else {
          // Rebuild step to show AI category
          renderStep();
          return;
        }

        // Update dropdown
        const select = modal.querySelector('#category-select');
        if (select) select.value = result.category;
      }

      // Enable/disable next
      if (val.trim().length > 0) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
      } else {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
      }
    }, 200));

    // Real-time input (non-debounced for char count)
    descInput.addEventListener('input', (e) => {
      const val = e.target.value.substring(0, 500);
      charCount.textContent = `${val.length}/500`;
      formData.description = val;
      if (val.trim().length > 0) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
      } else {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
      }
    });

    // Category select
    modal.querySelector('#category-select').addEventListener('change', (e) => {
      if (e.target.value) {
        formData.category = e.target.value;
        formData.categoryConfidence = 1;
      }
    });

    // Next
    nextBtn.addEventListener('click', () => {
      if (!formData.description.trim()) return;
      if (!formData.category) {
        const result = categorize(formData.description);
        formData.category = result.category || 'Other';
        formData.categoryConfidence = result.confidence;
      }
      currentStep = 3;
      renderStep();
    });

    // Focus the textarea
    setTimeout(() => descInput.focus(), 100);
  }

  // ========================
  // STEP 4: Review & Submit
  // ========================
  function renderReviewStep() {
    const cat = getCategoryByName(formData.category);

    modal.innerHTML = `
      <div class="modal-header">
        <h2><i data-lucide="check-circle" style="width:20px;height:20px;display:inline;vertical-align:middle;margin-right:8px;color:var(--teal-500);"></i> Review & Submit</h2>
        <button class="btn-icon btn-ghost" id="modal-close" aria-label="Close">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>

      <div class="stepper">
        <div class="stepper-dot completed"></div>
        <div class="stepper-dot completed"></div>
        <div class="stepper-dot completed"></div>
        <div class="stepper-dot active"></div>
      </div>

      <div class="modal-body">
        <!-- Preview Card -->
        <div class="card" style="cursor:default;">
          ${formData.imageUrl
            ? `<img src="${formData.imageUrl}" style="width:100%;aspect-ratio:16/10;object-fit:cover;" alt="Issue preview" />`
            : `<div style="width:100%;aspect-ratio:16/10;background:${cat.bgColor};display:flex;align-items:center;justify-content:center;"><i data-lucide="${cat.icon}" style="width:48px;height:48px;color:${cat.color};opacity:0.5;"></i></div>`
          }

          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
            <span class="badge" style="background:${cat.bgColor};color:${cat.color};border:1px solid ${cat.borderColor};align-self:flex-start;">
              <i data-lucide="${cat.icon}" style="width:12px;height:12px;display:inline;"></i> ${cat.name}
              ${formData.categoryConfidence ? ` · ${Math.round(formData.categoryConfidence * 100)}%` : ''}
            </span>

            <p style="font-size:var(--font-sm);color:var(--text-secondary);line-height:var(--leading-relaxed);">
              ${escapeHtml(formData.description)}
            </p>

            ${formData.location ? `
              <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);color:var(--text-tertiary);">
                <i data-lucide="map-pin" style="width:12px;height:12px;flex-shrink:0;"></i>
                ${escapeHtml(formData.location.address)}
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" id="back-btn">
          <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
          Back
        </button>
        <button class="btn btn-primary" id="submit-btn">
          <i data-lucide="send" style="width:16px;height:16px;"></i>
          Submit Report
        </button>
      </div>
    `;

    modal.querySelector('#modal-close').addEventListener('click', close);
    modal.querySelector('#back-btn').addEventListener('click', () => {
      currentStep = 2;
      renderStep();
    });

    modal.querySelector('#submit-btn').addEventListener('click', () => {
      const submitBtn = modal.querySelector('#submit-btn');
      submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Submitting...';
      submitBtn.disabled = true;

      // Simulate short delay for UX
      setTimeout(() => {
        addIssue({
          description: formData.description,
          imageUrl: formData.imageUrl,
          location: formData.location || { lat: 0, lng: 0, address: 'Not specified' },
          category: formData.category,
          categoryConfidence: formData.categoryConfidence,
        });

        close();
        showToast({
          type: 'success',
          title: 'Issue Reported',
          message: 'Your report has been submitted and is now visible to the community.',
          duration: 5000,
        });

        if (onComplete) onComplete();
      }, 800);
    });
  }

  // Start rendering
  renderStep();
  modalRoot.appendChild(backdrop);
}
